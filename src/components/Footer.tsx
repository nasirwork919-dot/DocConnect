import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import { MadeWithDyad } from "./made-with-dyad";

const Footer = () => {
  return (
    <footer className="bg-foreground dark:bg-gray-950 text-gray-300 py-10">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4 text-white font-heading">DocConnect</h3>
          <p className="text-sm font-sans text-gray-400">Providing quality healthcare with compassion and innovation.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white font-heading">Quick Links</h3>
          <ul className="space-y-2 font-sans">
            <li><Link to="/" className="hover:text-primary/70">Home</Link></li>
            <li><Link to="/doctors" className="hover:text-primary/70">Doctors</Link></li>
            <li><Link to="/about" className="hover:text-primary/70">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-primary/70">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white font-heading">Contact Info</h3>
          <ul className="space-y-2 font-sans">
            <li className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-primary" /> 123 Hospital Rd, Health City</li>
            <li className="flex items-center"><Phone className="mr-2 h-4 w-4 text-primary" /> +1 (555) 123-4567</li>
            <li className="flex items-center"><Mail className="mr-2 h-4 w-4 text-primary" /> info@hospital.com</li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white font-heading">Follow Us</h3>
          <div className="flex space-x-4">
            {/* Placeholder for social icons */}
            <a href="#" className="hover:text-primary/70"><img src="/placeholder.svg" alt="Facebook" className="h-6 w-6" /></a>
            <a href="#" className="hover:text-primary/70"><img src="/placeholder.svg" alt="Twitter" className="h-6 w-6" /></a>
            <a href="#" className="hover:text-primary/70"><img src="/placeholder.svg" alt="LinkedIn" className="h-6 w-6" /></a>
          </div>
        </div>
      </div>
      <div className="text-center mt-8 border-t border-gray-700 pt-6">
        <p className="text-sm font-sans">&copy; {new Date().getFullYear()} DocConnect. All rights reserved.</p>
        <MadeWithDyad />
      </div>
    </footer>
  );
};

export default Footer;