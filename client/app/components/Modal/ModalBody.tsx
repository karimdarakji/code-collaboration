import React, { PropsWithChildren } from "react";

const ModalBody: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className="p-4 md:p-5 space-y-4">{children}</div>;
};

export default ModalBody;
