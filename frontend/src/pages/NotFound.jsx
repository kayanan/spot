// src/pages/NotFound.jsx

import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';


const NotFound = () => {
  const navigate = useNavigate();
  
  const handleHomeClick = () => {
    navigate('/province'); // Redirect to '/user' page
  };

  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-4 pt-20 -mt-20">
      {/* The pt-20 adds padding-top to account for the navbar height */}
      <div className="text-center max-w-md w-full bg-white shadow-2xl rounded-xl p-8 transform transition-all hover:scale-105 duration-300">
        <div className="flex justify-center mb-6">
          <AlertTriangle
            className="text-cyan-500"
            size={80}
            strokeWidth={1.5}
          />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4 tracking-tight">
          Oops! Page Not Found
        </h1>
        <p className="text-gray-600 mb-6 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="flex flex-col space-y-4">
          <button
            onClick={handleHomeClick}
            className="w-full px-6 py-3 bg-cyan-500 text-white rounded-lg 
            hover:bg-cyan-600 transition-colors duration-300 
            shadow-md hover:shadow-lg focus:outline-none 
            focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50"
          >
            Back to Home
          </button>
        
        </div>
      </div>
      <div className="mt-8 text-center text-gray-500 text-sm">
        Need help?{' '}
        <a href="/support" className="text-cyan-600 hover:underline">
          Contact Support
        </a>
      </div>
    </div>
  );
};

export default NotFound;
