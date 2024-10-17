import React from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center">
        <Link href="/" className="mr-8">
          <img src="/api/placeholder/120/40" alt="Phidata Logo" className="h-8" />
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <button className="relative">
          <Bell className="h-6 w-6 text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            1
          </span>
        </button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
          Leave Feedback
        </button>
      </div>
    </header>
  );
};

export default Header;