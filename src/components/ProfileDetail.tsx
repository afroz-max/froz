import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Briefcase, IndianRupee, ExternalLink, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { ProfessionalProfile } from '../types';
import { apiFetch } from '../lib/api';

interface ProfileDetailProps {
  profileId: number;
  onBack: () => void;
  onGoToRequests: () => void;
}

export const ProfileDetail: React.FC<ProfileDetailProps> = ({ profileId, onBack, onGoToRequests }) => {
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Request modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [service, setService] = useState('');
  const [message, setMessage] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [profileId]);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`/api/profiles/${profileId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load profile');
      setProfile(data.profile);
      if (data.profile && data.profile.service_category) {
        setService(data.profile.service_category);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load professional profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSubmitting(true);
    setRequestError('');

    try {
      const res = await apiFetch('/api/requests', {
        method: 'POST',
        body: JSON.stringify({
          professional_id: profileId,
          service,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send collaboration request');

      setRequestSuccess(true);
    } catch (err: any) {
      setRequestError(err.message || 'Failed to send request.');
    } finally {
      setRequestSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-stone-900 border-t-transparent"></div>
        <p className="mt-4 text-sm text-stone-600">Loading professional profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl mb-6">
          {error || 'Profile not found.'}
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Search</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-2 text-sm font-semibold text-stone-600 hover:text-stone-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to search results</span>
      </button>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            {profile.profile_picture ? (
              <img
                src={profile.profile_picture}
                alt={profile.professional_name}
                className="w-20 h-20 rounded-full object-cover border-2 border-stone-200 shadow-sm"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-stone-100 text-stone-800 flex items-center justify-center font-bold text-2xl border-2 border-stone-200">
                {profile.professional_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-stone-900">{profile.professional_name}</h1>
              <p className="text-sm font-semibold text-stone-700 mt-1">{profile.service_category}</p>
              <div className="flex items-center text-xs text-stone-500 mt-1.5">
                <MapPin className="w-4 h-4 mr-1 text-stone-400" />
                <span>{profile.area}, {profile.city} (Exact address hidden for privacy)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowRequestModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>Send Request</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* About / Description */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">About</h2>
            <p className="text-stone-700 leading-relaxed whitespace-pre-line text-base">
              {profile.short_description}
            </p>
          </div>

          {/* Skills & Services */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-stone-100">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2.5">Skills & Services</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.split(',').map((s, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-stone-100 text-stone-800 px-3 py-1.5 rounded-lg font-medium"
                  >
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2.5">Experience</h2>
              <p className="text-sm font-semibold text-stone-900">{profile.experience}</p>
            </div>
          </div>

          {/* Portfolio & Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-stone-100">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">Portfolio / Work Links</h2>
              {profile.portfolio ? (
                <a
                  href={profile.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-sm font-medium text-stone-900 hover:underline bg-stone-50 border border-stone-200 px-3.5 py-2 rounded-lg"
                >
                  <ExternalLink className="w-4 h-4 text-stone-500" />
                  <span className="truncate max-w-xs">{profile.portfolio}</span>
                </a>
              ) : (
                <p className="text-sm text-stone-500">No portfolio links provided.</p>
              )}
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">Expected Price (Optional)</h2>
              {profile.expected_price !== null && profile.expected_price !== undefined ? (
                <div>
                  <div className="text-lg font-bold text-stone-900 flex items-center">
                    ₹{Number(profile.expected_price).toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mt-2">
                    Final price is decided by both users.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-stone-500">Price not specified (Discuss directly)</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Send Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-stone-200">
            {requestSuccess ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">Request Sent Successfully!</h3>
                <p className="text-sm text-stone-600 mb-6 leading-relaxed">
                  Your collaboration request has been sent to {profile.professional_name}. Private contact details will open once the professional accepts your request.
                </p>
                <div className="flex space-x-3 justify-center">
                  <button
                    onClick={() => {
                      setShowRequestModal(false);
                      onGoToRequests();
                    }}
                    className="px-5 py-2.5 bg-stone-900 text-white font-semibold rounded-xl text-sm"
                  >
                    View My Requests
                  </button>
                  <button
                    onClick={() => {
                      setShowRequestModal(false);
                      setRequestSuccess(false);
                    }}
                    className="px-5 py-2.5 bg-stone-100 text-stone-800 font-semibold rounded-xl text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-stone-900">
                    Send Collaboration Request
                  </h3>
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="text-stone-400 hover:text-stone-600 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-xs text-stone-500 mb-6">
                  To: <span className="font-semibold text-stone-800">{profile.professional_name}</span> ({profile.city})
                </p>

                {requestError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                    {requestError}
                  </div>
                )}

                <form onSubmit={handleSendRequest} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                      Service Requested
                    </label>
                    <input
                      type="text"
                      required
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      placeholder="e.g. Record Writing"
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                      Message / Project Details
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe what help you need, timeline, or expected deliverables..."
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg p-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>

                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-600">
                    Note: Private contact details are kept secure until the professional accepts your request.
                  </div>

                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowRequestModal(false)}
                      className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-semibold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={requestSubmitting}
                      className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold rounded-xl disabled:opacity-50"
                    >
                      {requestSubmitting ? 'Sending...' : 'Send Request Now'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
