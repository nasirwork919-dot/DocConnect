import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Briefcase, Lightbulb, Users } from "lucide-react";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-10 text-blue-700 dark:text-blue-300">About Us</h1>

        <section className="mb-12 text-center">
          <p className="text-lg leading-relaxed max-w-2xl mx-auto">
            Welcome to our platform, where we connect patients with top-tier medical professionals. Our mission is to simplify healthcare access, making it easier for you to find, book, and manage appointments with trusted doctors.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-center mb-8">Our Mission & Vision</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6 shadow-lg bg-white dark:bg-gray-800 text-center">
              <CardHeader>
                <Lightbulb className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <CardTitle className="text-xl font-semibold">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">
                  To empower individuals to take control of their health by providing seamless access to quality medical care and a diverse network of healthcare providers.
                </p>
              </CardContent>
            </Card>
            <Card className="p-6 shadow-lg bg-white dark:bg-gray-800 text-center">
              <CardHeader>
                <Users className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <CardTitle className="text-xl font-semibold">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">
                  To be the leading platform for online doctor appointments, recognized for our reliability, user-friendliness, and commitment to patient well-being.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-center mb-8">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 shadow-lg bg-white dark:bg-gray-800 text-center">
              <Avatar className="mx-auto h-24 w-24 mb-4">
                <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cfd975fd?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Jane Doe" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold mb-2">Jane Doe</h3>
              <p className="text-blue-600 dark:text-blue-400 mb-2">CEO & Founder</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Visionary leader passionate about transforming healthcare access.
              </p>
            </Card>
            <Card className="p-6 shadow-lg bg-white dark:bg-gray-800 text-center">
              <Avatar className="mx-auto h-24 w-24 mb-4">
                <AvatarImage src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="John Smith" />
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold mb-2">John Smith</h3>
              <p className="text-blue-600 dark:text-blue-400 mb-2">Chief Medical Officer</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Experienced physician guiding our medical standards and partnerships.
              </p>
            </Card>
            <Card className="p-6 shadow-lg bg-white dark:bg-gray-800 text-center">
              <Avatar className="mx-auto h-24 w-24 mb-4">
                <AvatarImage src="https://images.unsplash.com/photo-1573496359142-b8d87734b584?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Sarah Lee" />
                <AvatarFallback>SL</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold mb-2">Sarah Lee</h3>
              <p className="text-blue-600 dark:text-blue-400 mb-2">Head of Technology</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Driving innovation to create a seamless and secure platform.
              </p>
            </Card>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-semibold mb-6">Join Our Network</h2>
          <p className="text-lg leading-relaxed mb-6 max-w-2xl mx-auto">
            Are you a healthcare professional looking to expand your reach and connect with more patients? Join our growing network of esteemed doctors.
          </p>
          <Link to="/contact" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-11 px-8 py-6 text-lg shadow-lg">
            <Briefcase className="mr-2 h-5 w-5" /> Partner With Us
          </Link>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;