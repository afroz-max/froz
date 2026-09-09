import React from 'react';
import { Search, Briefcase, FileText, ArrowRight, ShieldCheck, MapPin, CheckCircle2 } from 'lucide-react';
import { User } from '../types';

interface DashboardProps {
  user: User;
  setActiveTab: (tab: string) => void;
  onSelectCategory?: (category: string) => void;
}

const SERVICE_CATEGORIES = [
  { name: 'Notebook / Record Writing', desc: 'Neat handwriting & record completion' },
  { name: 'Website Making', desc: 'Frontend development & landing pages' },
  { name: 'Design', desc: 'Posters, slides & graphics' },
  { name: 'Printing', desc: 'Document prints & spiral binding' },
  { name: 'Notes', desc: 'Study notes & exam summaries' },
  { name: 'Other Services', desc: 'Miscellaneous local assistance' },
];

export const Dashboard: React.FC<DashboardProps> = ({ user, setActiveTab, onSelectCategory }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome Banner */}
      <div className="mb-10 text-center sm:text-left sm:flex sm:items-center sm:justify-between bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Hello, {user.name} 👋
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Welcome to FROZ. Find help nearby, share your skills, and work together.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center justify-center sm:justify-end space-x-3">
          <button
            onClick={() => setActiveTab('my-requests')}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-medium rounded-xl transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>My Requests</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-12 mb-12 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-stone-800 rounded-full opacity-50 pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-block bg-stone-800 text-stone-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            Find help nearby. Offer your skills. Work together.
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 leading-tight">
            Find Help. Share Skills. Work Nearby.
          </h2>
          <p className="text-stone-300 text-base sm:text-lg mb-8 leading-relaxed">
            FROZ helps you find nearby people for useful services and lets you offer your own skills to people in your city and locality.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => setActiveTab('search')}
              className="inline-flex items-center justify-center space-x-2 py-3.5 px-7 bg-white hover:bg-stone-100 text-stone-900 font-bold rounded-xl transition-colors shadow-sm text-sm sm:text-base"
            >
              <Search className="w-5 h-5" />
              <span>Find Help</span>
            </button>
            <button
              onClick={() => setActiveTab('manage-profile')}
              className="inline-flex items-center justify-center space-x-2 py-3.5 px-7 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded-xl transition-colors border border-stone-700 text-sm sm:text-base"
            >
              <Briefcase className="w-5 h-5" />
              <span>Offer Your Skills</span>
            </button>
          </div>
        </div>
      </div>

      {/* Nearby Services Category Grid */}
      <div className="mb-12">
        <div className="text-center sm:text-left mb-6">
          <h3 className="text-2xl font-bold text-stone-900 tracking-tight">Need something done nearby?</h3>
          <p className="text-sm text-stone-600 mt-1">Select a service category to find professionals near you.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICE_CATEGORIES.map((cat) => (
            <div
              key={cat.name}
              onClick={() => {
                if (onSelectCategory) onSelectCategory(cat.name);
                else setActiveTab('search');
              }}
              className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md hover:border-stone-900 cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 bg-stone-100 text-stone-900 rounded-xl flex items-center justify-center mb-4 group-hover:bg-stone-900 group-hover:text-white transition-colors">
                  <Search className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-stone-900 mb-1">{cat.name}</h4>
                <p className="text-xs text-stone-500 mb-4">{cat.desc}</p>
              </div>
              <div className="flex items-center text-xs font-semibold text-stone-900 group-hover:underline">
                <span>Browse {cat.name}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How FROZ Works */}
      <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 mb-12 shadow-sm">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h3 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">How FROZ Works</h3>
          <p className="text-sm text-stone-600 mt-2">Simple, direct collaboration for students and local community members.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Finding Help */}
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
            <h4 className="text-lg font-bold text-stone-900 mb-4 flex items-center space-x-2">
              <Search className="w-5 h-5 text-stone-900" />
              <span>For People Seeking Help</span>
            </h4>
            <ol className="space-y-4 text-sm text-stone-700">
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <div>
                  <strong className="text-stone-900 block font-semibold">Find a Service</strong>
                  <span>Browse categories or search by skill, city, and locality.</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="text-stone-900 block font-semibold">Choose Someone Nearby</strong>
                  <span>View professional profiles, skills, experience, and location.</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <div>
                  <strong className="text-stone-900 block font-semibold">Send a Request</strong>
                  <span>Submit your request directly with your contact email and message.</span>
                </div>
              </li>
            </ol>
          </div>

          {/* Offering Skills */}
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
            <h4 className="text-lg font-bold text-stone-900 mb-4 flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-stone-900" />
              <span>For Skilled Professionals</span>
            </h4>
            <ol className="space-y-4 text-sm text-stone-700">
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <div>
                  <strong className="text-stone-900 block font-semibold">Create Your Profile</strong>
                  <span>Add your name, photo, category, city, and locality.</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="text-stone-900 block font-semibold">Add Your Skills</strong>
                  <span>List your expertise, portfolio links, and expected pricing.</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <div>
                  <strong className="text-stone-900 block font-semibold">Get Requests</strong>
                  <span>Review incoming collaboration requests and accept or decline.</span>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Trust & Privacy Section */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-900">Your personal contact details stay private.</h3>
            <p className="text-xs sm:text-sm text-emerald-800 mt-0.5">
              Connect through FROZ instead of sharing your phone number immediately. No platform fees or hidden charges.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('search')}
          className="text-xs font-bold text-white bg-emerald-900 hover:bg-emerald-800 px-5 py-3 rounded-xl transition-colors whitespace-nowrap shadow-sm"
        >
          Find Help Now
        </button>
      </div>
    </div>
  );
};
