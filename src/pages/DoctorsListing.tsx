import React, { useState, useMemo } from "react";
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
    location: "Main Branch",
    gender: "female",
  },
  {
    id: "2",
    name: "Dr. John Smith",
    specialization: "Neurology",
    experience: 8,
    fees: 120,
    availabilityStatus: "Next Available Slot: Tomorrow, 9 AM",
    profilePhotoUrl: "https://images.unsplash.com/photo-1612349317035-efcd554845ed?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "Downtown Clinic",
    gender: "male",
  },
  {
    id: "3",
    name: "Dr. Sarah Chen",
    specialization: "Pediatrics",
    experience: 15,
    fees: 180,
    availabilityStatus: "Now Available",
    profilePhotoUrl: "https://images.unsplash.com/photo-1537368910025-7dcd2817d04e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "Main Branch",
    gender: "female",
  },
  {
    id: "4",
    name: "Dr. Michael Brown",
    specialization: "Dermatology",
    experience: 10,
    fees: 130,
    availabilityStatus: "Next Available Slot: Today, 3 PM",
    profilePhotoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "Uptown Medical Center",
    gender: "male",
  },
  {
    id: "5",
    name: "Dr. Jessica Lee",
    specialization: "Orthopedics",
    experience: 7,
    fees: 160,
    availabilityStatus: "Next Available Slot: Tomorrow, 11 AM",
    profilePhotoUrl: "https://images.unsplash.com/photo-1582759710003-c75390b87992?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "Downtown Clinic",
    gender: "female",
  },
];

const DoctorsListing = () => {
  const [specialization, setSpecialization] = useState("all");
  const [location, setLocation] = useState("all");
  const [gender, setGender] = useState("any");
  const [availability, setAvailability] = useState("any");
  const [minFee, setMinFee] = useState<string>("");
  const [maxFee, setMaxFee] = useState<string>("");
  const [showAvailableNow, setShowAvailableNow] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDoctors = useMemo(() => {
    return DUMMY_DOCTORS.filter((doctor) => {
      // Search Term Filter
      const matchesSearchTerm = searchTerm
        ? doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      // Specialization Filter
      const matchesSpecialization =
        specialization === "all" || doctor.specialization.toLowerCase() === specialization;

      // Location Filter
      const matchesLocation =
        location === "all" || doctor.location.toLowerCase() === location;

      // Gender Filter
      const matchesGender =
        gender === "any" || doctor.gender.toLowerCase() === gender;

      // Availability Filter
      const matchesAvailability =
        availability === "any" ||
        (availability === "today" && doctor.availabilityStatus.includes("Today")) ||
        (availability === "tomorrow" && doctor.availabilityStatus.includes("Tomorrow"));

      // Fee Range Filter
      const fee = doctor.fees;
      const matchesMinFee = minFee === "" || fee >= parseFloat(minFee);
      const matchesMaxFee = maxFee === "" || fee <= parseFloat(maxFee);

      // Show Available Now Filter
      const matchesAvailableNow = showAvailableNow
        ? doctor.availabilityStatus === "Now Available"
        : true;

      return (
        matchesSearchTerm &&
        matchesSpecialization &&
        matchesLocation &&
        matchesGender &&
        matchesAvailability &&
        matchesMinFee &&
        matchesMaxFee &&
        matchesAvailableNow
      );
    });
  }, [specialization, location, gender, availability, minFee, maxFee, showAvailableNow, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-10">Our Doctors</h1>

        {/* Quick Doctor Search (from Home page, now integrated here) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">Find a Doctor</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select onValueChange={setSpecialization} value={specialization}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Specialization" />
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
            <Input
              type="text"
              placeholder="Doctor Name or Specialization"
              className="w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <SlidersHorizontal className="h-6 w-6 mr-2" /> Advanced Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select onValueChange={setLocation} value={location}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="main branch">Main Branch</SelectItem>
                <SelectItem value="downtown clinic">Downtown Clinic</SelectItem>
                <SelectItem value="uptown medical center">Uptown Medical Center</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={setGender} value={gender}>
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

            <Select onValueChange={setAvailability} value={availability}>
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
              <Input
                id="fee-range-min"
                type="number"
                placeholder="Min $"
                className="w-1/2"
                value={minFee}
                onChange={(e) => setMinFee(e.target.value)}
              />
              <Input
                id="fee-range-max"
                type="number"
                placeholder="Max $"
                className="w-1/2"
                value={maxFee}
                onChange={(e) => setMaxFee(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="available-now"
                checked={showAvailableNow}
                onCheckedChange={(checked) => setShowAvailableNow(!!checked)}
              />
              <Label htmlFor="available-now">Show Available Now</Label>
            </div>
          </div>
          {/* The "Apply Filters" button is no longer strictly necessary as filters apply on change,
              but we can keep it for visual consistency or if more complex "apply" logic is needed later. */}
          <div className="mt-6 text-center">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2">
              <SlidersHorizontal className="h-4 w-4 mr-2" /> Apply Filters
            </Button>
          </div>
        </div>

        {/* Doctor List */}
        <div className="grid grid-cols-1 gap-6">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))
          ) : (
            <p className="text-center text-lg text-gray-600 dark:text-gray-400">No doctors found matching your criteria.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorsListing;