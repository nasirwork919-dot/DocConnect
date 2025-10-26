import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Stethoscope, Briefcase, DollarSign, CalendarDays, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

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
    <Card className="flex flex-col md:flex-row items-center p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800">
      <Avatar className="h-24 w-24 md:h-32 md:w-32 mb-4 md:mb-0 md:mr-6">
        <AvatarImage src={doctor.profilePhotoUrl || "/placeholder.svg"} alt={doctor.name} />
        <AvatarFallback>{doctor.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
      </Avatar>
      <div className="flex-1 text-center md:text-left">
        <CardHeader className="p-0 mb-2">
          <CardTitle className="text-2xl font-bold">{doctor.name}</CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-400 flex items-center justify-center md:justify-start">
            <Stethoscope className="h-4 w-4 mr-2" /> {doctor.specialization}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-2 text-gray-700 dark:text-gray-300">
          <p className="flex items-center justify-center md:justify-start">
            <Briefcase className="h-4 w-4 mr-2" /> {doctor.experience} Years Experience
          </p>
          <p className="flex items-center justify-center md:justify-start">
            <DollarSign className="h-4 w-4 mr-2" /> Consultation Fee: ${doctor.fees}
          </p>
          {doctor.location && (
            <p className="flex items-center justify-center md:justify-start">
              <MapPin className="h-4 w-4 mr-2" /> {doctor.location}
            </p>
          )}
          <p className="flex items-center justify-center md:justify-start text-sm text-gray-500 dark:text-gray-400">
            <CalendarDays className="h-4 w-4 mr-2" /> {doctor.availabilityStatus}
          </p>
        </CardContent>
      </div>
      <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0">
        <Button asChild className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white">
          <Link to={`/doctors/${doctor.id}`}>View Profile</Link>
        </Button>
      </div>
    </Card>
  );
};

export default DoctorCard;