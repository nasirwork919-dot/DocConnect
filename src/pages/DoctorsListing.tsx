import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import DoctorCard from "@/components/DoctorCard";
import { SlidersHorizontal, Search, Loader2 } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { fetchAllDoctors, Doctor } from "@/data/doctors"; // Import fetchAllDoctors

const MotionButton = motion.create(Button);

const DoctorsListing = () => {
  const [searchParams] = useSearchParams();

  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  const [specialization, setSpecialization] = useState(searchParams.get("specialization") || "all");
  const [location, setLocation] = useState(searchParams.get("location") || "all");
  const [gender, setGender] = useState(searchParams.get("gender") || "any");
  const [availability, setAvailability] = useState(searchParams.get("availability") || "any");
  const [minFee, setMinFee] = useState<string>(searchParams.get("minFee") || "");
  const [maxFee, setMaxFee] = useState<string>(searchParams.get("maxFee") || "");
  const [showAvailableNow, setShowAvailableNow] = useState(searchParams.get("availableNow") === "true");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const getDoctors = async () => {
      setLoading(true);
      const fetchedDoctors = await fetchAllDoctors();
      setAllDoctors(fetchedDoctors);
      setLoading(false);
    };
    getDoctors();
  }, []);

  const quickSearchRef = useRef(null);
  const quickSearchInView = useInView(quickSearchRef, { amount: 0.1 });

  const advancedFiltersRef = useRef(null);
  const advancedFiltersInView = useInView(advancedFiltersRef, { amount: 0.1 });

  const filteredDoctors = useMemo(() => {
    return allDoctors.filter((doctor: Doctor) => {
      const matchesSearchTerm = searchTerm
        ? doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const matchesSpecialization =
        specialization === "all" || doctor.specialization.toLowerCase() === specialization;

      const matchesLocation =
        location === "all" || doctor.location.toLowerCase() === location;

      const matchesGender =
        gender === "any" || doctor.gender.toLowerCase() === gender;

      const matchesAvailability =
        availability === "any" ||
        (availability === "today" && doctor.availability_status.includes("Today")) ||
        (availability === "tomorrow" && doctor.availability_status.includes("Tomorrow"));

      const fee = doctor.consultation_fee;
      const matchesMinFee = minFee === "" || fee >= parseFloat(minFee);
      const matchesMaxFee = maxFee === "" || fee <= parseFloat(maxFee);

      const matchesAvailableNow = showAvailableNow
        ? doctor.availability_status === "Now Available"
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
  }, [allDoctors, specialization, location, gender, availability, minFee, maxFee, showAvailableNow, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light text-heading-dark font-michroma">
        <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light text-heading-dark py-8 font-michroma">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-10 font-michroma">Our Doctors</h1>

        <section
          className="relative bg-cover bg-center py-12 rounded-2xl mb-8 bg-fixed"
          style={{ backgroundImage: `url('https://i.pinimg.com/736x/70/5c/6c/705c6ceed87510dc18ea86fcc048cb5d.jpg')` }}
        >
          <div className="absolute inset-0 bg-background-light/80 dark:bg-heading-dark/80 rounded-2xl"></div>
          <div className="relative z-10 container mx-auto px-4">
            <motion.div
              ref={quickSearchRef}
              animate={{ opacity: quickSearchInView ? 1 : 0, y: quickSearchInView ? 0 : 20 }}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.currentTarget.value)}
                />
                <MotionButton className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white rounded-xl font-sans" whileHover={{ scale: 1.05 }}>
                  <Search className="mr-2 h-4 w-4" /> Search
                </MotionButton>
              </div>
            </motion.div>

            <motion.div
              ref={advancedFiltersRef}
              animate={{ opacity: advancedFiltersInView ? 1 : 0, y: advancedFiltersInView ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card-background p-6 rounded-2xl shadow-[0_4px_14px_rgba(0,0,0,0.07)]"
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMinFee(e.currentTarget.value)}
                  />
                  <Input
                    id="fee-range-max"
                    type="number"
                    placeholder="Max $"
                    className="w-1/2 rounded-xl font-sans"
                    value={maxFee}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxFee(e.currentTarget.value)}
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
                <MotionButton className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white px-8 py-2 rounded-xl font-sans" whileHover={{ scale: 1.05 }}>
                  <SlidersHorizontal className="h-4 w-4 mr-2" /> Apply Filters
                </MotionButton>
              </div>
            </motion.div>
          </div>
        </section>

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
                viewport={{ once: false, amount: 0.1 }}
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