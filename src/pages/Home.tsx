import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Stethoscope, Heart, Brain, Syringe, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            Book Your Doctor in Seconds
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Find the right specialist, view their availability, and book appointments instantly.
          </p>
          <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100 text-lg px-8 py-6 rounded-full shadow-lg">
            <Link to="/doctors">Browse Doctors</Link>
          </Button>
        </div>
      </section>

      {/* Quick Doctor Search */}
      <section className="py-12 bg-white dark:bg-gray-800 shadow-md -mt-16 relative z-10 mx-4 md:mx-auto max-w-4xl rounded-lg p-6">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-6">Find a Doctor</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select>
              <SelectTrigger className="w-full">
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
            <Input type="text" placeholder="Doctor Name (optional)" className="w-full" />
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Stethoscope className="mr-2 h-4 w-4" /> Search Doctors
            </Button>
          </div>
        </div>
      </section>

      {/* Services Offered */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <Heart className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <CardTitle className="text-xl font-semibold">Cardiology</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Expert care for heart conditions, diagnostics, and preventive treatments.</CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <Brain className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <CardTitle className="text-xl font-semibold">Neurology</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Specialized treatment for brain, spinal cord, and nervous system disorders.</CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <Syringe className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <CardTitle className="text-xl font-semibold">Pediatrics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Comprehensive healthcare for infants, children, and adolescents.</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us (USP points) */}
      <section className="py-16 bg-blue-50 dark:bg-blue-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-blue-800 dark:text-blue-200">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader>
                <CalendarIcon className="mx-auto h-10 w-10 text-blue-600 mb-3" />
                <CardTitle className="text-lg font-semibold">Instant Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Book appointments with ease, anytime, anywhere.</CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center p-6 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader>
                <Stethoscope className="mx-auto h-10 w-10 text-blue-600 mb-3" />
                <CardTitle className="text-lg font-semibold">Expert Doctors</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Access to a wide network of highly qualified specialists.</CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center p-6 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader>
                <Phone className="mx-auto h-10 w-10 text-blue-600 mb-3" />
                <CardTitle className="text-lg font-semibold">24/7 Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Our AI chatbot is always ready to assist you.</CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center p-6 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader>
                <Heart className="mx-auto h-10 w-10 text-blue-600 mb-3" />
                <CardTitle className="text-lg font-semibold">Patient-Centric Care</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Your health and comfort are our top priorities.</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact/CTA Banner */}
      <section className="bg-blue-700 dark:bg-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Need Help? Contact Us!</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Our team is ready to assist you with any queries or support you might need.
          </p>
          <Button size="lg" variant="secondary" className="text-blue-700 hover:bg-blue-100 text-lg px-8 py-6 rounded-full shadow-lg">
            <Link to="/contact">Get in Touch</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;