import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignup) {
        if (!username.trim()) {
          toast.error("Username is required.");
          setIsLoading(false);
          return;
        }

        // Validate if username is already taken
        const { data: existingUsers, error: checkError } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username);

        if (checkError) {
          console.error('Username check failed:', checkError);
          toast.error("Could not validate username.");
          setIsLoading(false);
          return;
        }

        if (existingUsers.length > 0) {
          toast.error("Username is already taken.");
          setIsLoading(false);
          return;
        }

        // Proceed with sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              role: 'user'
            }
          }
        });

        if (error) {
          toast.error(error.message);
          setIsLoading(false);
          return;
        }

        if (data.user) {
          const { error: profErr } = await supabase.from('profiles').insert({
            id: data.user.id,
            username,
            full_name: null,
            profile_image: '/RankAPlank.png', // Set default image
            bio: '',
            join_date: new Date().toISOString().split('T')[0],
            followers_count: 0,
            role: 'user'
          });

          if (profErr) {
            console.error('Could not create profile:', profErr);
            toast.error('Could not create profile data.');
          }
        }

        toast.success('Account created! Check your email for verification.');
        setIsSignup(false);
        setPassword('');
        setUsername('');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          toast.error(error.message);
          setIsLoading(false);
          return;
        }

        toast.success('Signed in!');
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            {isSignup ? 'Create Account' : 'Sign in to your account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div className="rounded-md shadow-sm -space-y-px">
            {isSignup && (
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Select a Username"
                  className="mb-4"
                />
              </div>
            )}
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
                  ? 'Creating account...'
                  : 'Signing in...'
                : isSignup
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
                setPassword('');
                setUsername('');
              }}
            >
              {isSignup
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
