import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignup) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: email.split('@')[0],
              role: 'user' // Default role
            }
          }
        });

        if (error) {
          toast.error(error.message);
          setIsLoading(false); // Stop loading on error
          return;
        }

        // Seed profile row
        if (data.user) {
          const { error: profErr } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              username: email.split('@')[0],
              full_name: null,
              profile_image: null,
              bio: '',
              join_date: new Date().toISOString().split('T')[0],
              followers_count: 0,
              role: 'user' // Ensure role is added to profile too if needed elsewhere
            });
          if (profErr) {
            console.error('Could not create profile:', profErr);
            toast.error('Could not create profile data.');
            // Optionally handle this more gracefully, maybe delete the auth user?
          }
        }

        // Updated Toast Text
        toast.success('Account created! Check your email for verification.');
        setIsSignup(false);
        setPassword(''); // Clear password after signup attempt
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          toast.error(error.message);
          setIsLoading(false); // Stop loading on error
          return;
        }

        // Updated Toast Text
        toast.success('Signed in!');
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      // Updated Toast Text
      toast.error('An unexpected error occurred.');
    } finally {
      // Ensure isLoading is always set to false eventually
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          {/* Updated Heading */}
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            {isSignup ? 'Create Account' : 'Sign in to your account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mb-4"
              />
            </div>
            <div>
              {/* Updated Label */}
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? isSignup
                  // Updated loading text
                  ? 'Creating account...'
                  : 'Signing in...'
                : isSignup
                  // Updated button text
                  ? 'Sign Up'
                  : 'Sign In'}
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="text-sm text-plank-blue hover:underline"
              onClick={() => {
                setIsSignup(!isSignup);
                setPassword(''); // Clear password when toggling
              }}
            >
              {isSignup
                // Updated toggle text
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
