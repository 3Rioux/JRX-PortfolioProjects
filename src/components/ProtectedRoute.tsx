import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext.tsx';
import type { JSX } from 'react';

//this class will create a route that has a condition (in my case its to make sure that the user is logged in to supabase before accessing the add project page.)

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>; // or a spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}