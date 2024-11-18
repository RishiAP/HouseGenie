from flask_restful import Resource
from helpers.auth_decorators import check_signin
from setup import db
from models.ServiceRequest import ServiceRequest, ServiceReview
from sqlalchemy import func

class Summary(Resource):
    @check_signin
    def get(self,signed_in,signin_as,signed_email,signed_id):
        if not signed_in:
            return {'message':'You are not signed in'},401
        if signin_as=="admin":
            ratings=db.session.query(ServiceReview.customer_rating,func.count(ServiceReview.id)).group_by(ServiceReview.customer_rating).all()
            service_requests=db.session.query(ServiceRequest.service_status,func.count(ServiceRequest.id)).group_by(ServiceRequest.service_status).all()
            print(ratings,service_requests)
            return {"ratings":{rating:number for rating,number in ratings},"status_summary":{status:number for status,number in service_requests}},200
        elif signin_as=="customer":
            service_requests=db.session.query(ServiceRequest.service_status,func.count(ServiceRequest.id)).filter_by(customer_id=signed_id).group_by(ServiceRequest.service_status).all()
            return {"status_summary":{status:number for status,number in service_requests}},200
        elif signin_as=="professional":
            ratings=(db.session.query(ServiceReview.customer_rating,func.count(ServiceReview.id))
            .join(ServiceRequest, ServiceRequest.id == ServiceReview.id)
            .filter_by(professional_id=signed_id).group_by(ServiceReview.customer_rating)).all()
            service_requests=db.session.query(ServiceRequest.service_status,func.count(ServiceRequest.id)).filter_by(professional_id=signed_id).group_by(ServiceRequest.service_status).all()
            return  {"ratings":{rating:number for rating,number in ratings},"status_summary":{status:number for status,number in service_requests}},200
        else:
            return {'message':'Invalid sign in type'},400