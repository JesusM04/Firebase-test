import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ChevronLeft } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { resetPassword } from '../../services/firebase';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!email) {
      setError('Please enter your email');
      return;
    }
    
    try {
      setIsLoading(true);
      await resetPassword(email);
      setMessage('Password reset email sent. Check your inbox for further instructions.');
      setEmail('');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format');
      } else {
        setError('Failed to send password reset email. Please try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
      <div className="text-center">
        <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Reset your password</h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter the email associated with your account and we'll send you instructions to reset your password.
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
      
      {message && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-700">{message}</p>
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
        </div>

        <div className="space-y-4">
          <Button 
            type="submit" 
            fullWidth 
            isLoading={isLoading}
            className="group"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <KeyRound className="h-5 w-5 text-indigo-300 group-hover:text-indigo-200" />
            </span>
            Send reset instructions
          </Button>
          
          <div className="text-center">
            <Link to="/login" className="inline-flex items-center font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to login
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;