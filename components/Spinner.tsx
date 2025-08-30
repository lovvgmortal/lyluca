import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full animate-spin border-4 border-dashed border-brand-primary border-t-transparent"></div>
        <p className="text-brand-text-secondary">AI is processing, please wait...</p>
    </div>
  );
};

export default Spinner;