import React from "react";
import { motion } from "framer-motion";
import DoctorCard from "@/components/DoctorCard";
import { Button } from "@/components/ui/button";

const doctors = [
  {
    id: "1",
    name: "Dr. Sarah Mitchell",
    specialization: "Cardiologist",
    experience: 12,
    fees: 120,
    availabilityStatus: "Available Now",
    profilePhotoUrl: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=500&q=80",
    location: "London, UK"
  },
  {
    id: "2",
    name: "Dr. Ethan Brown",
    specialization: "Orthopedic Surgeon",
    experience: 8,
    fees: 100,
    availabilityStatus: "Next Slot: Tomorrow, 9 AM",
    profilePhotoUrl: "https://images.unsplash.com/photo-1606813902741-3b64d41b2b68?auto=format&fit=crop&w=500&q=80",
    location: "Manchester, UK"
  }
];

const HomePage = () => {
  return (
    <div className="font-[Michroma] text-[#1E293B] bg-[#F8FAFC]">
      {/* HERO SECTION */}
      <section
        className="relative flex flex-col items-center justify-center text-center py-28 px-6"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1580281657521-47b2fe8a9e1a?auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-white max-w-3xl"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Connecting You with Trusted Doctors
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-200">
            Find, book, and chat with certified specialists — all in one place.
          </p>
          <Button className="bg-[#00C6A9] hover:bg-[#00a88d] text-white px-6 py-3 rounded-xl text-lg">
            Find a Doctor
          </Button>
        </motion.div>
      </section>

      {/* SEARCH SECTION */}
      <section className="py-12 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl mb-4 font-semibold">Search Doctors</h2>
        <p className="text-[#64748B] mb-6">
          Filter by specialization, location, or availability
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <input
            type="text"
            placeholder="Search by name or specialization"
            className="w-full sm:w-1/2 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2A5DFF]"
          />
          <Button className="bg-[#2A5DFF] hover:bg-[#1E3DBF] text-white px-6 rounded-xl">
            Search
          </Button>
        </div>
      </section>

      {/* FEATURED DOCTORS */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-center mb-10">Featured Doctors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </section>

      {/* CHATBOT TEASER */}
      <section
        className="relative py-20 px-6 text-center text-white"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[#2A5DFF]/80"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl mb-4 font-semibold">Meet Your Virtual Assistant</h2>
          <p className="text-lg mb-6 text-gray-200">
            Our AI chatbot helps patients book appointments, ask questions, and get instant responses — 24/7.
          </p>
          <Button className="bg-white text-[#2A5DFF] hover:bg-gray-100 px-6 py-3 rounded-xl text-lg">
            Try Chatbot Demo
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="relative py-12 text-center text-white"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1587502536263-54e43e9a6d7f?auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10">
          <p className="text-sm">© 2025 MedConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
