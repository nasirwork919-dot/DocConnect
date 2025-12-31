import React, { useEffect, useState } from "react";
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
  Star,
  Languages,
  Hospital,
  Clock,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { Doctor, fetchDoctorById } from "@/data/doctors"; // Import fetchDoctorById

const MotionButton = motion.create(Button);

const DoctorProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getDoctor = async () => {
      if (id) {
        setLoading(true);
        const fetchedDoctor = await fetchDoctorById(id);
        setDoctor(fetchedDoctor);
        setLoading(false);
      }
    };
    getDoctor();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light text-heading-dark font-michroma">
        <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light text-heading-dark font-michroma">
        <h1 className="text-3xl font-bold font-michroma">Doctor not found.</h1>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Online":
        return "bg-secondary-teal";
      case "In Clinic":
        return "bg-accent-yellow";
      case "Off":
      default:
        return "bg-destructive";
    }
  };

  return (
    <div className="min-h-screen bg-background-light text-heading-dark py-8 font-michroma">
      <div className="container mx-auto px-4">
        <MotionButton variant="link" asChild className="mb-6 pl-0 text-primary-blue dark:text-primary/70 font-sans">
          <Link to="/doctors">← Back to Doctors</Link>
        </MotionButton>

        <Card className="p-6 shadow-[0_4px_14px_rgba(0,0,0,0.07)] bg-card-background rounded-2xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0"
            >
              <Avatar className="h-32 w-32 md:h-48 md:w-48">
                <AvatarImage src={doctor.profile_photo_url || "/images/doctor-placeholder.jpg"} alt={doctor.name} className="object-cover object-top" />
                <AvatarFallback className="text-5xl bg-muted-foreground/20 text-foreground">
                  {doctor.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2 font-michroma">{doctor.name}</h1>
              <p className="text-xl text-primary-blue flex items-center justify-center md:justify-start mb-2 font-sans">
                <Stethoscope className="h-5 w-5 mr-2" /> {doctor.specialization}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4 font-sans">
                <Star className="h-5 w-5 text-accent-yellow" fill="currentColor" />
                <span className="text-lg font-semibold">{doctor.average_rating}</span>
                <span className="text-muted-text">({doctor.reviews_count} Reviews)</span>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                {doctor.qualifications.map((q, index) => (
                  <Badge key={index} variant="secondary" className="bg-primary-blue/10 text-primary-blue dark:bg-primary-blue/20 dark:text-primary-blue font-sans rounded-md">
                    {q}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-4 text-muted-text font-sans">
                <p className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" /> {doctor.experience} Years Experience
                </p>
                <p className="flex items-center">
                  <Hospital className="h-4 w-4 mr-2" /> {doctor.hospital}
                </p>
                <p className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" /> Fee: ${doctor.consultation_fee}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full md:w-auto md:min-w-[200px]">
              <MotionButton asChild className="bg-primary-blue hover:bg-primary-blue/90 text-white w-full rounded-xl font-sans" whileHover={{ scale: 1.05 }}>
                <Link to={`/book?doctorId=${doctor.id}`}>Book Appointment</Link>
              </MotionButton>
            </div>
          </div>

          <Separator className="my-8 bg-border" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-4 font-michroma">About {doctor.name}</h2>
              <p className="text-muted-text leading-relaxed mb-6 font-sans">{doctor.bio}</p>

              <h3 className="text-xl font-semibold mb-3 flex items-center font-michroma">
                <Languages className="h-5 w-5 mr-2 text-primary-blue" /> Languages Spoken
              </h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {doctor.languages.map((lang, index) => (
                  <Badge key={index} variant="outline" className="text-muted-text border-muted-text/50 font-sans rounded-md">
                    {lang}
                  </Badge>
                ))}
              </div>

              <h3 className="text-xl font-semibold mb-3 flex items-center font-michroma">
                <Mail className="h-5 w-5 mr-2 text-primary-blue" /> Contact
              </h3>
              <p className="text-muted-text mb-6 font-sans">{doctor.contact_email}</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 font-michroma">Availability & Status</h2>
              <Card className="p-4 mb-6 bg-primary-blue/10 dark:bg-primary-blue/20 rounded-2xl">
                <CardContent className="p-0 font-sans">
                  <p className="flex items-center text-lg font-semibold text-heading-dark dark:text-gray-50">
                    <Clock className="h-5 w-5 mr-2 text-primary-blue" /> Current Status:
                    <Badge className={`ml-2 ${getStatusColor(doctor.realtime_status)} text-white font-sans rounded-md`}>
                      {doctor.realtime_status}
                    </Badge>
                  </p>
                </CardContent>
              </Card>

              <h3 className="text-xl font-semibold mb-3 font-michroma">Schedule</h3>
              <div className="space-y-2 text-muted-text font-sans mb-6">
                {Object.entries(doctor.availability_schedule).map(([day, time]: [string, string]) => (
                  <motion.div
                    key={day}
                    className="flex justify-between p-2 rounded-md hover:bg-muted/50 transition-colors duration-200"
                    whileHover={{ x: 5 }}
                  >
                    <span className="font-medium capitalize">{day}:</span>
                    <span>{time}</span>
                  </motion.div>
                ))}
              </div>

              <h3 className="text-xl font-semibold mb-3 font-michroma">Book a Slot</h3>
              <Card className="p-0 rounded-2xl">
                <Calendar
                  mode="single"
                  selected={new Date()}
                  onSelect={() => {}}
                  className="rounded-2xl border w-full"
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