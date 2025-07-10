import React, { useState } from 'react';
import { CheckIcon, XIcon } from '@heroicons/react/solid';

const ActiveInactiveSwitch = () => {
  const [isActive, setIsActive] = useState(false);

  const toggleSwitch = () => {
    setIsActive(!isActive);
  };

  return (
    <div className="flex items-center">
      <div className="flex items-center mr-2">
        <span className={isActive ? 'text-green-500' : 'text-gray-500'}>
          {isActive ? (
            <CheckIcon className="w-6 h-6" />
          ) : (
            <XIcon className="w-6 h-6" />
          )}
        </span>
        <span className="ml-2">{isActive ? 'Active' : 'Inactive'}</span>
      </div>
      <div
        className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${
          isActive ? 'bg-green-500' : 'bg-gray-400'
        }`}
        onClick={toggleSwitch}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
            isActive ? 'transform translate-x-6' : ''
          }`}
        ></div>
      </div>
    </div>
  );
};

export default ActiveInactiveSwitch;
