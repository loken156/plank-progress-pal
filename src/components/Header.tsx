// src/components/Header.tsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.id) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                setIsAdmin(!error && data?.role === 'admin');
            } else {
                setIsAdmin(false);
            }
        };
        fetchProfile();
    }, [user]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const toggleMenu = () => setIsMenuOpen(open => !open);

    return (
        <header className="bg-white shadow-sm py-4 px-6 md:px-10 sticky top-0 z-10">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center">
                    {/* logo container */}
                    <div className="w-10 h-10 mr-3 flex items-center justify-center">
                        <img
                            src="/RankAPlankLogo.png"
                            alt="Rank a Plank logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <h1 className="text-xl md:text-2xl font-poppins font-bold gradient-text">
                        Rank a Plank
                    </h1>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link to="/" className="font-medium hover:text-plank-blue transition-colors">
                        Home
                    </Link>
                    <Link to="/challenges" className="font-medium hover:text-plank-blue transition-colors">
                        Challenges
                    </Link>
                    {user ? (
                        <>
                            <Link to="/profile" className="font-medium hover:text-plank-blue transition-colors">
                                My Profile
                            </Link>
                            {isAdmin && (
                                <Link
                                    to="/admin/challenges"
                                    className="font-medium hover:text-plank-blue transition-colors"
                                >
                                    Manage Challenges
                                </Link>
                            )}
                            <Button onClick={handleLogout} variant="outline">
                                Log Out
                            </Button>
                        </>
                    ) : (
                        <Link to="/auth">
                            <Button className="plank-btn-primary">Log In</Button>
                        </Link>
                    )}
                </nav>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <Button variant="ghost" size="icon" onClick={toggleMenu}>
                        <Menu className="h-6 w-6" />
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-md py-4 px-6 animate-slide-in-bottom">
                    <nav className="flex flex-col gap-4">
                        <Link to="/" className="font-medium hover:text-plank-blue transition-colors py-2" onClick={toggleMenu}>
                            Home
                        </Link>
                        <Link to="/challenges" className="font-medium hover:text-plank-blue transition-colors py-2" onClick={toggleMenu}>
                            Challenges
                        </Link>
                        {user ? (
                            <>
                                <Link to="/profile" className="font-medium hover:text-plank-blue transition-colors py-2" onClick={toggleMenu}>
                                    My Profile
                                </Link>
                                {isAdmin && (
                                    <Link
                                        to="/admin/challenges"
                                        className="font-medium hover:text-plank-blue transition-colors py-2"
                                        onClick={toggleMenu}
                                    >
                                        Manage Challenges
                                    </Link>
                                )}
                                <Button onClick={handleLogout} variant="outline" className="w-full">
                                    Log Out
                                </Button>
                            </>
                        ) : (
                            <Link to="/auth" onClick={toggleMenu}>
                                <Button className="plank-btn-primary w-full">Log In</Button>
                            </Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
