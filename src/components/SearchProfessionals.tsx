import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, IndianRupee, ExternalLink, Filter, ChevronRight } from 'lucide-react';
import { ProfessionalProfile } from '../types';
import { apiFetch } from '../lib/api';

interface SearchProfessionalsProps {
  onSelectProfile: (profileId: number) => void;
  initialCategory?: string;
}

const SERVICE_CATEGORIES = [
  'All',
  'Notebook / Record Writing',
  'Website Making',
  'Web Development',
  'Assignment Help',
  'Notes',
  'Printing',
  'Design',
  'Other Services',
];

export const SearchProfessionals: React.FC<SearchProfessionalsProps> = ({ onSelectProfile, initialCategory }) => {
  const [serviceCategory, setServiceCategory] = useState(initialCategory || 'All');
  const [skillQuery, setSkillQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [areaQuery, setAreaQuery] = useState('');

  const [profiles, setProfiles] = useState<ProfessionalProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (serviceCategory && serviceCategory !== 'All') params.append('service_category', serviceCategory);
      if (skillQuery.trim()) params.append('skill', skillQuery.trim());
      if (cityQuery.trim()) params.append('city', cityQuery.trim());
      if (areaQuery.trim()) params.append('area', areaQuery.trim());

      const res = await apiFetch(`/api/profiles/search?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to search professionals');

      setProfiles(data.profiles || []);
      setSearched(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while searching.');
    } finally {
      setLoading(false);
    }
  };

  // Run initial search on mount (or when initialCategory changes)
  useEffect(() => {
    handleSearch();
  }, [initialCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Find Help & Services</h1>
        <p className="mt-2 text-stone-600">
          Search nearby professionals by service category, skill, city, or locality.
        </p>
      </div>

      {/* Search Filter Box */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm mb-10">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
              Service Category
            </label>
            <select
              value={serviceCategory}
              onChange={(e) => setServiceCategory(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2.5 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
            >
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
              Skill or Keyword
            </label>
            <input
              type="text"
              value={skillQuery}
              onChange={(e) => setSkillQuery(e.target.value)}
              placeholder="e.g. Record Writing, React"
              className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2.5 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
              City
            </label>
            <input
              type="text"
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              placeholder="e.g. Hyderabad"
              className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2.5 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
              Area / Locality
            </label>
            <input
              type="text"
              value={areaQuery}
              onChange={(e) => setAreaQuery(e.target.value)}
              placeholder="e.g. Ameerpet"
              className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2.5 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Searching...' : 'Search Professionals'}</span>
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Results Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-stone-900">
            Available Professionals ({profiles.length})
          </h2>
          <span className="text-xs text-stone-500">
            Real profiles from database (No placeholders)
          </span>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-stone-900 border-t-transparent"></div>
            <p className="mt-4 text-sm text-stone-600">Loading professional profiles...</p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
            <Briefcase className="w-12 h-12 text-stone-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-stone-900 mb-2">No professionals found</h3>
            <p className="text-sm text-stone-600 max-w-md mx-auto mb-6">
              No matching professionals found for your search criteria. Try broadening your location or skill keywords, or offer your own skills!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                onClick={() => onSelectProfile(profile.id)}
                className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md hover:border-stone-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start space-x-4 mb-4">
                    {profile.profile_picture ? (
                      <img
                        src={profile.profile_picture}
                        alt={profile.professional_name}
                        className="w-14 h-14 rounded-full object-cover border border-stone-200"
                        onError={(e) => {
                          // fallback if image url fails
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-lg border border-stone-200">
                        {profile.professional_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-stone-900 truncate">
                        {profile.professional_name}
                      </h3>
                      <p className="text-xs font-semibold text-stone-700 mt-0.5">
                        {profile.service_category}
                      </p>
                      <div className="flex items-center text-xs text-stone-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                        <span className="truncate">{profile.area}, {profile.city}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-stone-600 line-clamp-2 mb-4 leading-relaxed">
                    {profile.short_description}
                  </p>

                  <div className="mb-4">
                    <span className="text-xs font-semibold text-stone-500 block mb-1.5">Skills:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.skills.split(',').map((s, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-stone-100 text-stone-800 px-2.5 py-1 rounded-md font-medium"
                        >
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between mt-2">
                  <div>
                    <span className="text-xs text-stone-500 block">Experience</span>
                    <span className="text-sm font-bold text-stone-900">{profile.experience}</span>
                  </div>
                  {profile.expected_price !== null && profile.expected_price !== undefined ? (
                    <div className="text-right">
                      <span className="text-xs text-stone-500 block">Expected Price</span>
                      <span className="text-sm font-bold text-stone-900 flex items-center justify-end">
                        ₹{Number(profile.expected_price).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="text-xs text-stone-400">Price negotiable</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
