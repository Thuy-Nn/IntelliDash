import os
import uuid
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
from main import DashboardOrchestrator

app = Flask(__name__)
CORS(app)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'json', 'parquet'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/", methods=["GET"])
def home():
    return "IntelliDash REST API is running."

@app.route("/upload", methods=["POST"])
def upload_and_create_dashboard():
    
    if "file" not in request.files:
        return jsonify({"error": "No file provided. Please include 'file' in form data"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": f"File type not supported. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"}), 400

    try:
        safe_name = secure_filename(file.filename)
        unique_name = f"{uuid.uuid4().hex}_{safe_name}"
        save_path = os.path.abspath(os.path.join(UPLOAD_DIR, unique_name))
        file.save(save_path)

        orchestrator = DashboardOrchestrator()
        result = orchestrator.create_dashboard(save_path)

        return jsonify({
            "success": True,
            "message": "File uploaded and dashboard created successfully",
            # "file_path": save_path,
            "filename": unique_name,
            "dashboard": result,
        }), 200

    except Exception as e:
        return jsonify({"error": f"Failed to create dashboard: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

