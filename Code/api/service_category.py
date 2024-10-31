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