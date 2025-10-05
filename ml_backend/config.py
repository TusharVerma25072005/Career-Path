import os
import google.generativeai as genai
from dotenv import load_dotenv

def configure_apis():
    """Load environment variables and configure APIs."""
    load_dotenv()
    # Configure Gemini API
    # Make sure to set your GOOGLE_API_KEY environment variable
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

