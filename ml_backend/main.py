import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback

from config import configure_apis
from model_loader import load_model_artifacts
from preprocessing import preprocess_data, calculate_scores
from gemini_utils import get_gemini_response

# Configure APIs and load model artifacts
configure_apis()
model, clusters_meta, mapping, model_columns = load_model_artifacts()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.config['DEBUG'] = True

@app.route('/predict', methods=['POST'])
def predict():
    if not all([model, clusters_meta is not None, mapping is not None]):
        return jsonify({"error": "Model not loaded. Please check server logs."}), 500

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON input"}), 400

        original_data_df = pd.DataFrame([data])
        processed_df = preprocess_data(data, model_columns, mapping)

        prediction = model.predict(processed_df)
        cluster_id = prediction[0]

        if cluster_id in clusters_meta.index:
            cluster_info = clusters_meta.loc[cluster_id]
        else:
            return jsonify({"error": f"Predicted cluster ID {cluster_id} not found in metadata."}), 500

        gemini_response = get_gemini_response(cluster_info, original_data_df)

        return jsonify({
            "predicted_cluster": cluster_info.to_dict(),
            "career_guidance": gemini_response
        })

    except Exception as e:
        print(f"An error occurred during prediction: {e}")
        return jsonify({"error": "An internal error occurred."}), 500

@app.route('/predict_from_questionnaire', methods=['POST'])
def predict_from_questionnaire():
    if not all([model, clusters_meta is not None, mapping is not None]):
        return jsonify({"error": "Model not loaded"}), 500
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON provided"}), 400

        scores = calculate_scores(data, mapping)
        processed_data = preprocess_data(scores, model_columns, mapping)
        
        if hasattr(model, 'predict'):
            prediction = model.predict(processed_data)
            cluster_label = prediction[0]
        else:
            # Fallback for non-standard model object
            scores_series = processed_data.iloc[0]
            if scores_series['academic_average'] > 0.8 and scores_series['stream_Science'] == 1:
                cluster_label = 0
            elif scores_series['academic_average'] > 0.8:
                cluster_label = 1
            else:
                cluster_label = 2
        
        cluster_key = clusters_meta.index[cluster_label]
        cluster_info = clusters_meta.loc[cluster_key]
        
        if 'top_jobs' in cluster_info:
            careers = pd.DataFrame(cluster_info['top_jobs'], columns=['career_name'])
        else:
            careers = pd.DataFrame([{"career_name": "Career recommendations not available"}])

        student_df = pd.DataFrame([scores], index=[0])
        gemini_guidance = get_gemini_response(cluster_info, student_df)
        
        return jsonify({
            "cluster_label": int(cluster_label),
            "cluster_name": cluster_info.get('name', 'N/A'),
            "cluster_description": cluster_info.get('description', 'N/A'),
            "suggested_careers": careers.to_dict(orient='records'),
            "guidance": gemini_guidance
        })
    except Exception as e:
        error_details = {
            "error": str(e),
            "traceback": traceback.format_exc(),
            "received_data": request.get_json()
        }
        print("Error in predict_from_questionnaire:", error_details)
        return jsonify({"error": str(e), "details": error_details}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
