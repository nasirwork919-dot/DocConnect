import React from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import {
  Stethoscope,
  Briefcase,
  DollarSign,
  CalendarDays,
  MapPin,
  Mail,
  MessageSquare,
  Star,
  Languages,
  Hospital,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion"; // Import motion

// Create a motion-compatible Button component
const MotionButton = motion(Button);

// Dummy data for a single doctor
const DUMMY_DOCTORS_DETAILS = [
  {
    id: "1",
    name: "Dr. Emily White",
    profilePhotoUrl: "https://images.unsplash.com/photo-1559839734-2b716b17f7ce?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    specialization: "Cardiology",
    qualifications: ["MBBS", "MD Cardiology", "FCPS"],
    experience: 12,
    hospital: "Main Branch Hospital",
    consultationFee: 150,
    languages: ["English", "Spanish"],
    contactEmail: "emily.white@hospital.com",
    bio: "Dr. Emily White is a highly experienced cardiologist with over a decade of practice. She specializes in preventive cardiology, heart failure management, and interventional procedures. Dr. White is committed to providing patient-centered care with a focus on long-term heart health.",
    availabilitySchedule: {
      monday: "9:00 AM - 5:00 PM",
      tuesday: "9:00 AM - 5:00 PM",
      wednesday: "9:00 AM - 1:00 PM",
      thursday: "9:00 AM - 5:00 PM",
      friday: "9:00 AM - 5:00 PM",
      saturday: "Closed",
      sunday: "Closed",
    },
    realtimeStatus: "Online",
    averageRating: 4.8,
    reviewsCount: 120,
  },
  {
    id: "2",
    name: "Dr. John Smith",
    profilePhotoUrl: "https://images.unsplash.com/photo-1612349317035-efcd554845ed?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    specialization: "Neurology",
    qualifications: ["MBBS", "MD Neurology"],
    experience: 8,
    hospital: "Downtown Clinic",
    consultationFee: 120,
    languages: ["English", "French"],
    contactEmail: "john.smith@hospital.com",
    bio: "Dr. John Smith is a dedicated neurologist focusing on neurological disorders such as migraines, epilepsy, and stroke rehabilitation. He believes in a holistic approach to patient care, integrating the latest research with compassionate treatment.",
    availabilitySchedule: {
      monday: "10:00 AM - 6:00 PM",
      tuesday: "10:00 AM - 6:00 PM",
      wednesday: "Closed",
      thursday: "10:00 AM - 6:00 PM",
      friday: "10:00 AM - 6:00 PM",
      saturday: "9:00 AM - 1:00 PM",
      sunday: "Closed",
    },
    realtimeStatus: "In Clinic",
    averageRating: 4.5,
    reviewsCount: 85,
  },
  {
    id: "3",
    name: "Dr. Sarah Chen",
    profilePhotoUrl: "https://images.unsplash.com/photo-1537368910025-7dcd2817d04e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    specialization: "Pediatrics",
    qualifications: ["MBBS", "DCH", "MRCPCH"],
    experience: 15,
    hospital: "Main Branch Hospital",
    consultationFee: 180,
    languages: ["English", "Mandarin"],
    contactEmail: "sarah.chen@hospital.com",
    bio: "Dr. Sarah Chen is a compassionate pediatrician dedicated to the health and well-being of children from infancy through adolescence. She provides comprehensive care, including routine check-ups, vaccinations, and management of childhood illnesses.",
    availabilitySchedule: {
      monday: "8:00 AM - 4:00 PM",
      tuesday: "8:00 AM - 4:00 PM",
      wednesday: "8:00 AM - 4:00 PM",
      thursday: "Closed",
      friday: "8:00 AM - 4:00 PM",
      saturday: "Closed",
      sunday: "Closed",
    },
    realtimeStatus: "Online",
    averageRating: 4.9,
    reviewsCount: 150,
  },
  {
    id: "4",
    name: "Dr. Michael Brown",
    profilePhotoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    specialization: "Dermatology",
    qualifications: ["MBBS", "MD Dermatology"],
    experience: 10,
    hospital: "Uptown Medical Center",
    consultationFee: 130,
    languages: ["English"],
    contactEmail: "michael.brown@hospital.com",
    bio: "Dr. Michael Brown is a leading dermatologist specializing in skin conditions, cosmetic dermatology, and skin cancer screenings. He is dedicated to helping patients achieve healthy and radiant skin through personalized treatment plans.",
    availabilitySchedule: {
      monday: "9:00 AM - 5:00 PM",
      tuesday: "Closed",
      wednesday: "9:00 AM - 5:00 PM",
      thursday: "9:00 AM - 5:00 PM",
      friday: "9:00 AM - 5:00 PM",
      saturday: "Closed",
      sunday: "Closed",
    },
    realtimeStatus: "Off",
    averageRating: 4.7,
    reviewsCount: 90,
  },
];

const DoctorProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const doctor = DUMMY_DOCTORS_DETAILS.find((d) => d.id === id);

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <h1 className="text-3xl font-bold font-heading">Doctor not found.</h1>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Online":
        return "bg-emerald-green"; // Use emerald-green
      case "In Clinic":
        return "bg-yellow-500";
      case "Off":
      default:
        return "bg-error-red"; // Use error-red
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto px-4">
        <MotionButton variant="link" asChild className="mb-6 pl-0 text-sky-blue dark:text-blue-400 font-sans">
          <Link to="/doctors">← Back to Doctors</Link>
        </MotionButton>

        <Card className="p-6 shadow-lg bg-card rounded-xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0"
            >
              <Avatar className="h-32 w-32 md:h-48 md:w-48">
                <AvatarImage src={doctor.profilePhotoUrl || "/placeholder.svg"} alt={doctor.name} />
                <AvatarFallback className="text-5xl bg-muted-gray-blue/20 text-slate-black">
                  {doctor.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2 font-heading">{doctor.name}</h1>
              <p className="text-xl text-sky-blue flex items-center justify-center md:justify-start mb-2 font-sans">
                <Stethoscope className="h-5 w-5 mr-2" /> {doctor.specialization}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4 font-sans">
                <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                <span className="text-lg font-semibold">{doctor.averageRating}</span>
                <span className="text-muted-gray-blue">({doctor.reviewsCount} Reviews)</span>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                {doctor.qualifications.map((q, index) => (
                  <Badge key={index} variant="secondary" className="bg-sky-blue/10 text-sky-blue dark:bg-sky-blue/20 dark:text-sky-blue font-sans rounded-md">
                    {q}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-4 text-muted-gray-blue font-sans">
                <p className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" /> {doctor.experience} Years Experience
                </p>
                <p className="flex items-center">
                  <Hospital className="h-4 w-4 mr-2" /> {doctor.hospital}
                </p>
                <p className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" /> Fee: ${doctor.consultationFee}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full md:w-auto md:min-w-[200px]">
              <MotionButton asChild className="bg-sky-blue hover:bg-blue-700 text-white w-full rounded-xl" whileHover={{ scale: 1.05 }}>
                <Link to={`/book?doctorId=${doctor.id}`}>Book Appointment</Link>
              </MotionButton>
              <MotionButton variant="outline" className="w-full rounded-xl border-muted-gray-blue text-muted-gray-blue hover:bg-muted-gray-blue/10" whileHover={{ scale: 1.05 }}>
                <MessageSquare className="h-4 w-4 mr-2" /> Ask via Chatbot
              </MotionButton>
            </div>
          </div>

          <Separator className="my-8 bg-border" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-4 font-heading">About {doctor.name}</h2>
              <p className="text-muted-gray-blue leading-relaxed mb-6 font-sans">{doctor.bio}</p>

              <h3 className="text-xl font-semibold mb-3 flex items-center font-heading">
                <Languages className="h-5 w-5 mr-2 text-sky-blue" /> Languages Spoken
              </h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {doctor.languages.map((lang, index) => (
                  <Badge key={index} variant="outline" className="text-muted-gray-blue border-muted-gray-blue/50 font-sans rounded-md">
                    {lang}
                  </Badge>
                ))}
              </div>

              <h3 className="text-xl font-semibold mb-3 flex items-center font-heading">
                <Mail className="h-5 w-5 mr-2 text-sky-blue" /> Contact
              </h3>
              <p className="text-muted-gray-blue mb-6 font-sans">{doctor.contactEmail}</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 font-heading">Availability & Status</h2>
              <Card className="p-4 mb-6 bg-sky-blue/10 dark:bg-sky-blue/20 rounded-xl">
                <CardContent className="p-0 font-sans">
                  <p className="flex items-center text-lg font-semibold text-slate-black dark:text-gray-50">
                    <Clock className="h-5 w-5 mr-2 text-sky-blue" /> Current Status:
                    <Badge className={`ml-2 ${getStatusColor(doctor.realtimeStatus)} text-white font-sans rounded-md`}>
                      {doctor.realtimeStatus}
                    </Badge>
                  </p>
                </CardContent>
              </Card>

              <h3 className="text-xl font-semibold mb-3 font-heading">Schedule</h3>
              <div className="space-y-2 text-muted-gray-blue font-sans mb-6">
                {Object.entries(doctor.availabilitySchedule).map(([day, time]) => (
                  <motion.div
                    key={day}
                    className="flex justify-between p-2 rounded-md hover:bg-muted/50 transition-colors duration-200"
                    whileHover={{ x: 5 }} // Simple hover animation for schedule items
                  >
                    <span className="font-medium capitalize">{day}:</span>
                    <span>{time}</span>
                  </motion.div>
                ))}
              </div>

              <h3 className="text-xl font-semibold mb-3 font-heading">Book a Slot</h3>
              <Card className="p-0 rounded-xl">
                <Calendar
                  mode="single"
                  selected={new Date()} // Placeholder for selected date
                  onSelect={() => {}} // Placeholder for date selection
                  className="rounded-xl border w-full"
                />
              </Card>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DoctorProfilePage;