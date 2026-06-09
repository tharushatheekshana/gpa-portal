import { createPortal } from 'react-dom';

interface GpaCalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GpaCalculationModal({ isOpen, onClose }: GpaCalculationModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <>
      <div 
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)',
          zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        onClick={onClose}
      >
        <div 
          className="glass-panel animate-fade-in"
          style={{
            width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
            padding: '30px', zIndex: 100000,
            background: 'rgba(18, 18, 28, 0.95)', border: '1px solid rgba(99, 102, 241, 0.3)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#fff' }}>How is GPA Calculated?</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '1.5rem', cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
          <p>
            Your Cumulative Grade Point Average (CGPA) is a weighted average of all your credit-bearing modules.
          </p>

          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', margin: '20px 0', textAlign: 'center', fontWeight: 'bold' }}>
            <span style={{ color: '#60a5fa' }}>CGPA</span> = Total Grade Points / Total GPA Credits
          </div>

          <h3 style={{ color: '#fff', marginTop: '20px' }}>Step-by-Step Calculation:</h3>
          <ol style={{ paddingLeft: '20px', marginBottom: '20px' }}>
            <li style={{ marginBottom: '10px' }}>
              <strong>Module Grade Points:</strong> Each grade you receive has a numerical value (e.g., A = 4.0, B = 3.0).
            </li>
            <li style={{ marginBottom: '10px' }}>
              <strong>Weighted Points:</strong> Multiply the module's Grade Point by its Credit value. <br/>
              <em>Example: An 'A' (4.0) in a 3-credit module = 12.0 total points.</em>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <strong>Sum it up:</strong> Add all your Weighted Points together across every semester.
            </li>
            <li>
              <strong>Divide:</strong> Divide that massive sum by your Total GPA Credits attempted.
            </li>
          </ol>

          <h3 style={{ color: '#fff', marginTop: '20px', marginBottom: '10px' }}>Standard Grade Point Scale</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px' }}>
            <div><strong style={{color: '#4ade80'}}>A+ / A</strong> = 4.0</div>
            <div><strong style={{color: '#a855f7'}}>A-</strong> = 3.7</div>
            <div><strong style={{color: '#60a5fa'}}>B+</strong> = 3.3</div>
            <div><strong style={{color: '#fbbf24'}}>B</strong> = 3.0</div>
            <div><strong style={{color: '#9ca3af'}}>B-</strong> = 2.7</div>
            <div><strong style={{color: '#f87171'}}>C+</strong> = 2.3</div>
            <div><strong style={{color: '#f87171'}}>C</strong> = 2.0</div>
            <div><strong style={{color: '#f87171'}}>C-</strong> = 1.7</div>
            <div><strong style={{color: '#ef4444'}}>D+</strong> = 1.3</div>
            <div><strong style={{color: '#ef4444'}}>D</strong> = 1.0</div>
            <div><strong style={{color: '#ef4444'}}>E / F</strong> = 0.0</div>
          </div>
          
          <p style={{ marginTop: '20px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
            * Note: Non-GPA modules (like industrial training or supplementary English courses) are excluded from this calculation entirely.
          </p>
        </div>
      </div>
      </div>
    </>,
    document.body
  );
}
