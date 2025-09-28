"""Flask server to serve career guidance model inference.

Endpoints:
- GET /health -> simple health check
- POST /predict -> accepts JSON student profile, returns top-k cluster matches + prompt

This server expects `career_model.pkl` in the working directory.
"""
import os
import pickle
from flask import Flask, request, jsonify
from career_guidance import match_student_to_clusters, convert_free_text_to_student, apply_mapping_to_student

app = Flask(__name__)

# Load the pickled artifact at startup
MODEL_PATH = os.environ.get('CAREER_MODEL_PATH', 'career_model.pkl')
if not os.path.exists(MODEL_PATH):
    app.logger.warning(f"Model file {MODEL_PATH} not found. Please build career_model.pkl before starting.")
    model_artifact = None
else:
    with open(MODEL_PATH, 'rb') as f:
        model_artifact = pickle.load(f)


@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'model_loaded': model_artifact is not None})


@app.route('/predict', methods=['POST'])
def predict():
    if model_artifact is None:
        return jsonify({'error': 'Model not loaded on server'}), 500
    content_type = request.content_type or ''
    if 'application/json' in content_type:
        data = request.get_json()
        if data is None:
            return jsonify({'error': 'Expected JSON body with student data'}), 400
        student = data
    elif 'text/plain' in content_type or 'text/' in content_type:
        text = request.data.decode('utf-8')
        mappings = model_artifact.get('mappings') if model_artifact else None
        student = convert_free_text_to_student(text, mappings)
    else:
        # try parsing JSON by default
        data = request.get_json(silent=True)
        if data:
            student = data
        else:
            return jsonify({'error': 'Unsupported content type. Send application/json or text/plain free-text.'}), 415

    scaler = model_artifact['scaler']
    career_feature_columns = model_artifact['career_feature_columns']
    clusters_meta = model_artifact['clusters_meta']
    mappings = model_artifact.get('mappings', {})

    # Apply mappings to incoming student dict so categorical text values are encoded
    student = apply_mapping_to_student(student, mappings)

    # match
    raw_matches = match_student_to_clusters(student, clusters_meta, scaler, career_feature_columns, top_k=3)

    # Determine verbosity: allow request for full raw matches
    # 1) query param ?full=true
    # 2) JSON body contains {"full": true} (when sending JSON)
    # 3) request header X-Full-Response: 1
    full_flag = False
    try:
        if request.args.get('full', '').lower() in ('1', 'true', 'yes'):
            full_flag = True
        
    except Exception:
        pass

    # JSON body flags (only applies when JSON is used)
    if request.is_json:
        try:
            body_json = request.get_json(silent=True) or {}
            if isinstance(body_json, dict):
                if body_json.get('full') is True:
                    full_flag = True
                
        except Exception:
            pass

    # Header override
    if request.headers.get('X-Full-Response', '').lower() in ('1', 'true', 'yes'):
        full_flag = True

    def _to_native(o):
        """Recursively convert numpy types to native Python types for JSON serialization."""
        import numpy as _np
        if isinstance(o, dict):
            return {k: _to_native(v) for k, v in o.items()}
        if isinstance(o, list):
            return [_to_native(v) for v in o]
        if isinstance(o, tuple):
            return tuple(_to_native(v) for v in o)
        # numpy scalar
        if hasattr(o, 'item') and not isinstance(o, (str, bytes)):
            try:
                return o.item()
            except Exception:
                pass
        # numpy arrays
        if hasattr(o, 'tolist') and not isinstance(o, (str, bytes, dict)):
            try:
                return _to_native(o.tolist())
            except Exception:
                pass
        return o

    if full_flag:
        # Return full raw matches (converted to native types). Prompt is never returned to client.
        full_matches = _to_native(raw_matches)
        response = {'matches': full_matches}
    else:
        # Reduce payload: return only cluster_id, distance, and a small metadata summary
        matches = []
        for m in raw_matches:
            meta = _to_native(m.get('meta', {}))
            matches.append({
                'cluster_id': m.get('cluster_id'),
                'distance': float(m.get('distance')) if m.get('distance') is not None else None,
                'size': meta.get('size'),
                'top_jobs': meta.get('top_jobs')
            })
        response = {'matches': matches}
    return jsonify(response)


if __name__ == '__main__':
    # For local dev: python server.py
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
