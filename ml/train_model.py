"""
AI Fire & Gas Monitor — Decision Tree Classifier Training Module
Algorithm: Decision Tree Classifier (scikit-learn)
Split: 80% Training / 20% Testing
Features: gas_level, temperature, humidity, flame_status, gas_change, temperature_change
Classes: Normal, Gas Warning, Fire Risk, Critical
"""

import os
import sys
import json
import pickle
import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, confusion_matrix, classification_report
)
from sklearn.preprocessing import LabelEncoder

# ─── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR     = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, 'dataset', 'sensor_data.csv')
MODELS_DIR   = os.path.join(BASE_DIR, 'models')
MODEL_PATH   = os.path.join(MODELS_DIR, 'decision_tree_model.pkl')
ENCODER_PATH = os.path.join(MODELS_DIR, 'label_encoder.pkl')
RESULTS_PATH = os.path.join(MODELS_DIR, 'model_results.json')

FEATURES = ['gas_level', 'temperature', 'humidity', 'flame_status', 'gas_change', 'temperature_change']
TARGET   = 'label'
CLASSES  = ['Normal', 'Gas Warning', 'Fire Risk', 'Critical']


def load_data(path):
    print(f"\n📂 Loading dataset: {path}")
    if not os.path.exists(path):
        print("❌ Dataset not found. Run: python ml/generate_dataset.py")
        sys.exit(1)
    df = pd.read_csv(path)
    print(f"   Shape: {df.shape}")
    print(f"   Class distribution:\n{df[TARGET].value_counts().to_string()}")
    return df


def preprocess(df):
    """Encode labels and split into train/test."""
    le = LabelEncoder()
    le.fit(CLASSES)
    df['label_encoded'] = le.transform(df[TARGET])

    X = df[FEATURES].values
    y = df['label_encoded'].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"\n✂️  Train/Test Split:")
    print(f"   Training samples : {len(X_train)} ({len(X_train)/len(X)*100:.0f}%)")
    print(f"   Testing  samples : {len(X_test)}  ({len(X_test)/len(X)*100:.0f}%)")
    return X_train, X_test, y_train, y_test, le


def train_model(X_train, y_train):
    """Train Decision Tree Classifier."""
    print("\n🌳 Training Decision Tree Classifier...")
    model = DecisionTreeClassifier(
        criterion='gini',
        max_depth=8,           # Prevent overfitting
        min_samples_split=10,
        min_samples_leaf=5,
        random_state=42
    )
    model.fit(X_train, y_train)
    print("   ✅ Training complete!")
    return model


def evaluate_model(model, X_test, y_test, le):
    """Evaluate model and print metrics."""
    y_pred = model.predict(X_test)

    acc  = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    rec  = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1   = f1_score(y_test, y_pred, average='weighted', zero_division=0)
    cm   = confusion_matrix(y_test, y_pred)

    print("\n📊 Model Evaluation:")
    print(f"   Accuracy  : {acc*100:.2f}%")
    print(f"   Precision : {prec*100:.2f}%")
    print(f"   Recall    : {rec*100:.2f}%")
    print(f"   F1 Score  : {f1*100:.2f}%")
    print(f"\n   Confusion Matrix:\n{cm}")
    print(f"\n   Classification Report:\n{classification_report(y_test, y_pred, target_names=CLASSES, zero_division=0)}")

    # Per-class precision
    per_class_prec = precision_score(y_test, y_pred, average=None, zero_division=0)
    per_class_rec  = recall_score(y_test, y_pred, average=None, zero_division=0)
    per_class_f1   = f1_score(y_test, y_pred, average=None, zero_division=0)

    return {
        'accuracy':  round(float(acc) * 100, 2),
        'precision': round(float(prec) * 100, 2),
        'recall':    round(float(rec) * 100, 2),
        'f1_score':  round(float(f1) * 100, 2),
        'confusion_matrix': cm.tolist(),
        'per_class': {
            cls: {
                'precision': round(float(per_class_prec[i]) * 100, 2),
                'recall':    round(float(per_class_rec[i]) * 100, 2),
                'f1':        round(float(per_class_f1[i]) * 100, 2)
            }
            for i, cls in enumerate(CLASSES)
        }
    }


def save_artifacts(model, le, metrics, dataset_size):
    """Save model, encoder, and results."""
    os.makedirs(MODELS_DIR, exist_ok=True)

    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
    print(f"\n💾 Model saved  : {MODEL_PATH}")

    with open(ENCODER_PATH, 'wb') as f:
        pickle.dump(le, f)
    print(f"💾 Encoder saved: {ENCODER_PATH}")

    results = {
        'model_name':      'Decision Tree Classifier',
        'model_loaded':    True,
        'algorithm':       'Decision Tree (CART)',
        'criterion':       'gini',
        'max_depth':       8,
        'features':        FEATURES,
        'classes':         CLASSES,
        'training_split':  0.8,
        'testing_split':   0.2,
        'dataset_size':    dataset_size,
        'train_size':      int(dataset_size * 0.8),
        'test_size':       int(dataset_size * 0.2),
        **metrics
    }

    with open(RESULTS_PATH, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"💾 Results saved: {RESULTS_PATH}")


def load_model():
    """Load saved model and encoder for inference."""
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}. Run train_model.py first.")
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    with open(ENCODER_PATH, 'rb') as f:
        le = pickle.load(f)
    return model, le


def predict(gas_level, temperature, humidity, flame_status, gas_change=0.0, temperature_change=0.0):
    """Predict risk class from sensor values."""
    model, le = load_model()
    features = [[gas_level, temperature, humidity, flame_status, gas_change, temperature_change]]
    encoded  = model.predict(features)[0]
    proba    = model.predict_proba(features)[0]
    label    = le.inverse_transform([encoded])[0]
    return {
        'classification': label,
        'probabilities':  {le.inverse_transform([i])[0]: round(float(p)*100, 1) for i, p in enumerate(proba)},
        'risk_score':     round(max(proba) * 100, 1)
    }


if __name__ == '__main__':
    print("=" * 60)
    print("  AI Fire & Gas Monitor — Model Training")
    print("  Algorithm: Decision Tree Classifier")
    print("=" * 60)

    df = load_data(DATASET_PATH)
    X_train, X_test, y_train, y_test, le = preprocess(df)
    model = train_model(X_train, y_train)
    metrics = evaluate_model(model, X_test, y_test, le)
    save_artifacts(model, le, metrics, len(df))

    print("\n✅ Training pipeline complete!")
    print("\n🔍 Sample prediction test:")
    result = predict(gas_level=620, temperature=35, humidity=55, flame_status=1, gas_change=15, temperature_change=2.5)
    print(f"   Input  : gas=620, temp=35°C, hum=55%, flame=1")
    print(f"   Output : {result}")
