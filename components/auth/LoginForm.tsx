"use client";

import { useState } from "react";
import Link from "next/link";
import AuthCard from "./AuthCard";
import LogoHeader from "./LogoHeader";
import GoogleButton from "./GoogleButton";
import InputField from "./InputField";
import SubmitButton from "./SubmitButton";

export default function LoginForm() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({ username: false, password: false });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = {
      username: formData.username.trim() === "",
      password: formData.password.trim() === "",
    };
    
    setErrors(newErrors);

    if (!newErrors.username && !newErrors.password) {
      // Proceed with login logic
      console.log("Submitting login", formData);
    }
  };

  return (
    <AuthCard>
      <LogoHeader />
      
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <GoogleButton />
        
        <div className="flex items-center my-2">
          <div className="flex-1 border-t border-[#c8a882]/40"></div>
          <span className="px-3 text-[#a17c5b] text-sm">OR</span>
          <div className="flex-1 border-t border-[#c8a882]/40"></div>
        </div>

        <InputField
          label="Username"
          id="username"
          name="username"
          type="text"
          placeholder="Enter your username"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
        />
        
        <InputField
          label="Password"
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />

        <div className="flex items-center justify-between mt-2 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-[#c8a882] accent-[#3b1f0a] focus:ring-[#3b1f0a] focus:ring-offset-1 text-[#3b1f0a] transition-colors"
            />
            <span className="text-sm text-[#3b1f0a] select-none">Remember me</span>
          </label>
          
          <Link 
            href="/forgot-password" 
            className="text-sm font-medium text-[#7c4a1e] hover:underline transition-all"
          >
            Forgot password?
          </Link>
        </div>

        <SubmitButton label="Sign in" />
        
        <p className="text-center text-sm text-[#a17c5b] mt-4">
          New User?{" "}
          <Link href="/signup" className="text-[#7c4a1e] font-bold hover:underline transition-all">
            Click here to register
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
