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
        // 1) Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: email.split('@')[0] }
          }
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        // 2) Seed profile row
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
              followers_count: 0
            });
          if (profErr) {
            console.error('Could not create profile:', profErr);
            toast.error('Kunde inte skapa profil-datan.');
          }
        }

        toast.success('Konto skapat! Kolla din mejl för verifiering.');
        // Flip back to login form instead of redirecting
        setIsSignup(false);
        setPassword('');
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        toast.success('Inloggad!');
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      toast.error('Ett oväntat fel uppstod.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            {isSignup ? 'Skapa konto' : 'Logga in på ditt konto'}
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
              <Label htmlFor="password">Lösenord</Label>
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
                  ? 'Skapar konto...'
                  : 'Loggar in...'
                : isSignup
                  ? 'Registrera'
                  : 'Logga in'}
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="text-sm text-plank-blue hover:underline"
              onClick={() => {
                setIsSignup(!isSignup);
                setPassword('');
              }}
            >
              {isSignup
                ? 'Har redan konto? Logga in'
                : 'Har du inget konto? Registrera'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
