import pytest
import requests
import uuid
import random

BASE_URL = "http://localhost:5001"


@pytest.fixture
def api_client():
    """Create a requests session for API calls"""
    return requests.Session()


@pytest.fixture
def unique_phone():
    """Generate unique phone number for each test to avoid conflicts"""
    # Generate 8 random digits for the phone number
    random_digits = ''.join([str(random.randint(0, 9)) for _ in range(8)])
    return f"+2567{random_digits}"


@pytest.fixture
def authenticated_session(api_client, unique_phone):
    """
    Create an authenticated session with valid token
    Returns: tuple of (session, phone_number)
    """
    # Request OTP
    response = api_client.post(
        f"{BASE_URL}/api/auth/request-otp",
        json={"phone_number": unique_phone}
    )
    assert response.status_code == 200

    # Verify OTP
    response = api_client.post(
        f"{BASE_URL}/api/auth/verify-otp",
        json={"phone_number": unique_phone, "otp": "0000"}
    )
    assert response.status_code == 200

    data = response.json()
    token = data.get("session_token")
    assert token is not None

    # Set authorization header
    api_client.headers.update({"Authorization": f"Bearer {token}"})

    return api_client, unique_phone


@pytest.fixture
def valid_application_data():
    """Valid application data for testing"""
    return {
        "full_name": "John Doe",
        "national_id": f"CM{uuid.uuid4().hex[:8].upper()}",
        "email": "john.doe@example.com",
        "date_of_birth": "1990-01-15",
        "loan_amount": 50000,
        "loan_term": 30,
        "purpose": "Business expansion and working capital"
    }

