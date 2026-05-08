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
import { signupUser } from "@/store/slices/authSlice";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";

const validationSchema = Yup.object({
  fullname: Yup.string().required("Full Name is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

export default function SignupForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useAuth();
  const router = useRouter();
  const [firebaseError, setFirebaseError] = useState("");

  const formik = useFormik({
    initialValues: {
      fullname: "",
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setFirebaseError("");
      try {
        // 1. Create user in Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        const user = userCredential.user;

        // 2. Update Firebase profile
        await updateProfile(user, { displayName: values.fullname });

        // 3. Register user in backend
        await dispatch(
          signupUser({
            firebaseUid: user.uid,
            email: values.email,
            name: values.fullname,
            provider: "email",
          })
        ).unwrap();

        // 4. Redirect on success
        router.push("/login"); // Or wherever you want to redirect after signup
      } catch (err: any) {
        console.error("Signup error:", err);
        const errorMessage = typeof err === 'string' ? err : (err.message || "An error occurred during signup");
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
          label="Full Name"
          id="fullname"
          name="fullname"
          type="text"
          placeholder="e.g. John Doe"
          value={formik.values.fullname}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.fullname && Boolean(formik.errors.fullname)}
        />
        {formik.touched.fullname && formik.errors.fullname && (
          <p className="text-red-500 text-xs mt-1">{formik.errors.fullname}</p>
        )}

        <InputField
          label="Email address"
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
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
          placeholder="Create a strong password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
        />
        {formik.touched.password && formik.errors.password && (
          <p className="text-red-500 text-xs mt-1">{formik.errors.password}</p>
        )}

        <div className="mt-2 mb-2">
          <SubmitButton 
            label={loading || formik.isSubmitting ? "Creating account..." : "Create account"} 
            disabled={loading || formik.isSubmitting} 
          />
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
