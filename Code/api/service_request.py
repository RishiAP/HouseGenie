from flask_restful import Resource
from helpers.auth_decorators import check_signin,admin_required
from models.ServiceRequest import ServiceRequest, ServiceReview
from models.Professional import Professional
from flask import request
from sqlalchemy import or_,and_
from sqlalchemy.exc import IntegrityError
from datetime import date
from setup import db

class GetRequests(Resource):
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
            professional=Professional.query.filter_by(id=signed_id).first()
            if professional.approved:
                service_requests=ServiceRequest.query.filter_by(professional_id=signed_id).all()
            else:
                service_requests=[]
            return {'message':'Service Request page','service_requests':[service_request.professionalBrief() for service_request in service_requests],"approved":professional.approved},200
    

class LogicalException(Exception):
    def __init__(self,message,status_code=400):
        self.message=message
        self.status_code=status_code
    def __str__(self):
        return self.message

class BookService(Resource):
    @check_signin
    def post(self,id,signin_as,signed_in,signed_email,signed_id):
        if not signed_in:
            return {'message':'Please sign in'},401
        if request.is_json:
            data=request.get_json()
            try:
                date_of_service=date.fromisoformat(data['date_of_service'])
                if date_of_service<=date.today():
                    return {'message':'Date of service must be a future date'},400
            except ValueError:
                return {'message':'Invalid date format. Please use YYYY-MM-DD'},400
            except KeyError as e:
                return {'message':f'{str(e)} is required'},400
        else:
            return {'message':'Data must be in JSON format'},400
        if signin_as=="customer":
                try:
                    service_request=ServiceRequest.query.filter(ServiceRequest.service_id==id,ServiceRequest.customer_id==signed_id,ServiceRequest.date_of_service==date_of_service,and_(ServiceRequest.service_status!="Closed",ServiceRequest.service_status!="Rejected")).first()
                    if service_request:
                        return {'message':f'Service request for {service_request.service.name} already exists on {date_of_service.strftime("%d %B, %Y")}. Please choose another date or let it close first.'},400
                    service_request=ServiceRequest(service_id=id,customer_id=signed_id,date_of_service=date_of_service)
                    db.session.add(service_request)
                    db.session.commit()
                    return {'message':'Service request made successfully','service_request':service_request.customerBrief()},201
                except Exception as e:
                    db.session.rollback()
                    return {'message':str(e)},500
        else:
            return {'message':'Only customers can make service requests'},403
        
    @check_signin
    def put(self,id,signin_as,signed_in,signed_email,signed_id):
        if not signed_in:
            return {'message':'Please sign in'},401
        if request.is_json:
            data=request.get_json()
            try:
                date_of_service=date.fromisoformat(data['date_of_service'])
                if date_of_service<=date.today():
                    return {'message':'Date of service must be a future date'},400
            except ValueError:
                return {'message':'Invalid date format. Please use YYYY-MM-DD'},400
            except KeyError as e:
                return {'message':f'{str(e)} is required'},400
        else:
            return {'message':'Data must be in JSON format'},400
        if signin_as=="customer":
            try:
                service_request=ServiceRequest.query.filter_by(id=id).with_for_update().first()
                if service_request is None:
                    raise LogicalException('Service request not found',404)
                elif service_request.customer_id!=signed_id:
                    raise LogicalException('Service request dosent belongs to you',403)
                elif service_request.service_status not in ['Requested','Assigned']:
                    raise LogicalException("Cannot change date. Service request is already accepted",400)
                duplicate=ServiceRequest.query.filter(ServiceRequest.service_id==service_request.service.id,ServiceRequest.customer_id==signed_id,ServiceRequest.date_of_service==date_of_service,and_(ServiceRequest.service_status!="Closed",ServiceRequest.service_status!="Rejected")).first()
                if duplicate:
                    raise LogicalException(f'Service request for {service_request.service.name} already exists on {date_of_service.strftime("%d %B, %Y")}. Please choose another date or let it close first.',400)
                service_request.date_of_service=date_of_service
                db.session.commit()
                return {'message':'Service request updated successfully','service_request':service_request.customerBrief()},201
            except LogicalException as e:
                db.session.rollback()
                return {'message':str(e)},e.status_code
            except Exception as e:
                db.session.rollback()
                return {'message':str(e)},500
        else:
            return {'message':'Only customers can update service requests'},403
        
class GetSpecificRequest(Resource):
    @check_signin
    def get(self,id,signin_as,signed_in,signed_email,signed_id):
        if not signed_in:
            return {'message':'Please sign in'},401
        try:
            service_request=ServiceRequest.query.filter_by(id=id).first()
        except Exception as e:
            return {'message':str(e)},500
        if service_request is None:
            return {'message':'Service request not found'},404
        if signin_as=="admin":
            return {'message':'Service request','service_request':service_request.adminBrief()},200
        elif signin_as=="customer":
            if service_request.customer_id!=signed_id:
                return {'message':'Service request dosent belongs to you'},403
            return {'message':'Service request','service_request':service_request.customerBrief()},200
        elif signin_as=="professional":
            if service_request.professional_id!=signed_id:
                return {'message':"Service request isn't assigned to you"},403
            return {'message':'Service request','service_request':service_request.professionalBrief()},200
        

class AcceptRejectServiceRequest(Resource):
    @check_signin
    def put(self,id,reqType,signin_as,signed_in,signed_email,signed_id):
        if not signed_in:
            return {'message':'Please sign in'},401
        if signin_as!="professional":
            return {'message':'Only professionals can accept or reject service requests'},403
        if reqType not in ['accept','reject']:
            return {'message':'Invalid request type'},400
        try:
            service_request=ServiceRequest.query.filter_by(id=id).with_for_update().first()
            if service_request is None:
                raise LogicalException('Service request not found',404)
            if service_request.professional_id!=signed_id:
                raise LogicalException('Service request is already assigned to another professional',400)
            if service_request.service_status=="Accepted":
                raise LogicalException('Service request is already accepted by you',400)
            elif service_request.service_status=="Rejected":
                raise LogicalException('Service request is already rejected by you',400)
            elif service_request.service_status=="Closed":
                raise LogicalException('Service request is already closed',400)
            service_request.service_status="Accepted" if reqType=="accept" else "Rejected"
            db.session.commit()
            return {'message':f'Service request {"accepted" if reqType=="accept" else "rejected"}'},201
        except LogicalException as e:
            db.session.rollback()
            return {'message':str(e)},e.status_code
        except Exception as e:
            db.session.rollback()
            return {'message':str(e)},500
        
class AssignServiceRequest(Resource):
    @admin_required
    def put(self,service_request_id,professional_id):
        try:
            professional=Professional.query.filter_by(id=professional_id).first()
            if not professional.approved:
                return {"message":"Professional isn't approved yet"},403
            service_request=ServiceRequest.query.filter_by(id=service_request_id).with_for_update().first()
            if service_request is None:
                raise LogicalException("Service request not found",404)
            if service_request.service_status!="Requested":
                raise LogicalException("Service request already assigned",400)
            service_request.service_status="Assigned"
            service_request.professional_id=professional_id
            db.session.commit()
            return {"message":"Professional Assigned","professional":service_request.professional.as_private_dict()},201
        except IntegrityError as e:
            db.session.rollback()
            return {"message":f'{"This professional isn't registered to provide this service. PLease try other." if "Professional's service ID does not match the service request's service ID" in str(e) else str(e)}'},400
        except Exception as e:
            db.session.rollback()
            return {"message":str(e)},500
        
class CloseServiceRequest(Resource):
    @check_signin
    def put(self,id,signin_as,signed_in,signed_email,signed_id):
        if not signed_in:
            return {'message':'Please sign in'},401
        if signin_as=="admin":
            return {'message':'Only professionals and customers can close service requests'},403
        try:
            service_request=ServiceRequest.query.filter_by(id=id).with_for_update().first()
            if service_request is None:
                raise LogicalException('Service request not found',404)
            if signin_as=="customer":
                if service_request.customer_id!=signed_id:
                    raise LogicalException('Service request dosent belongs to you',403)
                if service_request.service_status=="Closed":
                    raise LogicalException('Service request is already closed',400)
                if service_request.date_of_completion is not None or service_request.date_of_service < date.today():
                    service_request.service_status="Closed"
                    db.session.commit()
                    return {'message':'Service request closed','date_of_completion':service_request.date_of_completion.isoformat(timespec='milliseconds') + 'Z'},201
                else:
                    raise LogicalException('Service requests can only be closed after the completion of the service or once the scheduled date of service has passed',400)
            elif signin_as=="professional":
                if service_request.professional_id!=signed_id:
                    raise LogicalException("Service request isn't assigned to you",403)
                if service_request.date_of_completion is not None:
                    raise LogicalException('Service request is already closed by you',400)
                service_request.date_of_completion=db.func.current_timestamp()
                db.session.commit()
                return {'message':'Service request closed','date_of_completion':service_request.date_of_completion.isoformat(timespec='milliseconds') + 'Z'},201
        except LogicalException as e:
            db.session.rollback()
            return {'message':str(e)},e.status_code
        except Exception as e:
            db.session.rollback()
            return {'message':str(e)},500
        
class ReviewServiceRequest(Resource):
    @check_signin
    def post(self,id,signin_as,signed_in,signed_email,signed_id):
        if not signed_in:
            return {'message':'Please sign in'},401
        if signin_as=="admin":
            return {'message':'Only customers and professionals can review service requests'},403
        if request.is_json:
            data=request.get_json()
            try:
                rating=int(data['rating'])
                review=data.get('review',None)
                if rating<1 or rating>5:
                    return {'message':'Rating must be between 1 and 5'},400
            except KeyError as e:
                return {'message':f'{str(e)} is required'},400
            except ValueError:
                return {'message':'Rating must be an integer'},400
        else:
            return {'message':'Data must be in JSON format'},400
        try:
            service_review=ServiceReview.query.filter_by(id=id).with_for_update().first()
            service_request=ServiceRequest.query.filter_by(id=id).first()
            if service_request is None:
                raise LogicalException('Service request not found',404)
            if signin_as=="customer":
                if service_request.customer_id!=signed_id:
                    raise LogicalException('Service request dosent belongs to you',403)
                if service_request.service_status!="Closed":
                    raise LogicalException('Service request is not closed yet',400)
                if service_review is None:
                    service_review=ServiceReview(id=id,customer_rating=rating,customer_review=review)
                    db.session.add(service_review)
                else:
                    service_review.customer_rating=rating
                    service_review.customer_review=review
                db.session.commit()
                return {'message':'Service request reviewed successfully','service_review':service_review.customerReview()},201
            elif signin_as=="professional":
                if service_request.professional_id!=signed_id:
                    raise LogicalException("Service request isn't assigned to you",403)
                if service_request.service_status!="Closed":
                    raise LogicalException('Service request is not closed yet',400)
                if service_review is None:
                    service_review=ServiceReview(id=id,professional_rating=rating,professional_review=review)
                    db.session.add(service_review)
                else:
                    service_review.professional_rating=rating
                    service_review.professional_review=review
                db.session.commit()
                return {'message':'Service request reviewed successfully','service_review':service_review.fullReview()},201
            else:
                return {'message':'Only customers and professionals can review service requests'},403
        except LogicalException as e:
            db.session.rollback()
            return {'message':str(e)},e.status_code
        except Exception as e:
            db.session.rollback()
            return {'message':str(e)},500