'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { AdminProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Download,
  AlertCircle,
  Users,
  ShoppingBag,
  TrendingUp,
  Loader2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/services/api/axios';

interface AccessRequest {
  _id: string;
  userId: { _id: string; name: string; email: string };
  projectId: { _id: string; title: string; thumbnail: string; category: string; price: number };
  amount: number;
  paymentStatus: string;
  accessStatus: 'pending' | 'approved' | 'rejected';
  billingDetails: any;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

export default function AdminAccessRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/access-requests?status=${statusFilter}&search=${searchTerm}`);
      setRequests(response.data.orders);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch access requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, searchTerm]);

  const handleApprove = async (orderId: string) => {
    if (!confirm('Are you sure you want to approve this access request?')) return;
    
    setProcessingId(orderId);
    try {
      await api.put(`/admin/access-requests/${orderId}`, { action: 'approve' });
      await fetchRequests();
    } catch (error) {
      console.error('Failed to approve:', error);
      alert('Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (orderId: string) => {
    if (!confirm('Are you sure you want to reject this access request?')) return;
    
    setProcessingId(orderId);
    try {
      await api.put(`/admin/access-requests/${orderId}`, { action: 'reject' });
      await fetchRequests();
    } catch (error) {
      console.error('Failed to reject:', error);
      alert('Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700"><Clock className="h-3 w-3" />Pending</span>;
      case 'approved':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700"><CheckCircle className="h-3 w-3" />Approved</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700"><XCircle className="h-3 w-3" />Rejected</span>;
      default:
        return null;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout user={user ?? undefined}>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Access Requests</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage and approve user access requests for purchased projects
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Requests</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
                </div>
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rejected</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by user name, email, or project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none cursor-pointer min-w-[140px]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Requests Table */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-1">No access requests</h3>
              <p className="text-sm text-slate-500">All access requests have been processed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request._id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-100">
                        <img
                          src={request.projectId.thumbnail}
                          alt={request.projectId.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-slate-900">{request.projectId.title}</h3>
                          <p className="text-sm text-slate-500 mt-0.5">
                            by {request.userId.name} ({request.userId.email})
                          </p>
                        </div>
                        {getStatusBadge(request.accessStatus)}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-3 text-sm">
                        <div>
                          <span className="text-slate-500">Order ID:</span>
                          <span className="ml-2 text-slate-700 font-mono text-xs">{request._id.slice(-8)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Amount:</span>
                          <span className="ml-2 font-semibold text-slate-900">${request.amount.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Purchase Date:</span>
                          <span className="ml-2 text-slate-700">{formatDate(request.createdAt)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Category:</span>
                          <span className="ml-2 text-slate-700">{request.projectId.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {request.accessStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(request._id)}
                            disabled={processingId === request._id}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
                          >
                            {processingId === request._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Approve'
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(request._id)}
                            disabled={processingId === request._id}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {request.accessStatus === 'approved' && (
                        <span className="px-4 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-lg">
                          Approved
                        </span>
                      )}
                      {request.accessStatus === 'rejected' && (
                        <span className="px-4 py-2 bg-red-100 text-red-700 text-sm font-semibold rounded-lg">
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}