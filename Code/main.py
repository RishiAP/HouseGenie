from setup import app,api
from flask import render_template, redirect, request
from api.signin import Signin
from api.register import Register
from functools import wraps
from api.signout import SignOut
from api.services import Services,SpecificService, ReactivateService
from api.service_category import ServiceCat, SpecificCategory
from models.Service import ServiceCategory, Service
from models.ServiceRequest import ServiceRequest, ServiceReview
from models.Professional import Professional
from api.service_request import GetRequests, GetSpecificRequest, CloseServiceRequest,BookService, AcceptRejectServiceRequest, AssignServiceRequest, ReviewServiceRequest
from api.professional import ProfessionalAPI, ServiceProfessionals
from api.profile import ProfileHandle
from api.search import Search
from api.summary import Summary
from models.Customer import Customer
from helpers.auth_decorators import check_signin, admin_required
from helpers.commons import searchTypes
from setup import db
from sqlalchemy import func
from api.ban_unban import BanUnban

@app.route('/')
@check_signin
def home(signed_in,signin_as,signed_email,signed_id,is_banned):
    if signin_as=="admin":
        categories=ServiceCategory.query.all()
        services=Service.query.filter_by(is_inactive=False).all()
        inactive_services=Service.query.filter_by(is_inactive=True).all()
        professionals=Professional.query.filter_by(approved=False).all()
        return render_template('home.html',page_type="home",signed_in=signed_in,signin_as=signin_as,categories=categories,services=services,inactive_services=inactive_services,professionals=professionals)
    elif signin_as=="customer":
        categories=ServiceCategory.query.all()
        return render_template('home.html',page_type="home",signed_in=signed_in,signin_as=signin_as,categories=categories)
    elif signin_as=="professional":
        professional=Professional.query.filter_by(email=signed_email).first()
        return render_template('home.html',page_type="home",signed_in=signed_in,signin_as=signin_as,signed_email=signed_email,professional=professional)
    else:
        return render_template('home.html',page_type="home",signed_in=signed_in,signin_as=signin_as)

@app.route('/signin')
def admin_login():
    return render_template('signin.html')

@app.route('/register/customer')
def customer_register():
    return render_template('customer_register.html')

@app.route('/register/professional')
def professional_register():
    services=Service.query.all()
    return render_template('professional_register.html',services=services)

@app.route('/professional/<int:id>')
@admin_required
def professional(id):
    professional_info=(db.session.query(Professional,func.avg(ServiceReview.customer_rating).label("average_rating"))
                .outerjoin(ServiceRequest, ServiceRequest.professional_id == Professional.id)
                .outerjoin(ServiceReview, ServiceReview.id == ServiceRequest.id)
                .group_by(Professional.id)
                .filter(Professional.id==id)).first()
    if professional_info is None:
        return render_template('professional.html',professional=None,average_rating=None,signed_in=True,signin_as="admin"), 404
    return render_template('professional.html',professional=professional_info[0],average_rating=professional_info[1],signed_in=True,signin_as="admin"), 404 if professional is None else 200

@app.route('/customer/<int:id>')
@admin_required
def customer(id):
    customer_info=(db.session.query(Customer,func.avg(ServiceReview.professional_rating).label("average_rating"))
                .outerjoin(ServiceRequest, ServiceRequest.customer_id == Customer.id)
                .outerjoin(ServiceReview, ServiceReview.id == ServiceRequest.id)
                .group_by(Customer.id)
                .filter(Customer.id==id)).first()
    if customer_info is None:
        return render_template('customer.html',customer=None,average_rating=None,signed_in=True,signin_as="admin"), 404
    return render_template('customer.html',customer=customer_info[0],average_rating=customer_info[1],signed_in=True,signin_as="admin"), 404 if customer is None else 200

@app.route('/service_request/<int:id>')
@check_signin
def service_request(id,signed_in,signin_as,signed_email,signed_id,is_banned):
    return render_template('service_request.html',signed_in=signed_in,signin_as=signin_as,signed_email=signed_email), 404 if service_request is None else 200

@app.route('/profile')
@check_signin
def profile(signed_in,signin_as,signed_email,signed_id,is_banned):
    if not signed_in or signin_as=="admin":
        return redirect('/')
    elif signin_as=="customer":
        customer=Customer.query.filter_by(id=signed_id).first()
        return render_template('customer.html',signed_in=signed_in,signin_as=signin_as,signed_email=signed_email,customer=customer)
    elif signin_as=="professional":
        professional_info=(db.session.query(Professional,func.avg(ServiceReview.customer_rating).label("average_rating"))
        .outerjoin(ServiceRequest, ServiceRequest.professional_id == Professional.id)
        .outerjoin(ServiceReview, ServiceReview.id == ServiceRequest.id)
        .group_by(Professional.id)
        .filter(Professional.id==signed_id)).first()
        return render_template('professional.html',signed_in=signed_in,signin_as=signin_as,signed_email=signed_email,professional=professional_info[0],average_rating=professional_info[1])
    
@app.route("/search")
@check_signin
def search_page(signed_in,signin_as,signed_email,signed_id,is_banned):
    if not signed_in:
        return redirect('/')
    return render_template("search.html",page_type="search",signed_in=signed_in,signin_as=signin_as,signed_email=signed_email,options={} if signin_as=="admin" else searchTypes["service_request"])

@app.route("/summary")
@check_signin
def summary_page(signed_in,signin_as,signed_email,signed_id,is_banned):
    if not signed_in:
        return redirect('/')
    return render_template("summary.html",page_type="summary",signed_in=signed_in,signin_as=signin_as,signed_email=signed_email)

api.add_resource(Signin,'/api/signin')
api.add_resource(Register,'/api/register')
api.add_resource(SignOut,'/api/signout')
api.add_resource(Services,'/api/services','/api/services/<category>')
api.add_resource(SpecificService,'/api/service/<int:id>')
api.add_resource(ServiceCat,'/api/service_category','/api/service_category/<int:id>')
api.add_resource(SpecificCategory,'/api/category/<int:id>')
api.add_resource(GetRequests,'/api/service_request')
api.add_resource(GetSpecificRequest,'/api/service_request/<int:id>')
api.add_resource(BookService,'/api/service/<int:id>/book','/api/service_request/<int:id>/edit')
api.add_resource(AssignServiceRequest,'/api/service_request/<int:service_request_id>/assign/<int:professional_id>')
api.add_resource(AcceptRejectServiceRequest,'/api/service_request/<int:id>/<reqType>')
api.add_resource(CloseServiceRequest,'/api/service_request/<int:id>/close')
api.add_resource(ReviewServiceRequest,'/api/service_request/<int:id>/rate')
api.add_resource(ProfessionalAPI,'/api/professional/<int:id>/approve')
api.add_resource(ServiceProfessionals,'/api/service/<int:service_id>/professionals/<professionalType>')
api.add_resource(ProfileHandle,'/api/edit_profile','/api/<user_type>/<int:id>/service_requests')
api.add_resource(Search,'/api/search')
api.add_resource(Summary,'/api/summary')
api.add_resource(BanUnban,'/api/<request_type>/<user_type>/<int:id>')
api.add_resource(ReactivateService,'/api/service/<int:id>/reactivate')

if __name__ == '__main__':
    app.run(debug=True)