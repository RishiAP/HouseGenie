from flask_restful import Resource
from helpers.auth_decorators import admin_required
from models.Professional import Professional
from models.Service import Service
from setup import db
from sqlalchemy import func, or_, case
from sqlalchemy.orm import Query
from models.ServiceRequest import ServiceRequest, ServiceReview

def getProfessionalsWithRatingAccepAsssign(professionalsQuery)->Query:
    query=(
        db.session.query(
            Professional,func.avg(ServiceReview.customer_rating).label("average_rating"),
            func.sum(case((ServiceRequest.service_status == "Accepted", 1), else_=0)).label("accepted_services"),
            func.sum(case((ServiceRequest.service_status == "Assigned", 1), else_=0)).label("assigned_services"),
        )
        .outerjoin(ServiceRequest, ServiceRequest.professional_id == Professional.id)
        .outerjoin(ServiceReview, ServiceReview.id == ServiceRequest.id)
        .filter(Professional.id.in_(professionalsQuery.with_entities(Professional.id)))
        .group_by(Professional.id)
    )
    return query

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
            service=Service.query.filter_by(id=service_id).first()
            if service.is_inactive:
                return {"message":"Cannot assign professionals for inactive services"},403
            professionals=getProfessionalsWithRatingAccepAsssign(Professional.query.filter_by(service_id=service_id,approved=True,is_banned=False)).all()
            return {"professionals":[{**professional.as_private_dict(only_professional=True),"average_rating":average_rating,"accepted":accepted,"assigned":assigned} for professional,average_rating,accepted,assigned in professionals],"service":service.as_dict()}
        else:
            professionals=Professional.query.filter_by(service_id=service_id).all()
            return {"professionals":[professional.as_private_dict() for professional in professionals]}