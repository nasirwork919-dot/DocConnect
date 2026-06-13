"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Stethoscope } from "lucide-react"; // Removed LogOut, CalendarCheck

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Removed useSession and supabase imports

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Doctors", path: "/doctors" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
    { name: "Admin", path: "/admin" }, // Added Admin link
  ];

  return (
    <nav className="bg-card-background dark:bg-card shadow-[0_4px_14px_rgba(0,0,0,0.07)] sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-primary-blue dark:text-primary/70 font-michroma">
          <Stethoscope className="h-8 w-8" />
          <span>DocConnect</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-heading-dark dark:text-gray-200 hover:text-primary-blue dark:hover:text-primary/70 transition-colors text-lg font-medium font-sans"
            >
              {link.name}
            </Link>
          ))}
          {/* Removed My Appointments link */}
          <Button asChild className="bg-primary-blue hover:bg-primary-blue/90 text-white font-sans">
            <Link to="/book">Book Appointment</Link>
          </Button>
          {/* Removed Login/Logout buttons */}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px] bg-card-background dark:bg-card">
              <div className="flex flex-col space-y-4 p-4">
                <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-primary-blue dark:text-primary/70 mb-4 font-michroma" onClick={() => setIsOpen(false)}>
                  <Stethoscope className="h-8 w-8" />
                  <span>DocConnect</span>
                </Link>
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="text-heading-dark dark:text-gray-200 hover:text-primary-blue dark:hover:text-primary/70 transition-colors text-lg font-medium py-2 font-sans"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                {/* Removed My Appointments link */}
                <Button asChild className="bg-primary-blue hover:bg-primary-blue/90 text-white mt-4 font-sans" onClick={() => setIsOpen(false)}>
                  <Link to="/book">Book Appointment</Link>
                </Button>
                {/* Removed Login/Logout buttons */}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;