'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { fetchProjectBySlug, setCurrentProject, clearCurrentProject } from '@/store/slices/projectsSlice';
import { initializeCart } from '@/store/slices/cartSlice';
import {
  PDPSkeleton,
  ProjectGallery,
  ProjectInfo,
  PricingCard,
  TechStack,
  FAQAccordion,
  ChangelogTimeline,
  LivePreview,
  ReviewsSummary,
} from './index';
import { AlertCircle, ArrowLeft, Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/utils/formatters';

interface ProjectDetailsClientProps {
  slug: string;
}

export default function ProjectDetailsClient({ slug }: ProjectDetailsClientProps) {
  const dispatch = useDispatch<AppDispatch>();

  // Select states from Redux
  const { currentProject, pdpLoading, pdpError, projectCache } = useSelector(
    (state: RootState) => state.projects
  );

  // Initialize cart from localStorage on mount (client-only)
  useEffect(() => {
    dispatch(initializeCart());
  }, [dispatch]);

  // Load project by slug
  useEffect(() => {
    if (projectCache[slug]) {
      // Use cached project data
      dispatch(setCurrentProject(projectCache[slug]));
    } else {
      dispatch(fetchProjectBySlug(slug));
      console.log(fetchProjectBySlug(slug))
    }

    // Cleanup on unmount or slug change
    return () => {
      dispatch(clearCurrentProject());
    };
  }, [slug, dispatch, projectCache]);

  if (pdpLoading) {
    return <PDPSkeleton />;
  }

  if (pdpError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4">
        <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-sm">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-gray-900">Project Not Found</h2>
          <p className="text-sm text-gray-500 font-medium">
            {pdpError || "The project you are looking for might have been removed or doesn't exist."}
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-brown-700 hover:text-brown-900 uppercase tracking-wider transition-colors pt-2"
        >
          <ArrowLeft size={16} />
          Back to marketplace
        </Link>
      </div>
    );
  }

  if (!currentProject) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Breadcrumb / Back button */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-extrabold text-gray-500 hover:text-brown-700 uppercase tracking-wider transition-colors group cursor-pointer"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Templates
          </Link>
        </div>

        {/* Dynamic PDP Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left / Main Details Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Gallery Section */}
            <ProjectGallery
              thumbnail={currentProject.thumbnail}
              images={currentProject.images}
              demoVideo={currentProject.demoVideo}
              title={currentProject.title}
            />

            {/* Title & Ratings Info Card */}
            <ProjectInfo
              title={currentProject.title}
              shortDescription={currentProject.shortDescription}
              category={currentProject.category}
              tags={currentProject.tags}
              rating={currentProject.rating}
              totalReviews={currentProject.totalReviews}
              salesCount={currentProject.salesCount}
              version={currentProject.version}
              fileSize={currentProject.fileSize}
              createdAt={currentProject.createdAt}
            />

            {/* Full description */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-3">Project Description</h2>
              <div 
                className="prose prose-brown max-w-none text-gray-600 leading-relaxed text-sm md:text-base whitespace-pre-wrap font-medium"
                dangerouslySetInnerHTML={{ __html: currentProject.fullDescription }}
              />
            </div>

            {/* Technologies Badges */}
            {currentProject.technologies && currentProject.technologies.length > 0 && (
              <TechStack technologies={currentProject.technologies} />
            )}

            {/* Requirements list */}
            {currentProject.requirements && currentProject.requirements.length > 0 && (
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-3">Requirements</h2>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-600 font-medium">
                  {currentProject.requirements.map((req, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Live Demo Sandbox preview */}
            {currentProject.liveDemoLink && (
              <LivePreview liveDemoLink={currentProject.liveDemoLink} title={currentProject.title} />
            )}

            {/* FAQAccordion section */}
            {currentProject.faq && currentProject.faq.length > 0 && (
              <FAQAccordion faq={currentProject.faq} />
            )}

            {/* Changelog timeline */}
            {currentProject.changelog && currentProject.changelog.length > 0 && (
              <ChangelogTimeline changelog={currentProject.changelog as any} />
            )}

            {/* Rating breakdown summary */}
            <ReviewsSummary rating={currentProject.rating} totalReviews={currentProject.totalReviews} />

          </div>

          {/* Right Sticky Sidebar (Pricing & Cart Actions) */}
          <div className="lg:col-span-1">
            <PricingCard project={currentProject} />
          </div>

        </div>

      </div>

      {/* Floating CTA bar for mobile screens */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 z-40 flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Price</p>
          <p className="text-lg font-extrabold text-gray-900 leading-none">
            {currentProject.discountPrice ? formatPrice(currentProject.discountPrice) : formatPrice(currentProject.price)}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Link
            href={`#`}
            onClick={(e) => {
              e.preventDefault();
              // Scroll to PricingCard on mobile
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }}
            className="bg-brown-700 hover:bg-brown-800 text-white font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-xl flex items-center gap-1.5 transition-all shadow active:scale-95"
          >
            <ShoppingBag size={14} />
            Options
          </Link>
        </div>
      </div>
    </div>
  );
}
