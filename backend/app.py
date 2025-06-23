from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.security import generate_password_hash

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:Fredrick4r%23%40%21%24@localhost/culfs_database'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_ECHO'] = True


db = SQLAlchemy(app)
CORS(app)

# Database Models
class User(db.Model):
    __tablename__ = 'users'
    
    user_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.Enum('student', 'staff', 'admin'), nullable=False)
    university_credentials = db.Column(db.String(50), nullable=True)
    email_address = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Office(db.Model):
    __tablename__ = 'offices'
    
    office_id = db.Column(db.String(10), primary_key=True)
    office_name = db.Column(db.String(100), nullable=False)
    contact_email = db.Column(db.String(100), nullable=False)
    responsible_person = db.Column(db.String(100), nullable=False)

class Student(db.Model):
    __tablename__ = 'students'
    
    matric_no = db.Column(db.String(20), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    level = db.Column(db.String(10), nullable=False)

class Staff(db.Model):
    __tablename__ = 'staff'
    
    staff_id = db.Column(db.String(20), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=False)
    office_id = db.Column(db.String(10), db.ForeignKey('offices.office_id'), nullable=False)

class LostItems(db.Model):
    __tablename__ = 'lost_items'
    
    case_number = db.Column(db.String(20), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=False)
    item_name = db.Column(db.String(100), nullable=False)
    item_type = db.Column(db.String(50), nullable=False)
    item_color = db.Column(db.String(50), nullable=True)
    brand = db.Column(db.String(50), nullable=True)
    description = db.Column(db.Text, nullable=False)
    last_seen_location = db.Column(db.String(100), nullable=False)
    last_seen_date = db.Column(db.Date, nullable=False)
    submission_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.Enum('Reported', 'Found', 'Matched', 'Claimed', 'Unclaimed', 'Archived'), default='Reported')
    image_path = db.Column(db.String(255), nullable=True)

class FoundItems(db.Model):
    __tablename__ = 'found_items'
    
    found_item_id = db.Column(db.String(20), primary_key=True)
    office_id = db.Column(db.String(10), db.ForeignKey('offices.office_id'), nullable=False)
    item_name = db.Column(db.String(100), nullable=False)
    item_color = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    found_date = db.Column(db.Date, nullable=False)
    found_location = db.Column(db.String(100), nullable=False)
    status = db.Column(db.Enum('Found', 'Matched', 'Claimed', 'Archived'), default='Found')
    image_path = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Matches(db.Model):
    __tablename__ = 'matches'
    
    match_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    found_item_id = db.Column(db.String(20), db.ForeignKey('found_items.found_item_id'), nullable=False)
    case_number = db.Column(db.String(20), db.ForeignKey('lost_items.case_number'), nullable=False)
    confirmation = db.Column(db.Boolean, default=False)
    match_status = db.Column(db.Enum('Pending', 'Confirmed', 'Rejected'), default='Pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Notifications(db.Model):
    __tablename__ = 'notifications'
    
    notification_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_number = db.Column(db.String(20), db.ForeignKey('lost_items.case_number'), nullable=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=False)
    notification_type = db.Column(db.Enum('Report_Confirmed', 'Item_Found', 'Match_Found', 'Claim_Reminder'), nullable=False)
    notification_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.Enum('Sent', 'Pending', 'Failed'), default='Pending')
    message = db.Column(db.Text, nullable=False)

class Archives(db.Model):
    __tablename__ = 'archives'
    
    archive_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_number = db.Column(db.String(20), db.ForeignKey('lost_items.case_number'), nullable=False)
    archive_date = db.Column(db.DateTime, default=datetime.utcnow)
    disposition = db.Column(db.Enum('Donated', 'Disposed', 'Returned_to_Owner'), nullable=False)

# Utility Functions
def generate_case_number():
    year = datetime.now().year
    import random
    random_num = random.randint(1000, 9999)
    return f"CU{year}{random_num}"

def generate_found_item_id():
    year = datetime.now().year
    import random
    random_num = random.randint(1000, 9999)
    return f"FI{year}{random_num}"

def send_email(to_email, subject, body):
    """Send email notification"""
    try:
        # Email configuration (you'll need to set up SMTP settings)
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        smtp_username = "your-email@gmail.com"  # Configure this
        smtp_password = "your-app-password"     # Configure this
        
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'html'))
        
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        text = msg.as_string()
        server.sendmail(smtp_username, to_email, text)
        server.quit()
        
        return True
    except Exception as e:
        print(f"Email sending failed: {e}")
        return False

def check_for_matches(found_item):
    """Check if found item matches any lost items"""
    lost_items = LostItems.query.filter_by(status='Reported').all()
    
    for lost_item in lost_items:
        # Simple matching algorithm based on item name and color
        if (lost_item.item_name.lower() in found_item.item_name.lower() and 
            lost_item.item_color and found_item.item_color and
            lost_item.item_color.lower() == found_item.item_color.lower()):
            
            # Create match record
            match = Matches(
                found_item_id=found_item.found_item_id,
                case_number=lost_item.case_number
            )
            db.session.add(match)
            
            # Update statuses
            lost_item.status = 'Matched'
            found_item.status = 'Matched'
            
            # Send notification to owner
            user = User.query.get(lost_item.user_id)
            notification_body = f"""
            <h2>Item Match Found!</h2>
            <p>Dear {user.name},</p>
            <p>We found a potential match for your lost item:</p>
            <ul>
                <li><strong>Your Report:</strong> Case #{lost_item.case_number}</li>
                <li><strong>Item:</strong> {lost_item.item_name}</li>
                <li><strong>Found Item ID:</strong> {found_item.found_item_id}</li>
            </ul>
            <p>Please contact the Lost and Found office to verify and claim your item.</p>
            <p>Best regards,<br>CULfs Team</p>
            """
            
            send_email(user.email_address, "Item Match Found - CULfs", notification_body)
            
            # Create notification record
            notification = Notifications(
                case_number=lost_item.case_number,
                user_id=lost_item.user_id,
                notification_type='Match_Found',
                message=f"Potential match found for {lost_item.item_name}",
                status='Sent'
            )
            db.session.add(notification)

# API Routes



@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    print(f"[DEBUG] Incoming registration data: {data}")

    try:
        if not data:
            raise ValueError("No data provided")

        required_fields = ['name', 'email', 'password', 'role']
        for field in required_fields:
            if field not in data:
                raise ValueError(f"Missing required field: {field}")

        # Hash the password
        hashed_password = generate_password_hash(data['password'])

        # Create user
        user = User(
            name=data['name'],
            role=data['role'],
            university_credentials=data.get('credentials'),
            email_address=data['email'],
            password_hash=hashed_password
        )
        db.session.add(user)
        db.session.flush()

        # Role-specific
        if data['role'] == 'student':
            student = Student(
                matric_no=data['matricNo'],
                user_id=user.user_id,
                department=data['department'],
                level=data['level']
            )
            db.session.add(student)

        elif data['role'] == 'staff':
            staff = Staff(
                staff_id=data['staffId'],
                user_id=user.user_id,
                office_id=data.get('officeId', 'ADMIN')
            )
            db.session.add(staff)

        db.session.commit()

        return jsonify({
            'success': True,
            'user_id': user.user_id,
            'message': 'Registration successful'
        })

    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Registration failed: {e}")
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Admin login
    if (data.get('email') == 'admin' or data.get('email') == 'admin@covenantuniversity.edu.ng') and data.get('password') == 'admin':
        return jsonify({
            'success': True,
            'user': {
                'id': 'admin-001',
                'name': 'System Administrator',
                'email': 'admin@covenantuniversity.edu.ng',
                'role': 'admin'
            }
        }), 200
    
    # Regular user login
    user = User.query.filter_by(email_address=data['email']).first()
    
    if user and check_password_hash(user.password_hash, data['password']):  # In production, use proper password hashing!
        user_data = {
            'id': user.user_id,
            'name': user.name,
            'email': user.email_address,
            'role': user.role
        }
        
        # Add role-specific data
        if user.role == 'student':
            student = Student.query.filter_by(user_id=user.user_id).first()
            if student:
                user_data['matricNo'] = student.matric_no
        elif user.role == 'staff':
            staff = Staff.query.filter_by(user_id=user.user_id).first()
            if staff:
                user_data['staffId'] = staff.staff_id
        
        return jsonify({'success': True, 'user': user_data}),200
    
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/api/report-lost-item', methods=['POST'])
def report_lost_item():
    data = request.get_json()
    print(data)
    try:
        case_number = generate_case_number()
        
        lost_item = LostItems(
            case_number=case_number,
            user_id=data['userId'],
            item_name=data['itemName'],
            item_type=data['itemType'],
            item_color=data.get('itemColor'),
            brand=data.get('brand'),
            description=data['description'],
            last_seen_location=data['lastSeenLocation'],
            last_seen_date=datetime.strptime(data['lastSeenDate'], '%Y-%m-%d').date(),
            image_path=None
        )
        
        db.session.add(lost_item)
        db.session.commit()
        print(f"[DEBUG] Lost item saved: {lost_item}")
        
        # Send confirmation email
        user = User.query.get(data['userId'])
        if user:
            email_body = f"""
            <h2>Lost Item Report Confirmation</h2>
            <p>Dear {user.name},</p>
            <p>Your lost item has been successfully reported.</p>
            <p><strong>Case Number:</strong> {case_number}</p>
            <p><strong>Item:</strong> {data['itemName']}</p>
            <p><strong>Description:</strong> {data['description']}</p>
            <p>We will notify you if your item is found.</p>
            <p>Best regards,<br>CULfs Team</p>
            """
            
            send_email(user.email_address, f"Lost Item Report Confirmation - Case #{case_number}", email_body)
            
            # Create notification
            notification = Notifications(
                case_number=case_number,
                user_id=data['userId'],
                notification_type='Report_Confirmed',
                message=f"Lost item report confirmed - Case #{case_number}",
                status='Sent'
            )
            db.session.add(notification)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'case_number': case_number,
            'message': 'Item reported successfully'
        })
    
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Failed to save lost item. Data: {data}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/api/log-found-item', methods=['POST'])
def log_found_item():
    data = request.get_json()
    
    try:
        found_item_id = generate_found_item_id()
        
        found_item = FoundItems(
            found_item_id=found_item_id,
            office_id=data['officeId'],
            item_name=data['itemName'],
            item_color=data['itemColor'],
            description=data['description'],
            found_date=datetime.strptime(data['foundDate'], '%Y-%m-%d').date(),
            found_location=data['foundLocation']
        )
        
        db.session.add(found_item)
        db.session.commit()
        
        # Check for matches
        check_for_matches(found_item)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'found_item_id': found_item_id,
            'message': 'Found item logged successfully'
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/api/lost-items/<user_id>', methods=['GET'])
def get_user_lost_items(user_id):
    lost_items = LostItems.query.filter_by(user_id=user_id).all()
    print(f"[DEBUG] Lost items for user {user_id}: {lost_items}")
    
    items_data = []
    for item in lost_items:
        items_data.append({
            'caseNumber': item.case_number,
            'itemName': item.item_name,
            'itemType': item.item_type,
            'status': item.status,
            'dateReported': item.submission_date.strftime('%Y-%m-%d'),
            'lastSeenLocation': item.last_seen_location
        })
    
    return jsonify({'success': True, 'items': items_data})

@app.route('/api/admin/lost-items', methods=['GET'])
def get_all_lost_items():
    lost_items = db.session.query(LostItems, User).join(User).all()
    print(f"[DEBUG] All lost items (admin): {lost_items}")
    
    items_data = []
    for lost_item, user in lost_items:
        items_data.append({
            'caseNumber': lost_item.case_number,
            'itemName': lost_item.item_name,
            'itemType': lost_item.item_type,
            'status': lost_item.status,
            'dateReported': lost_item.submission_date.strftime('%Y-%m-%d'),
            'lastSeenLocation': lost_item.last_seen_location,
            'reporterName': user.name,
            'reporterEmail': user.email_address
        })
    
    return jsonify({'success': True, 'items': items_data})

@app.route('/api/admin/found-items', methods=['GET'])
def get_all_found_items():
    found_items = FoundItems.query.all()
    
    items_data = []
    for item in found_items:
        items_data.append({
            'foundItemId': item.found_item_id,
            'itemName': item.item_name,
            'itemColor': item.item_color,
            'foundDate': item.found_date.strftime('%Y-%m-%d'),
            'foundLocation': item.found_location,
            'status': item.status,
            'description': item.description
        })
    
    return jsonify({'success': True, 'items': items_data})

@app.route('/api/init-db', methods=['POST'])
def init_database():
    """Initialize database with default data"""
    try:
        # Create all tables
        db.create_all()
        
        # Insert default offices
        offices_data = [
            {'office_id': 'SECURITY', 'office_name': 'Security Office', 'contact_email': 'security@covenantuniversity.edu.ng', 'responsible_person': 'Chief Security Officer'},
            {'office_id': 'ADMIN', 'office_name': 'Administrative Office', 'contact_email': 'admin@covenantuniversity.edu.ng', 'responsible_person': 'Administrative Officer'},
            {'office_id': 'STUDENT', 'office_name': 'Student Affairs', 'contact_email': 'studentaffairs@covenantuniversity.edu.ng', 'responsible_person': 'Student Affairs Officer'},
            {'office_id': 'ICT', 'office_name': 'ICT Services', 'contact_email': 'ict@covenantuniversity.edu.ng', 'responsible_person': 'ICT Manager'},
            {'office_id': 'LIBRARY', 'office_name': 'Library Office', 'contact_email': 'library@covenantuniversity.edu.ng', 'responsible_person': 'Chief Librarian'}
        ]
        
        for office_data in offices_data:
            existing_office = Office.query.get(office_data['office_id'])
            if not existing_office:
                office = Office(**office_data)
                db.session.add(office)
        
        db.session.commit()
        return jsonify({'success': True, 'message': 'Database initialized successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
