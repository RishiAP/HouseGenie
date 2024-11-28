from functools import wraps
import jwt
from flask import request, redirect
from setup import app
from models.Customer import Customer
from models.Professional import Professional

def check_signin(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        access_token = request.cookies.get(app.config['JWT_ACCESS_COOKIE_NAME'])
        signed_in = False  # Default to not signed in
        signed_email = None
        signed_id=None
        signin_as = None
        is_banned = False

        if access_token:
            try:
                current_user = jwt.decode(access_token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
                if current_user:
                    signin_as = current_user.get('signin_as')
                    signed_email = current_user.get('email')
                    signed_id=current_user.get('id')
                    if signin_as=="customer":
                        is_banned = Customer.query.filter_by(email=signed_email).first().is_banned
                    elif signin_as=="professional":
                        is_banned = Professional.query.filter_by(email=signed_email).first().is_banned
                signed_in = True  # User is signed in
            except Exception as e:
                app.logger.error(f"Authentication error: {str(e)}")
        
        return fn(*args, signed_in=signed_in,signin_as=signin_as,signed_email=signed_email,signed_id=signed_id,is_banned=is_banned, **kwargs)

    return wrapper

# Custom decorator to check for admin access
def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        access_token = request.cookies.get(app.config['JWT_ACCESS_COOKIE_NAME'])
        if not access_token:
            return {'message':'Please sign in'},401
        try:
            current_user = jwt.decode(access_token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            if not current_user or current_user.get('signin_as') != 'admin':
                return {'message':'Admin access required'},401 
            return fn(*args, **kwargs)
        except Exception as e:
            app.logger.error(f"Authentication error: {str(e)}")
            return {'message':'Please sign in'},401
    return wrapper