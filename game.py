
import json
import random
from operator import itemgetter
import os

# Read questions file
_site_root = os.path.realpath(os.path.dirname(__file__))
_questions_path = os.path.join(_site_root, 'resources', 'questions.json')
with open(_questions_path, 'r') as f:
    _questions = json.load(f)

# TODO how long?
MAX_TIME = 6000
MAX_SCORE = 1000


def get_question_header(question_id):
    q = _questions[question_id]
    return {
        'img': q['img'],
        'question': q['question']
    }


def get_question(question_id):
    q = _questions[question_id]
    answers = list(q['answers'])
    random.shuffle(answers)
    question_dict = {
        'img': q['img'],
        'question': q['question'],
        'answers': list(map(itemgetter('answer'), answers))
    }
    correct_answers = list(map(itemgetter('correct'), answers))
    return question_dict, correct_answers


def get_answer_score(t):
    if (t < 0 or t > MAX_TIME):
        raise ValueError('Invalid answer time')
    return int(MAX_SCORE * (float(MAX_TIME - t) / MAX_TIME))


def get_question_id_list():
    return list(range(num_questions()))


def num_questions():
    return len(_questions)
