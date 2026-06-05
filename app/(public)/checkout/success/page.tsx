'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { clearCheckoutState } from '@/store/slices/checkoutSlice';
import { CheckCircle2, ShieldCheck, Download, Sparkles, FolderHeart, Loader2, Mail, ArrowRight, Clock, FileText, CreditCard, Home } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api/axios';

import { Suspense } from 'react';

function CheckoutSuccessPageContent() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const router = useRouter();
  
  const sessionId = searchParams.get('session_id');
  const [emailStatus, setEmailStatus] = useState<'sending' | 'sent' | 'failed'>('sending');
  const [emailError, setEmailError] = useState('');
  const [countdown, setCountdown] = useState(5);

  // Clear checkout flow state on success landing
  useEffect(() => {
    dispatch(clearCheckoutState());
  }, [dispatch]);

  // Auto redirect countdown
  useEffect(() => {
    if (emailStatus === 'sent' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0) {
      router.push('/my-projects');
    }
  }, [emailStatus, countdown, router]);

  // Send email notifications
  useEffect(() => {
    if (sessionId) {
      const sendEmails = async () => {
        try {
          console.log('Sending email notifications for session:', sessionId);
          const response = await api.post('/send-purchase-email', { sessionId });
          if (response.data.success) {
            setEmailStatus('sent');
            console.log('Emails sent successfully');
          } else {
            setEmailStatus('failed');
            setEmailError(response.data.message);
          }
        } catch (error: any) {
          console.error('Failed to send emails:', error);
          setEmailStatus('failed');
          setEmailError(error.response?.data?.message || error.message);
        }
      };
      
      sendEmails();
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-teal-50/20 py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      {/* Confetti Animation Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-[10%] text-4xl animate-bounce opacity-20">🎉</div>
        <div className="absolute top-40 right-[15%] text-3xl animate-bounce delay-100 opacity-20">✨</div>
        <div className="absolute top-60 left-[20%] text-2xl animate-bounce delay-200 opacity-20">🎊</div>
        <div className="absolute top-80 right-[25%] text-3xl animate-bounce delay-300 opacity-20">🎈</div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 animate-in zoom-in">
          
          {/* Success Header Gradient */}
          <div className="relative bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-8 sm:py-10 text-center">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full shadow-lg mb-4 animate-bounce">
                <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-600" strokeWidth={1.5} />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2">
                Payment Successful!
              </h1>
              <p className="text-emerald-100 text-sm sm:text-base font-medium">
                Your order has been processed successfully
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Email Status Card */}
            <div className={`rounded-2xl p-5 transition-all duration-300 ${
              emailStatus === 'sending' ? 'bg-blue-50 border border-blue-100' :
              emailStatus === 'sent' ? 'bg-green-50 border border-green-100' :
              'bg-amber-50 border border-amber-100'
            }`}>
              {emailStatus === 'sending' && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
                  <div className="relative">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <div className="absolute inset-0 animate-ping opacity-30">
                      <Mail className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-800">Sending confirmation email...</p>
                    <p className="text-sm text-blue-600 mt-0.5">Please wait while we process your order</p>
                  </div>
                </div>
              )}
              
              {emailStatus === 'sent' && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <Mail className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">Confirmation Email Sent!</p>
                      <p className="text-sm text-green-600 mt-0.5">Check your inbox for the invoice</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Redirecting in {countdown}s</span>
                  </div>
                </div>
              )}
              
              {emailStatus === 'failed' && (
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-3">
                    <Mail className="h-8 w-8 text-amber-600" />
                    <p className="font-semibold text-amber-800">Email Delivery Issue</p>
                  </div>
                  <p className="text-sm text-amber-700">
                    We couldn't send the confirmation email automatically.
                  </p>
                  <p className="text-xs text-amber-600">
                    Please contact support with your Order ID to receive your invoice.
                  </p>
                  {emailError && (
                    <p className="text-xs text-red-500 mt-2 break-all">{emailError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Order Details */}
            <div className="bg-gray-50/80 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" />
                Order Details
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                  <span className="text-gray-500">Transaction ID:</span>
                  <span className="font-mono text-xs text-gray-700 break-all">
                    {sessionId || 'Processing...'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                  <span className="text-gray-500">Purchase Date:</span>
                  <span className="font-medium text-gray-700">
                    {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                  <span className="text-gray-500">Payment Method:</span>
                  <span className="font-medium text-gray-700 flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    Stripe Secure Checkout
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                Next Steps
              </h3>
              
              <div className="grid gap-4">
                <div className="flex gap-4 p-4 bg-gradient-to-r from-emerald-50 to-transparent rounded-xl">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Check Your Email</p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      We've sent your invoice and access instructions to your registered email address.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-xl">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Access Your Purchase</p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Go to your My Projects page to download your purchased files instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link
                href="/my-projects"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg cursor-pointer group"
              >
                <Download className="h-4 w-4 group-hover:animate-bounce" />
                Go to My Projects
              </Link>
              
              <Link
                href="/"
                className="flex-1 bg-white border-2 border-gray-200 hover:border-emerald-300 text-gray-700 hover:text-emerald-700 font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-md cursor-pointer group"
              >
                <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
                Continue Shopping
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-xs text-gray-500 border-t border-gray-100 pt-6">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>SSL Secure Payment</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                <span>100% Money Back Guarantee</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-emerald-600" />
                <span>24/7 Support</span>
              </div>
            </div>

          </div>
        </div>

        {/* Decorative Bottom */}
        <div className="text-center mt-6 text-xs text-gray-400">
          <p>Need help? Contact us at <a href="mailto:support@projecthive.com" className="text-emerald-600 hover:underline">support@projecthive.com</a></p>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes zoom-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-in {
          animation: zoom-in 0.5s ease-out forwards;
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce {
          animation: bounce 1s ease-in-out infinite;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-teal-50/20 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto" />
            <div className="absolute inset-0 animate-ping opacity-30">
              <Loader2 className="h-12 w-12 text-emerald-600 mx-auto" />
            </div>
          </div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">
            Loading your order details...
          </p>
          <p className="text-xs text-gray-400">Please wait while we confirm your payment</p>
        </div>
      </div>
    }>
      <CheckoutSuccessPageContent />
    </Suspense>
  );
}