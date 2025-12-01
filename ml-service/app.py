from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import os
from datetime import datetime
from bson.objectid import ObjectId

# Import custom modules
from config import Config
from database import (
    init_db, create_user, find_user_by_email, find_user_by_username,
    verify_password, update_last_login, create_transaction, get_user_transactions,
    get_transaction_by_id, update_transaction_status, create_fraud_alert,
    get_fraud_alerts, update_alert_status, get_transaction_stats, get_fraud_trends
)
from auth import generate_token, token_required
from otp_service import send_otp, verify_otp

app = Flask(__name__)
CORS(app, origins=Config.CORS_ORIGINS)

# Initialize database
init_db()

# Load trained model
model_path = os.path.join("models", "paywatch_model.pkl")
model = joblib.load(model_path)
print("✅ Model loaded successfully")

# Load saved scaler
scaler_path = os.path.join("models", "scaler.pkl")
scaler = joblib.load(scaler_path)
print("✅ Scaler loaded successfully")

# ==================== AUTHENTICATION ROUTES ====================

@app.route("/api/auth/register", methods=["POST"])
def register():
    """Register a new user"""
    try:
        data = request.json
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        
        # Validation
        if not username or not email or not password:
            return jsonify({"error": "All fields are required"}), 400
        
        # Check if user already exists
        if find_user_by_email(email):
            return jsonify({"error": "Email already registered"}), 400
        
        if find_user_by_username(username):
            return jsonify({"error": "Username already taken"}), 400
        
        # Create user
        user_id = create_user(username, email, password)
        
        # Generate token
        token = generate_token(user_id, email)
        
        return jsonify({
            "message": "User registered successfully",
            "token": token,
            "user": {
                "id": user_id,
                "username": username,
                "email": email
            }
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/auth/login", methods=["POST"])
def login():
    """Login user"""
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")
        
        # Validation
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        # Find user
        user = find_user_by_email(email)
        
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401
        
        # Verify password
        if not verify_password(user["password_hash"], password):
            return jsonify({"error": "Invalid credentials"}), 401
        
        # Update last login
        update_last_login(user["_id"])
        
        # Generate token
        token = generate_token(str(user["_id"]), email)
        
        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "username": user["username"],
                "email": user["email"]
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/auth/verify", methods=["GET"])
@token_required
def verify_token():
    """Verify if token is valid"""
    return jsonify({
        "valid": True,
        "user_id": request.user_id,
        "email": request.user_email
    }), 200

# ==================== PREDICTION ROUTES ====================

@app.route("/api/predict", methods=["POST"])
@token_required
def predict():
    """Predict fraud for a transaction"""
    try:
        data = request.json
        amount = data.get("Amount")
        time = data.get("Time")
        
        # Validation
        if amount is None or time is None:
            return jsonify({"error": "Amount and Time are required"}), 400
        
        # Create dataframe
        df = pd.DataFrame([{
            "Amount": float(amount),
            "Time": float(time)
        }])
        
        # Scale features
        df[["Amount", "Time"]] = scaler.transform(df[["Amount", "Time"]])
        
        # Predict
        prediction = int(model.predict(df)[0])
        
        # Get prediction probability for fraud score
        try:
            proba = model.predict_proba(df)[0]
            fraud_score = float(proba[1] * 100)  # Probability of fraud as percentage
        except:
            fraud_score = 100.0 if prediction == 1 else 0.0
        
        # Save transaction to database
        transaction_id = create_transaction(
            user_id=request.user_id,
            amount=float(amount),
            time=float(time),
            prediction=prediction,
            fraud_score=fraud_score
        )
        
        # If fraud detected, create alert and send OTP
        requires_2fa = False
        if prediction == 1:
            create_fraud_alert(transaction_id, request.user_id, fraud_score)
            
            # Send OTP for verification
            user_email = request.user_email
            otp_sent = send_otp(user_email, float(amount))
            
            requires_2fa = True
        
        return jsonify({
            "prediction": prediction,
            "fraud_score": round(fraud_score, 2),
            "transaction_id": transaction_id,
            "requires_2fa": requires_2fa,
            "message": "Transaction flagged as fraudulent. OTP sent to your email." if requires_2fa else "Transaction approved"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/verify-transaction", methods=["POST"])
@token_required
def verify_transaction():
    """Verify transaction with OTP"""
    try:
        data = request.json
        transaction_id = data.get("transaction_id")
        otp_code = data.get("otp")
        
        if not transaction_id or not otp_code:
            return jsonify({"error": "Transaction ID and OTP are required"}), 400
        
        # Verify OTP
        if verify_otp(request.user_email, otp_code):
            # Update transaction status
            update_transaction_status(transaction_id, "approved", verified=True)
            
            return jsonify({
                "message": "Transaction verified and approved successfully",
                "verified": True
            }), 200
        else:
            return jsonify({"error": "Invalid or expired OTP"}), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/resend-otp", methods=["POST"])
@token_required
def resend_otp():
    """Resend OTP for transaction verification"""
    try:
        data = request.json
        transaction_id = data.get("transaction_id")
        
        if not transaction_id:
            return jsonify({"error": "Transaction ID is required"}), 400
        
        # Get transaction details
        transaction = get_transaction_by_id(transaction_id)
        
        if not transaction:
            return jsonify({"error": "Transaction not found"}), 404
        
        # Send new OTP
        otp_sent = send_otp(request.user_email, transaction["amount"])
        
        if otp_sent:
            return jsonify({"message": "OTP resent successfully"}), 200
        else:
            return jsonify({"error": "Failed to send OTP"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==================== TRANSACTION ROUTES ====================

@app.route("/api/transactions", methods=["GET"])
@token_required
def get_transactions():
    """Get user's transaction history"""
    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 20))
        status_filter = request.args.get("status")  # 'fraud', 'legitimate', or None
        
        transactions, total = get_user_transactions(
            user_id=request.user_id,
            page=page,
            limit=limit,
            status_filter=status_filter
        )
        
        # Convert ObjectId to string for JSON serialization
        for transaction in transactions:
            transaction["_id"] = str(transaction["_id"])
        
        return jsonify({
            "transactions": transactions,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/transactions/<transaction_id>", methods=["GET"])
@token_required
def get_transaction_details(transaction_id):
    """Get detailed transaction information"""
    try:
        transaction = get_transaction_by_id(transaction_id)
        
        if not transaction:
            return jsonify({"error": "Transaction not found"}), 404
        
        # Verify user owns this transaction
        if str(transaction["user_id"]) != request.user_id:
            return jsonify({"error": "Unauthorized"}), 403
        
        transaction["_id"] = str(transaction["_id"])
        
        return jsonify({"transaction": transaction}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==================== ANALYTICS ROUTES ====================

@app.route("/api/analytics/stats", methods=["GET"])
@token_required
def get_stats():
    """Get transaction statistics"""
    try:
        stats = get_transaction_stats(user_id=request.user_id)
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/analytics/trends", methods=["GET"])
@token_required
def get_trends():
    """Get fraud trends over time"""
    try:
        days = int(request.args.get("days", 7))
        trends = get_fraud_trends(days=days, user_id=request.user_id)
        
        return jsonify({"trends": trends}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==================== FRAUD ALERT ROUTES ====================

@app.route("/api/alerts", methods=["GET"])
@token_required
def get_alerts():
    """Get fraud alerts"""
    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 20))
        status = request.args.get("status")  # 'pending', 'reviewed', or None
        
        alerts, total = get_fraud_alerts(
            user_id=request.user_id,
            status=status,
            page=page,
            limit=limit
        )
        
        # Convert ObjectId to string
        for alert in alerts:
            alert["_id"] = str(alert["_id"])
            alert["transaction_id"] = str(alert["transaction_id"])
        
        return jsonify({
            "alerts": alerts,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==================== HEALTH CHECK ====================

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "model_loaded": model is not None,
        "scaler_loaded": scaler is not None
    }), 200

# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(debug=Config.FLASK_DEBUG, host="0.0.0.0", port=5000)
