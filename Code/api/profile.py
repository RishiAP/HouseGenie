from flask import request, make_response
from flask_restful import Resource
from models.Customer import Customer
from models.Professional import Professional
from helpers.auth_decorators import check_signin,admin_required
from setup import db,app
from sqlalchemy.exc import IntegrityError
import bcrypt
import jwt
from models.ServiceRequest import ServiceRequest

class ProfileHandle(Resource):
    @check_signin
    def put(self,signed_in,signin_as,signed_email,signed_id,is_banned):
        if not signed_in:
            return {'message':'You are not signed in'},401
        if signin_as=="admin":
            return {'message':'Admin cannot have profile'},403
        try:
            if signin_as=="customer":
                customer=Customer.query.filter_by(id=signed_id).first()
                if not customer:
                    return {'message':'Customer not found'},404
                keys=set(request.form.keys())
                key_set=set(['name','phone','address','pincode','email'])
                missing_fields=key_set.difference(keys)
                if len(missing_fields)>0:
                    return {"success": False, "message": f'Missing required fields: {missing_fields}'}, 400
                for key in key_set:
                    setattr(customer,key,request.form.get(key))
                if "password" in keys:
                    password=request.form.get('password')
                    if password!="" and password!=None:
                        customer.password=bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            else:
                professional=Professional.query.filter_by(id=signed_id).first()
                if not professional:
                    return {'message':'Professional not found'},404
                keys=set(request.form.keys())
                key_set=set(['name','phone','address','pincode','email','experience'])
                missing_fields=key_set.difference(keys)
                if len(missing_fields)>0:
                    return {"success": False, "message": f'Missing required fields: {missing_fields}'}, 400
                for key in key_set:
                    setattr(professional,key,request.form.get(key))
                if "password" in keys:
                    password=request.form.get('password')
                    if password!="" and password!=None:
                        professional.password=bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            db.session.commit()
            access_token = jwt.encode({"id":signed_id,'email':request.form.get("email"),'signin_as':signin_as}, app.config['JWT_SECRET_KEY'], algorithm='HS256')
            response=make_response({'message':'Profile updated successfully'},201)
            response.set_cookie(
                app.config['JWT_ACCESS_COOKIE_NAME'],
                access_token,
                httponly=True,
                secure=True,
                samesite='Strict',
                max_age=60*60*24*30
            )
            return response
        except IntegrityError as e:
            db.session.rollback()
            message=str(e)
            return {'message':"Phone No. already exists" if "UNIQUE constraint failed: professionals.phone" in message or "UNIQUE constraint failed: customers.phone" in message else "Email Id already exists" if "UNIQUE constraint failed: professionals.email" in message or "UNIQUE constraint failed: customers.email" in message else message},400
        except Exception as e:
            db.session.rollback()
            return {'message':str(e)},500
        
    @admin_required
    def get(self,user_type,id):
        if user_type not in ["customer","professional"]:
            return {"message":"Invalid user type"},400
        if user_type=="customer":
            service_requests=ServiceRequest.query.filter_by(customer_id=id).all()
        elif user_type=="professional":
            service_requests=ServiceRequest.query.filter_by(professional_id=id).all()
        else:
            return {"message":"Invalid user type"},400
        return {"service_requests": [service_request.adminBrief() for service_request in service_requests]},200