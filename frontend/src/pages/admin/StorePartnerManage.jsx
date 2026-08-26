import React from 'react';

const StorePartnerManage = () => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-emerald-200/60 shadow-premium flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <h2 className="text-xl font-black text-slate-800">Store Partners Coming Soon</h2>
      <p className="text-slate-500 mt-2 text-center max-w-sm">
        This module will allow you to manage Store Partners, their verification documents, and onboarding processes.
      </p>
    </div>
  );
};

export default StorePartnerManage;
