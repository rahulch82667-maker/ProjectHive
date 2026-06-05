'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, FolderPlus, BookmarkPlus, Check, Loader2, Folder } from 'lucide-react';
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

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .atc-overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(30, 10, 5, 0.55);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    animation: atc-fade-in 0.18s ease;
  }

  @keyframes atc-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes atc-slide-up {
    from { opacity: 0; transform: translateY(16px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .atc-modal {
    font-family: 'DM Sans', sans-serif;
    width: 100%;
    max-width: 480px;
    background: #fff;
    border-radius: 24px;
    box-shadow: 0 24px 64px rgba(62,39,35,0.22), 0 2px 12px rgba(62,39,35,0.1);
    border: 1.5px solid #ede0de;
    max-height: 90vh;
    overflow-y: auto;
    animation: atc-slide-up 0.22s ease;
    scrollbar-width: thin;
    scrollbar-color: #e0cec8 transparent;
  }

  .atc-modal::-webkit-scrollbar { width: 4px; }
  .atc-modal::-webkit-scrollbar-thumb { background: #e0cec8; border-radius: 10px; }

  /* Header */
  .atc-header {
    background: #3e2723;
    border-radius: 22px 22px 0 0;
    padding: 18px 22px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .atc-header-icon {
    width: 38px; height: 38px;
    background: rgba(255,255,255,0.12);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: #fff;
    flex-shrink: 0;
  }

  .atc-header-text { flex: 1; min-width: 0; }

  .atc-header-title {
    font-family: 'Playfair Display', serif;
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    margin: 0 0 2px;
  }

  .atc-header-sub {
    font-size: 12px;
    color: rgba(255,255,255,0.5);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .atc-close-btn {
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 8px;
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,0.7);
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.15s ease;
  }

  .atc-close-btn:hover {
    background: rgba(255,255,255,0.2);
    color: #fff;
  }

  /* Body */
  .atc-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

  /* Section */
  .atc-section {
    border: 1.5px solid #ede0de;
    border-radius: 16px;
    overflow: hidden;
  }

  .atc-section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #fdf8f7;
    border-bottom: 1px solid #ede0de;
  }

  .atc-section-icon {
    width: 28px; height: 28px;
    background: #f5ede9;
    border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    color: #3e2723;
    flex-shrink: 0;
  }

  .atc-section-title {
    font-size: 13px;
    font-weight: 600;
    color: #3e2723;
    margin: 0;
  }

  .atc-section-body { padding: 14px 16px; }

  /* Collections list */
  .atc-collections-scroll {
    max-height: 200px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
    scrollbar-width: thin;
    scrollbar-color: #e0cec8 transparent;
    margin-bottom: 12px;
  }

  .atc-collections-scroll::-webkit-scrollbar { width: 3px; }
  .atc-collections-scroll::-webkit-scrollbar-thumb { background: #e0cec8; border-radius: 10px; }

  .atc-coll-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: 1.5px solid #ede0de;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.15s ease;
    background: #fff;
  }

  .atc-coll-row:hover { border-color: #c4a49e; background: #fdf8f7; }

  .atc-coll-row.selected {
    border-color: #3e2723;
    background: #fdf8f7;
    box-shadow: 0 0 0 3px rgba(62,39,35,0.07);
  }

  .atc-radio {
    width: 16px; height: 16px;
    border: 2px solid #c4aaa8;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: all 0.15s ease;
  }

  .atc-coll-row.selected .atc-radio {
    border-color: #3e2723;
    background: #3e2723;
  }

  .atc-radio-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #fff;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .atc-coll-row.selected .atc-radio-dot { opacity: 1; }

  .atc-coll-folder {
    color: #a08080;
    flex-shrink: 0;
    transition: color 0.15s ease;
  }

  .atc-coll-row.selected .atc-coll-folder { color: #3e2723; }

  .atc-coll-info { flex: 1; min-width: 0; }

  .atc-coll-name {
    font-size: 13.5px;
    font-weight: 600;
    color: #3e2723;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .atc-coll-meta {
    font-size: 11px;
    color: #a08080;
    margin-top: 1px;
  }

  .atc-pub-badge {
    font-size: 10.5px;
    font-weight: 600;
    background: #f5ede9;
    color: #7d5a56;
    padding: 2px 8px;
    border-radius: 20px;
    flex-shrink: 0;
  }

  /* Empty inside */
  .atc-empty-mini {
    text-align: center;
    padding: 20px 12px;
    border: 1.5px dashed #e8d5d0;
    border-radius: 12px;
    margin-bottom: 12px;
  }

  .atc-empty-mini p {
    font-size: 12.5px;
    color: #a08080;
    margin: 0;
  }

  /* Inputs */
  .atc-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #a08080;
    margin-bottom: 6px;
  }

  .atc-input, .atc-textarea {
    width: 100%;
    border: 1.5px solid #ede0de;
    border-radius: 11px;
    padding: 9px 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    color: #3e2723;
    background: #fdf8f7;
    outline: none;
    transition: all 0.2s ease;
    margin-bottom: 10px;
  }

  .atc-input::placeholder, .atc-textarea::placeholder { color: #c4aaa8; }

  .atc-input:focus, .atc-textarea:focus {
    border-color: #3e2723;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(62,39,35,0.07);
  }

  .atc-textarea { resize: none; }

  .atc-public-row {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 13px;
    color: #7d5a56;
    font-weight: 500;
    margin-bottom: 12px;
    user-select: none;
  }

  .atc-public-row input { accent-color: #3e2723; width: 15px; height: 15px; cursor: pointer; }
  .atc-public-hint { font-size: 11px; color: #c4aaa8; }

  /* Buttons */
  .atc-btn-primary {
    width: 100%;
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    background: #3e2723; color: #fff;
    border: none; border-radius: 12px;
    padding: 11px 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px; font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .atc-btn-primary:hover:not(:disabled) { background: #4e342e; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(62,39,35,0.18); }
  .atc-btn-primary:active:not(:disabled) { transform: translateY(0); }
  .atc-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

  .atc-btn-outline {
    width: 100%;
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    background: transparent; color: #3e2723;
    border: 1.5px solid #c4a49e; border-radius: 12px;
    padding: 10px 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px; font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .atc-btn-outline:hover:not(:disabled) { background: #fdf8f7; border-color: #3e2723; }
  .atc-btn-outline:disabled { opacity: 0.45; cursor: not-allowed; }

  /* Message */
  .atc-message {
    border-radius: 12px;
    padding: 10px 14px;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .atc-message.success { background: #f0faf4; color: #1a6b30; border: 1px solid #a8d5b5; }
  .atc-message.error { background: #fff5f5; color: #b0281a; border: 1px solid #f5b8b2; }
  .atc-message.info { background: #fdf8f7; color: #7d5a56; border: 1px solid #ede0de; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .atc-spin { animation: spin 0.7s linear infinite; }
`;

export default function AddToCollectionModal({ open, project, onClose }: AddToCollectionModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { collections, loading, error, success } = useSelector((state: RootState) => state.collections);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    if (open) { dispatch(fetchCollections()); setMessage(''); }
  }, [dispatch, open]);

  useEffect(() => {
    if (error) { setMessage(error); setMessageType('error'); dispatch(clearCollectionsError()); }
  }, [dispatch, error]);

  useEffect(() => {
    if (success) { setMessage('Saved successfully'); setMessageType('success'); dispatch(clearCollectionsSuccess()); dispatch(fetchCollections()); }
  }, [dispatch, success]);

  useEffect(() => {
    if (!open) { setSelectedCollectionId(''); setName(''); setDescription(''); setIsPublic(false); setMessage(''); }
  }, [open]);

  const existingCollections = useMemo(() => collections, [collections]);

  const handleAddToCollection = async () => {
    if (!selectedCollectionId) { setMessage('Choose a collection'); setMessageType('error'); return; }
    try {
      await dispatch(addProjectToCollection({ collectionId: selectedCollectionId, projectId: project._id })).unwrap();
      setMessage('Project added to collection'); setMessageType('success');
      setTimeout(() => onClose(), 1000);
    } catch (err: any) { setMessage(err?.message || 'Failed to add project'); setMessageType('error'); }
  };

  const handleCreateAndAdd = async () => {
    if (!name.trim()) { setMessage('Collection name is required'); setMessageType('error'); return; }
    try {
      const created = await dispatch(createCollection({ name: name.trim(), description: description.trim(), isPublic })).unwrap();
      await dispatch(addProjectToCollection({ collectionId: created._id, projectId: project._id })).unwrap();
      setMessage('Collection created and project added'); setMessageType('success');
      setTimeout(() => onClose(), 1000);
    } catch (err: any) { setMessage(err?.message || 'Failed to create collection'); setMessageType('error'); }
  };

  if (!open) return null;

  const shortTitle = project.title.length > 42 ? `${project.title.substring(0, 42)}…` : project.title;

  return (
    <>
      <style>{styles}</style>
      <div className="atc-overlay">
        <div className="atc-modal">
          {/* Header */}
          <div className="atc-header">
            <div className="atc-header-icon">
              <BookmarkPlus size={18} />
            </div>
            <div className="atc-header-text">
              <p className="atc-header-title">Add to Collection</p>
              <p className="atc-header-sub">{shortTitle}</p>
            </div>
            <button className="atc-close-btn" onClick={onClose}>
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="atc-body">

            {/* Existing Collections */}
            <div className="atc-section">
              <div className="atc-section-header">
                <div className="atc-section-icon"><FolderPlus size={14} /></div>
                <p className="atc-section-title">Save to existing collection</p>
              </div>
              <div className="atc-section-body">
                {existingCollections.length === 0 ? (
                  <div className="atc-empty-mini">
                    <p>No collections yet — create one below.</p>
                  </div>
                ) : (
                  <div className="atc-collections-scroll">
                    {existingCollections.map((collection) => (
                      <div
                        key={collection._id}
                        className={`atc-coll-row ${selectedCollectionId === collection._id ? 'selected' : ''}`}
                        onClick={() => setSelectedCollectionId(collection._id)}
                      >
                        <div className="atc-radio">
                          <div className="atc-radio-dot" />
                        </div>
                        <Folder size={15} className="atc-coll-folder" />
                        <div className="atc-coll-info">
                          <p className="atc-coll-name">{collection.name}</p>
                          <p className="atc-coll-meta">
                            {collection.projects.length} project{collection.projects.length === 1 ? '' : 's'}
                          </p>
                        </div>
                        {collection.isPublic && (
                          <span className="atc-pub-badge">Public</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  className="atc-btn-primary"
                  onClick={handleAddToCollection}
                  disabled={loading || existingCollections.length === 0 || !selectedCollectionId}
                >
                  {loading
                    ? <><Loader2 size={15} className="atc-spin" />Adding…</>
                    : <><Check size={15} />Add to Collection</>
                  }
                </button>
              </div>
            </div>

            {/* Create New */}
            <div className="atc-section">
              <div className="atc-section-header">
                <div className="atc-section-icon"><BookmarkPlus size={14} /></div>
                <p className="atc-section-title">Create new collection</p>
              </div>
              <div className="atc-section-body">
                <label className="atc-label">Name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My Favourites"
                  className="atc-input"
                />

                <label className="atc-label">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description…"
                  rows={2}
                  className="atc-textarea"
                />

                <label className="atc-public-row">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                  />
                  Make public
                  <span className="atc-public-hint">(anyone can view)</span>
                </label>

                <button
                  className="atc-btn-outline"
                  onClick={handleCreateAndAdd}
                  disabled={loading || !name.trim()}
                >
                  {loading
                    ? <><Loader2 size={15} className="atc-spin" />Creating…</>
                    : <><FolderPlus size={15} />Create & Add Project</>
                  }
                </button>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`atc-message ${messageType}`}>
                {messageType === 'success' && <Check size={14} />}
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}