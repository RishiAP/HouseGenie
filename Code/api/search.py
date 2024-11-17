from flask import request
from flask_restful import Resource
from helpers.auth_decorators import check_signin
from models.ServiceRequest import ServiceRequest, ServiceReview
from models.Service import Service, ServiceCategory
from models.Professional import Professional
from models.Customer import Customer
from sqlalchemy import func
from sqlalchemy.orm import Query
from setup import db
from helpers.commons import searchTypes

def getProfessionalsWithRating(professionalsQuery)->Query:
    query=(
        db.session.query(Professional,func.avg(ServiceReview.customer_rating).label("average_rating"))
        .join(ServiceRequest, ServiceRequest.professional_id == Professional.id)
        .join(ServiceReview, ServiceReview.id == ServiceRequest.id)
        .filter(Professional.id.in_(professionalsQuery.with_entities(Professional.id)))
        .group_by(Professional.id)
    )
    return query

def getCustomersWithRating(customersQuery)->Query:
    query=(
        db.session.query(Customer,func.avg(ServiceReview.professional_rating).label("average_rating"))
        .join(ServiceRequest, ServiceRequest.customer_id == Customer.id)
        .join(ServiceReview, ServiceReview.id == ServiceRequest.id)
        .filter(Customer.id.in_(customersQuery.with_entities(Customer.id)))
        .group_by(Customer.id)
    )
    return query

def get_professionals_with_avg_rating_between(lower_bound: float, upper_bound: float) -> Query:
    query = (
        db.session.query(Professional,func.avg(ServiceReview.customer_rating).label("average_rating"))
        .join(ServiceRequest, ServiceRequest.professional_id == Professional.id)
        .join(ServiceReview, ServiceReview.id == ServiceRequest.id)
        .group_by(Professional.id)
        .having(func.avg(ServiceReview.customer_rating).between(lower_bound, upper_bound))
    )
    return query

def get_customers_with_avg_rating_between(lower_bound: float, upper_bound: float) -> Query:
    query = (
        db.session.query(Customer,func.avg(ServiceReview.professional_rating).label("average_rating"))
        .join(ServiceRequest, ServiceRequest.customer_id == Customer.id)
        .join(ServiceReview, ServiceReview.id == ServiceRequest.id)
        .group_by(Customer.id)
        .having(func.avg(ServiceReview.professional_rating).between(lower_bound, upper_bound))
    )
    return query

class Search(Resource):
    @check_signin
    def get(self,signed_in,signin_as,signed_email,signed_id):
        if not signed_in:
            return {'message':'You are not signed in'},401
        keys=set(request.args.keys())
        key_set={"search_category","search_option","search_query"}
        if not key_set.issubset(keys):
            return {'message':'Invalid search query'},400
        if request.args["search_category"] not in searchTypes.keys():
            return {'message':'Invalid search category'},400
        if not (request.args["search_category"]=="service_request" and request.args["search_option"]=="pincode" and signin_as=="customer"):
            if request.args["search_option"] not in searchTypes[request.args["search_category"]]:
                return {'message':'Invalid search option'},400
        search_query=request.args["search_query"]
        option=request.args["search_option"]
        print(signin_as,search_query,option,request.args["search_category"])
        if signin_as=="admin":
            if request.args["search_category"] =="service_request":
                match option:
                    case "service":
                        service_requests=ServiceRequest.query.filter(ServiceRequest.service.has(Service.name.ilike(f"%{search_query}%"))).all()
                    case "service_status":
                        service_requests=ServiceRequest.query.filter_by(service_status=search_query).all()
                    case "date_of_request":
                        service_requests=ServiceRequest.query.filter(func.date(ServiceRequest.date_of_request)==search_query).all()
                    case "date_of_service":
                        service_requests=ServiceRequest.query.filter_by(date_of_service=search_query).all()
                    case "date_of_completion":
                        service_requests=ServiceRequest.query.filter(func.date(ServiceRequest.date_of_completion)==search_query).all()
                return {"service_requests":[service_request.adminBrief() for service_request in service_requests]},200
            elif request.args["search_category"]=="professional":
                match option:
                    case "name":
                        professionals=getProfessionalsWithRating(Professional.query.filter(Professional.name.ilike(f"%{search_query}%"))).all()
                    case "email":
                        professionals=getProfessionalsWithRating(Professional.query.filter(Professional.email.ilike(f"%{search_query}%"))).all()
                    case "phone":
                        professionals=getProfessionalsWithRating(Professional.query.filter(Professional.phone.ilike(f"%{search_query}%"))).all()
                    case "address":
                        professionals=getProfessionalsWithRating(Professional.query.filter(Professional.address.ilike(f"%{search_query}%"))).all()
                    case "pincode":
                        professionals=getProfessionalsWithRating(Professional.query.filter_by(pincode=search_query)).all()
                    case "service":
                        professionals=getProfessionalsWithRating(Professional.query.filter(Professional.service.has(Service.name.ilike(f"%{search_query}%")))).all()
                    case "rating":
                        professionals=get_professionals_with_avg_rating_between(int(search_query),int(search_query)+1).all()
                return {"professionals":[{**professional.as_private_dict(),"average_rating":average_rating} for professional,average_rating in professionals]},200
            elif request.args["search_category"]=="customer":
                match option:
                    case "name":
                        customers=getCustomersWithRating(Customer.query.filter(Customer.name.ilike(f"%{search_query}%"))).all()
                    case "email":
                        customers=getCustomersWithRating(Customer.query.filter(Customer.email.ilike(f"%{search_query}%"))).all()
                    case "phone":
                        customers=getCustomersWithRating(Customer.query.filter(Customer.phone.ilike(f"%{search_query}%"))).all()
                    case "address":
                        customers=getCustomersWithRating(Customer.query.filter(Customer.address.ilike(f"%{search_query}%"))).all()
                    case "pincode":
                        customers=getCustomersWithRating(Customer.query.filter_by(pincode=search_query)).all()
                    case "rating":
                        customers=get_customers_with_avg_rating_between(int(search_query),int(search_query)+1).all()
                return {"customers":[{**customer.as_private_dict(),"average_rating":average_rating} for customer,average_rating in customers]},200
        elif signin_as=="customer":
            if request.args["search_category"]!="service_request":
                return {'message':'Invalid search category for customer'},400
            match option:
                case "service":
                    services=Service.query.filter(Service.name.ilike(f"%{search_query}%")).all()
                    return {"services":[service.as_dict() for service in services]},200
                case "pincode":
                    services=Service.query.filter(Service.id.in_(Professional.query.filter_by(pincode=search_query).with_entities(Professional.service_id))).all()
                    return {"services":[service.as_dict() for service in services]},200
                case "service_status":
                    service_requests=ServiceRequest.query.filter_by(customer_id=signed_id,service_status=search_query).all()
                case "date_of_request":
                    service_requests=ServiceRequest.query.filter(ServiceRequest.customer_id==signed_id,func.date(ServiceRequest.date_of_request)==search_query).all()
                case "date_of_service":
                    service_requests=ServiceRequest.query.filter_by(customer_id=signed_id,date_of_service=search_query).all()
                case "date_of_completion":
                    service_requests=ServiceRequest.query.filter(ServiceRequest.customer_id==signed_id,func.date(ServiceRequest.date_of_completion)==search_query).all()
            return {"service_requests":[service_request.customerBrief() for service_request in service_requests]},200
        else:
            if request.args["search_category"]!="service_request":
                return {'message':'Invalid search category for customer'},400
            match option:
                case "service":
                    return {'message':'Invalid search option for professional'},400
                case "service_status":
                    service_requests=ServiceRequest.query.filter_by(professional_id=signed_id,service_status=search_query).all()
                case "date_of_request":
                    service_requests=ServiceRequest.query.filter(ServiceRequest.professional_id==signed_id,func.date(ServiceRequest.date_of_request)==search_query).all()
                case "date_of_service":
                    service_requests=ServiceRequest.query.filter_by(professional_id=signed_id,date_of_service=search_query).all()
                case "date_of_completion":
                    service_requests=ServiceRequest.query.filter(ServiceRequest.professional_id==signed_id,func.date(ServiceRequest.date_of_completion)==search_query).all()
            return {"service_requests":[service_request.professionalBrief() for service_request in service_requests]},200