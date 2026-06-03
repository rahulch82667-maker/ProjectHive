'use client';

import { useState, useEffect } from 'react';
import { Search, Download, Clock, CheckCircle, FolderOpen, Calendar, Tag, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/components/layout/MainLayout';
import Container from '@/components/layout/Container';
import api from '@/services/api/axios';

interface PurchasedProject {
  _id: string;
  title: string;
  category: string;
  description: string;
  thumbnail: string;
  price: number;
  slug: string;
  purchaseDate: string;
  orderId: string;
}

export default function MyProjectsPage() {
  const { user, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<PurchasedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchPurchasedProjects();
    }
  }, [isAuthenticated]);

  const fetchPurchasedProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/purchased-projects');
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Failed to fetch purchased projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <MainLayout>
          <Container className="py-20 text-center">
            <div className="max-w-md mx-auto">
              <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in Required</h2>
              <p className="text-gray-600 mb-6">Please sign in to view your purchased projects.</p>
              <Link href="/login" className="inline-block px-6 py-3 bg-brown-700 text-white rounded-lg hover:bg-brown-800">
                Sign In
              </Link>
            </div>
          </Container>
        </MainLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MainLayout>
        <Container className="py-8 sm:py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">My Projects</h1>
            <p className="text-gray-600">
              Access all your approved purchased projects and downloads.
            </p>
          </div>

          {/* Stats Card */}
          <div className="bg-gradient-to-r from-brown-700 to-brown-800 rounded-2xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-brown-200 text-sm">Total Purchased Projects</p>
                <p className="text-3xl font-bold mt-1">{projects.length}</p>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-semibold">All projects approved</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search your projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brown-500"
            />
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 animate-pulse">
                  <div className="aspect-video bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                    <div className="h-8 bg-gray-200 rounded w-full mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600 max-w-sm mx-auto">
                {searchTerm ? 'No projects match your search criteria.' : 'You haven\'t purchased any projects yet.'}
              </p>
              {!searchTerm && (
                <Link href="/templates" className="inline-block mt-6 px-6 py-3 bg-brown-700 text-white rounded-lg hover:bg-brown-800">
                  Browse Marketplace
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => (
                <div
                  key={project._id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 transform hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                      }}
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-500/90 text-white">
                      Approved
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                      {project.title}
                    </h3>

                    <div className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-xs font-medium text-gray-600">{project.category}</span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2">
                      {project.description}
                    </p>

                    <div className="flex items-center gap-2 pt-2">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        Purchased: {formatDate(project.purchaseDate)}
                      </span>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all"
                      >
                        View Details
                      </Link>
                      <button
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brown-700 hover:bg-brown-800 text-white text-sm font-semibold rounded-xl transition-all"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </MainLayout>
    </div>
  );
}