
import os
import logging
import google.generativeai as genai

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize the client with error handling
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    logger.error("GEMINI_API_KEY environment variable is not set.")
    raise RuntimeError("GEMINI_API_KEY environment variable is required.")

# Clean the API key by removing any quotes or extra content
if '=' in GEMINI_API_KEY:  # If Docker passed the entire env var string
    GEMINI_API_KEY = GEMINI_API_KEY.split('=', 1)[1]  # Get everything after the =

# Remove any remaining quotes and whitespace
GEMINI_API_KEY = GEMINI_API_KEY.replace('"', '').replace("'", '').strip()


genai.configure(api_key=GEMINI_API_KEY)


def get_gemini_response(cluster_info, student_data):
    """
    Generates a personalized career guidance response using the Gemini API.
    """
    generation_config = {
        "temperature": 0.9,
        "top_p": 0.85,
        "top_k": 30,
        "max_output_tokens": 4096,
    }
    safety_settings = [
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    ]

    try:
        student_profile = student_data.to_string()
    except Exception as e:
        logger.error(f"Failed to convert student_data to string: {e}")
        student_profile = str(student_data)

    prompt = f"""
    As an expert career counselor, provide a detailed and personalized career path recommendation for a student.

    **Student's Profile:**
    {student_profile}

    **Initial Career Cluster Analysis:**
    Our model has identified the following career cluster as a potential fit for the student:
    - **Cluster Name:** {cluster_info.get('name', 'N/A')}
    - **Description:** {cluster_info.get('description', 'N/A')}
    - **Key Traits:** {', '.join(cluster_info.get('key_traits', []))}
    - **Potential Career Paths:** {', '.join(cluster_info.get('career_paths', []))}

    **Your Task:**
    Based on the student's complete profile and the initial cluster analysis, provide a comprehensive and encouraging report. The report should include:
    1.  **Introduction:** A warm and personalized opening acknowledging the student's inputs.
    2.  **Analysis of Strengths:** Interpret the student's self-reported skills, interests, and academic performance. Highlight their strengths and connect them to potential career fields.
    3.  **Career Path Recommendations:** Elaborate on the suggested career paths from the cluster. Suggest 2-3 specific, actionable career roles. For each role, describe a typical day, required skills, and future outlook.
    4.  **Educational Guidance:** Recommend specific educational pathways (e.g., degrees, certifications) needed for these roles. Suggest relevant subjects the student should focus on.
    5.  **Actionable Next Steps:** Provide a clear, step-by-step plan for the student to explore these recommendations further. This could include online courses, internships, informational interviews, or projects.
    6.  **Encouraging Closing:** End with a positive and motivational message.

    Structure the response in a clear, readable format using markdown.
    """

    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            generation_config=generation_config,
            safety_settings=safety_settings
        )
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Error generating Gemini response: {e}")
        return "Sorry, there was an error generating your career guidance report. Please try again later."
