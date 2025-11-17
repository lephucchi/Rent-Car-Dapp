import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in
  const token = localStorage.getItem('token');
  if (token) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Rent Car DApp</h1>
            <p className="text-blue-200">{isLogin ? 'Sign in to your account' : 'Create a new account'}</p>
          </div>

          {isLogin ? (
            <LoginForm onToggleForm={() => setIsLogin(false)} onSuccess={() => navigate('/')} />
          ) : (
            <RegisterForm onToggleForm={() => setIsLogin(true)} onSuccess={() => {
              setIsLogin(true);
              alert('Registration successful! Please verify your email and then login.');
            }} />
          )}

          <div className="mt-6 text-center">
            <p className="text-blue-200 text-sm">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-blue-300 hover:text-white font-semibold transition-colors"
              >
                {isLogin ? 'Register' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
