from setup import db

class ServiceRequest(db.Model):
    __tablename__ = 'service_requests'
    
    id = db.Column(db.Integer, primary_key=True,autoincrement=True)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey('professionals.id'), nullable=True)
    date_of_request = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    date_of_completion = db.Column(db.DateTime, nullable=True)  
    service_status = db.Column(db.String, db.CheckConstraint("service_status IN ('Requested', 'Assigned', 'Closed')"), nullable=False, default='Requested')
    customer_rating = db.Column(db.Integer, db.CheckConstraint('customer_rating BETWEEN 1 AND 5'), nullable=True)
    customer_review = db.Column(db.Text, nullable=True)
    professional_rating = db.Column(db.Integer, db.CheckConstraint('professional_rating BETWEEN 1 AND 5'), nullable=True)
    professional_review = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f"<ServiceRequest(id={self.id}, customer_id={self.customer_id}, service_id={self.service_id})>"
    
    def adminBrief(self):
        return {
            'id': self.id,
            'service': self.service.name,
            'customer': self.customer.email,
            'professional': self.professional.email if self.professional!=None else None,
            'date_of_request': self.date_of_request.isoformat(timespec='milliseconds') + 'Z',
            'date_of_completion': (self.date_of_completion.isoformat(timespec='milliseconds') + 'Z') if self.date_of_completion!=None else None,
            'service_status': self.service_status,
            'customer_rating': self.customer_rating,
            'professional_rating': self.professional_rating,
        }
    
    def getAll(self):
        return {
            'id': self.id,
            'service': self.service.as_dict(),
            'customer': self.customer.as_private_dict(),
            'professional': self.professional.as_public_dict() if self.professional!=None else None,
            'date_of_request': self.date_of_request.isoformat(timespec='milliseconds') + 'Z',
            'date_of_completion': (self.date_of_completion.isoformat(timespec='milliseconds') + 'Z') if self.date_of_completion!=None else None,
            'service_status': self.service_status,
            'customer_rating': self.customer_rating,
            'customer_review': self.customer_review,
            'professional_rating': self.professional_rating,
            'professional_review': self.professional_review,
        }
    
    def customerBrief(self):
        return {
            'id': self.id,
            'service': self.service.as_dict(),
            'professional': self.professional.as_public_dict() if self.professional!=None else None,
            'date_of_request': self.date_of_request.isoformat(timespec='milliseconds') + 'Z',
            'date_of_completion': (self.date_of_completion.isoformat(timespec='milliseconds') + 'Z') if self.date_of_completion!=None else None,
            'service_status': self.service_status,
            'customer_rating': self.customer_rating,
            'customer_review': self.customer_review,
        }
    
    def professionalBrief(self):
        return {
            'id': self.id,
            'service': self.service.as_dict(),
            'customer': self.customer.as_public_dict(),
            'date_of_request': self.date_of_request.isoformat(timespec='milliseconds') + 'Z',
            'date_of_completion': (self.date_of_completion.isoformat(timespec='milliseconds') + 'Z') if self.date_of_completion!=None else None,
            'service_status': self.service_status,
            'professional_rating': self.professional_rating,
            'professional_review': self.professional_review,
        }
