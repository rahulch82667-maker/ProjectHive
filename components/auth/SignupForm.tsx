"use client";

import { useState } from "react";
import Link from "next/link";
import AuthCard from "./AuthCard";
import LogoHeader from "./LogoHeader";
import GoogleButton from "./GoogleButton";
import InputField from "./InputField";
import SubmitButton from "./SubmitButton";

export default function SignupForm() {
  const [formData, setFormData] = useState({ fullname: "", email: "", password: "" });
  const [errors, setErrors] = useState({ fullname: false, email: false, password: false });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = {
      fullname: formData.fullname.trim() === "",
      email: formData.email.trim() === "",
      password: formData.password.trim() === "",
    };
    
    setErrors(newErrors);

    if (!newErrors.fullname && !newErrors.email && !newErrors.password) {
      // Proceed with signup logic
      console.log("Submitting signup", formData);
    }
  };

  return (
    <AuthCard>
      <LogoHeader  />
      
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <GoogleButton />
        
        <div className="flex items-center my-2">
          <div className="flex-1 border-t border-[#c8a882]/40"></div>
          <span className="px-3 text-[#a17c5b] text-sm">OR</span>
          <div className="flex-1 border-t border-[#c8a882]/40"></div>
        </div>

        <InputField
          label="Full Name"
          id="fullname"
          name="fullname"
          type="text"
          placeholder="e.g. John Doe"
          value={formData.fullname}
          onChange={handleChange}
          error={errors.fullname}
        />

        <InputField
          label="Email address"
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />
        
        <InputField
          label="Password"
          id="password"
          name="password"
          type="password"
          placeholder="Create a strong password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />

        <div className="mt-2 mb-2">
          <SubmitButton label="Create account" />
        </div>
        
        <p className="text-center text-sm text-[#a17c5b] mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-[#7c4a1e] font-bold hover:underline transition-all">
            Login here
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
