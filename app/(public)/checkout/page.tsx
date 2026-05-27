'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { RootState, AppDispatch } from '@/store/store';
import { fetchProjectById } from '@/store/slices/projectsSlice';
import { initiateCheckoutSession, clearCheckoutState, IBillingDetails } from '@/store/slices/checkoutSlice';
import { formatPrice } from '@/utils/formatters';
import { Zap, ShieldCheck, ArrowLeft, Loader2, Sparkles, Building2, Globe, FileText, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

// Validation Schema using Yup
const BillingValidationSchema = Yup.object().shape({
  firstName: Yup.string()
    .trim()
    .required('First name is required')
    .max(50, 'Too long'),
  lastName: Yup.string()
    .trim()
    .required('Last name is required')
    .max(50, 'Too long'),
  email: Yup.string()
    .trim()
    .email('Invalid email address')
    .required('Email address is required'),
  companyName: Yup.string()
    .trim()
    .max(100, 'Company name is too long'),
  country: Yup.string()
    .trim()
    .required('Country is required'),
  addressLine1: Yup.string()
    .trim()
    .required('Address is required')
    .max(150, 'Too long'),
  addressLine2: Yup.string()
    .trim()
    .max(150, 'Too long'),
  city: Yup.string()
    .trim()
    .required('City is required')
    .max(100, 'Too long'),
  state: Yup.string()
    .trim()
    .required('State is required')
    .max(100, 'Too long'),
  zipCode: Yup.string()
    .trim()
    .required('Zip code is required')
    .matches(/^[a-zA-Z0-9\s-]{3,10}$/, 'Invalid zip/postal code format'),
  gstin: Yup.string()
    .trim()
    .max(15, 'GSTIN cannot exceed 15 characters')
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
      excludeEmptyString: true,
      message: 'Invalid GSTIN format (e.g. 22AAAAA0000A1Z5)'
    }),
});

import { Suspense } from 'react';

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const projectId = searchParams.get('projectId');

  // Redux Selectors
  const { currentProject, loading: projectLoading, error: projectError } = useSelector(
    (state: RootState) => state.projects
  );
  const project = currentProject;

  const { user: authUser, isAuthenticated, loading: authLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const { loading: checkoutLoading, error: checkoutError, sessionUrl } = useSelector(
    (state: RootState) => state.checkout
  );

  // Initialize and load project details
  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectById(projectId));
    }
    return () => {
      dispatch(clearCheckoutState());
    };
  }, [projectId, dispatch]);

  // Handle successful session creation by redirecting to Stripe Checkout
  useEffect(() => {
    if (sessionUrl) {
      window.location.href = sessionUrl;
    }
  }, [sessionUrl]);

  // Prepopulate form values from logged-in user if available
  const [initialFormValues, setInitialFormValues] = useState<IBillingDetails>({
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    country: 'India',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    gstin: '',
  });

  useEffect(() => {
    if (authUser) {
      const nameParts = authUser.name ? authUser.name.split(' ') : [];
      setInitialFormValues((prev) => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: authUser.email || '',
      }));
    }
  }, [authUser]);

  // Form submission handler
  const handleSubmit = async (values: IBillingDetails) => {
    if (!projectId) return;
    dispatch(initiateCheckoutSession({ projectId, billingDetails: values }));
  };

  // 1. Loading / Authenticating Check
  if (authLoading || projectLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 text-brown-700 animate-spin" />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">
            Loading secure checkout...
          </p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated state
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-5">
        <div className="h-16 w-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shadow-inner">
          <ShieldCheck size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-gray-900">Sign in Required</h2>
          <p className="text-sm text-gray-500 font-semibold leading-relaxed">
            Please log in to your account to securely purchase templates and access download dashboards.
          </p>
        </div>
        <button
          onClick={() => router.push(`/login?redirect=/checkout?projectId=${projectId}`)}
          className="w-full bg-brown-700 hover:bg-brown-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow cursor-pointer uppercase tracking-wider text-xs"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  // 3. Error state if project not found
  if (!projectId || projectError || (!project && !projectLoading)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4">
        <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-sm">
          <Zap size={32} className="rotate-12" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-gray-900">Invalid Checkout Request</h2>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">
            {projectError || 'The template you are trying to purchase does not exist or has been archived.'}
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-brown-700 hover:text-brown-900 uppercase tracking-wider transition-colors pt-2"
        >
          <ArrowLeft size={16} />
          Return to Marketplace
        </Link>
      </div>
    );
  }

  // TypeScript control-flow narrowing: project is guaranteed non-null past this guard
  if (!project) return null;

  const purchasePrice = project.discountPrice !== undefined && project.discountPrice > 0
    ? project.discountPrice
    : project.price;

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8 relative">
      
      {/* Dynamic Stripe Redirection Overlay */}
      {checkoutLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-2xl flex flex-col items-center space-y-5 max-w-sm text-center">
            <div className="relative flex items-center justify-center">
              <Loader2 className="h-14 w-14 text-brown-700 animate-spin" />
              <Zap className="h-6 w-6 text-amber-500 absolute animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Initiating Stripe Checkout</h3>
              <p className="text-xs text-gray-400 font-semibold tracking-wide uppercase mt-1 animate-pulse">
                Redirecting to secure gateway...
              </p>
              <p className="text-sm text-gray-500 font-medium leading-relaxed mt-3">
                Please do not close this window or click your browser's back button.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center gap-2 text-xs font-extrabold text-gray-500 hover:text-brown-700 uppercase tracking-wider transition-colors group cursor-pointer"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Template
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-3">Secure Checkout</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Complete the details below to finalize your purchase.</p>
        </div>

        {/* Form & Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT: Billing Form (Col span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {checkoutError && (
              <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl text-sm font-semibold flex items-center gap-3">
                <Zap size={18} className="text-red-500 shrink-0" />
                <span>{checkoutError}</span>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
              <Formik
                initialValues={initialFormValues}
                enableReinitialize={true}
                validationSchema={BillingValidationSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form className="space-y-6">
                    
                    {/* Section 1: Customer Contact */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
                        <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider">Account Details</h2>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="firstName" className="text-xs font-bold text-gray-500 uppercase tracking-wide">First Name *</label>
                          <Field
                            name="firstName"
                            id="firstName"
                            className={`w-full border rounded-xl px-4 py-3 text-sm font-medium transition-all outline-none ${
                              errors.firstName && touched.firstName
                                ? 'border-red-300 bg-red-50/20 focus:border-red-400'
                                : 'border-gray-200 focus:border-brown-600 focus:ring-1 focus:ring-brown-600'
                            }`}
                            placeholder="John"
                          />
                          <ErrorMessage name="firstName" component="p" className="text-xs font-bold text-red-500 mt-0.5" />
                        </div>
                        
                        <div className="space-y-1.5">
                          <label htmlFor="lastName" className="text-xs font-bold text-gray-500 uppercase tracking-wide">Last Name *</label>
                          <Field
                            name="lastName"
                            id="lastName"
                            className={`w-full border rounded-xl px-4 py-3 text-sm font-medium transition-all outline-none ${
                              errors.lastName && touched.lastName
                                ? 'border-red-300 bg-red-50/20 focus:border-red-400'
                                : 'border-gray-200 focus:border-brown-600 focus:ring-1 focus:ring-brown-600'
                            }`}
                            placeholder="Doe"
                          />
                          <ErrorMessage name="lastName" component="p" className="text-xs font-bold text-red-500 mt-0.5" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="email" className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email Address *</label>
                        <Field
                          name="email"
                          id="email"
                          type="email"
                          className={`w-full border rounded-xl px-4 py-3 text-sm font-medium transition-all outline-none ${
                            errors.email && touched.email
                              ? 'border-red-300 bg-red-50/20 focus:border-red-400'
                              : 'border-gray-200 focus:border-brown-600 focus:ring-1 focus:ring-brown-600'
                          }`}
                          placeholder="johndoe@example.com"
                        />
                        <p className="text-[10px] text-gray-400 font-semibold tracking-wide">This email will receive the PDF invoice and access instructions.</p>
                        <ErrorMessage name="email" component="p" className="text-xs font-bold text-red-500 mt-0.5" />
                      </div>
                    </div>

                    {/* Section 2: Billing Address */}
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
                        <Globe size={16} className="text-brown-700" />
                        <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider">Billing Address</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="companyName" className="text-xs font-bold text-gray-500 uppercase tracking-wide">Company Name (Optional)</label>
                          <div className="relative">
                            <Field
                              name="companyName"
                              id="companyName"
                              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium transition-all outline-none focus:border-brown-600 focus:ring-1 focus:ring-brown-600"
                              placeholder="Inc. Ltd"
                            />
                            <Building2 size={16} className="text-gray-400 absolute left-3.5 top-3.5" />
                          </div>
                          <ErrorMessage name="companyName" component="p" className="text-xs font-bold text-red-500 mt-0.5" />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="country" className="text-xs font-bold text-gray-500 uppercase tracking-wide">Country *</label>
                          <Field
                            name="country"
                            id="country"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium transition-all outline-none focus:border-brown-600 focus:ring-1 focus:ring-brown-600 bg-white"
                          />
                          <ErrorMessage name="country" component="p" className="text-xs font-bold text-red-500 mt-0.5" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="addressLine1" className="text-xs font-bold text-gray-500 uppercase tracking-wide">Address Line 1 *</label>
                          <Field
                            name="addressLine1"
                            id="addressLine1"
                            className={`w-full border rounded-xl px-4 py-3 text-sm font-medium transition-all outline-none ${
                              errors.addressLine1 && touched.addressLine1
                                ? 'border-red-300 bg-red-50/20 focus:border-red-400'
                                : 'border-gray-200 focus:border-brown-600 focus:ring-1 focus:ring-brown-600'
                            }`}
                            placeholder="Street address, P.O. box, company name"
                          />
                          <ErrorMessage name="addressLine1" component="p" className="text-xs font-bold text-red-500 mt-0.5" />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="addressLine2" className="text-xs font-bold text-gray-500 uppercase tracking-wide">Address Line 2 (Optional)</label>
                          <Field
                            name="addressLine2"
                            id="addressLine2"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium transition-all outline-none focus:border-brown-600 focus:ring-1 focus:ring-brown-600"
                            placeholder="Apartment, suite, unit, building, floor"
                          />
                          <ErrorMessage name="addressLine2" component="p" className="text-xs font-bold text-red-500 mt-0.5" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="city" className="text-xs font-bold text-gray-500 uppercase tracking-wide">City *</label>
                          <Field
                            name="city"
                            id="city"
                            className={`w-full border rounded-xl px-4 py-3 text-sm font-medium transition-all outline-none ${
                              errors.city && touched.city
                                ? 'border-red-300 bg-red-50/20 focus:border-red-400'
                                : 'border-gray-200 focus:border-brown-600 focus:ring-1 focus:ring-brown-600'
                            }`}
                            placeholder="Mumbai"
                          />
                          <ErrorMessage name="city" component="p" className="text-xs font-bold text-red-500 mt-0.5" />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="state" className="text-xs font-bold text-gray-500 uppercase tracking-wide">State *</label>
                          <Field
                            name="state"
                            id="state"
                            className={`w-full border rounded-xl px-4 py-3 text-sm font-medium transition-all outline-none ${
                              errors.state && touched.state
                                ? 'border-red-300 bg-red-50/20 focus:border-red-400'
                                : 'border-gray-200 focus:border-brown-600 focus:ring-1 focus:ring-brown-600'
                            }`}
                            placeholder="Maharashtra"
                          />
                          <ErrorMessage name="state" component="p" className="text-xs font-bold text-red-500 mt-0.5" />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="zipCode" className="text-xs font-bold text-gray-500 uppercase tracking-wide">Zip Code *</label>
                          <Field
                            name="zipCode"
                            id="zipCode"
                            className={`w-full border rounded-xl px-4 py-3 text-sm font-medium transition-all outline-none ${
                              errors.zipCode && touched.zipCode
                                ? 'border-red-300 bg-red-50/20 focus:border-red-400'
                                : 'border-gray-200 focus:border-brown-600 focus:ring-1 focus:ring-brown-600'
                            }`}
                            placeholder="400001"
                          />
                          <ErrorMessage name="zipCode" component="p" className="text-xs font-bold text-red-500 mt-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Tax (GSTIN) */}
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
                        <FileText size={16} className="text-brown-700" />
                        <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider">Tax Information</h2>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="gstin" className="text-xs font-bold text-gray-500 uppercase tracking-wide">GSTIN (Optional)</label>
                        <Field
                          name="gstin"
                          id="gstin"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium transition-all outline-none focus:border-brown-600 focus:ring-1 focus:ring-brown-600 uppercase"
                          placeholder="e.g. 22AAAAA0000A1Z5"
                        />
                        <ErrorMessage name="gstin" component="p" className="text-xs font-bold text-red-500 mt-0.5" />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting || checkoutLoading}
                      className="w-full bg-brown-700 hover:bg-brown-800 text-white font-extrabold py-4 px-6 rounded-xl flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-md hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-8 uppercase tracking-widest text-xs"
                    >
                      {checkoutLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Redirecting to Stripe...
                        </>
                      ) : (
                        <>
                          <Zap size={16} className="fill-white text-white" />
                          Buy Now &bull; Pay with Stripe
                        </>
                      )}
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          </div>

          {/* RIGHT: Order Summary Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6 lg:sticky lg:top-24">
              
              <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                <ShoppingCart size={16} className="text-brown-700" />
                <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">Order Summary</h2>
              </div>

              {/* Template details block */}
              <div className="flex gap-4 items-start pb-4 border-b border-gray-100">
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-16 h-16 rounded-xl object-cover border border-gray-100 shadow-sm shrink-0"
                />
                <div className="space-y-1">
                  <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold bg-brown-50 text-brown-800 uppercase tracking-wider">
                    {project.category}
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight">
                    {project.title}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                    Version {project.version || '1.0.0'}
                  </p>
                </div>
              </div>

              {/* Calculations detail */}
              <div className="space-y-3 font-semibold text-xs border-b border-gray-100 pb-4">
                <div className="flex justify-between items-center text-gray-500">
                  <span>List Price:</span>
                  <span>{formatPrice(project.price)}</span>
                </div>
                {project.discountPrice !== undefined && project.discountPrice > 0 && (
                  <div className="flex justify-between items-center text-red-600 font-bold">
                     <span>Discount:</span>
                    <span>-{formatPrice(project.price - project.discountPrice)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-gray-500">
                  <span>Taxes (GST):</span>
                  <span>₹0.00</span>
                </div>
              </div>

              {/* Final price */}
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Grand Total:</span>
                <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  {formatPrice(purchasePrice)}
                </span>
              </div>

              {/* Secure Trust badging */}
              <div className="space-y-3 pt-4 border-t border-gray-50 text-xs font-semibold text-gray-500">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={16} className="text-brown-700 shrink-0" />
                  <span>Stripe Secure SSL Checkout</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Sparkles size={16} className="text-brown-700 shrink-0" />
                  <span>Instant Access Granted Post-Payment</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 text-brown-700 animate-spin" />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">
            Loading secure checkout...
          </p>
        </div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}

