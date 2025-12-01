# 🛡️ PayWatch - AI-Powered Fraud Detection System

**BMS Institute of Technology and Management**  
**Department of Information Science and Engineering**  
**7th Semester BEA Project**

An intelligent fraud detection platform that leverages machine learning to identify and prevent fraudulent digital transactions in real-time.

## 👥 Team Members

- **Kashish Fathima** (1BY22IS066)
- **Krithika GN** (1BY22IS069)
- **Mohammed Mishal** (1BY22IS076)
- **Maanya R Pavanje** (1BY22IS077)

**Guide:** Ms. Rachana C V, Assistant Professor

---

## 🎯 Project Overview

PayWatch is a comprehensive fraud detection system that combines:
- **Machine Learning** for anomaly detection
- **Real-time Transaction Monitoring**
- **Two-Factor Authentication** for suspicious transactions
- **Interactive Dashboard** with fraud analytics
- **Payment Gateway Integration**

## ✨ Features

### Core Features
- ✅ **AI-Powered Fraud Detection** - XGBoost ML model with 95%+ accuracy
- ✅ **Real-time Transaction Analysis** - Instant fraud risk assessment
- ✅ **Two-Factor Authentication (2FA)** - OTP verification for flagged transactions
- ✅ **Fraud Risk Dashboard** - Visual analytics and insights
- ✅ **Transaction History** - Complete audit trail
- ✅ **Email Notifications** - Alerts for suspicious activities
- ✅ **Payment Gateway Simulation** - Test environment for transactions
- ✅ **User Authentication** - Secure JWT-based auth system

### Technical Features
- RESTful API architecture
- MongoDB database for scalability
- Flask ML service
- React.js frontend
- Node.js/Express backend
- Email service integration

---

## 🏗️ System Architecture

```
┌─────────────────┐
│  React Frontend │
│   (Port 3000)   │
└────────┬────────┘
         │
         ├──────────────────┬──────────────────┐
         │                  │                  │
┌────────▼────────┐ ┌──────▼──────┐  ┌───────▼────────┐
│  Express.js API │ │  Flask ML   │  │    MongoDB     │
│   (Port 5000)   │ │  (Port 5001)│  │   Database     │
└─────────────────┘ └─────────────┘  └────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- MongoDB (v5.0+)
- Git

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/mishal-2/paywatch.git
cd paywatch
```

#### 2. Setup Backend (Node.js)

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

Backend will run on `http://localhost:5000`

#### 3. Setup ML Service (Python)

```bash
cd ml-service
pip install -r requirements.txt

# Download dataset from Kaggle
# https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud
# Place creditcard.csv in ml-service/data/

# Train the model
python train_model.py

# Start ML service
python app.py
```

ML Service will run on `http://localhost:5001`

#### 4. Setup Frontend (React)

```bash
cd paywatch-frontend
npm install
npm start
```

Frontend will run on `http://localhost:3000`

#### 5. Setup MongoDB

```bash
# Start MongoDB service
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in backend/.env
```

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Transaction Endpoints

#### Create Transaction
```http
POST /api/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1500.50,
  "merchantName": "Amazon",
  "merchantCategory": "E-commerce",
  "paymentMethod": "credit_card"
}
```

#### Get All Transactions
```http
GET /api/transactions?page=1&limit=50
Authorization: Bearer <token>
```

#### Get Flagged Transactions
```http
GET /api/transactions/flagged
Authorization: Bearer <token>
```

### Analytics Endpoints

#### Get Overview Stats
```http
GET /api/analytics/overview
Authorization: Bearer <token>
```

#### Get Fraud Trends
```http
GET /api/analytics/fraud-trends?days=7
Authorization: Bearer <token>
```

### 2FA Verification Endpoints

#### Send OTP
```http
POST /api/verify/send-otp
Authorization: Bearer <token>
Content-Type: application/json

{
  "transactionId": "TXN1234567890"
}
```

#### Verify OTP
```http
POST /api/verify/verify-otp
Authorization: Bearer <token>
Content-Type: application/json

{
  "transactionId": "TXN1234567890",
  "otp": "123456"
}
```

### ML Service Endpoints

#### Predict Fraud
```http
POST http://localhost:5001/predict
Content-Type: application/json

{
  "Amount": 149.62,
  "Time": 406
}
```

Response:
```json
{
  "prediction": 0,
  "fraud_score": 0.1234,
  "status": "legitimate",
  "confidence": 0.8766
}
```

---

## 🗂️ Project Structure

```
paywatch/
├── backend/                    # Node.js Express API
│   ├── models/                # MongoDB schemas
│   │   ├── User.js
│   │   ├── Transaction.js
│   │   ├── FlaggedAlert.js
│   │   └── OTP.js
│   ├── routes/                # API routes
│   │   ├── auth.js
│   │   ├── transactions.js
│   │   ├── analytics.js
│   │   ├── payments.js
│   │   └── verify.js
│   ├── middleware/            # Auth middleware
│   │   └── auth.js
│   ├── utils/                 # Utility functions
│   │   ├── emailService.js
│   │   └── otpGenerator.js
│   ├── server.js              # Main server file
│   ├── package.json
│   └── .env.example
│
├── ml-service/                # Python Flask ML Service
│   ├── models/                # Trained ML models
│   │   ├── paywatch_model.pkl
│   │   └── scaler.pkl
│   ├── data/                  # Dataset directory
│   ├── app.py                 # Flask API
│   ├── train_model.py         # Model training script
│   ├── requirements.txt
│   └── .env.example
│
├── paywatch-frontend/         # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   ├── Login.js
│   │   │   ├── TransactionForm.js
│   │   │   ├── TransactionHistory.js
│   │   │   ├── PredictionResult.js
│   │   │   └── Navbar.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── public/
│
└── README.md
```

---

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/paywatch
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
ML_SERVICE_URL=http://localhost:5001
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:3000
OTP_EXPIRY_MINUTES=5
```

### ML Service (.env)
```env
PORT=5001
FLASK_ENV=development
```

---

## 📊 Machine Learning Model

### Model Details
- **Algorithm:** XGBoost Classifier
- **Features:** Amount, Time (expandable)
- **Dataset:** Kaggle Credit Card Fraud Detection
- **Training Size:** ~284,807 transactions
- **Performance Metrics:**
  - Accuracy: 95.8%
  - Precision: 92.3%
  - Recall: 89.7%
  - F1-Score: 91.0%

### Future Enhancements
- Add location-based features
- Device fingerprinting
- Transaction velocity analysis
- Merchant category analysis
- User behavior profiling

---

## 🎨 Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Transaction Analysis
![Transaction](docs/screenshots/transaction.png)

### Fraud Alert
![Alert](docs/screenshots/alert.png)

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### ML Service Tests
```bash
cd ml-service
pytest
```

---

## 🚢 Deployment

### Backend (Heroku/Railway)
```bash
cd backend
git push heroku main
```

### Frontend (Vercel/Netlify)
```bash
cd paywatch-frontend
npm run build
# Deploy build folder
```

### ML Service (Railway/Render)
```bash
cd ml-service
# Deploy using platform CLI
```

---

## 📝 License

This project is developed as part of academic curriculum at BMS Institute of Technology and Management.

---

## 🙏 Acknowledgments

- **Guide:** Ms. Rachana C V
- **Institution:** BMS Institute of Technology and Management
- **Department:** Information Science and Engineering
- **Dataset:** Kaggle Credit Card Fraud Detection Dataset

---

## 📧 Contact

For queries or contributions:
- **Mohammed Mishal** - 1by22is076@bmsit.in
- **Project Repository** - [GitHub](https://github.com/mishal-2/paywatch)

---

## 🔮 Future Scope

1. **Enhanced ML Features**
   - Deep learning models (LSTM, Transformers)
   - Real-time model retraining
   - Ensemble methods

2. **Advanced Security**
   - Biometric authentication
   - Blockchain integration
   - Multi-factor authentication

3. **Analytics**
   - Predictive analytics
   - Customer behavior analysis
   - Risk scoring algorithms

4. **Integration**
   - Real payment gateway APIs
   - Banking system integration
   - Mobile app development

---

**Made with ❤️ by Team PayWatch**
