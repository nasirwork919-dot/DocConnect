import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { showError } from "@/utils/toast";
import { ALL_DOCTORS } from "@/data/doctors"; // Import ALL_DOCTORS

interface Booking {
  id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  full_name: string;
  email: string;
  phone: string;
  gender: string;
  age: number;
  reason_for_visit: string;
  created_at: string;
}

const BookingsTab = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching bookings:", error);
        showError("Failed to load bookings.");
      } else {
        setBookings(data || []);
      }
      setLoading(false);
    };

    fetchBookings();
  }, []);

  const getDoctorName = (doctorId: string) => {
    const doctor = ALL_DOCTORS.find(d => d.id === doctorId);
    return doctor ? doctor.name : "Unknown Doctor";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
      </div>
    );
  }

  return (
    <Card className="rounded-2xl shadow-[0_4px_14px_rgba(0,0,0,0.07)]">
      <CardHeader>
        <CardTitle className="font-michroma">All Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <p className="text-center text-muted-text font-sans">No bookings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="font-michroma">
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Booked On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id} className="font-sans">
                    <TableCell className="font-medium">{booking.full_name}</TableCell>
                    <TableCell>{getDoctorName(booking.doctor_id)}</TableCell>
                    <TableCell>{format(new Date(booking.appointment_date), "PPP")}</TableCell>
                    <TableCell>{booking.appointment_time}</TableCell>
                    <TableCell>{booking.email}</TableCell>
                    <TableCell>{booking.phone}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{booking.reason_for_visit}</TableCell>
                    <TableCell>{format(new Date(booking.created_at), "PPpp")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingsTab;