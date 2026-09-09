import React, { useState, useEffect } from 'react';
import { Briefcase, Eye, EyeOff, Trash2, Edit3, Plus, MapPin, CheckCircle2, Upload, User as UserIcon, Sparkles } from 'lucide-react';
import { ProfessionalProfile, User } from '../types';
import { apiFetch } from '../lib/api';

interface ManageProfileProps {
  user: User;
}

const SERVICE_CATEGORIES = [
  'Website Making',
  'Record / Notebook Writing',
  'Design',
  'Printing',
  'Notes',
  'Other',
];

export const ManageProfile: React.FC<ManageProfileProps> = ({ user }) => {
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Simplified Creation Form States
  const [professionalName, setProfessionalName] = useState(user.name || '');
  const [profilePicture, setProfilePicture] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [skills, setSkills] = useState('');
  const [serviceCategory, setServiceCategory] = useState(SERVICE_CATEGORIES[0]);

  // Optional Extra States (only shown in Edit mode)
  const [shortDescription, setShortDescription] = useState('');
  const [experience, setExperience] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchMyProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/api/profiles/me/detail');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load profile');

      if (data.profile) {
        setProfile(data.profile);
        setProfessionalName(data.profile.professional_name || user.name);
        setProfilePicture(data.profile.profile_picture || '');
        setCity(data.profile.city || '');
        setArea(data.profile.area || '');
        setSkills(data.profile.skills || '');
        setServiceCategory(data.profile.service_category || SERVICE_CATEGORIES[0]);
        setShortDescription(data.profile.short_description || '');
        setExperience(data.profile.experience || '');
        setPortfolio(data.profile.portfolio || '');
        setExpectedPrice(data.profile.expected_price ? String(data.profile.expected_price) : '');
      } else {
        setProfile(null);
        setIsEditing(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please choose an image file.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('Profile images must be 2 MB or smaller.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const payload = {
        profile_picture: profilePicture,
        professional_name: professionalName,
        city,
        area,
        skills,
        service_category: serviceCategory,
        short_description: profile ? shortDescription : '',
        experience: profile ? experience : '',
        portfolio: profile ? portfolio : '',
        expected_price: profile && expectedPrice ? parseFloat(expectedPrice) : null,
      };

      let res;
      if (profile) {
        res = await apiFetch(`/api/profiles/${profile.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...payload,
            short_description: shortDescription || `Available for ${serviceCategory} in ${area}, ${city}`,
            experience: experience || 'Available',
          }),
        });
      } else {
        res = await apiFetch('/api/profiles', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save profile');

      setProfile(data.profile);
      setIsEditing(false);
      setSuccessMessage(profile ? 'Profile updated successfully!' : 'Profile created successfully! You are now visible to nearby users.');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async () => {
    if (!profile) return;
    setError('');
    try {
      const res = await apiFetch(`/api/profiles/${profile.id}/visibility`, {
        method: 'PATCH',
        body: JSON.stringify({ is_hidden: !profile.is_hidden }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update visibility');

      setProfile(data.profile);
      setSuccessMessage(`Profile is now ${data.profile.is_hidden ? 'Hidden' : 'Active and Visible'}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update visibility');
    }
  };

  const handleDeleteProfile = async () => {
    if (!profile) return;
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await apiFetch(`/api/profiles/${profile.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not delete your profile. Please try again.');

      setProfile(null);
      setIsEditing(true);
      setSuccessMessage('Professional profile deleted successfully.');
      setShowDeleteModal(false);
      setProfessionalName(user.name || '');
      setProfilePicture('');
      setCity('');
      setArea('');
      setSkills('');
      setServiceCategory(SERVICE_CATEGORIES[0]);
    } catch (err: any) {
      setError(err.message || 'Could not delete your profile. Please try again.');
      setShowDeleteModal(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile && !isEditing) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-stone-900 border-t-transparent"></div>
        <p className="mt-4 text-sm text-stone-600">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 text-center sm:text-left">
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-stone-100 text-stone-800 text-xs font-semibold rounded-full mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Offer Your Help Nearby</span>
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
          {profile && !isEditing ? 'My Profile' : profile ? 'Edit Profile' : 'Create Your Simple Profile'}
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          {profile && !isEditing
            ? 'Manage how nearby students and users see your services.'
            : 'Fill in these simple details so people nearby can connect with you.'}
        </p>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {profile && !isEditing ? (
        /* VIEW PROFILE */
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
            {profile.profile_picture ? (
              <img
                src={profile.profile_picture}
                alt={profile.professional_name}
                className="w-20 h-20 rounded-full object-cover border-2 border-stone-300 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-2xl border-2 border-stone-300">
                {profile.professional_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-xl font-bold text-stone-900">{profile.professional_name}</h2>
                <span className={`text-xs px-3 py-1 rounded-full font-medium inline-block w-fit mx-auto sm:mx-0 ${profile.is_hidden ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {profile.is_hidden ? 'Hidden from Search' : 'Active & Visible'}
                </span>
              </div>
              <p className="text-sm font-semibold text-stone-800 mt-1">{profile.service_category}</p>
              <p className="text-xs text-stone-500 mt-1 flex items-center justify-center sm:justify-start">
                <MapPin className="w-3.5 h-3.5 mr-1 text-stone-400" />
                {profile.area}, {profile.city}
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Your Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.split(',').map((s, idx) => (
                  <span key={idx} className="text-xs bg-stone-100 text-stone-800 px-3 py-1 rounded-lg font-medium">
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>

            {profile.short_description && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">About / Description</h3>
                <p className="text-sm text-stone-700 leading-relaxed">{profile.short_description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-100 text-sm">
              <div>
                <span className="text-xs font-semibold text-stone-400 block mb-1">Experience</span>
                <span className="text-stone-800 font-medium">{profile.experience || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-stone-400 block mb-1">Expected Price</span>
                <span className="text-stone-800 font-medium">
                  {profile.expected_price ? `₹${Number(profile.expected_price).toLocaleString('en-IN')}` : 'Flexible / Discuss'}
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  onClick={handleToggleVisibility}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                    profile.is_hidden
                      ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {profile.is_hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{profile.is_hidden ? 'Show Profile' : 'Hide Profile'}</span>
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              </div>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center space-x-1 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Profile</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* SIMPLIFIED CREATE / EDIT FORM */
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* 1. Profile Photo */}
            <div>
              <label className="block text-sm font-semibold text-stone-900 mb-1">
                1. Profile Photo <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <p className="text-xs text-stone-500 mb-3">Upload a photo using Choose File so people can recognize you.</p>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile Preview" className="w-20 h-20 rounded-full object-cover border-2 border-stone-300 shadow-sm flex-shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center border-2 border-stone-300 shadow-sm flex-shrink-0">
                    <UserIcon className="w-8 h-8" />
                  </div>
                )}
                <div className="flex-1 w-full space-y-3 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <label className="cursor-pointer inline-flex items-center space-x-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm">
                      <Upload className="w-4 h-4" />
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    {profilePicture && (
                      <button
                        type="button"
                        onClick={() => setProfilePicture('')}
                        className="inline-flex items-center space-x-1 px-3 py-2 bg-stone-100 hover:bg-red-50 text-red-600 text-xs font-semibold rounded-xl transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Photo</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-stone-400">Supports JPG, PNG or WEBP (Max recommended size: 2MB).</p>
                </div>
              </div>
            </div>

            <hr className="border-stone-100" />

            {/* 2. Your Name */}
            <div>
              <label className="block text-sm font-semibold text-stone-900 mb-1">
                2. Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={professionalName}
                onChange={(e) => setProfessionalName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>

            {/* 3. What can you help with? */}
            <div>
              <label className="block text-sm font-semibold text-stone-900 mb-1">
                3. What can you help with? <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-stone-500 mb-2">Choose the main service you want to offer.</p>
              <select
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 font-medium"
              >
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Your Skills */}
            <div>
              <label className="block text-sm font-semibold text-stone-900 mb-1">
                4. Your Skills <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-stone-500 mb-2">Enter what you are good at, separated by commas.</p>
              <input
                type="text"
                required
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. Record Writing, Assignment Help, Neat Handwriting, Python"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>

            {/* 5. Location */}
            <div>
              <label className="block text-sm font-semibold text-stone-900 mb-1">
                5. Location <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-stone-500 mb-3">Where are you located? <span className="font-medium text-stone-700">No exact home address needed.</span></p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City (e.g. Hyderabad)"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="Area / Locality (e.g. Ameerpet)"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>
            </div>

            {/* Optional Extra Details (Only when editing or if desired) */}
            {profile && (
              <div className="pt-4 border-t border-stone-200 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Optional Additional Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">About / Short Description</label>
                  <textarea
                    rows={2}
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Write a few words about your availability or services..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Experience (Optional)</label>
                    <input
                      type="text"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="e.g. 1 year / 10+ records completed"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Expected Price in ₹ (Optional)</label>
                    <input
                      type="number"
                      value={expectedPrice}
                      onChange={(e) => setExpectedPrice(e.target.value)}
                      placeholder="e.g. 300"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Portfolio / Link (Optional)</label>
                  <input
                    type="url"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-stone-200">
              {profile && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : profile ? 'Save Changes' : 'Create Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <h3 className="text-lg font-bold text-stone-900 mb-2">Delete your professional profile?</h3>
            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
              Your professional profile will be removed from FROZ. Your FROZ account will NOT be deleted.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProfile}
                disabled={loading}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete Profile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
