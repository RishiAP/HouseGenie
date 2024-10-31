from flask_restful import Resource
from helpers.auth_decorators import check_signin
from models.ServiceRequest import ServiceRequest
from flask import request
from setup import db

class ServiceReq(Resource):
    @check_signin
    def get(self,signin_as,signed_in,signed_email,signed_id):
        if not signed_in:
            return {'message':'Please sign in'},401
        if signin_as=="admin":
            service_requests=ServiceRequest.query.all()
            return {'message':'Service Request page','service_requests':[service_request.adminBrief() for service_request in service_requests]},200
        elif signin_as=="customer":
            service_requests=ServiceRequest.query.filter_by(customer_id=signed_id).all()
            return {'message':'Service Request page','service_requests':[service_request.customerBrief() for service_request in service_requests]},200
        elif signin_as=="professional":
            service_requests=ServiceRequest.query.filter_by(professional_id=signed_id).all()
            return {'message':'Service Request page','service_requests':[service_request.professionalBrief() for service_request in service_requests]},200
    
    @check_signin
    def post(self,signin_as,signed_in,signed_email,signed_id):
        if not signed_in:
            return {'message':'Please sign in'},401
        if signin_as=="customer":
            if request.is_json:
                data=request.get_json()
                try:
                    service_id = data['service_id']
                    if ServiceRequest.query.filter_by(service_id=service_id,customer_id=signed_id).filter(ServiceRequest.service_status.in_(['Requested','Assigned'])).first()!=None:
                        return {'message':'Service request already made. PLease wait till its completed.'},400
                    service_request=ServiceRequest(service_id=service_id,customer_id=signed_id)
                    db.session.add(service_request)
                    db.session.commit()
                    return {'message':'Service request made successfully','service_request':service_request.customerBrief()},201
                except KeyError as e:
                    return {'message':f'{str(e)} is required'},400
        else:
            return {'message':'Only customers can make service requests'},403