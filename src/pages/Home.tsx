import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Stethoscope, Heart, Brain, Syringe, Phone, Mail, MapPin, Search, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import DoctorCard from "@/components/DoctorCard"; // Import DoctorCard

// Create a motion-compatible Button component
const MotionButton = motion.create(Button); // Changed from motion(Button)

// Dummy data for Top Doctors section
const TOP_DOCTORS = [
  {
    id: "1",
    name: "Dr. Emily White",
    specialization: "Cardiology",
    experience: 12,
    fees: 150,
    availabilityStatus: "Now Available",
    profilePhotoUrl: "https://images.unsplash.com/photo-1559839734-2b716b17f7ce?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "Main Branch",
    gender: "female",
  },
  {
    id: "2",
    name: "Dr. John Smith",
    specialization: "Neurology",
    experience: 8,
    fees: 120,
    availabilityStatus: "Next Available Slot: Tomorrow, 9 AM",
    profilePhotoUrl: "https://images.unsplash.com/photo-1612349317035-efcd554845ed?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "Downtown Clinic",
    gender: "male",
  },
  {
    id: "3",
    name: "Dr. Sarah Chen",
    specialization: "Pediatrics",
    experience: 15,
    fees: 180,
    availabilityStatus: "Now Available",
    profilePhotoUrl: "https://images.unsplash.com/photo-1537368910025-7dcd2817d04e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "Main Branch",
    gender: "female",
  },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-sky-blue to-soft-violet text-white py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight font-heading"
          >
            Book Your Doctor Instantly — Smart Healthcare Made Simple.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-lg md:text-xl mb-8 max-w-2xl mx-auto font-sans"
          >
            Real-time doctor availability, instant bookings, and AI support.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex justify-center gap-4"
          >
            <MotionButton asChild size="lg" className="bg-white text-sky-blue hover:bg-gray-100 text-lg px-8 py-6 rounded-full shadow-lg" whileHover={{ scale: 1.05 }}>
              <Link to="/doctors">Book Appointment</Link>
            </MotionButton>
            <MotionButton asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-sky-blue text-lg px-8 py-6 rounded-full shadow-lg" whileHover={{ scale: 1.05 }}>
              <Link to="/chatbot">Chat with AI</Link>
            </MotionButton>
          </motion.div>
        </div>
      </section>

      {/* Quick Doctor Search */}
      <section className="py-12 bg-card shadow-md -mt-16 relative z-10 mx-4 md:mx-auto max-w-4xl rounded-xl p-6">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-6 font-heading">Find a Doctor</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue placeholder="Select Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cardiology">Cardiology</SelectItem>
                <SelectItem value="neurology">Neurology</SelectItem>
                <SelectItem value="pediatrics">Pediatrics</SelectItem>
                <SelectItem value="dermatology">Dermatology</SelectItem>
                <SelectItem value="orthopedics">Orthopedics</SelectItem>
              </SelectContent>
            </Select>
            <Input type="text" placeholder="Doctor Name (optional)" className="w-full rounded-xl" />
            <MotionButton className="w-full bg-sky-blue hover:bg-blue-700 text-white rounded-xl" whileHover={{ scale: 1.05 }}>
              <Stethoscope className="mr-2 h-4 w-4" /> Search Doctors
            </MotionButton>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-heading">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl h-full">
                <CardHeader>
                  <Search className="mx-auto h-12 w-12 text-sky-blue mb-4" />
                  <CardTitle className="text-xl font-semibold font-heading">1. Find Your Doctor</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-sans">Browse specialists by expertise, location, and availability.</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl h-full">
                <CardHeader>
                  <CalendarIcon className="mx-auto h-12 w-12 text-sky-blue mb-4" />
                  <CardTitle className="text-xl font-semibold font-heading">2. Book Appointment</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-sans">Select a convenient time slot and confirm your booking instantly.</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl h-full">
                <CardHeader>
                  <MessageSquare className="mx-auto h-12 w-12 text-sky-blue mb-4" />
                  <CardTitle className="text-xl font-semibold font-heading">3. Get AI Assistance</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-sans">Our AI chatbot provides quick answers and support 24/7.</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Top Doctors */}
      <section className="py-16 bg-blue-50 dark:bg-blue-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-sky-blue dark:text-blue-200 font-heading">Meet Our Top Doctors</h2>
          <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide"> {/* Horizontal scroll */}
            {TOP_DOCTORS.map((doctor) => (
              <div key={doctor.id} className="flex-shrink-0 w-80"> {/* Fixed width for scrollable cards */}
                <DoctorCard doctor={doctor} />
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <MotionButton asChild size="lg" className="bg-sky-blue hover:bg-blue-700 text-white rounded-full px-8 py-6 shadow-lg" whileHover={{ scale: 1.05 }}>
              <Link to="/doctors">View All Doctors</Link>
            </MotionButton>
          </div>
        </div>
      </section>

      {/* Services Offered */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-heading">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl">
              <CardHeader>
                <Heart className="mx-auto h-12 w-12 text-sky-blue mb-4" />
                <CardTitle className="text-xl font-semibold font-heading">Cardiology</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="font-sans">Expert care for heart conditions, diagnostics, and preventive treatments.</CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl">
              <CardHeader>
                <Brain className="mx-auto h-12 w-12 text-sky-blue mb-4" />
                <CardTitle className="text-xl font-semibold font-heading">Neurology</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="font-sans">Specialized treatment for brain, spinal cord, and nervous system disorders.</CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl">
              <CardHeader>
                <Syringe className="mx-auto h-12 w-12 text-sky-blue mb-4" />
                <CardTitle className="text-xl font-semibold font-heading">Pediatrics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="font-sans">Comprehensive healthcare for infants, children, and adolescents.</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us (USP points) */}
      <section className="py-16 bg-blue-50 dark:bg-blue-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-sky-blue dark:text-blue-200 font-heading">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 shadow-lg bg-card rounded-xl">
              <CardHeader>
                <CalendarIcon className="mx-auto h-10 w-10 text-sky-blue mb-3" />
                <CardTitle className="text-lg font-semibold font-heading">Instant Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="font-sans">Book appointments with ease, anytime, anywhere.</CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center p-6 shadow-lg bg-card rounded-xl">
              <CardHeader>
                <Stethoscope className="mx-auto h-10 w-10 text-sky-blue mb-3" />
                <CardTitle className="text-lg font-semibold font-heading">Expert Doctors</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="font-sans">Access to a wide network of highly qualified specialists.</CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center p-6 shadow-lg bg-card rounded-xl">
              <CardHeader>
                <Phone className="mx-auto h-10 w-10 text-sky-blue mb-3" />
                <CardTitle className="text-lg font-semibold font-heading">24/7 Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="font-sans">Our AI chatbot is always ready to assist you.</CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center p-6 shadow-lg bg-card rounded-xl">
              <CardHeader>
                <Heart className="mx-auto h-10 w-10 text-sky-blue mb-3" />
                <CardTitle className="text-lg font-semibold font-heading">Patient-Centric Care</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="font-sans">Your health and comfort are our top priorities.</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Patient Reviews (Placeholder) */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 font-heading">What Our Patients Say</h2>
          <p className="text-lg text-muted-gray-blue font-sans">
            (Placeholder for a testimonials slider component)
          </p>
        </div>
      </section>

      {/* AI Chatbot Section (Placeholder) */}
      <section className="py-16 bg-blue-50 dark:bg-blue-950">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading text-sky-blue dark:text-blue-200">Talk to Our AI Assistant</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto font-sans text-muted-gray-blue dark:text-gray-300">
            Get instant answers to your health questions and assistance with bookings.
          </p>
          <MotionButton asChild size="lg" className="bg-soft-violet hover:bg-soft-violet/90 text-white rounded-full px-8 py-6 shadow-lg" whileHover={{ scale: 1.05 }}>
            <Link to="/chatbot">Launch Chatbot</Link>
          </MotionButton>
        </div>
      </section>

      {/* Contact/CTA Banner */}
      <section className="bg-sky-blue dark:bg-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">Need Help? Contact Us!</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto font-sans">
            Our team is ready to assist you with any queries or support you might need.
          </p>
          <MotionButton asChild size="lg" variant="secondary" className="text-sky-blue hover:bg-blue-100 text-lg px-8 py-6 rounded-full shadow-lg" whileHover={{ scale: 1.05 }}>
            <Link to="/contact">Get in Touch</Link>
          </MotionButton>
        </div>
      </section>
    </div>
  );
};

export default Home;