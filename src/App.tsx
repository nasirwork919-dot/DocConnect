import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Home from "./pages/Home";
import DoctorsListing from "./pages/DoctorsListing";
import DoctorProfilePage from "./pages/DoctorProfilePage";
import AppointmentBookingPage from "./pages/AppointmentBookingPage";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTopButton from "./components/ScrollToTopButton"; // Import new component
import ChatbotWidget from "./components/ChatbotWidget"; // Import new component

const queryClient = new QueryClient();

// This component will contain the routes and useLocation hook
const AppContent = () => {
  const location = useLocation();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              {/* Wrap Routes in a motion.div with a key for AnimatePresence to animate */}
              <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <Routes location={location}> {/* Remove key from Routes here */}
                  <Route path="/" element={<Home />} />
                  <Route path="/doctors" element={<DoctorsListing />} />
                  <Route path="/doctors/:id" element={<DoctorProfilePage />} />
                  <Route path="/book" element={<AppointmentBookingPage />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/contact" element={<ContactUs />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </main>
          <Footer />
          <ScrollToTopButton /> {/* Add ScrollToTopButton */}
          <ChatbotWidget /> {/* Add ChatbotWidget */}
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

// The main App component that wraps AppContent with BrowserRouter
const App = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;