import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Stethoscope, Briefcase, DollarSign, CalendarDays, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DoctorCardProps {
  doctor: {
    id: string;
    name: string;
    specialization: string;
    experience: number;
    fees: number;
    availabilityStatus: string;
    profilePhotoUrl?: string;
    location?: string;
  };
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl overflow-hidden"
    >
      <Card className="relative flex flex-col md:flex-row items-center p-4 shadow-md hover:shadow-xl bg-white rounded-2xl transition duration-300">

        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{
            backgroundImage: `url('/images/hospital-bg.jpg')`
          }}
        ></div>

        {/* Profile Image */}
        <div className="z-10 flex flex-col items-center md:items-start md:w-1/3">
          <img
            src={doctor.profilePhotoUrl || "/images/default-doctor.jpg"}
            alt={doctor.name}
            className="h-32 w-32 rounded-full object-cover border-4 border-[#2A5DFF] shadow-lg"
          />
        </div>

        {/* Doctor Info */}
        <div className="z-10 flex-1 text-center md:text-left mt-4 md:mt-0 md:ml-6 space-y-2">
          <CardHeader className="p-0">
            <CardTitle className="text-2xl font-semibold text-[#1E293B]">
              {doctor.name}
            </CardTitle>
            <p className="text-[#00C6A9] flex items-center justify-center md:justify-start">
              <Stethoscope className="h-4 w-4 mr-2" /> {doctor.specialization}
            </p>
          </CardHeader>

          <CardContent className="p-0 text-[#475569] space-y-1">
            <p className="flex items-center justify-center md:justify-start">
              <Briefcase className="h-4 w-4 mr-2 text-[#2A5DFF]" /> {doctor.experience} Years Experience
            </p>
            <p className="flex items-center justify-center md:justify-start">
              <DollarSign className="h-4 w-4 mr-2 text-[#2A5DFF]" /> ${doctor.fees} Consultation Fee
            </p>
            {doctor.location && (
              <p className="flex items-center justify-center md:justify-start">
                <MapPin className="h-4 w-4 mr-2 text-[#2A5DFF]" /> {doctor.location}
              </p>
            )}
            <p className="flex items-center justify-center md:justify-start text-sm text-[#6B7280]">
              <CalendarDays className="h-4 w-4 mr-2 text-[#FFD43B]" /> {doctor.availabilityStatus}
            </p>
          </CardContent>
        </div>

        {/* Action Button */}
        <div className="z-10 mt-4 md:mt-0 md:ml-6 flex-shrink-0">
          <Button
            asChild
            className="bg-[#2A5DFF] hover:bg-[#1E3DBF] text-white rounded-xl px-6 py-2 transition"
          >
            <Link to={`/doctors/${doctor.id}`}>View Profile</Link>
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default DoctorCard;
