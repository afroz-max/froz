import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, XCircle, Mail, MapPin, ArrowRight } from 'lucide-react';
import { CollaborationRequest } from '../types';
import { apiFetch } from '../lib/api';

interface MyRequestsProps {
  onGoToSearch: () => void;
}

export const MyRequests: React.FC<MyRequestsProps> = ({ onGoToSearch }) => {
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
  const [sentRequests, setSentRequests] = useState<CollaborationRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<CollaborationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const [sentRes, receivedRes] = await Promise.all([
        apiFetch('/api/requests/sent'),
        apiFetch('/api/requests/received')
      ]);

      const sentData = await sentRes.json();
      const receivedData = await receivedRes.json();

      if (!sentRes.ok) throw new Error(sentData.error || 'Failed to load sent requests');
      if (!receivedRes.ok) throw new Error(receivedData.error || 'Failed to load received requests');

      setSentRequests(sentData.requests || []);
      setReceivedRequests(receivedData.requests || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (requestId: number, action: 'accept' | 'decline') => {
    setActionLoading(requestId);
    try {
      const res = await apiFetch(`/api/requests/${requestId}/${action}`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${action} request`);

      // Refresh requests list
      await fetchRequests();
    } catch (err: any) {
      setError(err.message || `Failed to ${action} request`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Accepted':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Accepted</span>
          </span>
        );
      case 'Declined':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-200">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Declined</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 tracking-tight">My Requests</h1>
        <p className="mt-2 text-stone-600">
          Track collaboration requests you have sent to professionals and manage requests received for your services.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-stone-200 mb-8">
        <button
          onClick={() => setActiveTab('sent')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'sent'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Sent Requests ({sentRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('received')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'received'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Received Requests ({receivedRequests.length})
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-stone-900 border-t-transparent"></div>
          <p className="mt-4 text-sm text-stone-600">Loading requests...</p>
        </div>
      ) : activeTab === 'sent' ? (
        /* SENT REQUESTS */
        <div>
          {sentRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
              <FileText className="w-12 h-12 text-stone-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-stone-900 mb-2">No sent requests yet</h3>
              <p className="text-sm text-stone-600 max-w-md mx-auto mb-6">
                You haven't sent any collaboration requests to professionals yet. Find someone who can help with your tasks!
              </p>
              <button
                onClick={onGoToSearch}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-stone-900 text-white text-sm font-semibold rounded-xl"
              >
                <span>Find Help & Professionals</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sentRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-stone-100">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-bold text-stone-900">{req.professional_name}</h3>
                        {getStatusBadge(req.status)}
                      </div>
                      <p className="text-xs text-stone-500 mt-1 flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        {req.area}, {req.city} • Service: <span className="font-semibold text-stone-700 ml-1">{req.service}</span>
                      </p>
                    </div>
                    <div className="text-xs text-stone-400">
                      Sent on: {new Date(req.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-1">Your Message:</span>
                    <p className="text-sm text-stone-700 bg-stone-50 p-3.5 rounded-xl border border-stone-100 leading-relaxed">
                      {req.message}
                    </p>
                  </div>

                  {req.status === 'Accepted' && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-emerald-800 text-sm font-medium">
                        <Mail className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Professional accepted! You can now contact them directly at: <strong className="underline">{req.professional_email}</strong></span>
                      </div>
                    </div>
                  )}

                  {req.status === 'Declined' && (
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-500">
                      This request was declined by the professional. You can reach out to other available professionals.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* RECEIVED REQUESTS */
        <div>
          {receivedRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
              <FileText className="w-12 h-12 text-stone-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-stone-900 mb-2">No received requests yet</h3>
              <p className="text-sm text-stone-600 max-w-md mx-auto mb-6">
                You haven't received any collaboration requests for your professional profile yet. Make sure your profile is active and visible in search results!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {receivedRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-stone-100">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-bold text-stone-900">From: {req.sender_name}</h3>
                        {getStatusBadge(req.status)}
                      </div>
                      <p className="text-xs text-stone-500 mt-1">
                        Service Requested: <span className="font-semibold text-stone-800">{req.service}</span> • Profile: {req.professional_name}
                      </p>
                    </div>
                    <div className="text-xs text-stone-400">
                      Received: {new Date(req.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-1">Message:</span>
                    <p className="text-sm text-stone-700 bg-stone-50 p-3.5 rounded-xl border border-stone-100 leading-relaxed">
                      {req.message}
                    </p>
                  </div>

                  {req.status === 'Pending' && (
                    <div className="flex items-center justify-end space-x-3 pt-2">
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'decline')}
                        disabled={actionLoading === req.id}
                        className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'accept')}
                        disabled={actionLoading === req.id}
                        className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                      >
                        {actionLoading === req.id ? 'Processing...' : 'Accept Request'}
                      </button>
                    </div>
                  )}

                  {req.status === 'Accepted' && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-emerald-800 text-sm font-medium">
                        <Mail className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>You accepted this request. Contact sender directly at: <strong className="underline">{req.sender_email}</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
