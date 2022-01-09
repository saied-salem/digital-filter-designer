from flask import Flask
from flask_cors import CORS, cross_origin

def create_app():
    _app = Flask(__name__)
    return _app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
