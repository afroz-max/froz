import React from 'react';
import { X, Terminal, Database, Shield, CheckCircle } from 'lucide-react';

interface InstructionsModalProps {
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200">
          <div className="flex items-center space-x-2">
            <Terminal className="w-6 h-6 text-stone-900" />
            <h2 className="text-xl font-bold text-stone-900">FROZ - Setup & Testing Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-sm text-stone-700">
          <div>
            <h3 className="font-bold text-stone-900 text-base mb-2 flex items-center">
              <span className="w-6 h-6 bg-stone-900 text-white rounded-full flex items-center justify-center text-xs mr-2">1</span>
              Installing Dependencies
            </h3>
            <p className="text-stone-600 mb-2">
              Dependencies are automatically managed via package.json. To install or reinstall packages:
            </p>
            <pre className="bg-stone-900 text-stone-100 p-3 rounded-lg text-xs font-mono overflow-x-auto">
              npm install
            </pre>
          </div>

          <div>
            <h3 className="font-bold text-stone-900 text-base mb-2 flex items-center">
              <span className="w-6 h-6 bg-stone-900 text-white rounded-full flex items-center justify-center text-xs mr-2">2</span>
              PostgreSQL Database Setup & Creation
            </h3>
            <p className="text-stone-600 mb-2">
              Ensure PostgreSQL is installed and running on your system or cloud instance (e.g. Cloud SQL, Neon, Supabase, local Postgres):
            </p>
            <pre className="bg-stone-900 text-stone-100 p-3 rounded-lg text-xs font-mono overflow-x-auto">
              # Create database in PostgreSQL{'\n'}
              createdb froz_db{'\n'}
              # Or via psql:{'\n'}
              CREATE DATABASE froz_db;
            </pre>
          </div>

          <div>
            <h3 className="font-bold text-stone-900 text-base mb-2 flex items-center">
              <span className="w-6 h-6 bg-stone-900 text-white rounded-full flex items-center justify-center text-xs mr-2">3</span>
              Setting Environment Variables
            </h3>
            <p className="text-stone-600 mb-2">
              Configure your environment variables in <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-900 font-mono">.env.example</code> or a <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-900 font-mono">.env</code> file:
            </p>
            <pre className="bg-stone-900 text-stone-100 p-3 rounded-lg text-xs font-mono overflow-x-auto">
              DATABASE_URL="postgresql://username:password@host:port/database"{'\n'}
              JWT_SECRET="replace_with_a_long_random_secret"
            </pre>
          </div>

          <div>
            <h3 className="font-bold text-stone-900 text-base mb-2 flex items-center">
              <span className="w-6 h-6 bg-stone-900 text-white rounded-full flex items-center justify-center text-xs mr-2">4</span>
              Running the Application
            </h3>
            <p className="text-stone-600 mb-2">
              Start the full-stack development server (Express backend + Vite middleware on port 3000):
            </p>
            <pre className="bg-stone-900 text-stone-100 p-3 rounded-lg text-xs font-mono overflow-x-auto">
              npm run dev
            </pre>
            <p className="text-stone-600 mt-2">
              For production build & start:
            </p>
            <pre className="bg-stone-900 text-stone-100 p-3 rounded-lg text-xs font-mono overflow-x-auto">
              npm run build{'\n'}
              npm start
            </pre>
          </div>

          <div>
            <h3 className="font-bold text-stone-900 text-base mb-2 flex items-center">
              <span className="w-6 h-6 bg-stone-900 text-white rounded-full flex items-center justify-center text-xs mr-2">5</span>
              Testing the Platform
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
              <li><strong>Registration & Login:</strong> Click "Create Account", register a new user with secure password hashing, and test login/logout.</li>
              <li><strong>Professional Profile:</strong> Click "Offer Your Skills" to create a professional profile (Record Writing, Website Making, etc.) with city, area, and expected price in ₹.</li>
              <li><strong>Search:</strong> Use "Find Help" to search for real professionals by service category or city/area.</li>
              <li><strong>Collaboration Requests:</strong> View a profile and click "Send Request". Check "My Requests" to see sent/received requests, accept or decline, and unlock direct email communication upon acceptance.</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-stone-900 text-white font-semibold rounded-xl text-sm"
          >
            Got it, close guide
          </button>
        </div>
      </div>
    </div>
  );
};
