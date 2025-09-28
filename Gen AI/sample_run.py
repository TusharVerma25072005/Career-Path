"""Sample runner to demonstrate clustering and matching.

Usage:
  - ensure `carrer.csv` and `student.csv` are in the same folder
  - install requirements from requirements.txt
  - run: python sample_run.py
"""
from career_guidance import (
    load_career_data, load_student_data, preprocess_for_clustering,
    recursive_agglomerative_split, generate_cluster_metadata, prepare_gemini_prompt,
    save_clusters_metadata, load_mappings, convert_free_text_to_student, apply_mapping_to_student
)
import pandas as pd


def main():
    career_df = load_career_data('carrer.csv')
    student_df = load_student_data('student.csv')

    print('Loaded careers:', len(career_df), 'rows')
    print('Loaded students:', len(student_df), 'rows')

    X_scaled, scaler = preprocess_for_clustering(career_df)
    print('Prepared features with shape', X_scaled.shape)

    cluster_labels = recursive_agglomerative_split(X_scaled, career_df, max_cluster_size=25)
    print('Produced', cluster_labels.nunique(), 'clusters')

    clusters_meta = generate_cluster_metadata(cluster_labels, career_df, X_scaled)
    save_clusters_metadata('clusters_meta.json', clusters_meta)
    print('Saved clusters_meta.json')

    # match first student as a demo
    # Demonstrate conversion from free-text to student record
    mappings = load_mappings('mapping.csv')
    example_text = """
    name: Rahul; age: 17; stream: Science; interest: Data Science; expected_salary: 1500000; academic_average: 85
    """
    student_dict = convert_free_text_to_student(example_text, mappings)
    student_dict = apply_mapping_to_student(student_dict, mappings)

    # for demo, compute matches and show a compact summary
    from career_guidance import match_student_to_clusters
    matches = match_student_to_clusters(student_dict, clusters_meta, scaler, list(X_scaled.columns), top_k=3)
    print('\nTop matches (compact):')
    for m in matches:
        print('-', m['cluster_id'], 'distance=', m['distance'], 'size=', clusters_meta[m['cluster_id']]['size'])


if __name__ == '__main__':
    main()
