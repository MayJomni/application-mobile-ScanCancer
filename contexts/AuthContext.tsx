import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * DermaScan — Enhanced Authentication Context
 * Doctor-focused secure authentication with medical credentials
 */

export interface DoctorProfile {
  id: string;
  name: string;
  email: string;
  role: 'doctor' | 'resident' | 'specialist';
  specialty: string;
  licenseNumber: string;     // RPPS or equivalent
  hospital: string;
  skinType?: number;         // Fitzpatrick 1-6
  yearsExperience?: number;
  avatarInitials: string;
  createdAt: string;
  lastLoginAt: string;
}

interface AuthContextType {
  user: DoctorProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<DoctorProfile>) => void;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'doctor' | 'resident' | 'specialist';
  specialty: string;
  licenseNumber: string;
  hospital: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo doctors database — realistic medical credentials
const DEMO_DOCTORS: (DoctorProfile & { password: string })[] = [
  {
    id: '1',
    email: 'dr.amira@dermascan.com',
    password: 'doctor123',
    name: 'Dr. Amira Behi',
    role: 'specialist',
    specialty: 'Dermatologie',
    licenseNumber: 'RPPS-10003456789',
    hospital: 'CHU Tunis — Service Dermatologie',
    skinType: 3,
    yearsExperience: 8,
    avatarInitials: 'AB',
    createdAt: '2025-09-15',
    lastLoginAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'dr.mohamed@dermascan.com',
    password: 'doctor123',
    name: 'Dr. Mohamed Karim',
    role: 'doctor',
    specialty: 'Médecine Générale',
    licenseNumber: 'RPPS-10007891234',
    hospital: 'Clinique El Manar',
    skinType: 4,
    yearsExperience: 5,
    avatarInitials: 'MK',
    createdAt: '2026-01-10',
    lastLoginAt: new Date().toISOString(),
  },
];

function getInitials(name: string): string {
  return name
    .replace(/^(Dr\.\s*|Pr\.\s*)/i, '')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking stored secure token
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    // Simulate secure API call
    await new Promise(r => setTimeout(r, 1200));

    const found = DEMO_DOCTORS.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...profile } = found;
      setUser({ ...profile, lastLoginAt: new Date().toISOString() });
      setIsLoading(false);
      return { success: true };
    }
    setIsLoading(false);
    return { success: false, error: 'Identifiants incorrects. Vérifiez votre email et mot de passe.' };
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1500));

    // Validate license number format
    if (!data.licenseNumber || data.licenseNumber.length < 5) {
      setIsLoading(false);
      return { success: false, error: 'Numéro de licence médicale invalide.' };
    }

    // Simulate checking for existing email
    if (DEMO_DOCTORS.some(u => u.email === data.email)) {
      setIsLoading(false);
      return { success: false, error: 'Un compte avec cet email existe déjà.' };
    }

    const newDoctor: DoctorProfile = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      role: data.role,
      specialty: data.specialty,
      licenseNumber: data.licenseNumber,
      hospital: data.hospital,
      avatarInitials: getInitials(data.name),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    setUser(newDoctor);
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updates: Partial<DoctorProfile>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
