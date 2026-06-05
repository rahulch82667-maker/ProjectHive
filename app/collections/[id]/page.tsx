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
import { FolderOpen, Trash2, Eye, ArrowLeft, Globe, Lock, Tag } from 'lucide-react';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

  .cd-page * { box-sizing: border-box; }

  .cd-page {
    font-family: 'DM Sans', sans-serif;
    background: #fdf8f6;
    min-height: 100vh;
  }

  /* Hero */
  .cd-hero {
    background: #3e2723;
    padding: 40px 0 50px;
    position: relative;
    overflow: hidden;
  }

  .cd-hero::before {
    content: '';
    position: absolute;
    top: -50px; right: -50px;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: rgba(255,255,255,0.03);
  }

  .cd-hero-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 24px;
    position: relative;
    z-index: 1;
  }

  .cd-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    font-weight: 500;
    color: rgba(255,255,255,0.55);
    background: none;
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 20px;
    padding: 5px 12px;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s ease;
    margin-bottom: 20px;
  }

  .cd-back-btn:hover {
    color: #fff;
    border-color: rgba(255,255,255,0.35);
    background: rgba(255,255,255,0.06);
  }

  .cd-hero-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
  }

  .cd-eyebrow {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.45);
    margin-bottom: 8px;
  }

  .cd-hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(24px, 3.5vw, 34px);
    font-weight: 600;
    color: #fff;
    margin: 0 0 6px;
    line-height: 1.2;
  }

  .cd-hero-desc {
    font-size: 13.5px;
    color: rgba(255,255,255,0.5);
    margin: 0;
    font-weight: 300;
  }

  .cd-visibility-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 12.5px;
    font-weight: 500;
    color: rgba(255,255,255,0.75);
    backdrop-filter: blur(4px);
    white-space: nowrap;
  }

  .cd-vis-dot {
    width: 7px; height: 7px; border-radius: 50%;
  }
  .cd-vis-dot.public { background: #2ecc71; }
  .cd-vis-dot.private { background: rgba(255,255,255,0.4); }

  .btn-all-collections {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 12px;
    padding: 9px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(4px);
  }

  .btn-all-collections:hover {
    background: rgba(255,255,255,0.2);
    border-color: rgba(255,255,255,0.35);
  }

  /* Body */
  .cd-body {
    max-width: 1100px;
    margin: 0 auto;
    padding: 36px 24px 64px;
  }

  /* Stats row */
  .cd-stats-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 28px;
    flex-wrap: wrap;
  }

  .cd-stat-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #fff;
    border: 1.5px solid #ede0de;
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 12.5px;
    font-weight: 500;
    color: #7d5a56;
    box-shadow: 0 1px 4px rgba(62,39,35,0.05);
  }

  .cd-stat-chip strong { color: #3e2723; font-weight: 700; }

  /* Projects list */
  .cd-project-card {
    background: #fff;
    border: 1.5px solid #ede0de;
    border-radius: 20px;
    padding: 22px 24px;
    box-shadow: 0 2px 12px rgba(62,39,35,0.05);
    margin-bottom: 16px;
    transition: all 0.25s ease;
  }

  .cd-project-card:last-child { margin-bottom: 0; }

  .cd-project-card:hover {
    border-color: #c4a49e;
    box-shadow: 0 8px 28px rgba(62,39,35,0.09);
    transform: translateY(-1px);
  }

  .cd-project-layout {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .cd-project-content { flex: 1; min-width: 220px; }

  .cd-project-title {
    font-family: 'Playfair Display', serif;
    font-size: 17px;
    font-weight: 600;
    color: #3e2723;
    text-decoration: none;
    display: block;
    margin-bottom: 6px;
    line-height: 1.3;
    transition: color 0.15s ease;
  }

  .cd-project-title:hover { color: #6d4c41; }

  .cd-project-desc {
    font-size: 13px;
    color: #9a7a76;
    margin: 0 0 12px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .cd-tags { display: flex; flex-wrap: wrap; gap: 6px; }

  .cd-tag-cat {
    display: inline-flex; align-items: center; gap: 4px;
    background: #3e2723; color: #fff;
    font-size: 11px; font-weight: 600;
    padding: 3px 10px; border-radius: 20px;
  }

  .cd-tag-tech {
    background: #f5ede9; color: #7d5a56;
    font-size: 11px; font-weight: 500;
    padding: 3px 10px; border-radius: 20px;
    border: 1px solid #e8d5d0;
  }

  .cd-project-side {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 12px;
    min-width: 130px;
  }

  .cd-price {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 700;
    color: #3e2723;
    line-height: 1;
  }

  .cd-price.free { color: #1e7e34; }

  .cd-project-actions { display: flex; gap: 8px; }

  .btn-proj-view {
    display: inline-flex; align-items: center; gap: 5px;
    border: 1.5px solid #ede0de;
    border-radius: 10px; background: #fff;
    padding: 7px 13px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12.5px; font-weight: 600;
    color: #3e2723;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .btn-proj-view:hover { background: #f5ede9; border-color: #c4a49e; }

  .btn-proj-remove {
    display: inline-flex; align-items: center; gap: 5px;
    border: 1.5px solid #f5c6cb;
    border-radius: 10px; background: #fff5f5;
    padding: 7px 13px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12.5px; font-weight: 600;
    color: #c0392b;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-proj-remove:hover { background: #fde8e8; border-color: #e74c3c; }

  /* Empty / Loading */
  .cd-empty {
    background: #fff;
    border: 1.5px dashed #e0cec8;
    border-radius: 20px;
    padding: 60px 24px;
    text-align: center;
  }

  .cd-empty-icon {
    width: 60px; height: 60px;
    background: #f5ede9;
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    color: #c4a49e;
    margin: 0 auto 16px;
  }

  .cd-empty-title {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 600;
    color: #3e2723;
    margin: 0 0 6px;
  }

  .cd-empty-text {
    font-size: 13px;
    color: #a08080;
    margin: 0 0 20px;
  }

  .btn-back-to-coll {
    display: inline-flex; align-items: center; gap: 6px;
    background: #3e2723; color: #fff;
    border: none; border-radius: 12px;
    padding: 10px 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px; font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-back-to-coll:hover { background: #4e342e; }
`;

export default function CollectionDetailPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { selectedCollection, loading, error } = useSelector((state: RootState) => state.collections);
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (id && isAuthenticated) dispatch(fetchCollectionById(id));
  }, [dispatch, id, isAuthenticated]);

  useEffect(() => {
    if (error) dispatch(clearCollectionsError());
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
      <div style={{ fontFamily: 'DM Sans, sans-serif', background: '#fdf8f6', minHeight: '100vh' }}>
        <Navbar />
        <MainLayout>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <p style={{ color: '#9a7a76', fontSize: 14 }}>Loading…</p>
          </div>
        </MainLayout>
        <Footer />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <style>{styles}</style>
      <div className="cd-page">
        <Navbar />
        <MainLayout>
          {/* Hero */}
          <div className="cd-hero">
            <div className="cd-hero-inner">
              <button className="cd-back-btn" onClick={() => router.back()}>
                <ArrowLeft size={12} strokeWidth={2.5} />
                Back
              </button>

              <div className="cd-hero-row">
                <div>
                  <p className="cd-eyebrow">Collection</p>
                  <h1 className="cd-hero-title">{selectedCollection?.name || 'Collection'}</h1>
                  <p className="cd-hero-desc">{selectedCollection?.description || 'Project collection details.'}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                  {selectedCollection && (
                    <span className="cd-visibility-pill">
                      <span className={`cd-vis-dot ${selectedCollection.isPublic ? 'public' : 'private'}`} />
                      {selectedCollection.isPublic ? <Globe size={12} /> : <Lock size={12} />}
                      {selectedCollection.isPublic ? 'Public' : 'Private'}
                    </span>
                  )}
                  <Link href="/collections" className="btn-all-collections">
                    <FolderOpen size={14} />
                    All Collections
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="cd-body">
            {loading ? (
              <div className="cd-empty">
                <div className="cd-empty-icon"><FolderOpen size={26} /></div>
                <p className="cd-empty-title">Loading collection…</p>
              </div>
            ) : selectedCollection ? (
              <>
                {/* Stats */}
                <div className="cd-stats-row">
                  <span className="cd-stat-chip">
                    <strong>{selectedCollection.projects.length}</strong>
                    project{selectedCollection.projects.length === 1 ? '' : 's'}
                  </span>
                  <span className="cd-stat-chip">
                    {selectedCollection.isPublic ? <Globe size={13} /> : <Lock size={13} />}
                    {selectedCollection.isPublic ? 'Public collection' : 'Private collection'}
                  </span>
                </div>

                {/* Projects */}
                {selectedCollection.projects.length === 0 ? (
                  <div className="cd-empty">
                    <div className="cd-empty-icon"><FolderOpen size={26} /></div>
                    <p className="cd-empty-title">No projects yet</p>
                    <p className="cd-empty-text">Use the bookmark icon on any project to add it to this collection.</p>
                  </div>
                ) : (
                  selectedCollection.projects.map((project) => (
                    <article className="cd-project-card" key={(project as any)._id}>
                      <div className="cd-project-layout">
                        <div className="cd-project-content">
                          <Link href={`/projects/${(project as any)._id}`} className="cd-project-title">
                            {(project as any).title}
                          </Link>
                          <p className="cd-project-desc">{(project as any).shortDescription}</p>
                          <div className="cd-tags">
                            <span className="cd-tag-cat">
                              <Tag size={10} />
                              {(project as any).category}
                            </span>
                            {(project as any).technologies?.slice(0, 3).map((tech: string) => (
                              <span key={tech} className="cd-tag-tech">{tech}</span>
                            ))}
                          </div>
                        </div>

                        <div className="cd-project-side">
                          <span className={`cd-price ${(project as any).price === 0 ? 'free' : ''}`}>
                            {(project as any).price === 0 ? 'Free' : `$${(project as any).price}`}
                          </span>
                          <div className="cd-project-actions">
                            <Link href={`/projects/${(project as any)._id}`} className="btn-proj-view">
                              <Eye size={13} />
                              View
                            </Link>
                            <button
                              className="btn-proj-remove"
                              onClick={() => handleRemoveProject((project as any)._id)}
                            >
                              <Trash2 size={13} />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </>
            ) : (
              <div className="cd-empty">
                <div className="cd-empty-icon"><FolderOpen size={26} /></div>
                <p className="cd-empty-title">Collection not found</p>
                <p className="cd-empty-text">This collection may have been deleted or you don't have access.</p>
                <Link href="/collections" className="btn-back-to-coll">
                  <ArrowLeft size={14} />
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