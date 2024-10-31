from flask_restful import Resource
from flask import request
from models.Customer import Customer
from models.Professional import Professional
from setup import db,app
import os
import bcrypt

class Register(Resource):
    def post(self):

        register_as = request.form.get('register_as')
        if not register_as or register_as not in ['customer', 'professional']:
            return {"success": False, "message": "Invalid or missing register type"}, 400
        args={}
        keys=set(request.form.keys())
        key_set=set(['email','password','full_name','phone','address','pincode'])
        missing_fields=key_set.difference(keys)
        if len(missing_fields)>0:
            return {"success": False, "message": f'Missing required fields: {missing_fields}'}, 400
        for key in keys:
            args[key]=request.form.get(key)

        try:
            if register_as=="customer":
                if Customer.query.filter_by(email=args['email']).first():
                    return {"success": False, "message": "Email already exists"}, 400
                customer=Customer(email=args['email'],password=bcrypt.hashpw(args['password'].encode('utf-8'), bcrypt.gensalt()),name=args['full_name'],phone=args['phone'],address=args['address'],pincode=args['pincode'])
                db.session.add(customer)
                db.session.commit()
            else:
                missing_fields=set(['service','experience']).difference(keys)
                if len(missing_fields)>0:
                    return {"success": False, "message": f"Missing required fields: ${missing_fields}"}, 400
                if Professional.query.filter_by(email=args['email']).first():
                    return {"success": False, "message": "Email already exists"}, 400
                resume=request.files['resume']
                if not resume or resume.filename == '':
                    return {"success": False, "message": "Resume file is required for professionals"}, 400
                resume_filename = f"{args['email']}_resume.pdf"
                resume_path = os.path.join(app.config['UPLOAD_FOLDER'], resume_filename)
                resume.save(resume_path)
                professional=Professional(email=args['email'],password=bcrypt.hashpw(args['password'].encode('utf-8'), bcrypt.gensalt()),name=args['full_name'],phone=args['phone'],address=args['address'],pincode=args['pincode'],service_id=args['service'],experience=args['experience'])
                db.session.add(professional)
                db.session.commit()
        except Exception as e:
            app.logger.error(f"Error registering user: {str(e)}")
            return {"success": False, "message": str(e)}, 400
        return {"success": True, "message": "Registered successfully"}, 201