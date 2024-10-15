import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Callback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      // Exchange the authorization code for an access token
      axios.post('http://localhost:3000/api/auth/exchange-token', { code })
        .then(response => {
          const { access_token, refresh_token } = response.data;
          // Store tokens securely (e.g., in HttpOnly cookies via your backend)
          // For this example, we'll use localStorage (not recommended for production)
          console.log('Access token:', access_token);
          console.log('Refresh token:', refresh_token);
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          navigate('/dashboard');
        })
        .catch(error => {
          console.error('Error exchanging code for token:', error);
          navigate('/');
        });
    } else {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <p className="text-xl">Authenticating...</p>
    </div>
  );
};

export default Callback;