import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Stethoscope, Briefcase, DollarSign, CalendarDays, MapPin } from "lucide-react";
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
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden transition-all duration-300 border border-gray-100"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Doctor Image */}
        <div className="relative w-full sm:w-1/3">
          <img
            src={doctor.profilePhotoUrl || "/images/default-doctor.jpg"}
            alt={doctor.name}
            className="object-cover w-full h-60 sm:h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>

        {/* Doctor Info */}
        <div className="flex flex-col justify-between p-5 sm:p-6 flex-1">
          <div>
            <h3 className="text-2xl font-semibold text-gray-800">{doctor.name}</h3>
            <p className="text-[#2A5DFF] flex items-center mt-1 text-sm font-medium">
              <Stethoscope className="h-4 w-4 mr-2" /> {doctor.specialization}
            </p>

            <div className="mt-3 space-y-1 text-gray-600 text-sm">
              <p className="flex items-center">
                <Briefcase className="h-4 w-4 mr-2 text-[#00C6A9]" /> {doctor.experience} Years Experience
              </p>
              <p className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-[#00C6A9]" /> ${doctor.fees} Consultation Fee
              </p>
              {doctor.location && (
                <p className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-[#00C6A9]" /> {doctor.location}
                </p>
              )}
              <p className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-2 text-[#FFD43B]" /> {doctor.availabilityStatus}
              </p>
            </div>
          </div>

          {/* Button */}
          <div className="mt-4 sm:mt-6">
            <Button
              asChild
              className="bg-[#2A5DFF] hover:bg-[#1E3DBF] text-white rounded-xl w-full sm:w-auto px-5 py-2 transition"
            >
              <Link to={`/doctors/${doctor.id}`}>View Profile</Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DoctorCard;
