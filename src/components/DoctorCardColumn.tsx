import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Stethoscope, Briefcase, DollarSign, CalendarDays, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Doctor } from "@/data/doctors"; // Import Doctor interface

interface DoctorCardColumnProps {
  doctor: Doctor;
}

const DoctorCardColumn: React.FC<DoctorCardColumnProps> = ({ doctor }) => {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="rounded-2xl"
    >
      <Card className="flex flex-col gap-5 items-baseline p-6 shadow-[0_4px_14px_rgba(0,0,0,0.07)] bg-card-background dark:bg-card rounded-2xl hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300">
        {/* Avatar Section */}
        <div className="relative">
          <div className="h-28 w-28 md:h-32 md:w-32 rounded-full overflow-hidden border-4 border-white dark:border-card shadow-md">
            <Avatar className="h-full w-full">
              <AvatarImage
                src={doctor.profilePhotoUrl || "/images/doctor-placeholder.jpg"}
                alt={doctor.name}
              />
              <AvatarFallback className="bg-muted-foreground/20 text-foreground">
                {doctor.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="absolute bottom-2 right-2 bg-secondary-teal w-4 h-4 rounded-full border-2 border-white dark:border-card"></div>
        </div>

        {/* Doctor Info */}
        <div className="flex-1 text-left">
          <CardHeader className="p-0 mb-2">
            <CardTitle className="text-2xl font-semibold text-heading-dark dark:text-foreground font-michroma">{doctor.name}</CardTitle>
            <CardDescription className="text-primary-blue flex items-center justify-start font-sans">
              <Stethoscope className="h-4 w-4 mr-2 text-secondary-teal" />
              {doctor.specialization}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-2 text-muted-text dark:text-muted-foreground font-sans">
            <p className="flex items-center justify-start">
              <Briefcase className="h-4 w-4 mr-2 text-primary-blue" /> {doctor.experience} Years Experience
            </p>
            <p className="flex items-center justify-start">
              <DollarSign className="h-4 w-4 mr-2 text-primary-blue" /> Consultation Fee: ${doctor.consultationFee}
            </p>
            {doctor.location && (
              <p className="flex items-center justify-start">
                <MapPin className="h-4 w-4 mr-2 text-primary-blue" /> {doctor.location}
              </p>
            )}
            <p className="flex items-center justify-start text-sm font-medium text-accent-yellow">
              <CalendarDays className="h-4 w-4 mr-2" /> {doctor.availabilityStatus}
            </p>
          </CardContent>
        </div>

        {/* CTA Button */}
        <div className="flex-shrink-0">
          <Link to={`/doctors/${doctor.id}`}>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
              <Button className="bg-gradient-to-r from-primary-blue to-secondary-teal text-white rounded-xl px-6 py-2 font-medium shadow-md hover:shadow-lg transition-all duration-300 font-sans">
                View Profile
              </Button>
            </motion.div>
          </Link>
        </div>
      </Card>
    </motion.div>
  );
};

export default DoctorCardColumn;