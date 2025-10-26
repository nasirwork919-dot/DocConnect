import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import DoctorCard from "@/components/DoctorCard";
import { SlidersHorizontal, Search } from "lucide-react";

const DUMMY_DOCTORS = [
  {
    id: "1",
    name: "Dr. Emily White",
    specialization: "Cardiology",
    experience: 12,
    fees: 150,
    availabilityStatus: "Now Available",
    profilePhotoUrl: "https://images.unsplash.com/photo-1559839734-2b716b17f7ce?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "Main Branch"
  },
  {
    id: "2",
    name: "Dr. John Smith",
    specialization: "Neurology",
    experience: 8,
    fees: 120,
    availabilityStatus: "Next Available Slot: Tomorrow, 9 AM",
    profilePhotoUrl: "https://images.unsplash.com/photo-1612349317035-efcd554845ed?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "Downtown Clinic"
  },
  {
    id: "3",
    name: "Dr. Sarah Chen",
    specialization: "Pediatrics",
    experience: 15,
    fees: 180,
    availabilityStatus: "Now Available",
    profilePhotoUrl: "https://images.unsplash.com/photo-1537368910025-7dcd2817d04e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "Main Branch"
  },
  {
    id: "4",
    name: "Dr. Michael Brown",
    specialization: "Dermatology",
    experience: 10,
    fees: 130,
    availabilityStatus: "Next Available Slot: Today, 3 PM",
    profilePhotoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "Uptown Medical Center"
  },
];

const DoctorsListing = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-10">Our Doctors</h1>

        {/* Filters Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <SlidersHorizontal className="h-6 w-6 mr-2" /> Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                <SelectItem value="cardiology">Cardiology</SelectItem>
                <SelectItem value="neurology">Neurology</SelectItem>
                <SelectItem value="pediatrics">Pediatrics</SelectItem>
                <SelectItem value="dermatology">Dermatology</SelectItem>
                <SelectItem value="orthopedics">Orthopedics</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="main">Main Branch</SelectItem>
                <SelectItem value="downtown">Downtown Clinic</SelectItem>
                <SelectItem value="uptown">Uptown Medical Center</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Gender (Optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Label htmlFor="fee-range-min">Fee Range:</Label>
              <Input id="fee-range-min" type="number" placeholder="Min $" className="w-1/2" />
              <Input id="fee-range-max" type="number" placeholder="Max $" className="w-1/2" />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="available-now" />
              <Label htmlFor="available-now">Show Available Now</Label>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2">
              <Search className="h-4 w-4 mr-2" /> Apply Filters
            </Button>
          </div>
        </div>

        {/* Doctor List */}
        <div className="grid grid-cols-1 gap-6">
          {DUMMY_DOCTORS.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorsListing;