from setup import db
from models.ServiceRequest import ServiceRequest

class Professional(db.Model):
    __tablename__="professionals"
    id=db.Column(db.Integer,primary_key=True,autoincrement=True)
    email=db.Column(db.String(100),unique=True,nullable=False)
    password=db.Column(db.String(100),nullable=False)
    name=db.Column(db.String(100),nullable=False)
    address=db.Column(db.String(255),nullable=False)
    pincode=db.Column(db.Integer,nullable=False,index=True)
    phone=db.Column(db.String(20),nullable=False)
    experience=db.Column(db.Integer,nullable=False)
    approved=db.Column(db.Boolean,nullable=False,default=False)
    created_on=db.Column(db.DateTime,nullable=False,default=db.func.current_timestamp())
    service_id=db.Column(db.Integer,db.ForeignKey('services.id'),nullable=False)
    service_request=db.relationship('ServiceRequest',backref='professional',lazy=True)

    def __repr__(self):
        return f"{self.name} - {self.email}"
    
    def as_private_dict(self):
        return {
            'id':self.id,
            'email':self.email,
            'name':self.name,
            'address':self.address,
            'phone':self.phone,
            'experience':self.experience,
            'approved':self.approved,
            'pincode':self.pincode,
            'created_on':self.created_on.isoformat(timespec='milliseconds') + 'Z',
        }
    
    def as_public_dict(self):
        return {
            'id':self.id,
            'name':self.name,
            'address':self.address,
            'phone':self.phone,
            'experience':self.experience,
            'pincode':self.pincode,
        }