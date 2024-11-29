from setup import db
from models.Professional import Professional
from models.ServiceRequest import ServiceRequest

class Service(db.Model):
    __tablename__='services'
    id=db.Column(db.Integer,primary_key=True)
    name=db.Column(db.String(100),nullable=False)
    description=db.Column(db.String(255),nullable=False)
    price=db.Column(db.Float,nullable=False)
    time_required_minutes=db.Column(db.Integer,nullable=False)
    category_id=db.Column(db.Integer,db.ForeignKey('service_categories.id'),nullable=False)
    professional=db.relationship('Professional',backref='service',lazy=True)
    is_inactive=db.Column(db.Boolean,nullable=False,default=False)
    service_request=db.relationship('ServiceRequest',backref='service',lazy=True)

    def as_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'time_required_minutes': self.time_required_minutes,
            'category': self.category.as_dict(),
            'is_inactive': self.is_inactive,
        }

class ServiceCategory(db.Model):
    __tablename__='service_categories'
    id=db.Column(db.Integer,primary_key=True)
    name=db.Column(db.String(100),nullable=False)
    description=db.Column(db.String(255),nullable=False)
    services=db.relationship('Service',backref='category',lazy=True)

    def as_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
        }