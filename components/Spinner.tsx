
import * as React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center p-4">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default Spinner;
