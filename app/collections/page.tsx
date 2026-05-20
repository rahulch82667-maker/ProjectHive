'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { fetchCollections, createCollection, deleteCollection, clearCollectionsError, clearCollectionsSuccess } from '@/store/slices/collectionsSlice';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MainLayout from '@/components/layout/MainLayout';

export default function CollectionsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { collections, loading, error, success } = useSelector((state: RootState) => state.collections);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCollections());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (error) {
      setMessage(error);
      dispatch(clearCollectionsError());
    }
  }, [dispatch, error]);

  useEffect(() => {
    if (success) {
      setMessage('Collection created successfully');
      setName('');
      setDescription('');
      setIsPublic(false);
      dispatch(clearCollectionsSuccess());
      dispatch(fetchCollections());
    }
  }, [dispatch, success]);

  const handleCreate = async () => {
    if (!name.trim()) {
      setMessage('Name is required');
      return;
    }

    try {
      await dispatch(createCollection({ name: name.trim(), description: description.trim(), isPublic })).unwrap();
    } catch (err: any) {
      setMessage(err?.message || 'Failed to create collection');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collection?')) {
      return;
    }

    try {
      await dispatch(deleteCollection(id)).unwrap();
      setMessage('Collection deleted');
    } catch (err: any) {
      setMessage(err?.message || 'Failed to delete collection');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-brown-50 to-white">
        <Navbar />
        <MainLayout>
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-brown-900">Collections</h1>
                <p className="mt-2 text-sm text-brown-600">Manage your saved project collections and view your library.</p>
              </div>
            </div>

            <section className="mb-8 rounded-3xl border border-brown-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-brown-900">Create new collection</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Collection name"
                  className="rounded-2xl border border-brown-300 bg-brown-50 px-4 py-3 text-sm text-brown-900 outline-none focus:border-brown-500 focus:ring-2 focus:ring-brown-100 placeholder:text-brown-400"
                />
                <input
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Description (optional)"
                  className="rounded-2xl border border-brown-300 bg-brown-50 px-4 py-3 text-sm text-brown-900 outline-none focus:border-brown-500 focus:ring-2 focus:ring-brown-100 placeholder:text-brown-400"
                />
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-sm text-brown-700">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(event) => setIsPublic(event.target.checked)}
                      className="h-4 w-4 accent-brown-700"
                    />
                    Public
                  </label>
                  <button
                    type="button"
                    onClick={handleCreate}
                    className="rounded-full bg-brown-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brown-800"
                  >
                    Create
                  </button>
                </div>
              </div>
              {message ? <p className="mt-3 text-sm text-brown-600">{message}</p> : null}
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              {loading ? (
                <div className="rounded-3xl border border-brown-200 bg-white p-8 text-center text-brown-600">Loading collections...</div>
              ) : collections.length === 0 ? (
                <div className="rounded-3xl border border-brown-200 bg-white p-8 text-center text-brown-600">
                  No collections yet. Create one to get started.
                </div>
              ) : (
                collections.map((collection) => (
                  <article key={collection._id} className="rounded-3xl border border-brown-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <Link 
                          href={`/collections/${collection._id}`} 
                          className="text-xl font-semibold text-brown-900 hover:text-brown-700 transition-colors"
                        >
                          {collection.name}
                        </Link>
                        <p className="mt-2 text-sm text-brown-600">{collection.description || 'No description added yet.'}</p>
                      </div>
                      <span className="rounded-full bg-brown-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brown-700">
                        {collection.projects.length} project{collection.projects.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-brown-600">
                      <span className="inline-flex items-center gap-1">
                        <span className={`inline-block h-2 w-2 rounded-full ${collection.isPublic ? 'bg-green-600' : 'bg-brown-400'}`}></span>
                        {collection.isPublic ? 'Public' : 'Private'}
                      </span>
                      <div className="flex gap-2">
                        <Link 
                          href={`/collections/${collection._id}`} 
                          className="rounded-full bg-brown-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brown-800"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(collection._id)}
                          className="rounded-full border border-brown-300 px-4 py-2 text-sm font-semibold text-brown-700 transition hover:bg-brown-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </section>
          </div>
        </MainLayout>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}