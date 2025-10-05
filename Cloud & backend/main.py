import os
import requests
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app) # Enable CORS for all routes
load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

ML_BACKEND_URL = os.getenv("ML_BACKEND_URL", "http://localhost:8081") # Replace with your Vertex AI endpoint

@app.route('/assess', methods=['POST'])
def assess():
    try:
        user_assessment_data = request.get_json()
        if not user_assessment_data:
            return jsonify({"error": "Invalid JSON input"}), 400

        # 1. Call ML Backend (Vertex AI Endpoint)
        ml_response = requests.post(f"{ML_BACKEND_URL}/predict_from_questionnaire", json=user_assessment_data)
        ml_response.raise_for_status() # Raise an exception for HTTP errors
        ml_results = ml_response.json()

        cluster_name = ml_results.get('cluster_name', 'N/A')
        cluster_description = ml_results.get('cluster_description', 'N/A')
        suggested_careers = ml_results.get('suggested_careers', [])

        # 2. Prepare prompt for Gemini API to get structured career details
        recommendation_prompt = f"""
        You are a career counselor AI. Based on the assessment data and the determined career cluster "{cluster_name}", provide a detailed career recommendation.

        Assessment Summary:
        - Career Cluster: {cluster_name}
        - Primary Strengths: {user_assessment_data.get('verbalAptitude', 0) > 7 and "Verbal, " or ""}{user_assessment_data.get('quantitativeAptitude', 0) > 7 and "Quantitative, " or ""}{user_assessment_data.get('creativity', 0) > 7 and "Creative" or ""}
        - Academic Stream: {user_assessment_data.get('academicStream', 'N/A')}
        - Field of Interest: {user_assessment_data.get('fieldOfInterest', 'N/A')}
        - Work Preferences: {user_assessment_data.get('workArrangement', 'N/A')}, {user_assessment_data.get('internationalWork', 'No') == "Yes" and "Open to international opportunities" or "Prefers domestic opportunities"}

        Provide a detailed career recommendation in the following JSON format:
        {{
          "primaryCareer": "Specific job title",
          "description": "2-3 sentence description of the career",
          "salaryRange": "$XX,000 - $XX,000 (or INR equivalent)",
          "growthOutlook": "Growth outlook with percentage",
          "educationRequired": "Required education level and field",
          "alternativePaths": [
            {{"title": "Alternative Career 1", "description": "Brief description"}},
            {{"title": "Alternative Career 2", "description": "Brief description"}}
          ],
          "keySkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
          "nextSteps": ["Step 1", "Step 2", "Step 3", "Step 4"],
          "whyRecommended": "Detailed explanation of why this career suits the student based on their assessment"
        }}

        Respond ONLY with valid JSON. Make it personalized, realistic, and aligned with Indian career paths and salary expectations.
        """

        # 3. Call Gemini API for structured career details
        model = genai.GenerativeModel("gemini-2.5-flash") # Or other appropriate Gemini model
        gemini_recommendation_response = model.generate_content(recommendation_prompt)
        
        career_details_raw = gemini_recommendation_response.text
        
        # Extract JSON from code blocks if needed
        try:
            if "```json" in career_details_raw:
                career_details_raw = career_details_raw.split("```json")[1].split("```")[0].strip()
            elif "```" in career_details_raw:
                career_details_raw = career_details_raw.split("```")[1].split("```")[0].strip()
        except Exception:
            pass # ignore, use raw text

        parsed_career_details = {}
        try:
            parsed_career_details = json.loads(career_details_raw)
        except json.JSONDecodeError as err:
            print(f"Failed to parse careerDetails JSON: {err}")
            return jsonify({"error": "Failed to parse career details JSON from model output"}), 500


        # 4. Send combined response to webapp
        return jsonify({
            "ml_results": ml_results, # Contains cluster_label, cluster_name, cluster_description, suggested_careers, guidance (from ML backend's Gemini call)
            "career_details": parsed_career_details # Structured career details from Cloud & Backend's Gemini call
        })

    except requests.exceptions.RequestException as e:
        print(f"Error communicating with ML backend: {e}")
        return jsonify({"error": f"Failed to connect to ML backend: {e}"}), 500
    except Exception as e:
        print(f"An error occurred during assessment: {e}")
        return jsonify({"error": "An internal error occurred during assessment."}), 500

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        if not data or 'user_query' not in data or 'assessment_data' not in data:
            return jsonify({"error": "Invalid JSON input or missing user_query/assessment_data"}), 400

        user_query = data['user_query']
        chat_history = data.get('chat_history', []) # List of {"role": "user/model", "content": "message"}
        assessment_data = data['assessment_data'] # Expected to contain career_details and responses

        # Extract relevant assessment details for the system prompt
        career_details = assessment_data.get('career_details', {})
        assessment_responses = assessment_data.get('responses', {})

        # Construct system prompt similar to career-chat/index.ts
        system_prompt = f"""
        You are a helpful career guidance AI assistant. You're chatting with a student about their career assessment results.

        Career Recommendation:
        - Primary Career: {career_details.get('primaryCareer', 'N/A')}
        - Career Cluster: {assessment_data.get('career_cluster', 'N/A')}
        - Description: {career_details.get('description', 'N/A')}
        - Salary Range: {career_details.get('salaryRange', 'N/A')}
        - Growth Outlook: {career_details.get('growthOutlook', 'N/A')}
        - Education Required: {career_details.get('educationRequired', 'N/A')}

        Key Skills Needed:
        {', '.join(career_details.get('keySkills', [])) or "N/A"}

        Student Assessment Summary:
        - Academic Stream: {assessment_responses.get('academicStream', 'N/A')}
        - Field of Interest: {assessment_responses.get('fieldOfInterest', 'N/A')}
        - Verbal Aptitude: {assessment_responses.get('verbalAptitude', 'N/A')}/10
        - Quantitative Aptitude: {assessment_responses.get('quantitativeAptitude', 'N/A')}/10
        - Creativity: {assessment_responses.get('creativity', 'N/A')}/10

        Guidelines:
        - Provide personalized career guidance based on their assessment
        - Answer questions about the recommended career path
        - Suggest specific skills to develop, courses to take, and actionable steps
        - Be realistic and concise (2-4 paragraphs max)
        - Reference alternative careers if asked
        - Help with education planning, skill development, and career roadmap
        """

        # Build conversation history for Gemini
        # Gemini expects roles "user" and "model"
        conversation_for_gemini = []
        for msg in chat_history:
            role = "model" if msg.get("role") == "assistant" else "user"
            conversation_for_gemini.append({"role": role, "parts": [{"text": msg.get("content", "")}]})
        
        # Add the current user message
        conversation_for_gemini.append({"role": "user", "parts": [{"text": user_query}]})

        # Call Gemini API for chat response
        model = genai.GenerativeModel("gemini-2.5-flash") # Or other appropriate Gemini model
        
        # Start a chat session with the system prompt
        chat_session = model.start_chat(history=[{"role": "user", "parts": [{"text": system_prompt}]}])
        
        # Send the conversation history and current user query
        gemini_chat_response = chat_session.send_message(user_query)


        assistant_message = gemini_chat_response.text
        if not assistant_message:
            raise Exception("No response generated from Gemini API")

        # Update chat history to be returned to the webapp
        updated_chat_history = chat_history + [
            {"role": "user", "content": user_query},
            {"role": "assistant", "content": assistant_message}
        ]

        # 3. Send response to webapp
        return jsonify({
            "response": assistant_message,
            "chat_history": updated_chat_history
        })

    except Exception as e:
        print(f"An error occurred during chat: {e}")
        return jsonify({"error": "An internal error occurred during chat."}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get("PORT", 8080)))
