'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { updateProfile, clearUpdateSuccess, clearProfileError } from '@/store/slices/profileSlice';
import { Loader2, Save, CheckCircle, AlertCircle, User, Mail, Lock } from 'lucide-react';

export default function ProfileEditForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, updating, updateSuccess, error } = useSelector(
    (state: RootState) => state.profile
  );

  const [name, setName] = useState(profile?.name ?? '');
  const [nameError, setNameError] = useState('');

  // Sync if profile loads after mount
  useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile?.name]);

  // Auto-clear success
  useEffect(() => {
    if (updateSuccess) {
      const t = setTimeout(() => dispatch(clearUpdateSuccess()), 3000);
      return () => clearTimeout(t);
    }
  }, [updateSuccess, dispatch]);

  // Clear API error when typing
  useEffect(() => {
    if (error) dispatch(clearProfileError());
  }, [name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }
    if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      return;
    }
    setNameError('');
    dispatch(updateProfile({ name: name.trim() }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-amber-50 ring-4 ring-amber-100 flex items-center justify-center">
          <User className="h-4 w-4 text-amber-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Personal Information</h3>
          <p className="text-xs text-slate-500">Update your display name</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name field */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError('');
            }}
            placeholder="Your full name"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              nameError ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50 focus:bg-white'
            }`}
          />
          {nameError && (
            <p className="text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {nameError}
            </p>
          )}
        </div>

        {/* Email — read-only */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="email"
              value={profile?.email ?? ''}
              readOnly
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-sm text-slate-500 cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-slate-400">Email cannot be changed</p>
        </div>
        {/* Feedback */}
        {updateSuccess && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            Profile updated successfully!
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={updating || name.trim() === profile?.name}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
}