from flask_restful import Resource
from helpers.auth_decorators import admin_required
from models.Professional import Professional
from setup import db

class ProfessionalAPI(Resource):
    @admin_required
    def put(self,id):
        professional=Professional.query.filter_by(id=id).first()
        if professional is None:
            return {"message":"Professional not found"},404
        elif professional.approved:
            return {"message":"Professional already approved"},400
        try:
            professional.approved=True
            db.session.commit()
            return {"message":"Professional approved"},201
        except Exception as e:
            db.session.rollback()
            return {"message":str(e)},500
        
class ServiceProfessionals(Resource):
    @admin_required
    def get(self,service_id,professionalType):
        if professionalType=="approved":
            professionals=Professional.query.filter_by(service_id=service_id,approved=True,is_banned=False).all()
        else:
            professionals=Professional.query.filter_by(service_id=service_id).all()
        return {"professionals":[professional.as_private_dict() for professional in professionals]}