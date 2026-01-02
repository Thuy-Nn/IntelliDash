from flask import Flask, request, jsonify
from flask_cors import CORS
from main import DashboardOrchestrator

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def home():
    return "IntelliDash REST API is running."

@app.route("/create_dashboard", methods=["POST"])
def create_dashboard():
    # data = request.json
    # file_path = data.get("file_path")
    
    # if not file_path:
    #     return jsonify({"error": "file_path is required"}), 400
    
    file_path = "Walmart_Sales.csv"

    orchestrator = DashboardOrchestrator()
    result = orchestrator.create_dashboard(file_path)
    
    return jsonify(result)


if __name__ == "__main__":
    app.run()

