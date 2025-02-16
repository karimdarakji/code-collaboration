import React, { PropsWithChildren } from "react";

const ModalContent: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
      {children}
    </div>
  );
};

export default ModalContent;
