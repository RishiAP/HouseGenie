import os
from dotenv import load_dotenv
from flask import Flask
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy

load_dotenv()

app = Flask("HouseGenie")
api=Api(app)

#Define JWT Config
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_COOKIE_NAME'] = 'access_token'

# Directory to save uploaded resumes
app.config['UPLOAD_FOLDER'] = 'static/uploads/resumes'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

current_dir = os.path.dirname(os.path.abspath(__file__))

#Define database
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI') or 'sqlite:///'+os.path.join(current_dir, 'database.sqlite3')
db = SQLAlchemy()
db.init_app(app)
app.app_context().push()