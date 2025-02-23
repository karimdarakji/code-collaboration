import React, { PropsWithChildren } from "react";

const Modal: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full flex">
      <div className="relative p-4 w-full max-w-lg max-h-full">{children}</div>
    </div>
  );
};

export default Modal;
