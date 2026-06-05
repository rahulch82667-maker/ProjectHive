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
import { Plus, Folder, Globe, Lock, Trash2, Eye, FolderPlus } from 'lucide-react';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

  .coll-page * { box-sizing: border-box; }

  .coll-page {
    font-family: 'DM Sans', sans-serif;
    background: #fdf8f6;
    min-height: 100vh;
  }

  .coll-hero {
    border-bottom: 1.5px solid #ede0de;
    padding: 28px 0 26px;
  }

  .coll-hero-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .coll-eyebrow {
    display: none;
  }

  .coll-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 600;
    color: #3e2723;
    margin: 0 0 3px;
    line-height: 1.2;
  }

  .coll-subtitle {
    font-size: 13px;
    color: #a08080;
    margin: 0;
    font-weight: 400;
  }

  .coll-body {
    max-width: 1100px;
    margin: 0 auto;
    padding: 36px 24px 64px;
  }

  /* Create Form Card */
  .create-card {
    background: #fff;
    border-radius: 20px;
    border: 1.5px solid #ede0de;
    box-shadow: 0 2px 16px rgba(62,39,35,0.06);
    overflow: hidden;
    margin-bottom: 36px;
  }

  .create-card-header {
    background: linear-gradient(135deg, #4e342e 0%, #3e2723 100%);
    padding: 16px 22px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .create-card-header-icon {
    width: 32px; height: 32px;
    background: rgba(255,255,255,0.12);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: #fff;
  }

  .create-card-header-text {
    font-family: 'Playfair Display', serif;
    font-size: 15px;
    font-weight: 600;
    color: #fff;
  }

  .create-card-body {
    padding: 20px 22px;
  }

  .create-row {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 12px;
    align-items: start;
  }

  @media (max-width: 680px) {
    .create-row { grid-template-columns: 1fr; }
  }

  .create-input {
    width: 100%;
    border: 1.5px solid #ede0de;
    border-radius: 12px;
    padding: 10px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    color: #3e2723;
    background: #fdf8f7;
    outline: none;
    transition: all 0.2s ease;
  }

  .create-input::placeholder { color: #c4aaa8; }

  .create-input:focus {
    border-color: #3e2723;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(62,39,35,0.08);
  }

  .create-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .public-toggle {
    display: flex;
    align-items: center;
    gap: 7px;
    cursor: pointer;
    user-select: none;
    font-size: 13px;
    color: #7d5a56;
    font-weight: 500;
    white-space: nowrap;
  }

  .public-toggle input { accent-color: #3e2723; width: 15px; height: 15px; cursor: pointer; }

  .btn-create {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #3e2723;
    color: #fff;
    border: none;
    border-radius: 12px;
    padding: 10px 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .btn-create:hover { background: #4e342e; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(62,39,35,0.2); }
  .btn-create:active { transform: translateY(0); }

  .create-message {
    margin-top: 12px;
    font-size: 13px;
    padding: 8px 14px;
    border-radius: 10px;
  }

  .create-message.error { background: #fff5f5; color: #c0392b; border: 1px solid #f5c6cb; }
  .create-message.success { background: #f0faf4; color: #1e7e34; border: 1px solid #b7e4c7; }
  .create-message.info { background: #fdf8f7; color: #7d5a56; border: 1px solid #ede0de; }

  /* Section Title */
  .section-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
  }

  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 600;
    color: #3e2723;
  }

  .section-count {
    font-size: 12px;
    color: #a08080;
    background: #f5ede9;
    padding: 3px 10px;
    border-radius: 20px;
    font-weight: 500;
  }

  /* Collection Cards Grid */
  .collections-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 18px;
  }

  .coll-card {
    background: #fff;
    border: 1.5px solid #ede0de;
    border-radius: 20px;
    padding: 22px;
    box-shadow: 0 2px 12px rgba(62,39,35,0.05);
    transition: all 0.25s ease;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .coll-card:hover {
    border-color: #c4a49e;
    box-shadow: 0 8px 28px rgba(62,39,35,0.10);
    transform: translateY(-2px);
  }

  .coll-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .coll-card-icon {
    width: 44px; height: 44px;
    background: #f5ede9;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    color: #3e2723;
    flex-shrink: 0;
  }

  .coll-projects-badge {
    background: #3e2723;
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 20px;
    white-space: nowrap;
  }

  .coll-card-name {
    font-family: 'Playfair Display', serif;
    font-size: 17px;
    font-weight: 600;
    color: #3e2723;
    text-decoration: none;
    line-height: 1.3;
    display: block;
    margin-bottom: 6px;
    transition: color 0.15s ease;
  }

  .coll-card-name:hover { color: #6d4c41; }

  .coll-card-desc {
    font-size: 13px;
    color: #9a7a76;
    line-height: 1.5;
    margin: 0;
    flex: 1;
  }

  .coll-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 18px;
    padding-top: 14px;
    border-top: 1px solid #f5ede9;
    gap: 10px;
    flex-wrap: wrap;
  }

  .visibility-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 500;
    color: #7d5a56;
  }

  .vis-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
  }
  .vis-dot.public { background: #27ae60; }
  .vis-dot.private { background: #a08080; }

  .card-actions { display: flex; gap: 8px; }

  .btn-view {
    display: inline-flex; align-items: center; gap: 5px;
    background: #3e2723; color: #fff;
    border: none; border-radius: 10px;
    padding: 7px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12.5px; font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-view:hover { background: #4e342e; }

  .btn-delete {
    display: inline-flex; align-items: center; gap: 5px;
    background: transparent;
    border: 1.5px solid #ede0de;
    border-radius: 10px;
    padding: 7px 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12.5px; font-weight: 600;
    color: #c0392b;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-delete:hover { background: #fff5f5; border-color: #f5c6cb; }

  /* Empty / Loading States */
  .empty-state {
    grid-column: 1 / -1;
    background: #fff;
    border: 1.5px dashed #e0cec8;
    border-radius: 20px;
    padding: 52px 24px;
    text-align: center;
  }

  .empty-icon {
    width: 56px; height: 56px;
    background: #f5ede9;
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    color: #c4a49e;
    margin: 0 auto 16px;
  }

  .empty-title {
    font-family: 'Playfair Display', serif;
    font-size: 17px;
    font-weight: 600;
    color: #3e2723;
    margin: 0 0 6px;
  }

  .empty-text {
    font-size: 13px;
    color: #a08080;
    margin: 0;
  }
`;

export default function CollectionsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { collections, loading, error, success } = useSelector((state: RootState) => state.collections);
  const { isAuthenticated } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | 'info'>('info');

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchCollections());
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (error) {
      setMessage(error);
      setMessageType('error');
      dispatch(clearCollectionsError());
    }
  }, [dispatch, error]);

  useEffect(() => {
    if (success) {
      setMessage('Collection created successfully');
      setMessageType('success');
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
      setMessageType('error');
      return;
    }
    try {
      await dispatch(createCollection({ name: name.trim(), description: description.trim(), isPublic })).unwrap();
    } catch (err: any) {
      setMessage(err?.message || 'Failed to create collection');
      setMessageType('error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collection?')) return;
    try {
      await dispatch(deleteCollection(id)).unwrap();
      setMessage('Collection deleted');
      setMessageType('info');
    } catch (err: any) {
      setMessage(err?.message || 'Failed to delete collection');
      setMessageType('error');
    }
  };

  return (
    <ProtectedRoute>
      <style>{styles}</style>
      <div className="coll-page">
        <Navbar />
        <MainLayout>
          {/* Hero */}
          <div className="coll-hero">
            <div className="coll-hero-inner">
              <div>
                <h1 className="coll-title">Collections</h1>
                <p className="coll-subtitle">Organise and manage your saved project collections.</p>
              </div>
            </div>
          </div>

          <div className="coll-body">

            {/* Create Card */}
            <div className="create-card">
              <div className="create-card-header">
                <div className="create-card-header-icon">
                  <FolderPlus size={16} />
                </div>
                <span className="create-card-header-text">Create new collection</span>
              </div>
              <div className="create-card-body">
                <div className="create-row">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Collection name"
                    className="create-input"
                  />
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description (optional)"
                    className="create-input"
                  />
                  <div className="create-actions">
                    <label className="public-toggle">
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                      />
                      Public
                    </label>
                    <button className="btn-create" onClick={handleCreate}>
                      <Plus size={14} strokeWidth={2.5} />
                      Create
                    </button>
                  </div>
                </div>
                {message && (
                  <p className={`create-message ${messageType}`}>{message}</p>
                )}
              </div>
            </div>

            {/* Collections List */}
            <div className="section-meta">
              <h2 className="section-title">Your Collections</h2>
              {!loading && <span className="section-count">{collections.length} total</span>}
            </div>

            <div className="collections-grid">
              {loading ? (
                <div className="empty-state">
                  <div className="empty-icon"><Folder size={24} /></div>
                  <p className="empty-title">Loading collections…</p>
                </div>
              ) : collections.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><Folder size={24} /></div>
                  <p className="empty-title">No collections yet</p>
                  <p className="empty-text">Create your first collection above to get started.</p>
                </div>
              ) : (
                collections.map((collection) => (
                  <article className="coll-card" key={collection._id}>
                    <div className="coll-card-top">
                      <div className="coll-card-icon">
                        <Folder size={20} />
                      </div>
                      <span className="coll-projects-badge">
                        {collection.projects.length} project{collection.projects.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <Link href={`/collections/${collection._id}`} className="coll-card-name">
                      {collection.name}
                    </Link>
                    <p className="coll-card-desc">
                      {collection.description || 'No description added yet.'}
                    </p>

                    <div className="coll-card-footer">
                      <span className="visibility-badge">
                        {collection.isPublic
                          ? <><span className="vis-dot public" /><Globe size={12} />Public</>
                          : <><span className="vis-dot private" /><Lock size={12} />Private</>
                        }
                      </span>
                      <div className="card-actions">
                        <Link href={`/collections/${collection._id}`} className="btn-view">
                          <Eye size={13} />
                          View
                        </Link>
                        <button className="btn-delete" onClick={() => handleDelete(collection._id)}>
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </MainLayout>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}