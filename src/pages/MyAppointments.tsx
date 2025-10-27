"use client";

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/components/SessionContextProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CalendarDays, Stethoscope, Clock, User, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ALL_DOCTORS, Doctor } from "@/data/doctors"; // Import ALL_DOCTORS to get doctor details

interface Appointment {
  id: string;
  user_id: string;
  doctor_id: string;
  appointment_date: string; // Stored as string in DB
  appointment_time: string;
  full_name: string;
  email: string;
  phone: string;
  gender: "male" | "female" | "other";
  age: number;
  reason_for_visit: string;
  created_at: string;
}

const MyAppointments = () => {
  const { user, isLoading: isSessionLoading } = useSession();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSessionLoading && !user) {
      navigate('/login');
      return;
    }

    const fetchAppointments = async () => {
      if (!user) return;

      setLoadingAppointments(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('appointment_date', { ascending: true })
          .order('appointment_time', { ascending: true });

        if (error) {
          throw error;
        }

        setAppointments(data || []);
      } catch (err: any) {
        console.error("Error fetching appointments:", err);
        setError("Failed to load appointments. Please try again.");
      } finally {
        setLoadingAppointments(false);
      }
    };

    if (user) {
      fetchAppointments();
    }
  }, [user, isSessionLoading, navigate]);

  if (isSessionLoading || loadingAppointments) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light text-heading-dark py-8 font-michroma">
        <Loader2 className="h-10 w-10 animate-spin text-primary-blue" />
        <p className="ml-3 text-lg font-sans">Loading appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light text-heading-dark py-8 font-michroma">
        <Card className="w-full max-w-md p-6 text-center shadow-[0_4px_14px_rgba(0,0,0,0.07)] rounded-2xl bg-card-background">
          <CardHeader>
            <CardTitle className="text-3xl font-bold font-michroma text-destructive">Error</CardTitle>
            <CardDescription className="text-lg font-sans text-muted-text">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white rounded-xl font-sans">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light text-heading-dark py-8 font-michroma">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-10 text-primary-blue dark:text-primary/70 font-michroma">My Appointments</h1>

        {appointments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center p-8 bg-card-background dark:bg-heading-dark rounded-2xl shadow-[0_4px_14px_rgba(0,0,0,0.07)]"
          >
            <p className="text-xl text-muted-text dark:text-gray-300 mb-6 font-sans">You don't have any upcoming appointments yet.</p>
            <Button asChild className="bg-primary-blue hover:bg-primary-blue/90 text-white rounded-xl px-6 py-3 text-lg font-sans">
              <Link to="/doctors">Book Your First Appointment</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {appointments.map((appointment) => {
              const doctor = ALL_DOCTORS.find(d => d.id === appointment.doctor_id);
              const appointmentDate = new Date(appointment.appointment_date);
              const isPastAppointment = appointmentDate < new Date();

              return (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="p-6 shadow-[0_4px_14px_rgba(0,0,0,0.07)] bg-card-background dark:bg-heading-dark rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between p-0 mb-4">
                      <div>
                        <CardTitle className="text-2xl font-bold font-michroma">{doctor?.name || "Unknown Doctor"}</CardTitle>
                        <CardDescription className="text-primary-blue flex items-center font-sans">
                          <Stethoscope className="h-4 w-4 mr-2 text-secondary-teal" />
                          {doctor?.specialization || "Specialization N/A"}
                        </CardDescription>
                      </div>
                      <Badge className={`font-sans ${isPastAppointment ? "bg-muted-text/20 text-muted-text" : "bg-secondary-teal text-white"}`}>
                        {isPastAppointment ? "Past" : "Upcoming"}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-0 space-y-3 text-muted-text dark:text-gray-300 font-sans">
                      <p className="flex items-center">
                        <CalendarDays className="h-4 w-4 mr-2 text-primary-blue" />
                        Date: {format(appointmentDate, "PPP")}
                      </p>
                      <p className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-primary-blue" />
                        Time: {appointment.appointment_time}
                      </p>
                      <p className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-primary-blue" />
                        Patient: {appointment.full_name}
                      </p>
                      <p className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-primary-blue" />
                        Email: {appointment.email}
                      </p>
                      <p className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-primary-blue" />
                        Phone: {appointment.phone}
                      </p>
                      <p><strong>Reason for Visit:</strong> {appointment.reason_for_visit}</p>
                      {!isPastAppointment && (
                        <div className="mt-4 flex justify-end">
                          <Button variant="outline" className="rounded-xl border-destructive text-destructive hover:bg-destructive/10 font-sans">
                            Cancel Appointment
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;