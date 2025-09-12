import React from "react";
import { IoSparklesSharp } from "react-icons/io5";
import { BsArrowUpRight } from "react-icons/bs";

const AISuggestionsCard = () => {
  return (
    <div
      className="relative  rounded-xl p-6 shadow-lg overflow-hidden
bg-gradient-to-r from-[oklch(0.65_0.12_15)] via-[oklch(0.6_0.15_320)] to-[oklch(0.55_0.18_340)]
      "
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-white bg-opacity-30 rounded-full p-2 mr-3">
            <IoSparklesSharp className="h-4 w-4" />
          </div>
          <h3 className="text-white text-lg font-semibold">AI Suggestions</h3>
        </div>
        <div className="bg-white text-black bg-opacity-30 rounded-full p-2">
          <BsArrowUpRight stroke="1" className="h-4 stroke-[1px]  w-4" />
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-white text-md font-medium">AI strategy</h4>
        <p className="text-white text-sm mt-1">
          Check out these tips to boost your study results!
        </p>
      </div>

      <button className="mt-5 px-4 py-2 bg-white bg-opacity-40 rounded-full text-black text-sm hover:bg-opacity-50 transition-colors">
        AI Suggestions
      </button>

      {/* Growth graphic */}
      <div className="absolute bottom-6 right-6 text-right">
        <p className="text-white text-xl font-bold">+25%</p>
        <p className="text-white text-sm opacity-80">Potential growth</p>
      </div>
    </div>
  );
};

export default AISuggestionsCard;
