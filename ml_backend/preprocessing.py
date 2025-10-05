import pandas as pd

def preprocess_data(data, model_columns, mapping):
    """
    Preprocesses the incoming JSON data to match the model's input format.
    """
    # Convert incoming JSON to a DataFrame
    df = pd.DataFrame([data])

    # Normalize rating scales from 0-10 to 0.0-1.0
    rating_scales = [
        'parental_interest_level', 'psychometric_aptitude_verbal',
        'psychometric_aptitude_quantitative', 'exploration_work_score',
        'creativity_score', 'teamwork_score'
    ]
    for col in rating_scales:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce') / 10.0

    # Calculate academic stats
    subject_scores = [
        'math_score', 'english_score', 'science_score'
        # Add other potential subject score columns here if any
    ]
    scores = df[subject_scores].apply(pd.to_numeric, errors='coerce').dropna(axis=1)
    
    if not scores.empty:
        df['academic_average'] = scores.mean(axis=1)
        df['academic_max'] = scores.max(axis=1)
        df['academic_min'] = scores.min(axis=1)
        df['academic_std'] = scores.std(axis=1)
        df['academic_subjects_count'] = scores.count(axis=1)
    else:
        df['academic_average'] = 0
        df['academic_max'] = 0
        df['academic_min'] = 0
        df['academic_std'] = 0
        df['academic_subjects_count'] = 0

    # Calculate hobby-related features
    hobby_cols = ['has_creative_hobby', 'has_technical_hobby', 'has_sports_hobby']
    df['hobby_count'] = df[hobby_cols].sum(axis=1)
    
    # One-hot encode categorical variables based on the mapping file
    for _, row in mapping.iterrows():
        column, value = row['column'], row['original_value']
        new_col_name = f"{column}_{value}"
        if column in df.columns:
            df[new_col_name] = (df[column] == value).astype(int)

    for col in model_columns:
        if col not in df.columns:
            df[col] = 0
    
    # Fill any remaining NaNs with 0 (or a more appropriate strategy)
    df.fillna(0, inplace=True)

    return df[model_columns]

def calculate_scores(answers, mapping):
    """
    Calculates scores from questionnaire answers to be used as input for the ML model.
    """
    # Mapping for categorical variables
    # Create mappings from the mapping.csv file
    grade_map = dict(zip(mapping[mapping['column'] == 'grade']['original_value'], 
                        mapping[mapping['column'] == 'grade']['encoded_value']))
    stream_map = dict(zip(mapping[mapping['column'] == 'stream']['original_value'], 
                         mapping[mapping['column'] == 'stream']['encoded_value']))
    income_map = dict(zip(mapping[mapping['column'] == 'family_income_band']['original_value'], 
                         mapping[mapping['column'] == 'family_income_band']['encoded_value']))
    parent_expectation_map = dict(zip(mapping[mapping['column'] == 'parental_expectation_field']['original_value'], 
                                    mapping[mapping['column'] == 'parental_expectation_field']['encoded_value']))
    career_interest_map = dict(zip(mapping[mapping['column'] == 'interest']['original_value'], 
                                 mapping[mapping['column'] == 'interest']['encoded_value']))
    work_arrangement_map = dict(zip(mapping[mapping['column'] == 'job_seeking_preference']['original_value'], 
                                  mapping[mapping['column'] == 'job_seeking_preference']['encoded_value']))
    yes_no_map = {'Yes': 1, 'No': 0}

    # Hobbies - one-hot encoding
    hobbies = answers.get('5', [])
    hobbies_creative = 1 if 'Creative Hobbies' in hobbies else 0
    hobbies_technical = 1 if 'Technical Hobbies' in hobbies else 0
    hobbies_sports = 1 if 'Sports' in hobbies else 0
    
    # Disability - simple binary
    disability = answers.get('4', [])
    has_disability = 0 if 'Unknown' in disability or not disability else 1

    # Create a dictionary with the processed features
    feature_dict = {
        'age': answers.get('1'),
        'grade': grade_map.get(answers.get('2'), -1),
        'stream': stream_map.get(answers.get('3'), -1),
        'family_income_band': income_map.get(answers.get('6'), -1),
        'parental_expectation_field': parent_expectation_map.get(answers.get('7'), -1),
        'parental_interest_level': answers.get('8'),
        'psychometric_aptitude_verbal': answers.get('9'),
        'psychometric_aptitude_quantitative': answers.get('10'),
        'creativity_score': answers.get('11'),
        'teamwork_score': answers.get('12'),
        'exploration_work_score': answers.get('13'),
        'interest': career_interest_map.get(answers.get('14'), -1),
        'expected_salary': answers.get('15'),
        'job_seeking_preference': work_arrangement_map.get(answers.get('16'), -1),
        'comfortable_outside_india': yes_no_map.get(answers.get('17'), -1),
        'math_score': answers.get('18'),
        'english_score': answers.get('19'),
        'science_score': answers.get('20'),
        'psychometric_test_given': yes_no_map.get(answers.get('21'), -1),
        'psychometric_test_score': answers.get('22', 0) or 0, # Handles None or empty string
        'has_creative_hobby': hobbies_creative,
        'has_technical_hobby': hobbies_technical,
        'has_sports_hobby': hobbies_sports,
        'disability_status': has_disability
    }
    
    return feature_dict
