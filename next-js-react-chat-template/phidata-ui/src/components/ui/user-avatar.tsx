import React from 'react';

interface UserAvatarProps {
  initials: string;
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ initials, className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="w-10 h-10 rounded-full bg-transparent border border-gray-300 flex items-center justify-center text-gray-600 font-bold text-sm cursor-pointer">
        {initials.toUpperCase()}
      </div>
    </div>
  );
};

export default UserAvatar;