from flask_restful import Resource
from flask import request, make_response
import bcrypt
import jwt
from models.Admin import Admin
from setup import app
from models.Customer import Customer
from models.Professional import Professional

class Signin(Resource):
    def post(self):
        if request.is_json:
            data = request.get_json()
            try:
                email, password, signin_as = data['email'], data['password'], data['signin_as']
            except KeyError as e:
                return {'message':f"Couldn't find the field: {str(e)}"}, 400
            user=None
            if signin_as == 'admin':
                user=Admin.query.filter_by(email=email).first()
            elif signin_as == 'customer':
                user=Customer.query.filter_by(email=email).first()
            elif signin_as == 'professional':
                user=Professional.query.filter_by(email=email).first()
            else:
                return {'message':f"Invalid signin_as : {signin_as}"}, 400
            if user is None:
                return {'message':'Invalid credentials'}, 403
            if bcrypt.checkpw(password.encode('utf-8'), user.password):
                    access_token = jwt.encode({"id":user.id,'email':email,'signin_as':signin_as}, app.config['JWT_SECRET_KEY'], algorithm='HS256')
                    response=make_response({'message':'Signed in successfully'}, 200)
                    response.set_cookie(
                        app.config['JWT_ACCESS_COOKIE_NAME'],
                        access_token,
                        httponly=True,
                        secure=True,
                        samesite='Strict',
                        max_age=60*60*24*30
                    )
                    return response
            else:
                return {'message':'Invalid credentials'}, 403
        else:
            return {'message':'Please provide a json request'}, 400