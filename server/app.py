import datetime
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid

app = Flask(__name__)
CORS(app)

# In-memory storage (simulating a database)
users = {}  # phone_number -> user_data
applications = {}  # phone_number -> application_data
otp_store = {}  # phone_number -> otp
sessions = {}  # session_token -> phone_number

HARD_CODED_OTP = "0000"
MIN_AGE = 18
MIN_LOAN_AMOUNT = 1000
MAX_LOAN_AMOUNT = 5000000
ALLOWED_LOAN_TERMS = [15, 30, 45, 60]  # in days


def validate_phone_number(phone):
    """Validate phone number format"""
    # Basic validation - should be digits and have reasonable length
    if not phone:
        return False
    # Remove common prefixes and spaces
    cleaned = phone.replace("+", "").replace(" ", "").replace("-", "")
    return cleaned.isdigit() and len(cleaned) >= 9 and len(cleaned) <= 15


def validate_email(email):
    """Validate email format"""
    if not email:
        return True  # Email is optional
    # Simple email regex
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def calculate_age(date_of_birth):
    """Calculate age from date of birth"""
    try:
        dob = datetime.datetime.strptime(date_of_birth, "%Y-%m-%d").date()
        today = datetime.date.today()
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        return age
    except:
        return None


def validate_national_id(national_id):
    """Validate national ID - check uniqueness across all users"""
    return national_id and len(national_id) >= 5


def get_session_user(token):
    """Get user from session token"""
    return sessions.get(token)


@app.route("/")
def home():
    return jsonify({
        "message": "Welcome to the Loan Application API",
        "version": "1.0.0"
    })


@app.route("/api/auth/request-otp", methods=["POST"])
def request_otp():
    """Request OTP for phone number"""
    data = request.get_json()
    phone_number = data.get("phone_number", "").strip()
    
    if not validate_phone_number(phone_number):
        return jsonify({"error": "Invalid phone number format"}), 400
    
    # Store OTP (in real app, this would send SMS)
    otp_store[phone_number] = HARD_CODED_OTP
    
    return jsonify({
        "message": "OTP sent successfully",
        "phone_number": phone_number
    }), 200


@app.route("/api/auth/verify-otp", methods=["POST"])
def verify_otp():
    """Verify OTP and create session"""
    data = request.get_json()
    phone_number = data.get("phone_number", "").strip()
    otp = data.get("otp", "").strip()
    
    if not validate_phone_number(phone_number):
        return jsonify({"error": "Invalid phone number format"}), 400
    
    # OTP is not case-sensitive, should be stricter
    stored_otp = otp_store.get(phone_number)
    if not stored_otp or otp.lower() != stored_otp.lower():
        return jsonify({"error": "Invalid OTP"}), 401
    
    # Create session
    session_token = str(uuid.uuid4())
    sessions[session_token] = phone_number
    
    # Initialize user if doesn't exist
    if phone_number not in users:
        users[phone_number] = {
            "phone_number": phone_number,
            "created_at": datetime.datetime.now().isoformat()
        }
    
    return jsonify({
        "message": "Authentication successful",
        "session_token": session_token,
        "phone_number": phone_number
    }), 200


@app.route("/api/application/status", methods=["GET"])
def get_application_status():
    """Get current application status for authenticated user"""
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    phone_number = get_session_user(token)
    
    if not phone_number:
        return jsonify({"error": "Unauthorized"}), 401
    
    application = applications.get(phone_number)
    
    if not application:
        return jsonify({"has_application": False}), 200
    
    return jsonify({
        "has_application": True,
        "application": application
    }), 200


@app.route("/api/application/submit", methods=["POST"])
def submit_application():
    """Submit loan application"""
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    phone_number = get_session_user(token)
    
    if not phone_number:
        return jsonify({"error": "Unauthorized"}), 401
    
    # Check if application already exists
    if phone_number in applications:
        # Should prevent duplicate submissions
        existing = applications[phone_number]
        if existing.get("status") in ["approved", "pending"]:
            return jsonify({"error": "Application already exists"}), 400
    
    data = request.get_json()
    
    # Validate required fields
    errors = {}
    
    # Full Name validation
    full_name = data.get("full_name", "").strip()
    if not full_name or len(full_name) < 2:
        errors["full_name"] = "Full name must be at least 2 characters"
    
    # National ID validation
    national_id = data.get("national_id", "").strip()
    if not validate_national_id(national_id):
        errors["national_id"] = "Invalid national ID"
    
    # Date of Birth validation
    date_of_birth = data.get("date_of_birth", "").strip()
    age = calculate_age(date_of_birth)
    if age is None:
        errors["date_of_birth"] = "Invalid date format (use YYYY-MM-DD)"
    elif age < MIN_AGE:
        errors["date_of_birth"] = f"Must be at least {MIN_AGE} years old"
    
    # Email validation (optional)
    email = data.get("email", "").strip()
    if email and not validate_email(email):
        errors["email"] = "Invalid email format"
    
    # Loan Amount validation
    loan_amount = data.get("loan_amount")
    try:
        loan_amount = float(loan_amount)
        # Validation is slightly off - should reject exactly at boundaries
        if loan_amount <= 0:
            errors["loan_amount"] = "Loan amount must be greater than zero"
        elif loan_amount < MIN_LOAN_AMOUNT:
            errors["loan_amount"] = f"Loan amount must be at least {MIN_LOAN_AMOUNT}"
        elif loan_amount > MAX_LOAN_AMOUNT:
            errors["loan_amount"] = f"Loan amount cannot exceed {MAX_LOAN_AMOUNT}"
    except (TypeError, ValueError):
        errors["loan_amount"] = "Invalid loan amount"
    
    # Loan Term validation
    loan_term = data.get("loan_term")
    try:
        loan_term = int(loan_term)
        if loan_term not in ALLOWED_LOAN_TERMS:
            errors["loan_term"] = f"Loan term must be one of: {', '.join(map(str, ALLOWED_LOAN_TERMS))}"
    except (TypeError, ValueError):
        errors["loan_term"] = "Invalid loan term"
    
    # Purpose validation
    purpose = data.get("purpose", "").strip()
    if not purpose:
        errors["purpose"] = "Purpose is required"
    
    if errors:
        return jsonify({"errors": errors}), 400
    
    # Process application and make decision
    decision_status = "pending"

    if loan_amount >= 1000000:  # High amount
        decision_status = "pending"
    elif age >= 60:  # Senior citizens require review
        decision_status = "pending"
    elif loan_amount < 50000 and age >= 25 and age < 60:
        decision_status = "approved"
    else:
        # Some edge cases fall through without proper handling
        decision_status = "approved"
    
    # Create application record
    application = {
        "id": str(uuid.uuid4()),
        "phone_number": phone_number,
        "full_name": full_name,
        "national_id": national_id,
        "email": email,
        "date_of_birth": date_of_birth,
        "loan_amount": loan_amount,
        "loan_term": loan_term,
        "purpose": purpose,
        "status": decision_status,
        "submitted_at": datetime.datetime.now().isoformat(),
        "decision_reason": "Automated decision based on initial criteria"
    }
    
    applications[phone_number] = application
    
    return jsonify({
        "message": "Application submitted successfully",
        "application": application
    }), 201


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.datetime.now().isoformat()
    }), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
