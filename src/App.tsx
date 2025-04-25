import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from '@/integrations/supabase/client'; // Import supabase client

import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Challenges from "./pages/Challenges";
import AdminChallenges from "./pages/admin/Challenges";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import RedirectToSelf from "./components/RedirectToSelf";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Consider a nicer loading spinner
  }

  return user ? <>{children}</> : <Navigate to="/auth" replace />;
};

// --- Modified AdminProtectedRoute ---
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // Use state for async check
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (authLoading) {
        // Wait for auth loading to finish
        // We set loading to true initially, so it will show loading anyway
        return;
      }

      if (!user) {
        // No user logged in, definitely not admin
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Fetch role from profiles table
      try {
        const { data, error } = await supabase
          .from('profiles') // Your profiles table name
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile for role check:', error);
          setIsAdmin(false); // Assume not admin on error
        } else {
          setIsAdmin(data?.role === 'admin');
        }
      } catch (error) {
        console.error('Unexpected error fetching profile:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false); // Finished loading profile data
      }
    };

    checkAdminRole();
  }, [user, authLoading]); // Re-run if user or auth loading state changes

  if (loading || authLoading) {
    // Show loading state while checking auth or fetching profile
    return <div>Loading Admin Access...</div>;
  }

  // Once loading is complete, check the isAdmin state
  return isAdmin ? <>{children}</> : <Navigate to="/" replace />;
};
// --- End of Modified AdminProtectedRoute ---

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
                      <Route
                          path="/profile"
                          element={
                              <ProtectedRoute>
                                  <RedirectToSelf />
                              </ProtectedRoute>
                          }
                      />

                      {/* The existing /profile/:id */}
                      <Route
                          path="/profile/:id"
                          element={
                              <ProtectedRoute>
                                  <Profile />
                              </ProtectedRoute>
                          }
                      />
            <Route
              path="/challenges"
              element={
                <ProtectedRoute>
                  <Challenges />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/challenges"
              element={
                <AdminProtectedRoute> {/* Use the modified guard */}
                  <AdminChallenges />
                </AdminProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;