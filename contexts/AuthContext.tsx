import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface DoctorProfile {
  id: string;
  name: string;
  email: string;
  role: 'doctor' | 'resident' | 'specialist';
  specialty: string;
  licenseNumber: string;
  hospital: string;
  skinType?: number;
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

interface StoredDoctor extends DoctorProfile {
  password: string;
}

const INITIAL_DOCTORS: StoredDoctor[] = [
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
    .replace(/^(Dr\.?\s*|Pr\.?\s*)/i, '')
    .split(' ')
    .filter(w => w.length > 0)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const doctorsRef = useRef<StoredDoctor[]>([...INITIAL_DOCTORS]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(r => setTimeout(r, 800));

    const trimmedEmail = email.trim().toLowerCase();
    const found = doctorsRef.current.find(
      u => u.email.toLowerCase() === trimmedEmail && u.password === password
    );

    if (found) {
      const { password: _, ...profile } = found;
      setUser({ ...profile, lastLoginAt: new Date().toISOString() });
      return { success: true };
    }

    const emailExists = doctorsRef.current.find(
      u => u.email.toLowerCase() === trimmedEmail
    );

    if (emailExists) {
      return { success: false, error: 'Mot de passe incorrect. Veuillez réessayer.' };
    }

    return {
      success: false,
      error: 'Aucun compte trouvé avec cet email. Veuillez créer un compte.',
    };
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    await new Promise(r => setTimeout(r, 800));

    if (!data.licenseNumber || data.licenseNumber.length < 5) {
      return { success: false, error: 'Numéro de licence invalide (minimum 5 caractères).' };
    }

    if (!data.password || data.password.length < 6) {
      return { success: false, error: 'Mot de passe trop court (minimum 6 caractères).' };
    }

    const trimmedEmail = data.email.trim().toLowerCase();
    if (doctorsRef.current.some(u => u.email.toLowerCase() === trimmedEmail)) {
      return { success: false, error: 'Un compte avec cet email existe déjà.' };
    }

    const newDoctor: StoredDoctor = {
      id: Date.now().toString(),
      name: data.name,
      email: trimmedEmail,
      password: data.password,
      role: data.role,
      specialty: data.specialty,
      licenseNumber: data.licenseNumber,
      hospital: data.hospital,
      avatarInitials: getInitials(data.name),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    doctorsRef.current.push(newDoctor);

    const { password: _, ...profile } = newDoctor;
    setUser(profile);
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
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateProfile,
    }}>
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
