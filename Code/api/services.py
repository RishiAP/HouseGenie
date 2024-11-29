from flask_restful import Resource
from flask import request
from helpers.auth_decorators import admin_required
from models.Service import Service,ServiceCategory
from setup import db

class SpecificService(Resource):
    def get(self,id):
        service=Service.query.filter_by(id=id).first()
        if service:
            return {'message':'Service page','service':service.as_dict()},200
        else:
            return {'message':'Service not found'},404
        
    @admin_required
    def put(self,id):
        try:
            service=Service.query.filter_by(id=id).first()
        except Exception as e:
            return {'message':str(e)},500
        if service:
            if request.is_json:
                data = request.get_json()
                try:
                    name, description, price, time, category = data['name'], data['description'], data['price'], data['time'], data['category']
                    service.name=name
                    service.description=description
                    service.price=price
                    service.time_required_minutes=time
                    service.category_id=category
                    db.session.commit()
                    return {'message':'Service updated successfully','service':service.as_dict()},200
                except KeyError as e:
                    return {'message':f'{str(e)} is required'},400
            else:
                return {'message':'The request payload is not in JSON format'},400
        else:
            return {'message':'Service not found'},404
        
    @admin_required
    def delete(self,id):
        try:
            service=Service.query.filter_by(id=id).first()
            if not service:
                return {"message":"Service not found"},404
            service.is_inactive=True
            db.session.commit()
            return {"message":"Service deleted successfully"},201
        except Exception as e:
            db.session.rollback()
            return {"message":str(e)},500

class Services(Resource):
    def get(self,category):
        services=Service.query.filter_by(category_id=category,is_inactive=False).all()
        category=ServiceCategory.query.filter_by(id=category).first()
        return {'message':'Service page',"services":[service.as_dict() for service in services],"category":category.as_dict()},200

    @admin_required
    def post(self):
        if request.is_json:
            data = request.get_json()
            try:
                name, description, price, time, category = data['name'], data['description'], data['price'], data['time'],data['category']
                service = Service.query.filter_by(name=name).first()
                if service:
                    return {'message':'Service already exists'},400
                new_service = Service(name=name,description=description,price=price,time_required_minutes=time,category_id=category)
                db.session.add(new_service)
                db.session.commit()
                return {'message':'Service added successfully','service':new_service.as_dict()},200
            except KeyError as e:
                return {'message':f'{str(e)} is required'},400
        else:
            return {'message':'The request payload is not in JSON format'},400
        
class ReactivateService(Resource):
    @admin_required
    def put(self,id):
        try:
            service=Service.query.filter_by(id=id).first()
            if not service:
                return {"message":"Service not found"},404
            service.is_inactive=False
            db.session.commit()
            return {"message":"Service reactivated successfully"},201
        except Exception as e:
            db.session.rollback()
            return {"message":str(e)},500