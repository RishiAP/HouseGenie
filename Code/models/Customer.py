from setup import db
from models.ServiceRequest import ServiceRequest

class Customer(db.Model):
    __tablename__='customers'
    id=db.Column(db.Integer,primary_key=True,autoincrement=True)
    email=db.Column(db.String(100),unique=True,nullable=False)
    password=db.Column(db.String(100),nullable=False)
    name=db.Column(db.String(100),nullable=False)
    address=db.Column(db.String(255),nullable=False)
    pincode=db.Column(db.Integer,nullable=False,index=True)
    phone=db.Column(db.String(20),nullable=False,unique=True)
    created_on=db.Column(db.DateTime,nullable=False,default=db.func.current_timestamp())
    service_request=db.relationship('ServiceRequest',backref='customer',lazy=True)

    def as_public_dict(self):
        return {
            'name':self.name,
            'address':self.address,
            'phone':self.phone,
            'pincode':self.pincode,
        }
    
    def as_private_dict(self):
        return {
            'email':self.email,
            'name':self.name,
            'address':self.address,
            'phone':self.phone,
            'pincode':self.pincode,
            'created_on':self.created_on.isoformat(timespec='milliseconds') + 'Z',
        }