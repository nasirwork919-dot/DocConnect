import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { showError } from "@/utils/toast";

interface PatientInquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

const PatientInquiriesTab = () => {
  const [inquiries, setInquiries] = useState<PatientInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('patient_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching patient inquiries:", error);
        showError("Failed to load patient inquiries.");
      } else {
        setInquiries(data || []);
      }
      setLoading(false);
    };

    fetchInquiries();
  }, []);

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
        <CardTitle className="font-michroma">Patient Inquiries</CardTitle>
      </CardHeader>
      <CardContent>
        {inquiries.length === 0 ? (
          <p className="text-center text-muted-text font-sans">No patient inquiries found.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="font-michroma">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Received On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inquiry) => (
                  <TableRow key={inquiry.id} className="font-sans">
                    <TableCell className="font-medium">{inquiry.name}</TableCell>
                    <TableCell>{inquiry.email}</TableCell>
                    <TableCell>{inquiry.subject}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{inquiry.message}</TableCell>
                    <TableCell>{format(new Date(inquiry.created_at), "PPpp")}</TableCell>
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

export default PatientInquiriesTab;