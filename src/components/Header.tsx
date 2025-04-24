
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm py-4 px-6 md:px-10 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-plank-blue to-plank-green rounded-lg mr-3 flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <h1 className="text-xl md:text-2xl font-poppins font-bold gradient-text">Rank Your Plank</h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="font-medium hover:text-plank-blue transition-colors">Hem</Link>
          <Link to="/challenges" className="font-medium hover:text-plank-blue transition-colors">Utmaningar</Link>
          <Link to="/profile" className="font-medium hover:text-plank-blue transition-colors">Min Profil</Link>
          <Button className="plank-btn-primary">Logga In</Button>
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
            <Link 
              to="/" 
              className="font-medium hover:text-plank-blue transition-colors py-2"
              onClick={toggleMenu}
            >
              Hem
            </Link>
            <Link 
              to="/challenges" 
              className="font-medium hover:text-plank-blue transition-colors py-2"
              onClick={toggleMenu}
            >
              Utmaningar
            </Link>
            <Link 
              to="/profile" 
              className="font-medium hover:text-plank-blue transition-colors py-2"
              onClick={toggleMenu}
            >
              Min Profil
            </Link>
            <Button className="plank-btn-primary w-full mt-2">Logga In</Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
