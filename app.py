#!/usr/bin/env python

from flask import Flask, session, jsonify
from flask.sessions import SessionInterface
from beaker.middleware import SessionMiddleware
import json
from time import time
import os

import game


app = Flask('paloquiz')


# Some constants to use as enum
NOT_ANSWERED = -1
INCORRECT = 0
CORRECT = 0

# Session data keys (not public, keep small to reduce cookie size)
QUESTIONS = 'q'
CURRENT_QUESTION = 'cq'
CURRENT_ANSWERS = 'ca'
QUESTION_LIST = 'ql'
SCORE = 's'
ANSWER = 'a'
TIME = 't'


# Read session secret keys
_site_root = os.path.realpath(os.path.dirname(__file__))
_secret_path = os.path.join(_site_root, 'resources', 'secret.json')
with open(_secret_path, 'r') as f:
    _secret = json.load(f)


# Eases Beaker session integration
class BeakerSessionInterface(SessionInterface):
    def open_session(self, app, request):
        ses = request.environ['beaker.session']
        return ses

    def save_session(self, app, ses, response):
        ses.save()


# Session configuration
session_opts = {
    'session.type': 'cookie',
    'session.validate_key': ''.join(_secret['session_validate_key']),
    'session.encrypt_key': ''.join(_secret['session_encrypt_key'])
}


# Error handling
class InvalidUsage(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv


@app.errorhandler(InvalidUsage)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


# Application routes


@app.route('/start')
def start():
    session[CURRENT_QUESTION] = 0
    session[CURRENT_ANSWERS] = []
    session[QUESTIONS] = {}
    session[QUESTION_LIST] = game.get_question_id_list()
    session[SCORE] = 0
    return status()


@app.route('/questionHeader')
def question_header():
    question_id = get_current_question_id(session)
    try:
        return jsonify(game.get_question_header(question_id))
    except Exception:
        raise InvalidUsage('Invalid question header parameters')


@app.route('/question')
def question():
    question_id = get_current_question_id(session)
    session[QUESTIONS] = session.get(QUESTIONS, {})
    q = session[QUESTIONS].get(question_id, {})

    # Check question has not been already answered
    answered = q.get(ANSWER, NOT_ANSWERED)
    if answered != NOT_ANSWERED:
        raise InvalidUsage('The question has already been answered')

    # Get question data
    try:
        question_data, correct_answers = game.get_question(question_id)
    except Exception:
        raise InvalidUsage('Invalid question parameters')

    # Do not give a new timestamp if there is one already
    current_time = int(time() * 1000)
    question_time = q.get(TIME, current_time)
    elapsed_time = max(min(current_time - question_time, game.MAX_TIME), 0)
    time_left = game.MAX_TIME - elapsed_time
    question_data['time'] = time_left

    # Save session data
    session[CURRENT_ANSWERS] = correct_answers
    session[QUESTIONS][question_id] = {
        ANSWER: NOT_ANSWERED,
        TIME: question_time
    }

    return jsonify(question_data)


@app.route('/answer/<int:answer_id>')
def answer(answer_id):
    question_id = get_current_question_id(session)
    session[CURRENT_ANSWERS] = session.get(CURRENT_ANSWERS, 0)
    correct_answers = session[CURRENT_ANSWERS]

    sessionQuestions = session.get(QUESTIONS, {})
    if question_id not in sessionQuestions:
        raise InvalidUsage('The question has not been asked')

    q = sessionQuestions[question_id]
    if TIME not in q or ANSWER not in q:
        raise InvalidUsage('Invalid session data')

    # Read session data
    question_time = q[TIME]
    answered = q[ANSWER]

    # Check question has not been answered already
    if answered != NOT_ANSWERED:
        raise InvalidUsage('The question has already been answered')

    # Check answer
    delay = int(time() * 1000) - question_time
    try:
        correct = correct_answers[answer_id] and delay < game.MAX_TIME
        if correct:
            earned_score = game.get_answer_score(delay)
        else:
            earned_score = 0
    except Exception:
        raise InvalidUsage('Invalid answer parameters')

    # Update session
    session[SCORE] = session.get(SCORE, 0) + earned_score
    session[QUESTIONS][question_id][ANSWER] = correct and CORRECT or INCORRECT

    # Move to next question
    session[CURRENT_QUESTION] += 1
    session[CURRENT_ANSWERS] = []

    # Return response
    return jsonify({
        'correct': correct,
        'score': session[SCORE]
    })


@app.route('/status')
def status():
    # Read session data
    session[CURRENT_QUESTION] = session.get(CURRENT_QUESTION, 0)
    if QUESTION_LIST not in session:
        session[QUESTION_LIST] = game.get_question_id_list()
    session[QUESTIONS] = session.get(QUESTIONS, {})
    questions = session[QUESTIONS]
    session[SCORE] = session.get(SCORE, 0)
    score = session[SCORE]

    if session[CURRENT_QUESTION] < len(session[QUESTION_LIST]):
        question_id = session[QUESTION_LIST][session[CURRENT_QUESTION]]
        if question_id not in questions:
            # Waiting for question
            return jsonify({
                'status': 'question',
                'score': score
            })
        else:
            # Not checking if the question has already been answered,
            # but that should not be possible
            return jsonify({
                'status': 'answer',
                'score': score
            })
    else:
        # Game is finished
        return jsonify({
            'status': 'finish',
            'score': score
        })


@app.route('/summary')
def summary():
    get_current_question_id(session)
    session[QUESTIONS] = session.get(QUESTIONS, {})
    questions = session[QUESTIONS]
    session[SCORE] = session.get(SCORE, 0)
    score = session[SCORE]

    corrects = []
    for i in range(session[CURRENT_QUESTION]):
        qi = session[QUESTION_LIST][session[CURRENT_QUESTION]]
        answered = questions.get(qi, {}).get(ANSWER, NOT_ANSWERED)
        # NOT_ANSWERED is considered as incorrect here
        corrects.append(answered == CORRECT)

    return jsonify({
        'score': score,
        'answers': corrects
    })


def get_current_question_id(ses):
    try:
        ses[CURRENT_QUESTION] = ses.get(CURRENT_QUESTION, 0)
        if QUESTION_LIST not in ses:
            ses[QUESTION_LIST] = game.get_question_id_list()
        return ses[QUESTION_LIST][ses[CURRENT_QUESTION]]
    except Exception:
        raise InvalidUsage('Invalid session data')


if __name__ == '__main__':
    app.wsgi_app = SessionMiddleware(app.wsgi_app, session_opts)
    app.session_interface = BeakerSessionInterface()
    app.run(debug=True)
