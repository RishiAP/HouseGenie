from flask_restful import Resource
from flask import make_response
from setup import app
class SignOut(Resource):
    def get(self):
        response=make_response({'message':'Signed out successfully'}, 200)
        response.set_cookie(
            app.config['JWT_ACCESS_COOKIE_NAME'],
            "",
            httponly=True,
            secure=True,
            samesite='Strict',
            max_age=60*60*24*30
        )
        return response