import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib
import os

print("🚀 Script started")  # debug print

# 1️⃣ Load dataset
data_path = os.path.join("data", "creditcard.csv")
print(f"📂 Loading dataset from: {data_path}")
df = pd.read_csv(data_path)
print("✅ Dataset loaded. Number of rows:", len(df))

# 2️⃣ Split data into features (X) and target (y)
X = df.drop("Class", axis=1)
y = df["Class"]
print("Columns in dataset:", list(df.columns))

# 3️⃣ Scale numerical columns ('Amount' and 'Time')
scaler = StandardScaler()
X[["Amount", "Time"]] = scaler.fit_transform(X[["Amount", "Time"]])
print("✅ Scaling done for Amount and Time")

# 4️⃣ Split into training and test sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"✅ Train/Test split done. Train rows: {len(X_train)}, Test rows: {len(X_test)}")

# 5️⃣ Train the model using XGBoost
print("⚙️ Training XGBoost model...")
model = XGBClassifier(
    n_estimators=100,
    max_depth=5,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    use_label_encoder=False,
    eval_metric="logloss"
)
model.fit(X_train, y_train)
print("✅ Model training complete")

# 6️⃣ Evaluate model
y_pred = model.predict(X_test)
print("\n✅ Model Evaluation Results:")
print(confusion_matrix(y_test, y_pred))
print(classification_report(y_test, y_pred))
print("Accuracy:", round(accuracy_score(y_test, y_pred) * 100, 2), "%")

# 7️⃣ Save trained model
os.makedirs("models", exist_ok=True)
model_path = os.path.join("models", "paywatch_model.pkl")
joblib.dump(model, model_path)
print(f"💾 Model saved to: {model_path}")

# 8️⃣ Save the scaler too
scaler_path = os.path.join("models", "scaler.pkl")
joblib.dump(scaler, scaler_path)
print(f"💾 Scaler saved to: {scaler_path}")

print("🎉 Script finished successfully")

