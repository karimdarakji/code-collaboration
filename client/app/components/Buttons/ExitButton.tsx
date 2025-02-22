import React from "react";

interface ExitButtonProps {
  className?: string;
  onClick?: () => void;
}

const ExitButton = ({ className, onClick }: ExitButtonProps) => {
  return (
    <button
      type="button"
      className={`focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-1 py-1 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900 ${className}`}
      onClick={onClick}
    >
      <span className="sr-only">Close menu</span>
      <svg
        className="h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
};

export default ExitButton;
