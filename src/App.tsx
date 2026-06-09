import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { type Student } from './types';
import { fetchStudentData, supabase } from './utils/supabase'; 

const ADMIN_EMAIL = 'tharushatheekshana25@gmail.com';

function App() {
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        handleSessionUser(session.user.email);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes (e.g. successful OTP verification)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        if (session?.user?.email) {
          handleSessionUser(session.user.email);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentStudent(null);
        setIsAdmin(false);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSessionUser = async (email: string) => {
    setIsLoading(true);
    
    if (email === ADMIN_EMAIL) {
      setIsAdmin(true);
      setCurrentStudent(null);
      setLoginError('');
      setIsLoading(false);
      return;
    }

    // email looks like 22cis0267@ms.sab.ac.lk -> extract 22cis0267
    const extractedId = email.split('@')[0].toUpperCase();
    const student = await fetchStudentData(extractedId);
    
    if (student) {
      setCurrentStudent(student);
      setIsAdmin(false);
      setLoginError('');
    } else {
      setLoginError('Student ID not found in database.');
      // If we can't find them, we should log them out of the auth session too
      supabase.auth.signOut();
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentStudent(null);
    setIsAdmin(false);
    setLoginError('');
  };

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Loading...</div>;
  }

  return (
    <>
      {isAdmin ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : !currentStudent ? (
        <Login error={loginError} />
      ) : (
        <Dashboard student={currentStudent} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;
