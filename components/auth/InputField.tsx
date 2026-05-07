interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: boolean;
}

export default function InputField({ label, error, ...props }: InputFieldProps) {
  return (
    <div className="flex flex-col space-y-1.5 mb-4">
      <label htmlFor={props.id} className="text-[#3b1f0a] font-medium text-sm">
        {label}
      </label>
      <input
        {...props}
        className={`w-full bg-white border ${
          error ? "border-red-400" : "border-[#c8a882]"
        } rounded-lg py-2.5 px-3 text-[#3b1f0a] outline-none transition-colors duration-200 focus:ring-2 focus:ring-[#3b1f0a] focus:border-transparent placeholder:text-[#a17c5b]/60`}
      />
    </div>
  );
}
