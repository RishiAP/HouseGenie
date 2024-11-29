from flask_restful import Resource
from helpers.auth_decorators import admin_required
from flask import request
from models.Service import ServiceCategory
from setup import db
from sqlalchemy import func

class ServiceCat(Resource):
    def get(self):
        categories=ServiceCategory.query.all()
        return {'message':'Service Categories','categories':[category.as_dict() for category in categories]},200
    @admin_required
    def post(self):
        if request.is_json:
            data = request.get_json()
            try:
                name, description = data['name'], data['description']
                if ServiceCategory.query.filter(func.lower(ServiceCategory.name) == func.lower(name)).first():
                    return {'message':'Category already exists'},400
                category=ServiceCategory(name=name,description=description)
                db.session.add(category)
                db.session.commit()
                return {'message':'Service Category added successfully','category':category.as_dict()},200
            except KeyError as e:
                return {'message':f'{str(e)} is required'},400
        else:
            return {'message':'The request payload is not in JSON format'},400
        
    @admin_required
    def put(self,id):
        try:
            category=ServiceCategory.query.filter_by(id=id).first()
            if category:
                if request.is_json:
                    data = request.get_json()
                    try:
                        name, description = data['name'], data['description']
                        category.name=name
                        category.description=description
                        db.session.commit()
                        return {'message':'Service Category updated successfully','category':category.as_dict()},201
                    except KeyError as e:
                        return {'message':f'{str(e)} is required'},400
                else:
                    return {'message':'The request payload is not in JSON format'},400
            else:
                return {'message':'Service Category not found'},404
        except Exception as e:
            db.session.rollback()
            return {'message':str(e)},500
        
    @admin_required
    def delete(self,id):
        try:
            category=ServiceCategory.query.filter_by(id=id).first()
            if category:
                if len(category.services)!=0:
                    return {'message':'Cannot delete category with services'},400
                db.session.delete(category)
                db.session.commit()
                return {'message':'Service Category deleted successfully'},201
            else:
                return {'message':'Service Category not found'},404
        except Exception as e:
            db.session.rollback()
            return {'message':str(e)},500
        
class SpecificCategory(Resource):
    def get(self,id):
        category=ServiceCategory.query.filter_by(id=id).first()
        if category:
            return {'message':'Service Category','category':category.as_dict()},200
        else:
            return {'message':'Service Category not found'},404