from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import os

app = Flask(__name__)
CORS(app)  # Allow requests from frontend on another port

# Load trained model
model_path = os.path.join("models", "paywatch_model.pkl")
model = joblib.load(model_path)
print("✅ Model loaded successfully")

# Load saved scaler
scaler_path = os.path.join("models", "scaler.pkl")
scaler = joblib.load(scaler_path)
print("✅ Scaler loaded successfully")

# Prediction route
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json

        # Only use Amount and Time
        df = pd.DataFrame([{
            "Amount": data["Amount"],
            "Time": data["Time"]
        }])

        # Scale numeric features
        df[["Amount", "Time"]] = scaler.transform(df[["Amount", "Time"]])

        # Predict fraud
        prediction = model.predict(df)[0]

        return jsonify({"prediction": int(prediction)})

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(debug=True)
