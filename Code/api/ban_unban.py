from flask_restful import Resource
from helpers.auth_decorators import admin_required
from models.Customer import Customer
from models.Professional import Professional
from setup import db

class BanUnban(Resource):
    @admin_required
    def put(self,request_type,user_type,id):
        if request_type not in ["ban","unban"]:
            return {"message":"Invalid request type"},400
        if user_type=="customer":
            user=Customer.query.filter_by(id=id).first()
        elif user_type=="professional":
            user=Professional.query.filter_by(id=id).first()
        else:
            return {"message":"Invalid user type"},400
        if user is None:
            return {"message":"User not found"},404
        try:
            user.is_banned=True if request_type=="ban" else False
            db.session.commit()
            return {"message": f'{"Customer" if user_type=="customer" else "Professional"} {"banned" if user.is_banned else "unbanned"}'},201
        except Exception as e:
            db.session.rollback()
            return {"message":str(e)},500