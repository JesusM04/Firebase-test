import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ChevronRight } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { registerWithEmailAndPassword, signInWithGoogle } from '../../services/firebase';

const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (password: string): boolean => {
    return password.length >= 6; // Basic validation, adjust as needed
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setIsLoading(true);
      await registerWithEmailAndPassword(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email is already in use');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError('Failed to register. Please try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to sign in with Google. Please try again');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
      <div className="text-center">
        <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Create your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
            sign in to existing account
          </Link>
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md -space-y-px">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="Email"
            fullWidth
          />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            label="Password"
            fullWidth
          />
          <Input
            id="confirm-password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            label="Confirm Password"
            fullWidth
          />
        </div>

        <div className="space-y-4">
          <Button 
            type="submit" 
            fullWidth 
            isLoading={isLoading}
            className="group"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <UserPlus className="h-5 w-5 text-indigo-300 group-hover:text-indigo-200" />
            </span>
            Create Account
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
          
          <div className="flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">Or continue with</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          
          <Button
            type="button"
            variant="google"
            fullWidth
            onClick={handleGoogleSignIn}
            isLoading={isGoogleLoading}
          >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign up with Google
          </Button>
        </div>
      </form>

      <p className="mt-4 text-xs text-gray-500 text-center">
        By signing up, you agree to our{' '}
        <a href="#" className="text-indigo-600 hover:text-indigo-500 transition-colors">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="text-indigo-600 hover:text-indigo-500 transition-colors">
          Privacy Policy
        </a>
      </p>
    </div>
  );
};

export default RegisterForm;