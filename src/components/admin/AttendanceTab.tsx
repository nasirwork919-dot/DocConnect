import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { showError } from "@/utils/toast";
import { fetchAllDoctors, Doctor } from "@/data/doctors";

interface DoctorAttendance {
  id: string;
  doctor_id: string;
  timestamp: string;
  event_type: string;
  camera_location: string | null;
  confidence_score: number | null;
  created_at: string;
}

const AttendanceTab = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<DoctorAttendance[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch doctors first to map doctor_id to name
      const fetchedDoctors = await fetchAllDoctors();
      setDoctors(fetchedDoctors);

      const { data, error } = await supabase
        .from('doctor_attendance')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching attendance records:", error);
        showError("Failed to load attendance records.");
      } else {
        setAttendanceRecords(data || []);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
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
        <CardTitle className="font-michroma">Doctor Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        {attendanceRecords.length === 0 ? (
          <p className="text-center text-muted-text font-sans">No attendance records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="font-michroma">
                  <TableHead>Doctor</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Camera Location</TableHead>
                  <TableHead>Confidence Score</TableHead>
                  <TableHead>Recorded At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.map((record) => (
                  <TableRow key={record.id} className="font-sans">
                    <TableCell className="font-medium">{getDoctorName(record.doctor_id)}</TableCell>
                    <TableCell>{record.event_type}</TableCell>
                    <TableCell>{format(new Date(record.timestamp), "PPpp")}</TableCell>
                    <TableCell>{record.camera_location || "N/A"}</TableCell>
                    <TableCell>{record.confidence_score ? record.confidence_score.toFixed(2) : "N/A"}</TableCell>
                    <TableCell>{format(new Date(record.created_at), "PPpp")}</TableCell>
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

export default AttendanceTab;