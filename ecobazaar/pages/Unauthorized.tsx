
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center max-w-lg">
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Oops! You don't have the required permissions to view this page. This area is restricted based on our Role-Based Access Control (RBAC) security protocols.
        </p>
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
