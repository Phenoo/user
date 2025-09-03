import React from "react";

const StudyResourcesSection = () => {
  return (
    <div className="">
      {" "}
      {/* Overall padding for the section */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Study Resources</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Documents Card */}
        <div className="relative w-full h-48 rounded-xl p-6 shadow-lg overflow-hidden bg-white border border-gray-200 flex flex-col justify-between">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Documents</h3>
          </div>

          <div className="mt-4">
            <p className="text-gray-600 text-sm">
              Access your notes, lectures, and reading materials.
            </p>
          </div>

          <button className="mt-5 self-start px-4 py-2 bg-blue-500 rounded-full text-white text-sm font-semibold hover:bg-blue-600 transition-colors">
            View Documents
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyResourcesSection;
