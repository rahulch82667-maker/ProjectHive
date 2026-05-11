interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export default function SubmitButton({ label, ...props }: SubmitButtonProps) {
  return (
    <button
      {...props}
      type="submit"
      className="w-full bg-[#3b1f0a] text-white rounded-lg font-medium py-2.5 px-4 transition-colors duration-200 hover:bg-[#7c4a1e] focus:outline-none focus:ring-2 focus:ring-[#c8a882] focus:ring-offset-1"
    >
      {label}
    </button>
  );
}
