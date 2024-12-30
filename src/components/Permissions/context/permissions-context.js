"use client";
import { createContext, useContext } from 'react';

export const PermissionContext = createContext([]);

export const usePermissionContext = () => {
  const context = useContext(PermissionContext);
  if (!context) throw new Error('usePermissionContext must be used inside PermissionProvider');
  return context;
};