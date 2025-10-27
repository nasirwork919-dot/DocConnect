"use client";

import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-heading-dark py-12 font-michroma">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-6 shadow-[0_4px_14px_rgba(0,0,0,0.07)] bg-card-background dark:bg-heading-dark rounded-2xl">
          <CardHeader className="text-center mb-6">
            <CardTitle className="text-3xl font-bold text-primary-blue dark:text-primary/70 font-michroma">Welcome Back!</CardTitle>
            <p className="text-muted-text dark:text-gray-300 font-sans">Sign in or create an account to continue.</p>
          </CardHeader>
          <CardContent className="min-h-[400px]"> {/* Added min-h to ensure space */}
            <Auth
              supabaseClient={supabase}
              providers={[]} // Only email/password for now
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'hsl(var(--primary-blue))',
                      brandAccent: 'hsl(var(--secondary-teal))',
                      defaultButtonBackground: 'hsl(var(--primary-blue))',
                      defaultButtonBackgroundHover: 'hsl(var(--primary-blue)/90%)',
                      defaultButtonBorder: 'hsl(var(--primary-blue))',
                      inputBackground: 'hsl(var(--background-light))',
                      inputBorder: 'hsl(var(--border))',
                      inputBorderHover: 'hsl(var(--ring))',
                      inputBorderFocus: 'hsl(var(--ring))',
                      inputText: 'hsl(var(--foreground))',
                      messageText: 'hsl(var(--destructive))',
                      anchorTextColor: 'hsl(var(--primary-blue))',
                      anchorTextHoverColor: 'hsl(var(--primary-blue)/90%)',
                    },
                    radii: {
                      borderRadiusButton: '1rem', // rounded-2xl
                      inputBorderRadius: '1rem',
                    },
                  },
                },
              }}
              theme="light" // Use light theme, can be toggled with dark mode later
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Email address',
                    password_label: 'Password',
                    email_input_placeholder: 'Your email address',
                    password_input_placeholder: 'Your password',
                    button_label: 'Sign In',
                    social_provider_text: 'Sign in with {{provider}}',
                    link_text: 'Already have an account? Sign In',
                  },
                  sign_up: {
                    email_label: 'Email address',
                    password_label: 'Create a Password',
                    email_input_placeholder: 'Your email address',
                    password_input_placeholder: 'Your password',
                    button_label: 'Sign Up',
                    social_provider_text: 'Sign up with {{provider}}',
                    link_text: 'Don\'t have an account? Sign Up',
                  },
                  forgotten_password: {
                    email_label: 'Email address',
                    password_label: 'Your Password',
                    email_input_placeholder: 'Your email address',
                    button_label: 'Send Reset Instructions',
                    link_text: 'Forgot your password?',
                  },
                  update_password: {
                    password_label: 'New Password',
                    password_input_placeholder: 'Your new password',
                    button_label: 'Update Password',
                  },
                },
              }}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;