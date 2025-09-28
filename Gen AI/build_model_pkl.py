"""Build and save a pickled career guidance model artifact.

The artifact contains:
- scaler: StandardScaler fitted on career features
- career_feature_columns: list of feature column names used
- cluster_labels: pandas Series mapping career_df index -> cluster id
- clusters_meta: dict with cluster metadata
- career_df: the original career dataframe (for lookups)

Run:
  python build_model_pkl.py

Output: career_model.pkl in the project root.
"""
import pandas as pd
import pickle
from career_guidance import (
    load_career_data,
    preprocess_for_clustering,
    recursive_agglomerative_split,
    generate_cluster_metadata,
    load_mappings,
    apply_mapping_to_student,
)


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Build career_model.pkl')
    parser.add_argument('--career_csv', default='carrer.csv')
    parser.add_argument('--mapping_csv', default='mapping.csv')
    parser.add_argument('--out', default='career_model.pkl')
    args = parser.parse_args()

    career_df = load_career_data(args.career_csv)
    mappings = load_mappings(args.mapping_csv)

    # Attempt to apply mappings to career_df where columns match
    if mappings:
        for col, map_dict in mappings.items():
            if col in career_df.columns:
                # map using dictionary; unknowns -> -1
                career_df[col] = career_df[col].apply(lambda v: map_dict.get(str(v).strip(), -1) if pd.notna(v) else -1)
    X_scaled, scaler = preprocess_for_clustering(career_df)

    print('Features prepared:', X_scaled.shape)

    # choose max_cluster_size tuned for saved model; change as needed
    cluster_labels = recursive_agglomerative_split(X_scaled, career_df, max_cluster_size=25)
    clusters_meta = generate_cluster_metadata(cluster_labels, career_df, X_scaled)

    artifact = {
        'scaler': scaler,
        'career_feature_columns': list(X_scaled.columns),
        'cluster_labels': cluster_labels,
        'clusters_meta': clusters_meta,
    'career_df': career_df,
    'mappings': mappings,
    }

    out_path = args.out
    with open(out_path, 'wb') as f:
        pickle.dump(artifact, f)

    print(f'Saved {out_path}')


if __name__ == '__main__':
    main()
