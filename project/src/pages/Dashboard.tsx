import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser } from '../services/firebase';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">MyApp</h1>
              </div>
            </div>
            <div className="flex items-center">
              <Button 
                variant="secondary" 
                onClick={handleLogout}
                className="ml-4 flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {currentUser?.email?.[0].toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-medium text-gray-900">Welcome!</h2>
                  <p className="text-gray-500">{currentUser?.email}</p>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-gray-700">
                  You've successfully logged in to your account. This is your dashboard where you can manage your profile and settings.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;