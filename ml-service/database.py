from pymongo import MongoClient, ASCENDING, DESCENDING
from datetime import datetime
from config import Config
import bcrypt

# Initialize MongoDB client
client = MongoClient(Config.MONGODB_URI)
db = client.paywatch

# Collections
users_collection = db.users
transactions_collection = db.transactions
fraud_alerts_collection = db.fraud_alerts
otp_collection = db.otps

# Create indexes for better performance
def init_db():
    """Initialize database with indexes"""
    # Users indexes
    users_collection.create_index([("email", ASCENDING)], unique=True)
    users_collection.create_index([("username", ASCENDING)], unique=True)
    
    # Transactions indexes
    transactions_collection.create_index([("user_id", ASCENDING)])
    transactions_collection.create_index([("timestamp", DESCENDING)])
    transactions_collection.create_index([("prediction", ASCENDING)])
    
    # Fraud alerts indexes
    fraud_alerts_collection.create_index([("transaction_id", ASCENDING)])
    fraud_alerts_collection.create_index([("user_id", ASCENDING)])
    fraud_alerts_collection.create_index([("flagged_at", DESCENDING)])
    
    # OTP indexes with TTL (expire after 5 minutes)
    otp_collection.create_index([("created_at", ASCENDING)], expireAfterSeconds=300)
    otp_collection.create_index([("email", ASCENDING)])
    
    print("✅ Database indexes created successfully")

# User Model Functions
def create_user(username, email, password):
    """Create a new user with hashed password"""
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    user = {
        "username": username,
        "email": email,
        "password_hash": password_hash,
        "created_at": datetime.utcnow(),
        "last_login": None
    }
    
    result = users_collection.insert_one(user)
    return str(result.inserted_id)

def find_user_by_email(email):
    """Find user by email"""
    return users_collection.find_one({"email": email})

def find_user_by_username(username):
    """Find user by username"""
    return users_collection.find_one({"username": username})

def verify_password(stored_password_hash, provided_password):
    """Verify password against hash"""
    return bcrypt.checkpw(provided_password.encode('utf-8'), stored_password_hash)

def update_last_login(user_id):
    """Update user's last login timestamp"""
    users_collection.update_one(
        {"_id": user_id},
        {"$set": {"last_login": datetime.utcnow()}}
    )

# Transaction Model Functions
def create_transaction(user_id, amount, time, prediction, fraud_score, device_info=None, location=None):
    """Create a new transaction record"""
    transaction = {
        "user_id": user_id,
        "amount": amount,
        "time": time,
        "timestamp": datetime.utcnow(),
        "prediction": prediction,
        "fraud_score": fraud_score,
        "status": "flagged" if prediction == 1 else "approved",
        "device_info": device_info,
        "location": location,
        "verified": False
    }
    
    result = transactions_collection.insert_one(transaction)
    return str(result.inserted_id)

def get_user_transactions(user_id, page=1, limit=20, status_filter=None):
    """Get paginated transactions for a user"""
    query = {"user_id": user_id}
    
    if status_filter:
        if status_filter == "fraud":
            query["prediction"] = 1
        elif status_filter == "legitimate":
            query["prediction"] = 0
    
    skip = (page - 1) * limit
    
    transactions = list(transactions_collection.find(query)
                       .sort("timestamp", DESCENDING)
                       .skip(skip)
                       .limit(limit))
    
    total = transactions_collection.count_documents(query)
    
    return transactions, total

def get_transaction_by_id(transaction_id):
    """Get transaction by ID"""
    from bson.objectid import ObjectId
    return transactions_collection.find_one({"_id": ObjectId(transaction_id)})

def update_transaction_status(transaction_id, status, verified=True):
    """Update transaction status after verification"""
    from bson.objectid import ObjectId
    transactions_collection.update_one(
        {"_id": ObjectId(transaction_id)},
        {"$set": {"status": status, "verified": verified, "verified_at": datetime.utcnow()}}
    )

# Fraud Alert Model Functions
def create_fraud_alert(transaction_id, user_id, risk_score):
    """Create a fraud alert for flagged transaction"""
    alert = {
        "transaction_id": transaction_id,
        "user_id": user_id,
        "risk_score": risk_score,
        "flagged_at": datetime.utcnow(),
        "status": "pending",
        "reviewed_by": None,
        "reviewed_at": None
    }
    
    result = fraud_alerts_collection.insert_one(alert)
    return str(result.inserted_id)

def get_fraud_alerts(user_id=None, status=None, page=1, limit=20):
    """Get fraud alerts with optional filters"""
    query = {}
    
    if user_id:
        query["user_id"] = user_id
    
    if status:
        query["status"] = status
    
    skip = (page - 1) * limit
    
    alerts = list(fraud_alerts_collection.find(query)
                 .sort("flagged_at", DESCENDING)
                 .skip(skip)
                 .limit(limit))
    
    total = fraud_alerts_collection.count_documents(query)
    
    return alerts, total

def update_alert_status(alert_id, status, reviewed_by=None):
    """Update fraud alert status"""
    from bson.objectid import ObjectId
    update_data = {
        "status": status,
        "reviewed_at": datetime.utcnow()
    }
    
    if reviewed_by:
        update_data["reviewed_by"] = reviewed_by
    
    fraud_alerts_collection.update_one(
        {"_id": ObjectId(alert_id)},
        {"$set": update_data}
    )

# OTP Model Functions
def create_otp(email, otp_code):
    """Store OTP for email verification"""
    otp_doc = {
        "email": email,
        "otp": otp_code,
        "created_at": datetime.utcnow(),
        "used": False
    }
    
    # Delete any existing OTPs for this email
    otp_collection.delete_many({"email": email})
    
    result = otp_collection.insert_one(otp_doc)
    return str(result.inserted_id)

def verify_otp(email, otp_code):
    """Verify OTP code"""
    otp_doc = otp_collection.find_one({
        "email": email,
        "otp": otp_code,
        "used": False
    })
    
    if otp_doc:
        # Mark OTP as used
        otp_collection.update_one(
            {"_id": otp_doc["_id"]},
            {"$set": {"used": True}}
        )
        return True
    
    return False

# Analytics Functions
def get_transaction_stats(user_id=None):
    """Get transaction statistics"""
    query = {}
    if user_id:
        query["user_id"] = user_id
    
    total_transactions = transactions_collection.count_documents(query)
    
    fraud_query = query.copy()
    fraud_query["prediction"] = 1
    fraud_count = transactions_collection.count_documents(fraud_query)
    
    legitimate_query = query.copy()
    legitimate_query["prediction"] = 0
    legitimate_count = transactions_collection.count_documents(legitimate_query)
    
    # Calculate total amount
    pipeline = [
        {"$match": query},
        {"$group": {"_id": None, "total_amount": {"$sum": "$amount"}}}
    ]
    
    amount_result = list(transactions_collection.aggregate(pipeline))
    total_amount = amount_result[0]["total_amount"] if amount_result else 0
    
    return {
        "total_transactions": total_transactions,
        "fraud_count": fraud_count,
        "legitimate_count": legitimate_count,
        "fraud_percentage": (fraud_count / total_transactions * 100) if total_transactions > 0 else 0,
        "total_amount": total_amount
    }

def get_fraud_trends(days=7, user_id=None):
    """Get fraud trends over time"""
    from datetime import timedelta
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    query = {"timestamp": {"$gte": start_date}}
    if user_id:
        query["user_id"] = user_id
    
    pipeline = [
        {"$match": query},
        {
            "$group": {
                "_id": {
                    "date": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
                    "prediction": "$prediction"
                },
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id.date": 1}}
    ]
    
    results = list(transactions_collection.aggregate(pipeline))
    
    return results
