// src/components/Cards/GPAStatusCard.tsx
import React from "react";

interface GPAStatusCardProps {
  gpa: string;
  lastUpdated?: string;
}

const GPAStatusCard: React.FC<GPAStatusCardProps> = ({ gpa, lastUpdated }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Current GPA</h3>
        {/* Optional: Add an icon or action button */}
      </div>
      <p className="text-4xl font-bold text-blue-600 mb-2">{gpa}</p>
      {lastUpdated && (
        <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
      )}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-green-500 flex items-center">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 7h8m0 0v8m0-8L11 2a8 8 0 00-11 5"
            ></path>
          </svg>
          +0.2 since last semester
        </span>
        <button className="text-sm text-blue-500 hover:underline">
          View Details
        </button>
      </div>
    </div>
  );
};

export default GPAStatusCard;
