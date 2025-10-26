import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Stethoscope,
  Briefcase,
  DollarSign,
  CalendarDays,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion"; // Framer Motion

interface DoctorCardProps {
  doctor: {
    id: string;
    name: string;
    specialization: string;
    experience: number;
    fees: number;
    availabilityStatus: string; // e.g., "Now Available", "Next Available Slot: Mon, 10 AM"
    profilePhotoUrl?: string;
    location?: string;
  };
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  return (
    <motion.div
      whileHover={{
        y: -5,
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      }}
      transition={{ duration: 0.3 }}
      className="rounded-xl"
    >
      <Card className="flex items-center p-4 shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-800 rounded-xl">
        {/* Doctor Avatar */}
        <Avatar className="h-24 w-24 mr-4 flex-shrink-0">
          <AvatarImage
            src={doctor.profilePhotoUrl || "/placeholder.svg"}
            alt={doctor.name}
          />
          <AvatarFallback>
            {doctor.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>

        {/* Doctor Info */}
        <div className="flex-1 text-left mr-4 min-w-[150px]"> {/* Added min-width to ensure text has space */}
          <CardHeader className="p-0 mb-2">
            <CardTitle className="text-xl font-heading">{doctor.name}</CardTitle>
            <CardDescription className="text-sky-500 flex items-center">
              <Stethoscope className="h-4 w-4 mr-2" /> {doctor.specialization}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-1 text-gray-600 dark:text-gray-300 text-sm">
            <p className="flex items-center">
              <Briefcase className="h-4 w-4 mr-2" /> {doctor.experience} Years Exp.
            </p>
            <p className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2" /> Fee: ${doctor.fees}
            </p>
            {doctor.location && (
              <p className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" /> {doctor.location}
              </p>
            )}
            <p className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <CalendarDays className="h-4 w-4 mr-2" /> {doctor.availabilityStatus}
            </p>
          </CardContent>
        </div>

        {/* View Profile Button */}
        <div className="flex-shrink-0">
          <Link to={`/doctors/${doctor.id}`}>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
              <Button className="w-full md:w-auto bg-sky-500 hover:bg-blue-700 text-white rounded-xl whitespace-nowrap">
                View Profile
              </Button>
            </motion.div>
          </Link>
        </div>
      </Card>
    </motion.div>
  );
};

export default DoctorCard;