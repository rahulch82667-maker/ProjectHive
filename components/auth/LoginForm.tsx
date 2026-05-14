"use client";

import { useState } from "react";
import Link from "next/link";
import AuthCard from "./AuthCard";
import LogoHeader from "./LogoHeader";
import GoogleButton from "./GoogleButton";
import InputField from "./InputField";
import SubmitButton from "./SubmitButton";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { loginUserThunk } from "@/store/slices/authSlice";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useAuth();
  const router = useRouter();
  const [firebaseError, setFirebaseError] = useState("");

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setFirebaseError("");
      try {
        // 1. Sign in with Firebase
        await signInWithEmailAndPassword(auth, values.email, values.password);

        // 2. Fetch user profile from backend (token is handled by axios interceptor)
        const userData = await dispatch(loginUserThunk()).unwrap();

        // 3. Redirect based on role
        if (userData.role === 'admin') {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } catch (err: any) {
        console.error("Login error:", err);
        const errorMessage = typeof err === 'string' ? err : (err.message || "Invalid email or password");
        setFirebaseError(errorMessage);
      }
    },
  });

  return (
    <AuthCard>
      <LogoHeader />
      
      <form onSubmit={formik.handleSubmit} className="flex flex-col space-y-4">
        <GoogleButton />
        
        <div className="flex items-center my-2">
          <div className="flex-1 border-t border-[#c8a882]/40"></div>
          <span className="px-3 text-[#a17c5b] text-sm">OR</span>
          <div className="flex-1 border-t border-[#c8a882]/40"></div>
        </div>

        {firebaseError && <p className="text-red-500 text-sm text-center">{firebaseError}</p>}
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
        
        <InputField
          label="Password"
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
        />
        {formik.touched.password && formik.errors.password && (
          <p className="text-red-500 text-xs mt-1">{formik.errors.password}</p>
        )}

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

        <SubmitButton 
          label={loading || formik.isSubmitting ? "Signing in..." : "Sign in"} 
          disabled={loading || formik.isSubmitting} 
        />
        
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
