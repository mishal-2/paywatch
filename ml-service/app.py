from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import os
import numpy as np

app = Flask(__name__)
CORS(app)  # Allow requests from frontend and backend

# Load trained model
model_path = os.path.join("models", "paywatch_model.pkl")
try:
    model = joblib.load(model_path)
    print("✅ Model loaded successfully")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

# Load saved scaler
scaler_path = os.path.join("models", "scaler.pkl")
try:
    scaler = joblib.load(scaler_path)
    print("✅ Scaler loaded successfully")
except Exception as e:
    print(f"❌ Error loading scaler: {e}")
    scaler = None

# Health check endpoint
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "OK",
        "message": "PayWatch ML Service is running",
        "model_loaded": model is not None,
        "scaler_loaded": scaler is not None
    })

# Prediction route
@app.route("/predict", methods=["POST"])
def predict():
    try:
        if model is None or scaler is None:
            return jsonify({
                "error": "Model or scaler not loaded",
                "prediction": 0,
                "fraud_score": 0.0
            }), 500

        data = request.json

        # Validate input
        if "Amount" not in data or "Time" not in data:
            return jsonify({
                "error": "Amount and Time are required fields"
            }), 400

        # Only use Amount and Time
        df = pd.DataFrame([{
            "Amount": float(data["Amount"]),
            "Time": float(data["Time"])
        }])

        # Scale numeric features
        df[["Amount", "Time"]] = scaler.transform(df[["Amount", "Time"]])

        # Predict fraud
        prediction = int(model.predict(df)[0])
        
        # Get fraud probability score
        try:
            fraud_proba = model.predict_proba(df)[0]
            fraud_score = float(fraud_proba[1])  # Probability of fraud (class 1)
        except:
            # If model doesn't support predict_proba, use a simple heuristic
            fraud_score = 0.85 if prediction == 1 else 0.15

        return jsonify({
            "prediction": prediction,
            "fraud_score": round(fraud_score, 4),
            "status": "fraud" if prediction == 1 else "legitimate",
            "confidence": round(max(fraud_proba) if 'fraud_proba' in locals() else 0.85, 4)
        })

    except Exception as e:
        return jsonify({
            "error": str(e),
            "prediction": 0,
            "fraud_score": 0.0
        }), 500

# Batch prediction endpoint
@app.route("/predict-batch", methods=["POST"])
def predict_batch():
    try:
        if model is None or scaler is None:
            return jsonify({
                "error": "Model or scaler not loaded"
            }), 500

        data = request.json
        transactions = data.get("transactions", [])

        if not transactions:
            return jsonify({
                "error": "No transactions provided"
            }), 400

        results = []
        for txn in transactions:
            df = pd.DataFrame([{
                "Amount": float(txn["Amount"]),
                "Time": float(txn["Time"])
            }])

            df[["Amount", "Time"]] = scaler.transform(df[["Amount", "Time"]])
            prediction = int(model.predict(df)[0])
            
            try:
                fraud_proba = model.predict_proba(df)[0]
                fraud_score = float(fraud_proba[1])
            except:
                fraud_score = 0.85 if prediction == 1 else 0.15

            results.append({
                "prediction": prediction,
                "fraud_score": round(fraud_score, 4),
                "status": "fraud" if prediction == 1 else "legitimate"
            })

        return jsonify({
            "results": results,
            "total": len(results)
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

# Model info endpoint
@app.route("/model-info", methods=["GET"])
def model_info():
    try:
        return jsonify({
            "model_type": "XGBoost Classifier",
            "features": ["Amount", "Time"],
            "model_loaded": model is not None,
            "scaler_loaded": scaler is not None,
            "version": "1.0.0"
        })
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(debug=True, host="0.0.0.0", port=port)
