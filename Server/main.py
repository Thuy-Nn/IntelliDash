import os
import uuid
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
from pipeline import DashboardOrchestrator
from google.cloud import storage


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


# Cloud Run: use /tmp for temporary files
TMP_DIR = "/tmp"

# Make sure to create this bucket in GCP console
GCS_BUCKET_NAME = 'intellidash'

def upload_to_gcs(local_path, destination_blob_name, content_type):
    """
    Uploads a local file to GCS and returns the gs:// URI.
    """
    if not GCS_BUCKET_NAME:
        raise RuntimeError("Missing env var GCS_BUCKET_NAME")

    client = storage.Client()
    bucket = client.bucket(GCS_BUCKET_NAME)
    blob = bucket.blob(destination_blob_name)

    blob.upload_from_filename(local_path, content_type=content_type)

    return f"gs://{GCS_BUCKET_NAME}/{destination_blob_name}"
    

@app.route("/upload", methods=["POST"])
def upload_and_create_dashboard():
    
    if "file" not in request.files:
        return jsonify({"error": "No file provided. Please include 'file' in form data"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": f"File type not supported. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"}), 400

    if not GCS_BUCKET_NAME:
        return jsonify({"error": "Server misconfigured: GCS_BUCKET_NAME not set"}), 500
    
    local_path = None

    try:
        safe_name = secure_filename(file.filename)
        unique_name = f"{uuid.uuid4().hex}_{safe_name}"

        # 1) Save to /tmp (ephemeral but fine for request-time processing)
        local_path = os.path.join(TMP_DIR, unique_name)
        file.save(local_path)

        # 2) Upload to GCS (store the raw upload durably)
        gcs_object_name = f"uploads/{unique_name}"
        gcs_uri = upload_to_gcs(
            local_path=local_path,
            destination_blob_name=gcs_object_name,
            content_type=file.mimetype,
        )

        # 3) Run your existing orchestrator against the local temp file
        orchestrator = DashboardOrchestrator()
        result = orchestrator.create_dashboard(local_path)

        return jsonify({
            "success": True,
            "message": "File uploaded and dashboard created successfully",
            "filename": unique_name,
            "gcs_bucket": GCS_BUCKET_NAME,
            "gcs_object": gcs_object_name,
            "gcs_uri": gcs_uri,
            "dashboard": result,
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        # 4) Cleanup local temp file (best practice on Cloud Run)
        if local_path and os.path.exists(local_path):
            try:
                os.remove(local_path)
            except Exception:
                pass


@app.route("/upload_legacy", methods=["POST"])
def upload_and_create_dashboard_legacy():
    
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
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))  # Cloud Run provides this
    app.run(host="0.0.0.0", port=port)

