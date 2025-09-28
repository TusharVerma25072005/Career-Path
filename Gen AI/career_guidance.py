"""Career guidance clustering and matching utilities.

This module provides:
- loading and preprocessing of career and student CSVs
- agglomerative clustering with a recursive split heuristic
- cluster metadata generation
- simple student-to-cluster matching
- Gemini prompt preparation (placeholder for API call)

This is intentionally conservative: the Gemini call is a placeholder and
must be wired with credentials by the user.
"""
from typing import List, Dict, Any, Tuple
import json
import csv
import re
import numpy as np
import pandas as pd
from sklearn.cluster import AgglomerativeClustering
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_distances


def load_career_data(path: str) -> pd.DataFrame:
    return pd.read_csv(path)


def load_student_data(path: str) -> pd.DataFrame:
    return pd.read_csv(path)


def load_mappings(path: str) -> Dict[str, Dict[str, int]]:
    """Load mapping.csv into a dict: {column: {original_value: encoded_value}}"""
    mappings: Dict[str, Dict[str, int]] = {}
    try:
        with open(path, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                col = row.get('column')
                orig = row.get('original_value')
                enc = row.get('encoded_value')
                if col is None or orig is None or enc is None:
                    continue
                try:
                    enc_val = int(enc)
                except Exception:
                    try:
                        enc_val = float(enc)
                    except Exception:
                        enc_val = enc
                mappings.setdefault(col, {})[str(orig).strip()] = enc_val
    except FileNotFoundError:
        # No mapping file available
        return {}
    return mappings


def apply_mapping_to_student(student: Dict[str, Any], mappings: Dict[str, Dict[str, int]], default_value: int = -1) -> Dict[str, Any]:
    """Apply categorical mappings in-place on a student dict.

    If value is numeric already, it is left as-is. Unknown categorical values map to default_value.
    """
    out = dict(student)  # shallow copy
    for col, map_dict in mappings.items():
        if col in out:
            val = out[col]
            # if already numeric, keep
            if isinstance(val, (int, float)) and not isinstance(val, bool):
                continue
            key = str(val).strip()
            # direct match
            if key in map_dict:
                out[col] = map_dict[key]
                continue
            # try common normalizations
            key_title = key.title()
            key_upper = key.upper()
            key_lower = key.lower()
            mapped = map_dict.get(key_title) or map_dict.get(key_upper) or map_dict.get(key_lower)
            if mapped is not None:
                out[col] = mapped
            else:
                out[col] = default_value
    return out


def convert_free_text_to_student(text: str, mappings: Dict[str, Dict[str, int]] = None) -> Dict[str, Any]:
    """Convert simple free-text input into a student dict.

    This function supports key:value or key=value pairs separated by newlines or commas.
    It also extracts some numeric fields via regex (age, expected_salary, scores).
    It's heuristic-based and intentionally permissive.
    """
    if text is None:
        return {}
    s = {}
    # split on newlines or semicolons
    parts = re.split(r'[\n;]+', text)
    for part in parts:
        if not part or part.strip() == '':
            continue
        # if contains ':' or '=' parse key/value
        if ':' in part or '=' in part:
            if ':' in part:
                key, val = part.split(':', 1)
            else:
                key, val = part.split('=', 1)
            key = key.strip()
            val = val.strip()
            s[key] = _coerce_value(val)
            continue
        # also split by commas for inline fields
        for sub in part.split(','):
            if ':' in sub or '=' in sub:
                if ':' in sub:
                    key, val = sub.split(':', 1)
                else:
                    key, val = sub.split('=', 1)
                s[key.strip()] = _coerce_value(val.strip())

    # fallback: common numeric extraction
    # age
    if 'age' not in s:
        m = re.search(r'\b(age)\D*(\d{1,2})\b', text, flags=re.I)
        if m:
            s['age'] = int(m.group(2))
    # expected_salary
    if 'expected_salary' not in s:
        m = re.search(r'expected[_ ]?salary\D*([0-9,]+)', text, flags=re.I)
        if m:
            s['expected_salary'] = int(m.group(1).replace(',', ''))
    # simple scores
    for score_key in ['math_score', 'english_score', 'science_score', 'academic_average']:
        if score_key not in s:
            m = re.search(rf'\b{score_key.replace("_","[ _]?")}\D*(\d{{1,3}}(?:\.\d+)?)', text, flags=re.I)
            if m:
                try:
                    s[score_key] = float(m.group(1))
                except Exception:
                    pass

    # Normalize keys: lower-case, replace spaces with underscore
    s_norm = {}
    for k, v in s.items():
        k2 = k.strip().lower().replace(' ', '_')
        s_norm[k2] = v

    # If mappings provided, attempt to map any categorical values now
    if mappings:
        s_norm = apply_mapping_to_student(s_norm, mappings)

    return s_norm


def _coerce_value(val: str):
    # try int then float, else return string
    v = val.replace(',', '')
    if v.isdigit():
        return int(v)
    try:
        return int(float(v))
    except Exception:
        pass
    try:
        return float(v)
    except Exception:
        pass
    return val


def _encode_entry_difficulty(series: pd.Series) -> pd.Series:
    mapping = {
        'Easy': 0,
        'Moderate': 1,
        'Hard': 2,
        'Very Hard': 3,
        'Very Hard,': 3  # tolerant
    }
    return series.map(mapping).fillna(0).astype(float)


def _encode_remote_feasibility(series: pd.Series) -> pd.Series:
    mapping = {
        'Remote': 0,
        'Hybrid': 1,
        'On-site': 2,
        'Low': 1,
        'High': 0
    }
    return series.map(mapping).fillna(1).astype(float)


def preprocess_for_clustering(career_df: pd.DataFrame) -> Tuple[pd.DataFrame, StandardScaler]:
    # Select a set of numeric features that represent job requirements / attributes.
    numeric_cols = [
        'verbal_aptitude_weight', 'quantitative_aptitude_weight',
        'creativity_requirement', 'teamwork_requirement', 'exploration_requirement',
        'salary_inr_avg', 'work_life_balance_score', 'stress_level',
        'growth_trajectory_5yr', 'automation_risk_level', 'industry_stability',
        'job_security_score'
    ]

    df = career_df.copy()

    # Best-effort encode some known categorical columns that are useful
    if 'entry_difficulty' in df.columns:
        df['entry_difficulty_enc'] = _encode_entry_difficulty(df['entry_difficulty'])
        numeric_cols.append('entry_difficulty_enc')

    if 'remote_work_feasibility' in df.columns:
        df['remote_work_feasibility_enc'] = _encode_remote_feasibility(df['remote_work_feasibility'])
        numeric_cols.append('remote_work_feasibility_enc')

    # Restrict to numeric_cols that actually exist
    numeric_cols = [c for c in numeric_cols if c in df.columns]

    X = df[numeric_cols].copy()

    # Fill missing values with column medians
    X = X.fillna(X.median())

    scaler = StandardScaler()
    X_scaled = pd.DataFrame(scaler.fit_transform(X), columns=X.columns, index=df.index)

    return X_scaled, scaler


def _attempt_split(X: pd.DataFrame, indices: np.ndarray) -> Tuple[np.ndarray, float]:
    """Attempt to split the subset indexed by `indices` into two subclusters.
    Returns labels for these indices (0/1) and the silhouette score for the split.
    If splitting is not possible (too small), returns original labels and -1.
    """
    if len(indices) < 4:
        return np.zeros(len(indices), dtype=int), -1.0

    subset = X.loc[indices]
    # try 2 clusters
    clustering = AgglomerativeClustering(n_clusters=2)
    labels = clustering.fit_predict(subset)
    try:
        score = silhouette_score(subset, labels)
    except Exception:
        score = -1.0
    return labels, float(score)


def recursive_agglomerative_split(X: pd.DataFrame,
                                  career_df: pd.DataFrame,
                                  max_cluster_size: int = 50,
                                  min_improvement: float = 0.05) -> pd.Series:
    """Recursively split clusters that are too large or heterogeneous.

    Returns a pandas Series mapping career_df index -> cluster_id (string path-style)
    e.g. 'C0', 'C0.0', 'C0.1', 'C0.1.0'
    """
    # Start with all in a single cluster
    cluster_map: Dict[str, List[int]] = {'C0': list(X.index)}

    changed = True
    while changed:
        changed = False
        # sort keys to avoid modifying while iterating unpredictably
        keys = list(cluster_map.keys())
        for k in keys:
            indices = np.array(cluster_map[k])
            if len(indices) <= max_cluster_size:
                continue

            # compute current silhouette if possible
            if len(indices) >= 3:
                try:
                    current_labels = np.zeros(len(indices), dtype=int)
                    current_score = -1.0
                except Exception:
                    current_score = -1.0
            else:
                current_score = -1.0

            labels, split_score = _attempt_split(X, indices)
            # only accept split if split_score improves enough
            if split_score > current_score + min_improvement and split_score > 0:
                # create two new cluster keys
                k0 = k + '.0'
                k1 = k + '.1'
                cluster_map[k0] = indices[labels == 0].tolist()
                cluster_map[k1] = indices[labels == 1].tolist()
                del cluster_map[k]
                changed = True
                # break to restart iteration from top-level after modification
                break

    # Build final mapping series
    mapping = {}
    for k, idxs in cluster_map.items():
        for i in idxs:
            mapping[i] = k

    mapping_series = pd.Series(mapping)
    mapping_series.index = mapping_series.index.astype(int)
    mapping_series = mapping_series.sort_index()
    return mapping_series


def generate_cluster_metadata(cluster_labels: pd.Series, career_df: pd.DataFrame, X_scaled: pd.DataFrame) -> Dict[str, Dict[str, Any]]:
    """Create metadata for each cluster (centroid, size, top job titles).
    Returns a dict cluster_id -> metadata
    """
    clusters = {}
    for cluster_id in sorted(cluster_labels.unique()):
        idxs = cluster_labels[cluster_labels == cluster_id].index
        subset = X_scaled.loc[idxs]
        centroid = subset.mean().to_dict()
        size = len(idxs)
        top_jobs = career_df.loc[idxs].sort_values('salary_inr_avg', ascending=False).head(5)['job_title'].tolist()
        primary_categories = career_df.loc[idxs]['primary_category'].value_counts().to_dict()
        clusters[cluster_id] = {
            'centroid': centroid,
            'size': size,
            'top_jobs': top_jobs,
            'primary_categories': primary_categories
        }
    return clusters


def match_student_to_clusters(student_row: pd.Series,
                              clusters_meta: Dict[str, Dict[str, Any]],
                              scaler: StandardScaler,
                              career_feature_columns: List[str],
                              top_k: int = 3) -> List[Dict[str, Any]]:
    """Match a single student to the top_k nearest clusters by centroid similarity.

    student_row: raw student row (pandas Series). We expect certain fields to be present
    (psychometric_aptitude_verbal, psychometric_aptitude_quantitative, exploration_work_score,
     creativity_score, teamwork_score, expected_salary).
    career_feature_columns: list of columns used for career clustering BEFORE scaling
    scaler: the StandardScaler trained on career features
    Returns: list of cluster metadata dicts with distance.
    """
    # Build a student feature vector aligned with career_feature_columns
    student_vec = []
    s = student_row
    # Map student fields to career feature names where reasonable
    field_map = {
        'verbal_aptitude_weight': 'psychometric_aptitude_verbal',
        'quantitative_aptitude_weight': 'psychometric_aptitude_quantitative',
        'creativity_requirement': 'creativity_score',
        'teamwork_requirement': 'teamwork_score',
        'exploration_requirement': 'exploration_work_score',
        'salary_inr_avg': 'expected_salary'
    }

    for col in career_feature_columns:
        if col in field_map:
            stud_field = field_map[col]
            val = s.get(stud_field, np.nan)
            if pd.isna(val):
                # fallback default
                val = 0.0
        else:
            val = 0.0
        student_vec.append(float(val))

    student_vec = np.array(student_vec).reshape(1, -1)
    # scale with same scaler (scaler expects same number of columns)
    try:
        student_scaled = scaler.transform(student_vec)
    except Exception:
        # if scaler cannot transform because columns mismatch, try simple normalization
        student_scaled = (student_vec - np.nanmean(student_vec, axis=0)) / (np.nanstd(student_vec, axis=0) + 1e-9)

    # compute distance to cluster centroids
    results = []
    for cid, meta in clusters_meta.items():
        centroid = np.array([meta['centroid'].get(c, 0.0) for c in scaler.feature_names_in_])
        # centroid is in scaled space already (since X_scaled used)
        dist = float(cosine_distances(student_scaled, centroid.reshape(1, -1))[0, 0])
        results.append({'cluster_id': cid, 'distance': dist, 'meta': meta})

    results = sorted(results, key=lambda r: r['distance'])[:top_k]
    return results


def prepare_gemini_prompt(student: Dict[str, Any], cluster_meta: Dict[str, Any]) -> str:
    """Prepare a natural-language prompt to send to Gemini (or other LLM) with student + cluster info.
    This function returns the prompt string; sending the prompt is intentionally left as a placeholder.
    """
    prompt_lines = [
        "You are a career guidance assistant.",
        "Student profile:",
    ]
    for k, v in student.items():
        prompt_lines.append(f"- {k}: {v}")

    prompt_lines.append("\nMatched career cluster summary:")
    prompt_lines.append(f"- Cluster id: {cluster_meta.get('cluster_id', 'unknown')}")
    prompt_lines.append(f"- Size: {cluster_meta.get('size')}")
    prompt_lines.append(f"- Top job titles: {', '.join(cluster_meta.get('top_jobs', []) )}")
    prompt_lines.append("\nPlease provide tailored study and career-path recommendations for this student, including short-term and long-term steps, skill-building resources, and realistic alternatives.")

    return "\n".join(prompt_lines)


def send_to_gemini(prompt: str, api_key: str = None) -> Dict[str, Any]:
    """Placeholder: send the prompt to Gemini-like API.

    DO NOT include real API keys in code. Replace this with an actual client call.
    """
    raise NotImplementedError("Wire your Gemini/OpenAI client here. This is a placeholder.")


def save_clusters_metadata(path: str, clusters_meta: Dict[str, Any]):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(clusters_meta, f, indent=2, default=list)


if __name__ == '__main__':
    print('Run the `sample_run.py` script to see an example pipeline.')
