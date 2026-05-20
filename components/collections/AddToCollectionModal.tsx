'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, FolderPlus, BookmarkPlus } from 'lucide-react';
import { RootState, AppDispatch } from '@/store/store';
import {
  addProjectToCollection,
  clearCollectionsError,
  clearCollectionsSuccess,
  createCollection,
  fetchCollections,
} from '@/store/slices/collectionsSlice';
import { Project } from '@/services/projects.api';

interface AddToCollectionModalProps {
  open: boolean;
  project: Project;
  onClose: () => void;
}

export default function AddToCollectionModal({ open, project, onClose }: AddToCollectionModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { collections, loading, error, success } = useSelector((state: RootState) => state.collections);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (open) {
      dispatch(fetchCollections());
      setMessage('');
    }
  }, [dispatch, open]);

  useEffect(() => {
    if (error) {
      setMessage(error);
      dispatch(clearCollectionsError());
    }
  }, [dispatch, error]);

  useEffect(() => {
    if (success) {
      setMessage('Saved successfully');
      dispatch(clearCollectionsSuccess());
      dispatch(fetchCollections());
    }
  }, [dispatch, success]);

  useEffect(() => {
    if (!open) {
      setSelectedCollectionId('');
      setName('');
      setDescription('');
      setIsPublic(false);
      setMessage('');
    }
  }, [open]);

  const existingCollections = useMemo(() => collections, [collections]);

  const handleAddToCollection = async () => {
    if (!selectedCollectionId) {
      setMessage('Choose a collection');
      return;
    }

    try {
      await dispatch(addProjectToCollection({ collectionId: selectedCollectionId, projectId: project._id })).unwrap();
      setMessage('Project added to collection');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setMessage(err?.message || 'Failed to add project');
    }
  };

  const handleCreateAndAdd = async () => {
    if (!name.trim()) {
      setMessage('Collection name is required');
      return;
    }

    try {
      const created = await dispatch(
        createCollection({ name: name.trim(), description: description.trim(), isPublic })
      ).unwrap();
      await dispatch(addProjectToCollection({ collectionId: created._id, projectId: project._id })).unwrap();
      setMessage('Collection created and project added');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setMessage(err?.message || 'Failed to create collection');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 backdrop-blur-sm">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl rounded-2xl bg-white shadow-xl border border-brown-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-brown-200 sticky top-0 bg-white z-10">
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-brown-900 truncate">Add to Collection</h2>
            <p className="text-xs sm:text-sm text-brown-600 truncate">
              {project.title.length > 40 ? `${project.title.substring(0, 40)}...` : project.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 rounded-full p-1.5 sm:p-2 text-brown-400 transition-all hover:bg-brown-100 hover:text-brown-700"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
          {/* Existing Collections Section */}
          <section className="rounded-xl border border-brown-200 bg-brown-50 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-3">
              <FolderPlus className="h-4 w-4 sm:h-5 sm:w-5 text-brown-600" />
              <h3 className="text-sm sm:text-base font-semibold text-brown-900">Existing collections</h3>
            </div>
            
            {existingCollections.length === 0 ? (
              <div className="rounded-lg bg-white p-4 text-center border border-brown-200">
                <p className="text-xs sm:text-sm text-brown-600">No collections yet.</p>
                <p className="text-xs text-brown-500 mt-1">Create one below</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {existingCollections.map((collection) => (
                  <label
                    key={collection._id}
                    className={`flex cursor-pointer items-center gap-2 sm:gap-3 rounded-lg border p-2.5 sm:p-3 transition-all ${
                      selectedCollectionId === collection._id
                        ? 'border-brown-500 bg-white shadow-sm ring-1 ring-brown-200'
                        : 'border-brown-200 bg-white hover:border-brown-300 hover:shadow-sm'
                    }`}
                  >
                    <input
                      type="radio"
                      name="collection"
                      value={collection._id}
                      checked={selectedCollectionId === collection._id}
                      onChange={() => setSelectedCollectionId(collection._id)}
                      className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brown-600 focus:ring-brown-500 accent-brown-600 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brown-900 truncate">{collection.name}</p>
                      <p className="text-xs text-brown-600">
                        {collection.projects.length} project{collection.projects.length === 1 ? '' : 's'}
                      </p>
                    </div>
                    {collection.isPublic && (
                      <span className="flex-shrink-0 rounded-full bg-brown-100 px-2 py-0.5 text-xs font-medium text-brown-700">
                        Public
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}
            
            <button
              type="button"
              onClick={handleAddToCollection}
              disabled={loading || existingCollections.length === 0 || !selectedCollectionId}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brown-700 px-3 py-2 text-xs sm:text-sm font-semibold text-white transition-all hover:bg-brown-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Adding...
                </>
              ) : (
                'Add to Collection'
              )}
            </button>
          </section>

          {/* Create New Collection Section */}
          <section className="rounded-xl border border-brown-200 bg-white p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookmarkPlus className="h-4 w-4 sm:h-5 sm:w-5 text-brown-600" />
              <h3 className="text-sm sm:text-base font-semibold text-brown-900">Create new collection</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-brown-700 mb-1">
                  Name *
                </label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="block w-full rounded-lg border border-brown-300 bg-brown-50 px-3 py-1.5 sm:py-2 text-sm text-brown-900 outline-none transition focus:border-brown-500 focus:ring-2 focus:ring-brown-200 placeholder:text-brown-400"
                  placeholder="Collection name"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-brown-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="block w-full rounded-lg border border-brown-300 bg-brown-50 px-3 py-1.5 sm:py-2 text-sm text-brown-900 outline-none transition focus:border-brown-500 focus:ring-2 focus:ring-brown-200 placeholder:text-brown-400"
                  placeholder="Optional description"
                  rows={2}
                />
              </div>
              
              <label className="flex items-center gap-2 text-xs sm:text-sm text-brown-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(event) => setIsPublic(event.target.checked)}
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-brown-300 text-brown-600 focus:ring-brown-500 accent-brown-600"
                />
                <span>Make public</span>
                <span className="text-xs text-brown-500">(anyone can view)</span>
              </label>
              
              <button
                type="button"
                onClick={handleCreateAndAdd}
                disabled={loading || !name.trim()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-brown-600 bg-transparent px-3 py-2 text-xs sm:text-sm font-semibold text-brown-700 transition-all hover:bg-brown-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-brown-600 border-t-transparent"></div>
                    Creating...
                  </>
                ) : (
                  'Create & Add Project'
                )}
              </button>
            </div>
          </section>

          {/* Message Display */}
          {message && (
            <div className={`rounded-lg p-2.5 sm:p-3 text-xs sm:text-sm ${
              message.includes('successfully') || message === 'Saved successfully'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}