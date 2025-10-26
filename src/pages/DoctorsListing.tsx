import React, { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import DoctorCard from "@/components/DoctorCard";
import { SlidersHorizontal, Search } from "lucide-react";
import { motion } from "framer-motion"; // Import motion
import { ALL_DOCTORS, Doctor } from "@/data/doctors"; // Import ALL_DOCTORS from new data file

// Create a motion-compatible Button component
const MotionButton = motion.create(Button);

const DoctorsListing = () => {
  const [searchParams] = useSearchParams();

  const [specialization, setSpecialization] = useState(searchParams.get("specialization") || "all");
  const [location, setLocation] = useState(searchParams.get("location") || "all");
  const [gender, setGender] = useState(searchParams.get("gender") || "any");
  const [availability, setAvailability] = useState(searchParams.get("availability") || "any");
  const [minFee, setMinFee] = useState<string>(searchParams.get("minFee") || "");
  const [maxFee, setMaxFee] = useState<string>(searchParams.get("maxFee") || "");
  const [showAvailableNow, setShowAvailableNow] = useState(searchParams.get("availableNow") === "true");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  const filteredDoctors = useMemo(() => {
    return ALL_DOCTORS.filter((doctor: Doctor) => {
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
      const fee = doctor.consultationFee; // Use consultationFee from Doctor interface
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
    <div className="min-h-screen bg-background-light text-heading-dark py-8 font-michroma">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-10 font-michroma">Our Doctors</h1>

        {/* Quick Doctor Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card-background p-6 rounded-2xl shadow-[0_4px_14px_rgba(0,0,0,0.07)] mb-8"
        >
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
                <SelectItem value="oncology" className="font-sans">Oncology</SelectItem>
                <SelectItem value="gastroenterology" className="font-sans">Gastroenterology</SelectItem>
                <SelectItem value="endocrinology" className="font-sans">Endocrinology</SelectItem>
                <SelectItem value="pulmonology" className="font-sans">Pulmonology</SelectItem>
                <SelectItem value="nephrology" className="font-sans">Nephrology</SelectItem>
                <SelectItem value="ophthalmology" className="font-sans">Ophthalmology</SelectItem>
                <SelectItem value="ent" className="font-sans">ENT</SelectItem>
                <SelectItem value="psychiatry" className="font-sans">Psychiatry</SelectItem>
                <SelectItem value="general practice" className="font-sans">General Practice</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="text"
              placeholder="Doctor Name or Specialization"
              className="w-full rounded-xl font-sans"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MotionButton className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white rounded-xl font-sans" whileHover={{ scale: 1.05 }}>
              <Search className="mr-2 h-4 w-4" /> Search
            </MotionButton>
          </div>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card-background p-6 rounded-2xl shadow-[0_4px_14px_rgba(0,0,0,0.07)] mb-8"
        >
          <h2 className="text-2xl font-semibold mb-4 flex items-center font-michroma">
            <SlidersHorizontal className="h-6 w-6 mr-2 text-primary-blue" /> Advanced Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select onValueChange={setLocation} value={location}>
              <SelectTrigger className="w-full rounded-xl font-sans">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-sans">All Locations</SelectItem>
                <SelectItem value="main branch hospital" className="font-sans">Main Branch Hospital</SelectItem>
                <SelectItem value="downtown clinic" className="font-sans">Downtown Clinic</SelectItem>
                <SelectItem value="uptown medical center" className="font-sans">Uptown Medical Center</SelectItem>
                <SelectItem value="community health center" className="font-sans">Community Health Center</SelectItem>
                <SelectItem value="eastside clinic" className="font-sans">Eastside Clinic</SelectItem>
                <SelectItem value="westwood hospital" className="font-sans">Westwood Hospital</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={setGender} value={gender}>
              <SelectTrigger className="w-full rounded-xl font-sans">
                <SelectValue placeholder="Gender (Optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any" className="font-sans">Any</SelectItem>
                <SelectItem value="male" className="font-sans">Male</SelectItem>
                <SelectItem value="female" className="font-sans">Female</SelectItem>
                <SelectItem value="other" className="font-sans">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={setAvailability} value={availability}>
              <SelectTrigger className="w-full rounded-xl font-sans">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any" className="font-sans">Any Time</SelectItem>
                <SelectItem value="today" className="font-sans">Today</SelectItem>
                <SelectItem value="tomorrow" className="font-sans">Tomorrow</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Label htmlFor="fee-range-min" className="font-sans text-muted-text">Fee Range:</Label>
              <Input
                id="fee-range-min"
                type="number"
                placeholder="Min $"
                className="w-1/2 rounded-xl font-sans"
                value={minFee}
                onChange={(e) => setMinFee(e.target.value)}
              />
              <Input
                id="fee-range-max"
                type="number"
                placeholder="Max $"
                className="w-1/2 rounded-xl font-sans"
                value={maxFee}
                onChange={(e) => setMaxFee(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="available-now"
                checked={showAvailableNow}
                onCheckedChange={(checked) => setShowAvailableNow(!!checked)}
                className="rounded"
              />
              <Label htmlFor="available-now" className="font-sans text-muted-text">Show Available Now</Label>
            </div>
          </div>
          <div className="mt-6 text-center">
            <MotionButton className="bg-primary-blue hover:bg-primary-blue/90 text-white px-8 py-2 rounded-xl font-sans" whileHover={{ scale: 1.05 }}>
              <SlidersHorizontal className="h-4 w-4 mr-2" /> Apply Filters
            </MotionButton>
          </div>
        </motion.div>

        {/* Doctor List */}
        <h2 className="text-2xl font-bold mb-6 font-michroma">
          {filteredDoctors.length} Doctor{filteredDoctors.length !== 1 ? "s" : ""} Found
        </h2>
        <div className="grid grid-cols-1 gap-6">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5 }}
              >
                <DoctorCard doctor={doctor} />
              </motion.div>
            ))
          ) : (
            <p className="text-center text-lg text-muted-text dark:text-gray-400 font-sans">No doctors found matching your criteria.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorsListing;