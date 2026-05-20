'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import { RootState, AppDispatch } from '@/store/store';
import {
  fetchCollectionById,
  removeProjectFromCollection,
  clearCollectionsError,
} from '@/store/slices/collectionsSlice';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MainLayout from '@/components/layout/MainLayout';
import { FolderOpen, Trash2, Eye, ArrowLeft } from 'lucide-react';

export default function CollectionDetailPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { selectedCollection, loading, error } = useSelector((state: RootState) => state.collections);
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (id && isAuthenticated) {
      dispatch(fetchCollectionById(id));
    }
  }, [dispatch, id, isAuthenticated]);

  useEffect(() => {
    if (error) {
      dispatch(clearCollectionsError());
    }
  }, [dispatch, error]);

  const handleRemoveProject = async (projectId: string) => {
    if (!selectedCollection) return;
    if (!confirm('Remove this project from the collection?')) return;

    try {
      await dispatch(removeProjectFromCollection({ collectionId: selectedCollection._id, projectId })).unwrap();
    } catch (err: any) {
      console.error('Remove project error', err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-brown-50 to-white">
        <Navbar />
        <MainLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-brown-600">Loading...</div>
          </div>
        </MainLayout>
        <Footer />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-brown-50 to-white">
        <Navbar />
        <MainLayout>
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="mb-8">
              <button
                onClick={() => router.back()}
                className="mb-4 inline-flex items-center gap-2 text-sm text-brown-600 hover:text-brown-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold text-brown-900">{selectedCollection?.name || 'Collection'}</h1>
                  <p className="mt-2 text-sm text-brown-600">{selectedCollection?.description || 'Project collection details.'}</p>
                </div>
                <Link 
                  href="/collections" 
                  className="inline-flex items-center gap-2 rounded-full bg-brown-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brown-800"
                >
                  <FolderOpen className="h-4 w-4" />
                  All Collections
                </Link>
              </div>
            </div>

            {/* Content Section */}
            {loading ? (
              <div className="rounded-3xl border border-brown-200 bg-white p-8 text-center text-brown-600">
                Loading collection...
              </div>
            ) : selectedCollection ? (
              <div className="space-y-6">
                {/* Collection Info Card */}
                <div className="rounded-3xl border border-brown-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="text-xl font-semibold text-brown-900">Projects in this collection</h2>
                      <p className="text-sm text-brown-600">
                        {selectedCollection.projects.length} project{selectedCollection.projects.length === 1 ? '' : 's'} inside this collection.
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-brown-100 px-4 py-2 text-sm font-semibold text-brown-700">
                      <span className={`inline-block h-2 w-2 rounded-full ${selectedCollection.isPublic ? 'bg-green-600' : 'bg-brown-600'}`}></span>
                      {selectedCollection.isPublic ? 'Public Collection' : 'Private Collection'}
                    </span>
                  </div>
                </div>

                {/* Projects List */}
                <div className="space-y-4">
                  {selectedCollection.projects.length === 0 ? (
                    <div className="rounded-3xl border border-brown-200 bg-white p-12 text-center">
                      <FolderOpen className="mx-auto h-12 w-12 text-brown-400 mb-4" />
                      <p className="text-brown-600 font-medium">No projects added yet.</p>
                      <p className="text-sm text-brown-500 mt-1">Use the bookmark icon on any project to add it to this collection.</p>
                    </div>
                  ) : (
                    selectedCollection.projects.map((project) => (
                      <article key={(project as any)._id} className="group rounded-3xl border border-brown-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1">
                            <Link href={`/projects/${(project as any)._id}`}>
                              <p className="text-lg font-semibold text-brown-900 group-hover:text-brown-700 transition-colors">
                                {(project as any).title}
                              </p>
                            </Link>
                            <p className="mt-2 text-sm text-brown-600 line-clamp-2">{(project as any).shortDescription}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className="inline-block rounded-full bg-brown-100 px-3 py-1 text-xs font-medium text-brown-700">
                                {(project as any).category}
                              </span>
                              {(project as any).technologies?.slice(0, 2).map((tech: string) => (
                                <span key={tech} className="inline-block rounded-full border border-brown-200 px-3 py-1 text-xs text-brown-600">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col gap-3 sm:items-end min-w-[140px]">
                            <span className="text-2xl font-bold text-brown-900">
                              {(project as any).price === 0 ? 'Free' : `$${(project as any).price}`}
                            </span>
                            <div className="flex gap-2">
                              <Link
                                href={`/projects/${(project as any)._id}`}
                                className="inline-flex items-center gap-1 rounded-full border border-brown-300 px-4 py-2 text-sm font-semibold text-brown-700 transition hover:bg-brown-50"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleRemoveProject((project as any)._id)}
                                className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-brown-200 bg-white p-12 text-center">
                <FolderOpen className="mx-auto h-12 w-12 text-brown-400 mb-4" />
                <p className="text-brown-600">Collection was not found.</p>
                <Link 
                  href="/collections" 
                  className="inline-block mt-4 rounded-full bg-brown-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brown-800"
                >
                  Back to Collections
                </Link>
              </div>
            )}
          </div>
        </MainLayout>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}