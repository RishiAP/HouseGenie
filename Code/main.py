from setup import app,api
from flask import render_template, redirect, request
from api.signin import Signin
from api.register import Register
from functools import wraps
from api.signout import SignOut
from api.services import Services
from api.service_category import ServiceCat
from models.Service import ServiceCategory, Service
from models.ServiceRequest import ServiceRequest
from models.Professional import Professional
from api.service_request import ServiceReq
import jwt
from helpers.auth_decorators import check_signin

@app.route('/')
@check_signin
def home(signed_in,signin_as,signed_email,signed_id):
    if signin_as=="admin":
        categories=ServiceCategory.query.all()
        services=Service.query.all()
        professionals=Professional.query.all()
        return render_template('home.html',signed_in=signed_in,signin_as=signin_as,categories=categories,services=services,professionals=professionals)
    elif signin_as=="customer":
        categories=ServiceCategory.query.all()
        service_requests=ServiceRequest.query.filter_by(customer_id=signed_id).all()
        return render_template('home.html',signed_in=signed_in,signin_as=signin_as,categories=categories,service_requests=service_requests)
    elif signin_as=="professional":
        professional=Professional.query.filter_by(email=signed_email).first()
        return render_template('home.html',signed_in=signed_in,signin_as=signin_as,signed_email=signed_email,professional=professional)
    else:
        return render_template('home.html',signed_in=signed_in,signin_as=signin_as)

@app.route('/signin')
def admin_login():
    return render_template('signin.html')

@app.route('/register/customer')
def customer_register():
    return render_template('customer_register.html')

@app.route('/register/professional')
def professional_register():
    services=Service.query.all()
    return render_template('professional_register.html',services=services)

@app.route('/professional/<phone>')
@check_signin
def professional(phone,signed_in,signin_as,signed_email,signed_id):
    professional=Professional.query.filter_by(phone=phone).first()
    return render_template('professional.html',professional=professional,signed_in=signed_in,signin_as=signin_as,signed_email=signed_email), 404 if professional is None else 200

api.add_resource(Signin,'/api/signin')
api.add_resource(Register,'/api/register')
api.add_resource(SignOut,'/api/signout')
api.add_resource(Services,'/api/services','/api/services/<category>')
api.add_resource(ServiceCat,'/api/service_category')
api.add_resource(ServiceReq,'/api/service_request','/api/book_service')

if __name__ == '__main__':
    app.run(debug=True)