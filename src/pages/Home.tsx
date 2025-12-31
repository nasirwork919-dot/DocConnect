import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Stethoscope, Heart, Brain, Syringe, Phone, Mail, MapPin, Search, MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DoctorCard from "@/components/DoctorCard";
import { fetchAllDoctors, Doctor } from "@/data/doctors";
import React, { useState, useEffect } from "react";
import DoctorsSlider from "@/components/DoctorsSlider";
import { Loader2 } from "lucide-react";

// Create a motion-compatible Button component
const MotionButton = motion.create(Button);

const Home = () => {
  const navigate = useNavigate();
  const [specialization, setSpecialization] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [topDoctors, setTopDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  useEffect(() => {
    const getTopDoctors = async () => {
      setLoadingDoctors(true);
      const allDoctors = await fetchAllDoctors();
      // Sort by average rating and take top 6
      const sortedDoctors = [...allDoctors].sort((a, b) => b.averageRating - a.averageRating);
      setTopDoctors(sortedDoctors.slice(0, 6));
      setLoadingDoctors(false);
    };
    getTopDoctors();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (specialization !== "all") {
      params.append("specialization", specialization);
    }
    if (searchTerm) {
      params.append("search", searchTerm);
    }
    navigate(`/doctors?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background-light text-heading-dark font-michroma">
      {/* Hero Banner */}
      <section 
        className="relative bg-cover bg-center py-20 md:py-32 bg-fixed"
        style={{ backgroundImage: `url('https://i.pinimg.com/736x/6c/37/78/6c37789996911b63291ba857a6f16b42.jpg')` }}
      >
        <div className="absolute inset-0 bg-primary-blue/40 dark:bg-primary-blue/80"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight text-white font-michroma"
          >
            Book Your Doctor Instantly — Smart Healthcare Made Simple.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-white font-sans"
          >
            Real-time doctor availability, instant bookings, and AI support.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex justify-center gap-4"
          >
            <MotionButton 
              asChild 
              size="lg" 
              className="bg-white text-primary-blue hover:bg-gray-100 text-lg px-8 py-6 rounded-full shadow-lg font-sans"
              whileHover={{ scale: 1.05 }}
            >
              <Link to="/doctors">Book Appointment</Link>
            </MotionButton>
          </motion.div>
        </div>
      </section>

      {/* Quick Doctor Search */}
      <section className="py-12 bg-card-background shadow-[0_4px_14px_rgba(0,0,0,0.07)] -mt-16 relative z-10 mx-4 md:mx-auto max-w-4xl rounded-2xl p-6">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-6 font-michroma">Find a Doctor</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select onValueChange={setSpecialization} value={specialization}>
              <SelectTrigger className="w-full rounded-xl font-sans">
                <SelectValue placeholder="Select Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-sans">All Specializations</SelectItem>
                <SelectItem value="cardiology" className="font-sans">Cardiology</SelectItem>
                <SelectItem value="neurology" className="font-sans">Neurology</SelectItem>
                <SelectItem value="pediatrics" className="font-sans">Pediatrics</SelectItem>
                <SelectItem value="dermatology" className="font-sans">Dermatology</SelectItem>
                <SelectItem value="orthopedics" className="font-sans">Orthopedics</SelectItem>
                <SelectItem value="gynecology" className="font-sans">Gynecology</SelectItem>
                <SelectItem value="general practice" className="font-sans">General Practice</SelectItem>
                <SelectItem value="ophthalmology" className="font-sans">Ophthalmology</SelectItem>
                <SelectItem value="psychiatry" className="font-sans">Psychiatry</SelectItem>
                <SelectItem value="endocrinology" className="font-sans">Endocrinology</SelectItem>
                <SelectItem value="urology" className="font-sans">Urology</SelectItem>
                <SelectItem value="gastroenterology" className="font-sans">Gastroenterology</SelectItem>
                <SelectItem value="ent" className="font-sans">ENT</SelectItem>
                <SelectItem value="rheumatology" className="font-sans">Rheumatology</SelectItem>
                <SelectItem value="pulmonology" className="font-sans">Pulmonology</SelectItem>
                <SelectItem value="oncology" className="font-sans">Oncology</SelectItem>
                <SelectItem value="nephrology" className="font-sans">Nephrology</SelectItem>
                <SelectItem value="allergy & immunology" className="font-sans">Allergy & Immunology</SelectItem>
                <SelectItem value="infectious disease" className="font-sans">Infectious Disease</SelectItem>
                <SelectItem value="physical medicine" className="font-sans">Physical Medicine</SelectItem>
                <SelectItem value="plastic surgery" className="font-sans">Plastic Surgery</SelectItem>
                <SelectItem value="geriatrics" className="font-sans">Geriatrics</SelectItem>
                <SelectItem value="sports medicine" className="font-sans">Sports Medicine</SelectItem>
                <SelectItem value="family medicine" className="font-sans">Family Medicine</SelectItem>
                <SelectItem value="emergency medicine" className="font-sans">Emergency Medicine</SelectItem>
                <SelectItem value="hematology" className="font-sans">Hematology</SelectItem>
                <SelectItem value="radiology" className="font-sans">Radiology</SelectItem>
                <SelectItem value="pathology" className="font-sans">Pathology</SelectItem>
                <SelectItem value="anesthesiology" className="font-sans">Anesthesiology</SelectItem>
                <SelectItem value="genetics" className="font-sans">Genetics</SelectItem>
              </SelectContent>
            </Select>
            
            <Input 
              type="text" 
              placeholder="Doctor Name or Specialization" 
              className="w-full rounded-xl font-sans" 
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            
            <MotionButton 
              onClick={handleSearch}
              className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white rounded-xl font-sans"
              whileHover={{ scale: 1.05 }}
            >
              <Stethoscope className="mr-2 h-4 w-4" /> Search Doctors
            </MotionButton>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section 
        className="py-16 bg-cover bg-center relative bg-fixed"
        style={{ backgroundImage: `url('https://i.pinimg.com/736x/52/9d/46/529d4645214be0ddfd96682c36b602d5.jpg')` }}
      >
        <div className="absolute inset-0 bg-background-light/80 dark:bg-heading-dark/80"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-michroma">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="text-center p-6 shadow-[0_4px_14px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-shadow duration-300 rounded-2xl h-full bg-card-background">
                <CardHeader>
                  <Search className="mx-auto h-12 w-12 text-primary-blue mb-4" />
                  <CardTitle className="text-xl font-semibold font-michroma">1. Find Your Doctor</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-sans text-muted-text">
                    Browse specialists by expertise, location, and availability.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="text-center p-6 shadow-[0_4px_14px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-shadow duration-300 rounded-2xl h-full bg-card-background">
                <CardHeader>
                  <CalendarIcon className="mx-auto h-12 w-12 text-primary-blue mb-4" />
                  <CardTitle className="text-xl font-semibold font-michroma">2. Book Appointment</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-sans text-muted-text">
                    Select a convenient time slot and confirm your booking instantly.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="text-center p-6 shadow-[0_4px_14px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-shadow duration-300 rounded-2xl h-full bg-card-background">
                <CardHeader>
                  <MessageSquare className="mx-auto h-12 w-12 text-primary-blue mb-4" />
                  <CardTitle className="text-xl font-semibold font-michroma">3. Get AI Assistance</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-sans text-muted-text">
                    Our AI chatbot provides quick answers and support 24/7.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Top Doctors */}
      <section 
        className="py-16 bg-cover bg-center relative"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1606813902741-3b64d41b2b68?auto=format&fit=crop&w=1920&q=80')` }}
      >
        <div className="absolute inset-0 bg-background-light/80 dark:bg-heading-dark/80"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-heading-dark dark:text-white font-michroma">
            Meet Our Top Doctors
          </h2>
          
          {loadingDoctors ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
            </div>
          ) : (
            <DoctorsSlider doctors={topDoctors} />
          )}
          
          <div className="text-center mt-10">
            <MotionButton 
              asChild 
              size="lg" 
              className="bg-primary-blue hover:bg-primary-blue/90 text-white rounded-full px-8 py-6 shadow-lg font-sans"
              whileHover={{ scale: 1.05 }}
            >
              <Link to="/doctors">View All Doctors</Link>
            </MotionButton>
          </div>
        </div>
      </section>

      {/* Services Offered */}
      <section className="py-16 bg-background-light">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-michroma">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6 shadow-[0_4px_14px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-shadow duration-300 rounded-2xl bg-card-background">
              <CardHeader>
                <Heart className="mx-auto h-12 w-12 text-primary-blue mb-4" />
                <CardTitle className="text-xl font-semibold font-michroma">Cardiology</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="font-sans text-muted-text">
                  Expert care for heart conditions, diagnostics, and preventive treatments.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 shadow-[0_4px_14px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-shadow duration-300 rounded-2xl bg-card-background">
              <CardHeader>
                <Brain className="mx-auto h-12 w-12 text-primary-blue mb-4" />
                <CardTitle className="text-xl font-semibold font-michroma">Neurology</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="font-sans text-muted-text">
                  Specialized treatment for brain, spinal cord, and nervous system disorders.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 shadow-[0_4px_14px_rgba(0,0,0,0.07)] bg-card-background rounded-2xl">
              <CardHeader>
                <Syringe className="mx-auto h-12 w-12 text-primary-blue mb-4" />
                <CardTitle className="text-xl font-semibold font-michroma">Pediatrics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="font-sans text-muted-text">
                  Comprehensive healthcare for infants, children, and adolescents.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us (USP points) */}
      <section 
        className="py-16 bg-cover bg-center relative"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1576765607924-3e83b4eb2b51?auto=format&fit=crop&w=1920&q=80')` }}
      >
        <div className="absolute inset-0 bg-primary-blue/40 dark:bg-primary-blue/80"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white font-michroma">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 shadow-[0_4px_14px_rgba(0,0,0,0.07)] bg-card-background rounded-2xl">
              <CardHeader>
                <CalendarIcon className="mx-auto h-10 w-10 text-primary-blue mb-3" />
                <CardTitle className="text-lg font-semibold font-michroma">Instant Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="font-sans text-muted-text">
                  Book appointments with ease, anytime, anywhere.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 shadow-[0_4px_14px_rgba(0,0,0,0.07)] bg-card-background rounded-2xl">
              <CardHeader>
                <Stethoscope className="mx-auto h-10 w-10 text-primary-blue mb-3" />
                <CardTitle className="text-lg font-semibold font-michroma">Expert Doctors</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="font-sans text-muted-text">
                  Access to a wide network of highly qualified specialists.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 shadow-[0_4px_14px_rgba(0,0,0,0.07)] bg-card-background rounded-2xl">
              <CardHeader>
                <Phone className="mx-auto h-10 w-10 text-primary-blue mb-3" />
                <CardTitle className="text-lg font-semibold font-michroma">24/7 Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="font-sans text-muted-text">
                  Our AI chatbot is always ready to assist you.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 shadow-[0_4px_14px_rgba(0,0,0,0.07)] bg-card-background rounded-2xl">
              <CardHeader>
                <Heart className="mx-auto h-10 w-10 text-primary-blue mb-3" />
                <CardTitle className="text-lg font-semibold font-michroma">Patient-Centric Care</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="font-sans text-muted-text">
                  Your health and comfort are our top priorities.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact/CTA Banner */}
      <section 
        className="bg-cover bg-center relative py-16"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1587502536263-54e43e9a6d7f?auto=format&fit=crop&w=1920&q=80')` }}
      >
        <div className="absolute inset-0 bg-primary-blue/40 dark:bg-primary-blue/80"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-michroma text-white">Need Help? Contact Us!</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto font-sans text-white/90">
            Our team is ready to assist you with any queries or support you might need.
          </p>
          <MotionButton 
            asChild 
            size="lg" 
            variant="secondary" 
            className="bg-white text-primary-blue hover:bg-gray-100 text-lg px-8 py-6 rounded-full shadow-lg font-sans"
            whileHover={{ scale: 1.05 }}
          >
            <Link to="/contact">Get in Touch</Link>
          </MotionButton>
        </div>
      </section>
    </div>
  );
};

export default Home;