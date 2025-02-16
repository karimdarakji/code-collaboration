import { ButtonVariant } from "@/contants";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
  text: string;
  onClick?: () => void;
}

const getClassNameVariant = (variant: ButtonVariant) => {
  switch (variant) {
    case ButtonVariant.PRIMARY:
      return "text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800";
    case ButtonVariant.SECONDARY:
      return "text-gray-900 bg-white border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700";
    default:
      return "";
  }
};

const Button = ({ type = 'button', variant = ButtonVariant.PRIMARY, text, onClick }: ButtonProps) => {
  const classNameType = getClassNameVariant(variant);
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center px-3 py-2 text-sm font-medium text-center rounded-lg focus:ring-4 focus:outline-none ${classNameType}`}
    >
      {text}
    </button>
  );
};

export default Button;
