import { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:5001'

type ApplicationStatus = 'approved' | 'rejected' | 'pending'

interface Application {
    id: string
    full_name: string
    national_id: string
    email?: string
    date_of_birth: string
    loan_amount: number
    loan_term: number
    purpose: string
    status: ApplicationStatus
    submitted_at: string
    decision_reason?: string
}

type Step = 'login' | 'phone-entry' | 'otp-verification' | 'personal-details' | 'loan-details' | 'decision'

function App() {
    const [currentStep, setCurrentStep] = useState<Step>('login')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [otp, setOtp] = useState('')
    const [sessionToken, setSessionToken] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    
    // Personal details
    const [fullName, setFullName] = useState('')
    const [nationalId, setNationalId] = useState('')
    const [email, setEmail] = useState('')
    const [dateOfBirth, setDateOfBirth] = useState('')
    
    // Loan details
    const [loanAmount, setLoanAmount] = useState('')
    const [loanTerm, setLoanTerm] = useState('12')
    const [purpose, setPurpose] = useState('')
    
    // Application
    const [application, setApplication] = useState<Application | null>(null)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        // Check if user has session token
        const token = sessionStorage.getItem('session_token')
        if (token) {
            setSessionToken(token)
            checkApplicationStatus(token)
        }
    }, [])

    const checkApplicationStatus = async (token: string) => {
        try {
            const response = await fetch(`${API_URL}/api/application/status`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            
            if (response.ok) {
                const data = await response.json()
                if (data.has_application) {
                    setApplication(data.application)
                    setCurrentStep('decision')
                } else {
                    setCurrentStep('personal-details')
                }
            }
        } catch (err) {
            console.error('Error checking application status:', err)
        }
    }

    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/api/auth/request-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone_number: phoneNumber })
            })

            const data = await response.json()

            if (response.ok) {
                setCurrentStep('otp-verification')
            } else {
                setError(data.error || 'Failed to send OTP')
            }
        } catch (err) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone_number: phoneNumber, otp })
            })

            const data = await response.json()

            if (response.ok) {
                setSessionToken(data.session_token)
                sessionStorage.setItem('session_token', data.session_token)
                await checkApplicationStatus(data.session_token)
            } else {
                setError(data.error || 'Invalid OTP')
            }
        } catch (err) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmitApplication = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setFieldErrors({})
        setLoading(true)

        if (!sessionToken) {
            setError('Session expired. Please login again.')
            return
        }

        try {
            const response = await fetch(`${API_URL}/api/application/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`
                },
                body: JSON.stringify({
                    full_name: fullName,
                    national_id: nationalId,
                    email: email,
                    date_of_birth: dateOfBirth,
                    loan_amount: parseFloat(loanAmount),
                    loan_term: parseInt(loanTerm),
                    purpose: purpose
                })
            })

            const data = await response.json()

            if (response.ok) {
                setApplication(data.application)
                setCurrentStep('decision')
            } else {
                if (data.errors) {
                    setFieldErrors(data.errors)
                } else {
                    setError(data.error || 'Failed to submit application')
                }
            }
        } catch (err) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        setSessionToken(null)
        sessionStorage.removeItem('session_token')
        setCurrentStep('login')
        setPhoneNumber('')
        setOtp('')
        setFullName('')
        setNationalId('')
        setEmail('')
        setDateOfBirth('')
        setLoanAmount('')
        setPurpose('')
        setApplication(null)
        setError(null)
    }

    const renderLoginStep = () => (
        <div className="step-container">
            <h1>First-Time Loan Application</h1>
            <p>Welcome! Let's get you started with your loan application.</p>
            <button onClick={() => setCurrentStep('phone-entry')} className="btn-primary">
                Start Application
            </button>
        </div>
    )

    const renderPhoneEntry = () => (
        <div className="step-container">
            <h2>Enter Your Phone Number</h2>
            <form onSubmit={handleRequestOTP}>
                <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+256 700 000 000"
                        required
                    />
                </div>
                {error && <div className="error-message">{error}</div>}
                <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Sending...' : 'Send OTP'}
                </button>
            </form>
        </div>
    )

    const renderOTPVerification = () => (
        <div className="step-container">
            <h2>Verify OTP</h2>
            <p>Enter the OTP sent to {phoneNumber}</p>
            {/* <p className="hint">For testing, use: 0000</p> */}
            <form onSubmit={handleVerifyOTP}>
                <div className="form-group">
                    <label htmlFor="otp">One-Time Password</label>
                    <input
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="0000"
                        maxLength={4}
                        required
                    />
                </div>
                {error && <div className="error-message">{error}</div>}
                <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Verifying...' : 'Verify'}
                </button>
                <button
                    type="button"
                    onClick={() => setCurrentStep('phone-entry')}
                    className="btn-secondary"
                >
                    Back
                </button>
            </form>
        </div>
    )

    const renderPersonalDetails = () => (
        <div className="step-container">
            <h2>Personal Details</h2>
            <form onSubmit={(e) => {
                e.preventDefault()
                setCurrentStep('loan-details')
            }}>
                <div className="form-group">
                    <label htmlFor="fullName">Full Name *</label>
                    <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="nationalId">National ID *</label>
                    <input
                        id="nationalId"
                        type="text"
                        value={nationalId}
                        onChange={(e) => setNationalId(e.target.value)}
                        placeholder="CM12345678"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="dob">Date of Birth *</label>
                    <input
                        id="dob"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="btn-primary">
                    Next
                </button>
            </form>
        </div>
    )

    const renderLoanDetails = () => (
        <div className="step-container">
            <h2>Loan Details</h2>
            <form onSubmit={handleSubmitApplication}>
                <div className="form-group">
                    <label htmlFor="loanAmount">Loan Amount *</label>
                    <input
                        id="loanAmount"
                        type="number"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(e.target.value)}
                        placeholder="50000"
                        required
                    />
                    {fieldErrors.loan_amount && (
                        <div className="field-error">{fieldErrors.loan_amount}</div>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="loanTerm">Loan Term (days) *</label>
                    <select
                        id="loanTerm"
                        value={loanTerm}
                        onChange={(e) => setLoanTerm(e.target.value)}
                        required
                    >
                        <option value="15">15 Days</option>
                        <option value="30">30 Days</option>
                        <option value="45">45 Days</option>
                        <option value="60">60 Days</option>
                    </select>
                    {fieldErrors.loan_term && (
                        <div className="field-error">{fieldErrors.loan_term}</div>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="purpose">Purpose *</label>
                    <textarea
                        id="purpose"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        placeholder="What will you use the loan for?"
                        rows={4}
                        required
                    />
                    {fieldErrors.purpose && (
                        <div className="field-error">{fieldErrors.purpose}</div>
                    )}
                </div>

                {error && <div className="error-message">{error}</div>}
                
                <div className="button-group">
                    <button
                        type="button"
                        onClick={() => setCurrentStep('personal-details')}
                        className="btn-secondary"
                    >
                        Back
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Submitting...' : 'Submit Application'}
                    </button>
                </div>
            </form>
        </div>
    )

    const renderDecision = () => {
        if (!application) return null

        const statusColors = {
            approved: '#28a745',
            rejected: '#dc3545',
            pending: '#ffc107'
        }

        const statusMessages = {
            approved: '🎉 Congratulations! Your loan has been approved.',
            rejected: '❌ Unfortunately, your loan application was not approved at this time.',
            pending: '⏳ Your application is under review. We will get back to you soon.'
        }

        return (
            <div className="step-container">
                <h2>Application Decision</h2>
                <div
                    className="decision-box"
                    style={{ borderColor: statusColors[application.status] }}
                >
                    <div className="status-badge" style={{ backgroundColor: statusColors[application.status] }}>
                        {application.status.toUpperCase()}
                    </div>
                    <p className="decision-message">{statusMessages[application.status]}</p>
                    
                    <div className="application-summary">
                        <h3>Application Summary</h3>
                        <div className="summary-item">
                            <span>Applicant:</span>
                            <strong>{application.full_name}</strong>
                        </div>
                        <div className="summary-item">
                            <span>Loan Amount:</span>
                            <strong>{application.loan_amount.toLocaleString()} UGX</strong>
                        </div>
                        <div className="summary-item">
                            <span>Loan Term:</span>
                            <strong>{application.loan_term} days</strong>
                        </div>
                        <div className="summary-item">
                            <span>Submitted:</span>
                            <strong>{new Date(application.submitted_at).toLocaleString()}</strong>
                        </div>
                    </div>
                </div>
                
                <button onClick={handleLogout} className="btn-secondary">
                    Logout
                </button>
            </div>
        )
    }

    return (
        <div className="app-container">
            {currentStep === 'login' && renderLoginStep()}
            {currentStep === 'phone-entry' && renderPhoneEntry()}
            {currentStep === 'otp-verification' && renderOTPVerification()}
            {currentStep === 'personal-details' && renderPersonalDetails()}
            {currentStep === 'loan-details' && renderLoanDetails()}
            {currentStep === 'decision' && renderDecision()}
        </div>
    )
}

export default App
