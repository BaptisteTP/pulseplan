import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveAthleteProfile, fetchAthleteProfile } from '../services/api';

const ProfileContext = createContext(null);

const DEFAULT_PROFILE = {
  name: 'Alexandre Renard',
  email: 'alex.renard@endurance.io',
  level: 'Intermédiaire',
  hasPowerMeter: false,
  vma: '16.0',
  ftp: '250',
  fcMax: '185',
  fcRepos: '48',
  weeklyHoursLimit: '10',
  currentDiscipline: 'running',
  currentDistance: 'marathon',
  targetTime: '03:30:00',
  daysPerWeek: 4
};

const STORAGE_KEY = 'pulseplan_athlete_profile';
const AUTH_KEY = 'pulseplan_auth_token';

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch (e) {
      return DEFAULT_PROFILE;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      saveAthleteProfile(profile);
    } catch (e) {
      console.error(e);
    }
  }, [profile]);

  const updateProfile = (fields) => {
    setProfile(prev => ({ ...prev, ...fields }));
  };

  const login = (email, password) => {
    // In production, this calls backend /api/auth/login with JWT
    const authenticatedUser = {
      id: 'usr_' + Date.now(),
      email,
      name: email.split('@')[0],
      token: 'jwt_mock_' + Math.random().toString(36).substring(2)
    };
    setUser(authenticatedUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(authenticatedUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  };

  return (
    <ProfileContext.Provider value={{ 
      profile, 
      updateProfile,
      user,
      isAuthenticated: Boolean(user),
      login,
      logout
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within a ProfileProvider');
  return context;
}
