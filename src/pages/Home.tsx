import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Stethoscope, Heart, Brain, Syringe, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion"; // Import motion

const Home = () => {
  return (
    <div className="min-h-screen bg-background text-foreground"> {/* Use background and foreground */}
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-sky-blue to-soft-violet text-white py-20 md:py-32"> {/* Apply new gradient colors */}
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight font-heading"> {/* Apply heading font */}
            Book Your Doctor Instantly — Smart Healthcare Made Simple.
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto font-sans"> {/* Apply body font */}
            Real-time doctor availability, instant bookings, and AI support.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-sky-blue hover:bg-gray-100 text-lg px-8 py-6 rounded-full shadow-lg"> {/* Apply sky-blue */}
              <Link to="/doctors">Book Appointment</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-sky-blue text-lg px-8 py-6 rounded-full shadow-lg">
              <Link to="/chatbot">Chat with AI</Link> {/* Placeholder for chatbot route */}
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Doctor Search */}
      <section className="py-12 bg-card shadow-md -mt-16 relative z-10 mx-4 md:mx-auto max-w-4xl rounded-xl p-6"> {/* Use card background and rounded-xl */}
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-6 font-heading">Find a Doctor</h2> {/* Apply heading font */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select>
              <SelectTrigger className="w-full rounded-xl"> {/* Apply rounded-xl */}
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
            <Input type="text" placeholder="Doctor Name (optional)" className="w-full rounded-xl" /> {/* Apply rounded-xl */}
            <Button className="w-full bg-sky-blue hover:bg-blue-700 text-white rounded-xl"> {/* Apply sky-blue and rounded-xl */}
              <Stethoscope className="mr-2 h-4 w-4" /> Search Doctors
            </Button>
          </div>
        </div>
      </section>

      {/* Services Offered */}
      <section className="py-16 bg-background"> {/* Use background */}
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-heading">Our Services</h2> {/* Apply heading font */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl"> {/* Apply rounded-xl */}
              <CardHeader>
                <Heart className="mx-auto h-12 w-12 text-sky-blue mb-4" /> {/* Apply sky-blue */}
                <CardTitle className="text-xl font-semibold font-heading">Cardiology</CardTitle> {/* Apply heading font */}
              </CardHeader>
              <CardContent>
                <CardDescription className="font-sans">Expert care for heart conditions, diagnostics, and preventive treatments.</CardDescription> {/* Apply body font */}
              </CardContent>
            </Card>
            <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl"> {/* Apply rounded-xl */}
              <CardHeader>
                <Brain className="mx-auto h-12 w-12 text-sky-blue mb-4" /> {/* Apply sky-blue */}
                <CardTitle className="text-xl font-semibold font-heading">Neurology</CardTitle> {/* Apply heading font */}
              </CardHeader>
              <CardContent>
                <CardDescription className="font-sans">Specialized treatment for brain, spinal cord, and nervous system disorders.</CardDescription> {/* Apply body font */}
              </CardContent>
            </Card>
            <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl"> {/* Apply rounded-xl */}
              <CardHeader>
                <Syringe className="mx-auto h-12 w-12 text-sky-blue mb-4" /> {/* Apply sky-blue */}
                <CardTitle className="text-xl font-semibold font-heading">Pediatrics</CardTitle> {/* Apply heading font */}
              </CardHeader>
              <CardContent>
                <CardDescription className="font-sans">Comprehensive healthcare for infants, children, and adolescents.</CardDescription> {/* Apply body font */}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us (USP points) */}
      <section className="py-16 bg-blue-50 dark:bg-blue-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-sky-blue dark:text-blue-200 font-heading">Why Choose Us?</h2> {/* Apply sky-blue and heading font */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 shadow-lg bg-card rounded-xl"> {/* Use card background and rounded-xl */}
              <CardHeader>
                <CalendarIcon className="mx-auto h-10 w-10 text-sky-blue mb-3" /> {/* Apply sky-blue */}
                <CardTitle className="text-lg font-semibold font-heading">Instant Booking</CardTitle> {/* Apply heading font */}
              </CardHeader>
              <CardContent>
                <CardDescription className="font-sans">Book appointments with ease, anytime, anywhere.</CardDescription> {/* Apply body font */}
              </CardContent>
            </Card>
            <Card className="text-center p-6 shadow-lg bg-card rounded-xl"> {/* Use card background and rounded-xl */}
              <CardHeader>
                <Stethoscope className="mx-auto h-10 w-10 text-sky-blue mb-3" /> {/* Apply sky-blue */}
                <CardTitle className="text-lg font-semibold font-heading">Expert Doctors</CardTitle> {/* Apply heading font */}
              </CardHeader>
              <CardContent>
                <CardDescription className="font-sans">Access to a wide network of highly qualified specialists.</CardDescription> {/* Apply body font */}
              </CardContent>
            </Card>
            <Card className="text-center p-6 shadow-lg bg-card rounded-xl"> {/* Use card background and rounded-xl */}
              <CardHeader>
                <Phone className="mx-auto h-10 w-10 text-sky-blue mb-3" /> {/* Apply sky-blue */}
                <CardTitle className="text-lg font-semibold font-heading">24/7 Support</CardTitle> {/* Apply heading font */}
              </CardHeader>
              <CardContent>
                <CardDescription className="font-sans">Our AI chatbot is always ready to assist you.</CardDescription> {/* Apply body font */}
              </CardContent>
            </Card>
            <Card className="text-center p-6 shadow-lg bg-card rounded-xl"> {/* Use card background and rounded-xl */}
              <CardHeader>
                <Heart className="mx-auto h-10 w-10 text-sky-blue mb-3" /> {/* Apply sky-blue */}
                <CardTitle className="text-lg font-semibold font-heading">Patient-Centric Care</CardTitle> {/* Apply heading font */}
              </CardHeader>
              <CardContent>
                <CardDescription className="font-sans">Your health and comfort are our top priorities.</CardDescription> {/* Apply body font */}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact/CTA Banner */}
      <section className="bg-sky-blue dark:bg-blue-800 text-white py-16"> {/* Apply sky-blue */}
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">Need Help? Contact Us!</h2> {/* Apply heading font */}
          <p className="text-lg mb-8 max-w-2xl mx-auto font-sans"> {/* Apply body font */}
            Our team is ready to assist you with any queries or support you might need.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-sky-blue hover:bg-blue-100 text-lg px-8 py-6 rounded-full shadow-lg"> {/* Apply sky-blue */}
            <Link to="/contact">Get in Touch</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;