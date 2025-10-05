import pandas as pd
import joblib

def load_model_artifacts():
    """Load the pre-trained model and other necessary files."""
    try:
        print("Attempting to load model files...")
        model = joblib.load('career_model.pkl')
        print("Loaded career_model.pkl")
        
        # Correctly load the JSON file
        with open('clusters_meta.json', 'r') as f:
            clusters_meta_json = pd.read_json(f, orient='index')
        print("Loaded clusters_meta.json")

        mapping = pd.read_csv('mapping.csv')
        print("Loaded mapping.csv")
        
        # Extract model columns from the model if available
        if hasattr(model, 'feature_names_in_'):
            model_columns = model.feature_names_in_
        else:
            # Define model columns manually if not available in the model object
            model_columns = [
                'age', 'grade', 'parental_interest_level', 'psychometric_aptitude_verbal',
                'psychometric_aptitude_quantitative', 'exploration_work_score', 'creativity_score',
                'expected_salary', 'teamwork_score', 'psychometric_test_score', 'academic_average',
                'academic_max', 'academic_min', 'academic_std', 'academic_subjects_count',
                'hobby_count', 'has_creative_hobby', 'has_technical_hobby', 'has_sports_hobby',
                'stream_Arts', 'stream_Commerce', 'stream_Science', 'family_income_band_High',
                'family_income_band_Low', 'family_income_band_Lower-Middle', 'family_income_band_Middle',
                'family_income_band_Upper-Middle', 'parental_expectation_field_Arts',
                'parental_expectation_field_Commerce', 'parental_expectation_field_Engineering',
                'parental_expectation_field_Law', 'parental_expectation_field_Medicine',
                'parental_expectation_field_Science', 'parental_expectation_field_Technology',
                'psychometric_test_given_No', 'psychometric_test_given_Yes', 'interest_Arts',
                'interest_Commerce', 'interest_Engineering', 'interest_Law', 'interest_Medicine',
                'interest_Science', 'interest_Technology', 'comfortable_outside_india_No',
                'comfortable_outside_india_Yes', 'job_seeking_preference_Hybrid',
                'job_seeking_preference_On-site', 'job_seeking_preference_Remote',
                'disability_status_Hearing', 'disability_status_Learning', 'disability_status_Physical',
                'disability_status_Unknown', 'disability_status_Visual'
            ]
            
        return model, clusters_meta_json, mapping, model_columns

    except Exception as e:
        print(f"Error loading model files: {str(e)}. Make sure all model-related files are present.")
        return None, None, None, None
