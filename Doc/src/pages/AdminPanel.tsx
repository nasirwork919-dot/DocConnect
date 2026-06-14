import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookingsTab from "@/components/admin/BookingsTab";
import PatientInquiriesTab from "@/components/admin/PatientInquiriesTab";
import AttendanceTab from "@/components/admin/AttendanceTab";
import ChatMessagesTab from "@/components/admin/ChatMessagesTab";
import { CalendarCheck, MessageSquare, UserCheck, Bot, Lock, LogOut, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ── Change these credentials to whatever you want ─────────────────────────────
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "DocConnect@2025";
// ─────────────────────────────────────────────────────────────────────────────

const SESSION_KEY = "docconnect_admin_auth";

const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "true");
      onLogin();
    } else {
      setError("Invalid username or password.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-heading-dark flex items-center justify-center px-4">
      <div
        className={`w-full max-w-sm bg-card-background dark:bg-card rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-8 transition-transform ${
          shake ? "animate-[shake_0.4s_ease-in-out]" : ""
        }`}
      >
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary-blue rounded-full p-4 mb-4 shadow-md">
            <Lock className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-primary-blue font-michroma">Admin Access</h1>
          <p className="text-sm text-muted-foreground font-sans mt-1">DocConnect Hospital</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium font-sans text-heading-dark dark:text-gray-200 mb-1 block">
              Username
            </label>
            <Input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(""); }}
              className="font-sans"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium font-sans text-heading-dark dark:text-gray-200 mb-1 block">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                className="font-sans pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-heading-dark transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 font-sans text-center">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white font-sans font-semibold rounded-xl py-2.5"
          >
            Sign In
          </Button>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-6px); }
          80%       { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
};

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-heading-dark text-heading-dark dark:text-gray-50 py-8 font-michroma">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header row */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-bold text-primary-blue dark:text-primary/70 font-michroma">
            Admin Panel
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-500 transition-colors font-sans border border-transparent hover:border-red-200 rounded-lg px-3 py-1.5"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>

        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 bg-card-background dark:bg-card rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.07)]">
            <TabsTrigger value="bookings" className="flex items-center justify-center space-x-2 font-sans text-lg py-3 rounded-xl data-[state=active]:bg-primary-blue data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
              <CalendarCheck className="h-5 w-5" />
              <span>Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="flex items-center justify-center space-x-2 font-sans text-lg py-3 rounded-xl data-[state=active]:bg-primary-blue data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
              <MessageSquare className="h-5 w-5" />
              <span>Inquiries</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center justify-center space-x-2 font-sans text-lg py-3 rounded-xl data-[state=active]:bg-primary-blue data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
              <UserCheck className="h-5 w-5" />
              <span>Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="chats" className="flex items-center justify-center space-x-2 font-sans text-lg py-3 rounded-xl data-[state=active]:bg-primary-blue data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
              <Bot className="h-5 w-5" />
              <span>AI Chats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <BookingsTab />
          </TabsContent>
          <TabsContent value="inquiries">
            <PatientInquiriesTab />
          </TabsContent>
          <TabsContent value="attendance">
            <AttendanceTab />
          </TabsContent>
          <TabsContent value="chats">
            <ChatMessagesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
