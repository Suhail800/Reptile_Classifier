from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from PIL import Image
import numpy as np
import io
import os

# Initialize Flask app
app = Flask(__name__)
CORS(app) # Enable CORS for all routes, allowing frontend to communicate

# --- Model & Class Configuration ---
MODEL_PATH = 'model/reptile_model.keras'
CLASS_NAMES = [
    "Chameleon", "Crocodile_Alligator", "Frog", "Gecko", "Iguana",
    "Lizard", "Salamander", "Snake", "Toad", "Turtle_Tortoise"
]
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# --- Load the Keras Model ---
try:
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}. Please make sure the model exists.")
    model = tf.keras.models.load_model(MODEL_PATH)
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

def allowed_file(filename):
    """Check if the uploaded file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_image(image_bytes):
    """Preprocess the image for model prediction."""
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize((224, 224))
    img_array = np.array(img)
    # Normalize pixel values to [0, 1]
    img_array = img_array / 255.0
    # Expand dimensions to create a batch of 1
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

# --- API Endpoints ---
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify server is running."""
    return jsonify({"status": "ok", "message": "Server is healthy."})

@app.route('/predict', methods=['POST'])
def predict():
    """Handle image upload and return model prediction."""
    if model is None:
        return jsonify({"error": "Model is not loaded. Please check server logs."}), 500

    # 1. Validate file existence
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']

    # 2. Validate filename
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # 3. Validate file type
    if not allowed_file(file.filename):
        return jsonify({"error": f"Invalid file type. Allowed types: {list(ALLOWED_EXTENSIONS)}"}), 400

    try:
        # 4. Read and preprocess the image
        image_bytes = file.read()
        processed_image = preprocess_image(image_bytes)

        # 5. Make prediction
        prediction_scores = model.predict(processed_image)[0]

        # 6. Format the response
        results = []
        for i, score in enumerate(prediction_scores):
            results.append({
                "class": CLASS_NAMES[i],
                "confidence": float(score)
            })
        
        # Sort results by confidence in descending order
        results.sort(key=lambda x: x['confidence'], reverse=True)
        
        return jsonify(results)

    except Exception as e:
        print(f"An error occurred during prediction: {e}")
        return jsonify({"error": "An internal error occurred while processing the image."}), 500

if __name__ == '__main__':
    # Use 0.0.0.0 to make it accessible on the network
    app.run(host='0.0.0.0', port=5000, debug=True)