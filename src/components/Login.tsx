import { useState, type FormEvent } from 'react';
import { supabase, checkStudentExists } from '../utils/supabase';
import './Login.css';

interface LoginProps {
  error?: string;
}

export function Login({ error: initialError }: LoginProps) {
  const [studentId, setStudentId] = useState('');
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
        shouldCreateUser: true
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



  return (
    <div className="login-container">
      <div className="login-card glass-panel animate-fade-in">
        <div className="login-header">
          <h1 className="text-gradient">GPA Portal</h1>
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
              {isLoading ? 'Sending Link...' : 'Send Magic Link'}
            </button>
          </form>
        ) : (
          <div className="magic-link-sent" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>Check your email!</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>
              We've sent a magic login link to <strong>{studentId.toLowerCase() === 'tharushatheekshana25@gmail.com' ? studentId.toLowerCase() : `${studentId.trim().toLowerCase()}@ms.sab.ac.lk`}</strong>.<br/><br/>
              Click the link in the email to automatically log into your dashboard.
            </p>
            <button 
              type="button" 
              onClick={() => { setStep(1); setLocalError(''); setMessage(''); }} 
              className="back-button"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', width: '100%', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s' }}
            >
              Try a different ID
            </button>
          </div>
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
