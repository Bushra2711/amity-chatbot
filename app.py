"""Amity University BCA Admission Chatbot.

Single Flask app with TF-IDF intent matching, English + Hinglish support,
and specialization card payloads for the frontend.
"""

from __future__ import annotations

import json
import logging
import random
from pathlib import Path

from flask import Flask, jsonify, render_template, request

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except Exception:
    SKLEARN_AVAILABLE = False

BASE_DIR = Path(__file__).resolve().parent
INTENTS_PATH = BASE_DIR / 'intents.json'
if not INTENTS_PATH.exists():
    INTENTS_PATH = BASE_DIR / 'data' / 'intents.json'

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CONFIDENCE_THRESHOLD = 0.18

SPECIALIZATION_CARDS = [
    {
        'id': 'data-analytics',
        'title': 'Data Analytics',
        'fee': '₹2,25,000 (Total)',
        'collaboration': 'TCS iON',
        'description': 'Data Analysis, Visualization, Machine Learning basics, Business Intelligence',
        'careers': 'Data Analyst, BI Analyst, Data Scientist'
    },
    {
        'id': 'cloud-security',
        'title': 'Cloud & Security',
        'fee': '₹2,25,000 (Total)',
        'collaboration': 'TCS iON',
        'description': 'Cloud Computing, Cybersecurity, Network Security',
        'careers': 'Cloud Engineer, Cybersecurity Analyst'
    },
    {
        'id': 'software-engineering',
        'title': 'Software Engineering',
        'fee': '₹2,50,000 (Total)',
        'collaboration': 'HCL Tech',
        'description': 'Software Development, Testing, DevOps, Full Stack',
        'careers': 'Software Developer, QA Engineer'
    },
    {
        'id': 'data-engineering',
        'title': 'Data Engineering',
        'fee': '₹2,50,000 (Total)',
        'collaboration': 'HCL Tech',
        'description': 'Big Data, ETL, Data Pipelines, Database Management',
        'careers': 'Data Engineer, ETL Developer'
    },
    {
        'id': 'fintech-ai',
        'title': 'FinTech & AI',
        'fee': '₹2,75,000 (Total)',
        'collaboration': 'Paytm',
        'description': 'Financial Technology, AI in Banking, Blockchain',
        'careers': 'Fintech Developer, AI Specialist'
    }
]

app = Flask(__name__)


def load_intents() -> dict:
    try:
        with open(INTENTS_PATH, 'r', encoding='utf-8') as file_handle:
            return json.load(file_handle)
    except Exception as exc:
        logger.error('Could not load intents.json: %s', exc)
        return {'intents': []}


INTENTS = load_intents()


def calculate_intent_similarity(user_message: str):
    best_intent = None
    best_score = 0.0
    for intent in INTENTS.get('intents', []):
        patterns = ' '.join(intent.get('patterns', []))
        if not patterns:
            continue

        try:
            if SKLEARN_AVAILABLE:
                vectorizer = TfidfVectorizer(analyzer='char_wb', ngram_range=(2, 4))
                tfidf = vectorizer.fit_transform([patterns.lower(), user_message.lower()])
                score = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
            else:
                pattern_words = set(patterns.lower().split())
                message_words = set(user_message.lower().split())
                score = len(pattern_words & message_words) / max(len(pattern_words), 1)

            if score > best_score:
                best_score = float(score)
                best_intent = intent
        except Exception as exc:
            logger.debug('Similarity calculation failed: %s', exc)

    return best_intent, best_score


def build_specialization_message(language: str = 'english') -> str:
    if language == 'hinglish':
        return (
            'Yeh raha BCA specializations ka quick overview. Aap kisi bhi card par click karke full details dekh sakte hain 😊'
        )

    return (
        'Here is a quick overview of the BCA specializations. You can click any card to see full details 😊'
    )


def get_specialization_details(spec_name):
    spec_name = spec_name.lower()
    specializations = {
        "data analytics": {
            "title" : "Data Analytics (TCS iON)",
            "fee" : "₹2,25,000 (Total)",
            "collaboration" : "TCS iON",
            "desc" : "Data Analysis, Visualization, Machine Learning basics, Business Intelligence",
            "careers" : "Data Analyst, BI Analyst, Data Scientist"
        },
        "cloud": {
            "title" : "Cloud & Security (TCS iON)",
            "fee" : "₹2,25,000 (Total)",
            "collaboration" : "TCS iON",
            "desc" : "Cloud Computing, Cybersecurity, Network Security",
            "careers" : "Cloud Engineer, Cybersecurity Analyst"
        },
        "software engineering": {
            "title" : "Software Engineering (HCL)",
            "fee" : "₹2,50,000 (Total)",
            "collaboration" : "HCL Tech",
            "desc" : "Software Development, Testing, DevOps, Full Stack",
            "careers" : "Software Developer, QA Engineer"
        },
        "data engineering": {
            "title" : "Data Engineering (HCL)",
            "fee" : "₹2,50,000 (Total)",
            "collaboration" : "HCL Tech",
            "desc" : "Big Data, ETL, Data Pipelines, Database Management",
            "careers" : "Data Engineer, ETL Developer"
        },
        "fintech": {
            "title" : "Fintech & AI (Paytm)",
            "fee" : "₹2,75,000 (Total)",
            "collaboration" : "Paytm",
            "desc" : "Financial Technology, AI in Banking, Blockchain",
            "careers" : "Fintech Developer, AI Specialist"
        }
    }

    for key in specializations:
        if key in spec_name:
            return specializations[key]
    return None


def build_specialization_detail_message(details: dict, language: str = 'english') -> str:
    if language == 'hinglish':
        return (
            f"<strong>{details['title']}</strong><br><br>"
            f"Fee: <span class='fee-highlight'>{details['fee']}</span><br>"
            f"Collaboration: {details['collaboration']}<br>"
            f"Yeh aap seekhenge: {details['desc']}<br>"
            f"Career options: {details['careers']}"
        )

    return (
        f"<strong>{details['title']}</strong><br><br>"
        f"Fee: <span class='fee-highlight'>{details['fee']}</span><br>"
        f"Collaboration: {details['collaboration']}<br>"
        f"What you will learn: {details['desc']}<br>"
        f"Career options: {details['careers']}"
    )


def get_response(user_message: str, language: str = 'english'):
    if not user_message or not user_message.strip():
        return 'Please enter a message.'

    normalized = user_message.lower().strip()

    specialization_details = get_specialization_details(normalized)
    if specialization_details:
        return build_specialization_detail_message(specialization_details, language)

    if any(keyword in normalized for keyword in ('specialization batao', 'bca specialization', 'specializations', 'specialization', 'data science')):
        return build_specialization_message(language)

    intent, score = calculate_intent_similarity(user_message)
    if intent and (not SKLEARN_AVAILABLE or score >= CONFIDENCE_THRESHOLD):
        key = 'responses_hinglish' if language == 'hinglish' else 'responses_en'
        responses = intent.get(key) or intent.get('responses') or []
        if responses:
            return random.choice(responses)

    if language == 'hinglish':
        return (
            'Mujhe samajh nahi aaya 😊 '
            'Aap fees, admission, specialization, semester ya courses ke baare me puch sakte hain.'
        )

    return "I didn't understand that. Please rephrase your question about fees, admission, courses, exams, scholarships, or specializations."


@app.route('/')
def index():
    return render_template('index.html', specialization_cards=SPECIALIZATION_CARDS)


@app.route('/chat', methods=['POST'])
def chat():
    try:
        payload = request.get_json(force=True) or {}
        user_message = (payload.get('message') or '').strip()
        language = payload.get('language', 'english')
        if not user_message:
            return jsonify({'error': True, 'response': 'Please enter a message.'}), 400

        bot_response = get_response(user_message, language)
        show_specializations = any(
            keyword in user_message.lower()
            for keyword in ('specialization', 'specializations', 'bca specialization', 'data science')
        )

        return jsonify({
            'error': False,
            'response': bot_response,
            'show_specializations': show_specializations,
            'specializations': SPECIALIZATION_CARDS if show_specializations else []
        })
    except Exception as exc:
        logger.exception('Error in /chat: %s', exc)
        return jsonify({'error': True, 'response': 'Server error.'}), 500


import os

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 8080))
    )
