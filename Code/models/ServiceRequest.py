from setup import db

class ServiceRequest(db.Model):
    __tablename__ = 'service_requests'
    
    id = db.Column(db.Integer, primary_key=True,autoincrement=True)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False, index=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False, index=True)
    professional_id = db.Column(db.Integer, db.ForeignKey('professionals.id'), nullable=True, default=None, index=True)
    date_of_request = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    date_of_service = db.Column(db.Date, nullable=False)
    customer_remark = db.Column(db.Text,nullable=True,default=None)
    professional_remark = db.Column(db.Text,nullable=True,default=None)
    date_of_completion = db.Column(db.DateTime, nullable=True,default=None)  
    service_status = db.Column(db.String, db.CheckConstraint("service_status IN ('Requested', 'Assigned', 'Accepted', 'Rejected', 'Closed')"), nullable=False, default='Requested')
    review= db.relationship('ServiceReview',backref='service_request',lazy=True)

    def __repr__(self):
        return f"<ServiceRequest(id={self.id}, customer_id={self.customer_id}, service_id={self.service_id})>"
    
    def adminBrief(self):
        return {
            'id': self.id,
            'service': self.service.as_dict(),
            'customer': self.customer.as_private_dict(),
            'professional': self.professional.as_private_dict() if self.professional!=None else None,
            'date_of_request': self.date_of_request.isoformat(timespec='milliseconds') + 'Z',
            'date_of_service': self.date_of_service.isoformat(),
            'date_of_completion': (self.date_of_completion.isoformat(timespec='milliseconds') + 'Z') if self.date_of_completion!=None else None,
            'service_status': self.service_status,
            'customer_remark': self.customer_remark,
            'professional_remark': self.professional_remark,
            'service_review': self.review[0].fullReview() if len(self.review)>0 else None,
        }
    
    def customerBrief(self):
        return {
            'id': self.id,
            'service': self.service.as_dict(),
            'professional': self.professional.as_public_dict() if self.professional!=None else None,
            'date_of_request': self.date_of_request.isoformat(timespec='milliseconds') + 'Z',
            'date_of_service': self.date_of_service.isoformat(),
            'date_of_completion': (self.date_of_completion.isoformat(timespec='milliseconds') + 'Z') if self.date_of_completion!=None else None,
            'service_status': self.service_status,
            'customer_remark': self.customer_remark,
            'professional_remark': self.professional_remark,
            'service_review': self.review[0].customerReview() if len(self.review)>0 else None,
        }
    
    def professionalBrief(self):
        return {
            'id': self.id,
            'service': self.service.as_dict(),
            'customer': self.customer.as_public_dict(),
            'date_of_request': self.date_of_request.isoformat(timespec='milliseconds') + 'Z',
            'date_of_service': self.date_of_service.isoformat(),
            'date_of_completion': (self.date_of_completion.isoformat(timespec='milliseconds') + 'Z') if self.date_of_completion!=None else None,
            'service_status': self.service_status,
            'service_review': self.review[0].fullReview() if len(self.review)>0 else None,
            'professional_remark': self.professional_remark,
            'customer_remark': self.customer_remark,
        }

class ServiceReview(db.Model):
    __tablename__ = 'service_reviews'
    id = db.Column(db.Integer, db.ForeignKey('service_requests.id'), primary_key=True)
    customer_rating = db.Column(db.Integer, db.CheckConstraint('customer_rating BETWEEN 1 AND 5'), nullable=True)
    customer_review = db.Column(db.Text, nullable=True)
    professional_rating = db.Column(db.Integer, db.CheckConstraint('professional_rating BETWEEN 1 AND 5'), nullable=True)
    professional_review = db.Column(db.Text, nullable=True)

    __table_args__ = (
        db.CheckConstraint(
            '(customer_rating IS NOT NULL OR professional_rating IS NOT NULL)',
            name='at_least_one_rating_required'
        ),
    )

    def __repr__(self):
        return f"<ServiceReview(service_request_id={self.id})>"
    
    def customerReview(self):
        return {
            'customer_rating': self.customer_rating,
            'customer_review': self.customer_review,
        }
    
    def fullReview(self):
        return {
            'customer_rating': self.customer_rating,
            'customer_review': self.customer_review,
            'professional_rating': self.professional_rating,
            'professional_review': self.professional_review,
        }