"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLayout, AuthCard, LogoHeader, InputField, SubmitButton } from "@/components/auth";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { forgotPassword } from "@/store/slices/authSlice";
import { useAuth } from "@/hooks/useAuth";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email is required"),
});

export default function ForgotPasswordPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useAuth();
  const [successMessage, setSuccessMessage] = useState("");

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setSuccessMessage("");
      try {
        await dispatch(forgotPassword(values.email)).unwrap();
        setSuccessMessage("If an account exists with that email, a password reset link has been sent.");
      } catch (err: any) {
        console.error("Forgot password error:", err);
      }
    },
  });

  return (
    <AuthLayout>
      <AuthCard>
        <LogoHeader />
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#3b1f0a]">Forgot Password?</h1>
          <p className="text-[#a17c5b] mt-2">Enter your email to receive a reset link</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="flex flex-col space-y-4">
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm text-center">
              {successMessage}
            </div>
          )}
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <InputField
            label="Email address"
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
          )}

          <SubmitButton 
            label={loading ? "Sending..." : "Send Reset Link"} 
            disabled={loading || !!successMessage} 
          />
          
          <p className="text-center text-sm text-[#a17c5b] mt-4">
            Remember your password?{" "}
            <Link href="/login" className="text-[#7c4a1e] font-bold hover:underline transition-all">
              Login here
            </Link>
          </p>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
