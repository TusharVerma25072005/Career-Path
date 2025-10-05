-- Add new columns to assessments table to store comprehensive assessment data
ALTER TABLE assessments
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS grade_level TEXT,
ADD COLUMN IF NOT EXISTS academic_stream TEXT,
ADD COLUMN IF NOT EXISTS disability TEXT,
ADD COLUMN IF NOT EXISTS hobbies TEXT[],
ADD COLUMN IF NOT EXISTS family_income TEXT,
ADD COLUMN IF NOT EXISTS parental_expectation TEXT,
ADD COLUMN IF NOT EXISTS parental_interest INTEGER,
ADD COLUMN IF NOT EXISTS verbal_aptitude INTEGER,
ADD COLUMN IF NOT EXISTS quantitative_aptitude INTEGER,
ADD COLUMN IF NOT EXISTS creativity_score INTEGER,
ADD COLUMN IF NOT EXISTS teamwork_score INTEGER,
ADD COLUMN IF NOT EXISTS openness_score INTEGER,
ADD COLUMN IF NOT EXISTS field_of_interest TEXT,
ADD COLUMN IF NOT EXISTS expected_salary INTEGER,
ADD COLUMN IF NOT EXISTS work_arrangement TEXT,
ADD COLUMN IF NOT EXISTS international_work BOOLEAN,
ADD COLUMN IF NOT EXISTS english_score INTEGER,
ADD COLUMN IF NOT EXISTS math_score INTEGER,
ADD COLUMN IF NOT EXISTS science_score INTEGER,
ADD COLUMN IF NOT EXISTS psychometric_test BOOLEAN,
ADD COLUMN IF NOT EXISTS psychometric_score TEXT;

-- Add check constraints for valid ranges
ALTER TABLE assessments
ADD CONSTRAINT age_range CHECK (age >= 13 AND age <= 19),
ADD CONSTRAINT parental_interest_range CHECK (parental_interest >= 0 AND parental_interest <= 10),
ADD CONSTRAINT verbal_aptitude_range CHECK (verbal_aptitude >= 0 AND verbal_aptitude <= 10),
ADD CONSTRAINT quantitative_aptitude_range CHECK (quantitative_aptitude >= 0 AND quantitative_aptitude <= 10),
ADD CONSTRAINT creativity_range CHECK (creativity_score >= 0 AND creativity_score <= 10),
ADD CONSTRAINT teamwork_range CHECK (teamwork_score >= 0 AND teamwork_score <= 10),
ADD CONSTRAINT openness_range CHECK (openness_score >= 0 AND openness_score <= 10),
ADD CONSTRAINT english_score_range CHECK (english_score >= 0 AND english_score <= 100),
ADD CONSTRAINT math_score_range CHECK (math_score IS NULL OR (math_score >= 0 AND math_score <= 100)),
ADD CONSTRAINT science_score_range CHECK (science_score IS NULL OR (science_score >= 0 AND science_score <= 100));