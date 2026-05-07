export default function GoogleButton() {
  return (
    <button
      type="button"
      className="w-full flex items-center justify-center gap-3 bg-white border border-[#c8a882] rounded-lg py-2.5 px-4 text-[#3b1f0a] font-medium transition-colors duration-200 hover:bg-[#fdf6ee] focus:outline-none focus:ring-2 focus:ring-[#3b1f0a] focus:ring-offset-1 focus:border-transparent"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.79 15.73 17.57V20.34H19.29C21.37 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
        <path d="M12 23C14.97 23 17.46 22.02 19.29 20.34L15.73 17.57C14.74 18.23 13.48 18.63 12 18.63C9.14 18.63 6.71 16.7 5.84 14.11H2.16V16.96C3.97 20.55 7.69 23 12 23Z" fill="#34A853"/>
        <path d="M5.84 14.11C5.62 13.45 5.49 12.74 5.49 12C5.49 11.26 5.62 10.55 5.84 9.89V7.04H2.16C1.41 8.53 1 10.22 1 12C1 13.78 1.41 15.47 2.16 16.96L5.84 14.11Z" fill="#FBBC05"/>
        <path d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.03L19.38 3.86C17.45 2.06 14.97 1 12 1C7.69 1 3.97 3.45 2.16 7.04L5.84 9.89C6.71 7.3 9.14 5.38 12 5.38Z" fill="#EA4335"/>
      </svg>
      Continue with Google
    </button>
  );
}
