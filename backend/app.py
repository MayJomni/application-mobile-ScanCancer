"""
DermaScan — Backend API (Flask)
Loads ensemble model and serves skin lesion predictions.

Usage:
  1. Place your model files in ./models/ (model1.h5, model2.h5, ensemble_info.json)
  2. pip install flask flask-cors tensorflow pillow numpy
  3. python app.py

For Google Colab deployment, see colab_deploy.ipynb
"""

import os
import io
import json
import base64
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image

app = Flask(__name__)
CORS(app)

# ─── Configuration ───
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
IMG_SIZE = (224, 224)

# HAM10000 class labels (alphabetical order as trained)
CLASS_NAMES = ['akiec', 'bcc', 'bkl', 'df', 'mel', 'nv', 'vasc']
CLASS_NAMES_FR = {
    'akiec': 'Kératose actinique',
    'bcc': 'Carcinome basocellulaire',
    'bkl': 'Kératose bénigne',
    'df': 'Dermatofibrome',
    'mel': 'Mélanome',
    'nv': 'Naevus mélanocytaire',
    'vasc': 'Lésion vasculaire',
}
RISK_LEVELS = {
    'akiec': 'pre-malignant',
    'bcc': 'malignant',
    'bkl': 'benign',
    'df': 'benign',
    'mel': 'malignant',
    'nv': 'benign',
    'vasc': 'benign',
}
CLASS_ICONS = {
    'akiec': '🔶', 'bcc': '🔴', 'bkl': '🟢',
    'df': '🟤', 'mel': '⚫', 'nv': '🟡', 'vasc': '🟣',
}

# ─── Global model references ───
model1 = None
model2 = None
ensemble_info = None


def load_models():
    """Load TensorFlow models and ensemble config."""
    global model1, model2, ensemble_info

    try:
        import tensorflow as tf
        tf.get_logger().setLevel('ERROR')

        model1_path = os.path.join(MODEL_DIR, 'model1.h5')
        model2_path = os.path.join(MODEL_DIR, 'model2.h5')
        info_path = os.path.join(MODEL_DIR, 'ensemble_info.json')

        # Try alternative names
        if not os.path.exists(model1_path):
            for f in os.listdir(MODEL_DIR):
                if f.endswith('.h5') or f.endswith('.keras'):
                    if 'model1' in f or 'first' in f or 'efficientnet' in f.lower():
                        model1_path = os.path.join(MODEL_DIR, f)
                    elif 'model2' in f or 'second' in f or 'resnet' in f.lower():
                        model2_path = os.path.join(MODEL_DIR, f)
                    elif model1 is None:
                        model1_path = os.path.join(MODEL_DIR, f)

        if os.path.exists(model1_path):
            print(f"✅ Loading Model 1: {model1_path}")
            model1 = tf.keras.models.load_model(model1_path, compile=False)
            print(f"   Input shape: {model1.input_shape}, Output shape: {model1.output_shape}")

        if os.path.exists(model2_path):
            print(f"✅ Loading Model 2: {model2_path}")
            model2 = tf.keras.models.load_model(model2_path, compile=False)
            print(f"   Input shape: {model2.input_shape}, Output shape: {model2.output_shape}")

        if os.path.exists(info_path):
            with open(info_path, 'r') as f:
                ensemble_info = json.load(f)
            print(f"✅ Ensemble info loaded: accuracy={ensemble_info.get('accuracy', 'N/A')}")

        if model1 is None and model2 is None:
            print("⚠️  No models found in ./models/ — running in DEMO mode")
            return False

        return True
    except Exception as e:
        print(f"❌ Error loading models: {e}")
        return False


def preprocess_image(img_bytes):
    """Preprocess image for model inference."""
    img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
    img = img.resize(IMG_SIZE)
    arr = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)


def apply_ensemble_rules(preds1, preds2):
    """Apply ensemble rules from ensemble_info.json."""
    class1 = int(np.argmax(preds1))
    conf1 = float(np.max(preds1))
    class2 = int(np.argmax(preds2))
    conf2 = float(np.max(preds2))

    # Default: use model1 predictions
    final_preds = preds1.copy()

    if ensemble_info and 'rules' in ensemble_info:
        rules = ensemble_info['rules']

        # BCC rule: class1 == 1 and conf1 > 0.68
        if class1 == 1 and conf1 > 0.68:
            final_preds[0][1] = max(final_preds[0][1], 0.85)

        # Melanoma rule: class2 == 4 and conf2 < 0.8 and class1 == 4
        if class2 == 4 and conf2 < 0.8 and class1 == 4:
            final_preds[0][4] = max(final_preds[0][4], 0.80)

        # Akiec rule: class2 == 0 and conf2 < 0.8 and class1 == 0
        if class2 == 0 and conf2 < 0.8 and class1 == 0:
            final_preds[0][0] = max(final_preds[0][0], 0.75)

        # Low confidence flag
        low_conf = conf2 < 0.9245 if 'low_confidence' in rules else False
    else:
        low_conf = conf1 < 0.5

    # Normalize
    total = np.sum(final_preds)
    if total > 0:
        final_preds = final_preds / total

    return final_preds, low_conf


def predict(img_bytes):
    """Run ensemble prediction on image bytes."""
    img_array = preprocess_image(img_bytes)

    if model1 is not None and model2 is not None:
        # Ensemble mode
        preds1 = model1.predict(img_array, verbose=0)
        preds2 = model2.predict(img_array, verbose=0)
        final_preds, low_conf = apply_ensemble_rules(preds1, preds2)
    elif model1 is not None:
        # Single model mode
        final_preds = model1.predict(img_array, verbose=0)
        low_conf = float(np.max(final_preds)) < 0.5
    else:
        # Demo mode — random predictions
        raw = np.random.dirichlet(np.ones(7))
        final_preds = raw.reshape(1, -1)
        low_conf = True

    probs = final_preds[0].tolist()

    # Build sorted results
    results = []
    for i, prob in enumerate(probs):
        code = CLASS_NAMES[i]
        results.append({
            'id': code,
            'code': code,
            'name': CLASS_NAMES_FR.get(code, code),
            'nameFr': CLASS_NAMES_FR.get(code, code),
            'confidence': round(prob, 6),
            'riskLevel': RISK_LEVELS.get(code, 'benign'),
            'icon': CLASS_ICONS.get(code, '⬜'),
        })

    results.sort(key=lambda x: x['confidence'], reverse=True)

    return {
        'predictions': results,
        'topPrediction': results[0],
        'lowConfidence': low_conf,
        'modelUsed': 'ensemble' if model2 else ('single' if model1 else 'demo'),
    }


# ─── Routes ───

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model1_loaded': model1 is not None,
        'model2_loaded': model2 is not None,
        'ensemble_info': ensemble_info is not None,
        'mode': 'ensemble' if model2 else ('single' if model1 else 'demo'),
    })


@app.route('/predict', methods=['POST'])
def predict_route():
    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({'error': 'Missing "image" field (base64)'}), 400

        # Decode base64 image
        img_b64 = data['image']
        if ',' in img_b64:
            img_b64 = img_b64.split(',')[1]

        img_bytes = base64.b64decode(img_b64)
        result = predict(img_bytes)

        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'name': 'DermaScan API',
        'version': '1.0.0',
        'endpoints': {
            '/health': 'GET — Check API status',
            '/predict': 'POST — Classify skin lesion (body: { image: base64 })',
        },
    })


if __name__ == '__main__':
    print("🔬 DermaScan API — Loading models...")
    loaded = load_models()
    mode = 'ENSEMBLE' if model2 else ('SINGLE MODEL' if model1 else 'DEMO')
    print(f"🚀 Starting server in {mode} mode on port 5000")
    app.run(host='0.0.0.0', port=5000, debug=False)
