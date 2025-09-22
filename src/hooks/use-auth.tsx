
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';
import { UserProfile } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // If user logs out, we're not loading anymore
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    let unsubscribeSnapshot: Unsubscribe | undefined;

    if (user) {
      setLoading(true);
      const userDocRef = doc(firestore, 'users', user.uid);
      unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          setUserProfile(doc.data() as UserProfile);
        } else {
          // This allows admins to exist without a user profile doc
          setUserProfile(null);
        }
        setLoading(false);
      }, (error) => {
        console.error("Error fetching user profile:", error);
        setUserProfile(null);
        setLoading(false);
      });
    } else {
      // User is logged out, clear profile and set loading to false
      setUserProfile(null);
      setLoading(false);
    }
    
    // Cleanup function to unsubscribe from the snapshot listener
    return () => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, [user]);

  const value = { user, userProfile, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
