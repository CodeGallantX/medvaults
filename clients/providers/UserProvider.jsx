// providers/UserProvider.js
import React, { useEffect } from 'react';
import { useUserStore } from '../stores/userStore';

export const UserProvider = ({ children }) => {
  const fetchUserData = useUserStore((state) => state.fetchUserData);
  
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return <>{children}</>;
};