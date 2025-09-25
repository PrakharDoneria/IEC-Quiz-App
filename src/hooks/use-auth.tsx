
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
    let unsubscribeSnapshot: Unsubscribe | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      // If there's a user, we need to fetch their profile.
      if (currentUser) {
        setLoading(true);
        const userDocRef = doc(firestore, 'users', currentUser.uid);
        
        // Clean up previous listener if it exists
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
        }

        unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUserProfile(doc.data() as UserProfile);
          } else {
            // This case handles admins who might not have a user doc,
            // or if the doc hasn't been created yet.
            setUserProfile(null);
          }
          // We have a user and we have their profile info (or lack thereof). We're done loading.
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
          setLoading(false); // Also stop loading on error.
        });
      } else {
        // No user, so we are definitely done loading.
        setUserProfile(null);
        setLoading(false);
        // Clean up listener if the user logs out.
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
        }
      }
    });

    // Cleanup function to unsubscribe from both listeners on component unmount
    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  const value = { user, userProfile, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
