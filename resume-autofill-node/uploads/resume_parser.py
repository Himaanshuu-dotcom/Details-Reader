# resume_parser.py
import sys
import json
from pdfminer.high_level import extract_text
import re
import spacy

nlp = spacy.load("en_core_web_sm")

def extract_details(text):
    doc = nlp(text)

    # Extract email
    email = None
    match = re.search(r'[\w\.-]+@[\w\.-]+', text)
    if match:
        email = match.group(0)

    # Extract name (First entity labeled as PERSON)
    name = None
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            name = ent.text
            break

    # Extract phone number
    phone = None
    match = re.search(r'\+?\d[\d\s\-\(\)]{8,}', text)
    if match:
        phone = match.group(0)

    # Extract skills (keywords based)
    skills_keywords = ["python", "java", "c++", "machine learning", "html", "css", "django", "flask"]
    skills = [word for word in skills_keywords if word.lower() in text.lower()]

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "skills": skills
    }

if __name__ == "__main__":
    filepath = sys.argv[1]
    text = extract_text(filepath)
    result = extract_details(text)
    print(json.dumps(result))
