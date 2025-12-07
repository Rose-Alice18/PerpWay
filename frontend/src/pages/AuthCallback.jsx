import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      alert('Authentication failed. Please try again.');
      navigate('/signin');
      return;
    }

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));

        // Store authentication data
        localStorage.setItem('authToken', token);
        localStorage.setItem('userAuthenticated', 'true');
        localStorage.setItem('userRole', user.role || 'user');
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.name);
        localStorage.setItem('authTime', Date.now().toString());

        if (user.profilePicture) {
          localStorage.setItem('userProfilePicture', user.profilePicture);
        }

        // Redirect based on role
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        alert('Authentication error. Please try again.');
        navigate('/signin');
      }
    } else {
      navigate('/signin');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-ashesi-primary border-t-transparent mb-4"></div>
        <p className="text-xl font-semibold text-gray-600 dark:text-gray-300">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
