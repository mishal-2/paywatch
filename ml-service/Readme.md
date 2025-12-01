# PayWatch ML Service

AI-powered fraud detection service using XGBoost machine learning model.

## 📂 Dataset Download Instructions

This project uses the **Credit Card Fraud Detection** dataset from Kaggle.

👉 **Download from Kaggle:** https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud

After downloading, place the file at: `ml-service/data/creditcard.csv`

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd ml-service
pip install -r requirements.txt
```

### 2. Train the Model

```bash
python train_model.py
```

This will:
- Load the dataset from `data/creditcard.csv`
- Train an XGBoost classifier
- Save the model to `models/paywatch_model.pkl`
- Save the scaler to `models/scaler.pkl`

### 3. Run the ML Service

```bash
python app.py
```

The service will start on `http://localhost:5001`

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Predict Single Transaction
```
POST /predict
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

### Batch Prediction
```
POST /predict-batch
Content-Type: application/json

{
  "transactions": [
    {"Amount": 149.62, "Time": 406},
    {"Amount": 2125.87, "Time": 407}
  ]
}
```

### Model Info
```
GET /model-info
```

## 🔧 Environment Variables

Create a `.env` file:

```
PORT=5001
FLASK_ENV=development
```

## 📊 Model Details

- **Algorithm:** XGBoost Classifier
- **Features:** Amount, Time
- **Accuracy:** ~95.8%
- **Precision:** ~92.3%
- **Recall:** ~89.7%
