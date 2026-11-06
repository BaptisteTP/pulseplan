import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  saveAthleteProfile, 
  fetchAthleteProfile, 
  loginUserApi,
  savePlanToBackend,
  fetchPlanFromBackend
} from '../services/api';

const ProfileContext = createContext(null);

const DEFAULT_PROFILE = {
  name: '',
  email: '',
  level: 'Intermédiaire',
  swimLevel: 'intermediaire', // 'debutant' | 'intermediaire' | 'avance'
  hasPowerMeter: false,
  vma: '',
  ftp: '',
  fcMax: '',
  fcRepos: '',
  weeklyHoursLimit: '10',
  currentDiscipline: 'running',
  currentDistance: 'marathon',
  targetTime: '',
  raceDate: '',
  daysPerWeek: 4
};

const STORAGE_KEY = 'pulseplan_athlete_profile';
const AUTH_KEY = 'pulseplan_auth_token';

export function ProfileProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [cloudPlan, setCloudPlan] = useState(null);

  useEffect(() => {
    if (user && user.email) {
      let isMounted = true;
      fetchAthleteProfile(user.email).then(remoteProfile => {
        if (isMounted && remoteProfile) {
          setProfile(prev => ({ ...prev, ...remoteProfile }));
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...profile, ...remoteProfile }));
        }
      });
      fetchPlanFromBackend(user.email).then(remotePlan => {
        if (isMounted && remotePlan) {
          setCloudPlan(remotePlan);
        }
      });
      return () => { isMounted = false; };
    }
  }, [user?.email]);

  const updateProfile = (fields) => {
    setProfile(prev => {
      const updated = { ...prev, ...fields };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      if (user?.email) {
        saveAthleteProfile(updated, user.email);
      }
      return updated;
    });
  };

  const login = async (email, password, athleteName) => {
    const finalName = athleteName || (profile.name ? profile.name : email.split('@')[0]);
    const backendRes = await loginUserApi(email, password, finalName);
    
    let authenticatedUser;
    let initialProfile = { ...DEFAULT_PROFILE, email, name: finalName };

    if (backendRes && backendRes.success) {
      authenticatedUser = backendRes.user;
      if (backendRes.profile) {
        initialProfile = { ...initialProfile, ...backendRes.profile };
      }
      if (backendRes.currentPlan) {
        setCloudPlan(backendRes.currentPlan);
      }
    } else {
      authenticatedUser = {
        id: 'usr_' + Date.now(),
        email,
        name: finalName,
        token: 'jwt_mock_' + Math.random().toString(36).substring(2)
      };
    }

    setUser(authenticatedUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(authenticatedUser));
    setProfile(initialProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProfile));
    
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setProfile(DEFAULT_PROFILE);
    setCloudPlan(null);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(STORAGE_KEY);
  };

  const saveUserPlan = (plan) => {
    setCloudPlan(plan);
    if (user?.email) {
      savePlanToBackend(user.email, plan);
    }
  };

  return (
    <ProfileContext.Provider value={{ 
      profile, 
      updateProfile,
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      cloudPlan,
      saveUserPlan
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
