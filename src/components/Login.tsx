import { useState, type FormEvent } from 'react';
import { supabase, checkStudentExists } from '../utils/supabase';
import './Login.css';

interface LoginProps {
  error?: string;
}

export function Login({ error: initialError }: LoginProps) {
  const [studentId, setStudentId] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [message, setMessage] = useState('');

  const error = localError || initialError;

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setMessage('');
    
    const id = studentId.trim();
    if (!id) return;



    setIsLoading(true);
    
    let email = '';

    if (id.toLowerCase() === 'tharushatheekshana25@gmail.com') {
      email = id.toLowerCase();
    } else {
      // First verify student exists in our DB
      const exists = await checkStudentExists(id.toUpperCase());
      if (!exists) {
        setLocalError('Student ID not found in the system.');
        setIsLoading(false);
        return;
      }
      email = `${id.toLowerCase()}@ms.sab.ac.lk`;
    }

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: window.location.origin
      }
    });

    if (signInError) {
      setLocalError(signInError.message);
    } else {
      setStep(2);
      setMessage(`OTP sent to ${email}`);
    }
    
    setIsLoading(false);
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setMessage('');
    
    if (!otp.trim()) return;

    setIsLoading(true);

    const id = studentId.trim();
    const email = id.toLowerCase() === 'tharushatheekshana25@gmail.com' 
      ? id.toLowerCase() 
      : `${id.toLowerCase()}@ms.sab.ac.lk`;

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp.trim(),
      type: 'email'
    });

    if (verifyError) {
      setLocalError('Invalid or expired code. Please try again.');
    }
    
    setIsLoading(false);
  };



  return (
    <div className="login-container">
      <div className="login-card glass-panel animate-fade-in">
        <div className="login-header">
          <div style={{ marginBottom: '1rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255, 255, 255, 0.6)' }}>
            <span style={{ display: 'block', marginBottom: '4px' }}>Sabaragamuwa University of Sri Lanka</span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 500 }}>Faculty of Computing</span>
          </div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>GPA Portal</h1>
          <p>{step === 1 ? 'Access your academic performance' : 'Enter verification code'}</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="login-form">
            <div className="input-group">
              <label htmlFor="studentId">Student ID</label>
              <input
                type="text"
                id="studentId"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. 22FIS0447"
                autoComplete="off"
                disabled={isLoading}
                required
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message" style={{ color: '#4ade80', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}

            <button type="submit" className="login-button pulse-hover" disabled={isLoading}>
              {isLoading ? 'Sending OTP...' : 'Continue to Dashboard'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="login-form">
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
              <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>Check your email</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                We sent a 6-digit code to <strong>{studentId.toLowerCase() === 'tharushatheekshana25@gmail.com' ? studentId.toLowerCase() : `${studentId.trim().toLowerCase()}@ms.sab.ac.lk`}</strong>
              </p>
            </div>

            <div className="input-group">
              <label htmlFor="otp">6-Digit Code</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                autoComplete="off"
                disabled={isLoading}
                maxLength={6}
                style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.25rem', fontWeight: 'bold' }}
                required
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-button pulse-hover" disabled={isLoading || otp.length < 6}>
              {isLoading ? 'Verifying...' : 'Verify & Login'}
            </button>

            <button 
              type="button" 
              onClick={() => { setStep(1); setOtp(''); setLocalError(''); setMessage(''); }} 
              className="back-button"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', width: '100%', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s', marginTop: '10px' }}
            >
              Back to Login
            </button>
          </form>
        )}

        {step === 1 && (
          <div className="login-footer">
            <p className="hint">Try <strong>22FIS0447</strong> or <strong>22CIS0241</strong>.</p>
          </div>
        )}
      </div>
    </div>
  );
}
