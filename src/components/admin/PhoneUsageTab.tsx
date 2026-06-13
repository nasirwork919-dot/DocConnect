import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Smartphone, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface PhoneUsageRecord {
  id: string;
  doctor_id: string;
  doctor_name: string;
  session_start: string;
  session_end: string;
  duration_seconds: number;
  camera_location: string;
  created_at: string;
}

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

const PhoneUsageTab = () => {
  const [records, setRecords] = useState<PhoneUsageRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("phone_usage")
        .select("*")
        .order("session_start", { ascending: false });

      if (error) {
        console.error("Error fetching phone usage:", error);
      } else {
        setRecords(data || []);
      }
      setLoading(false);
    };
    fetchRecords();
  }, []);

  const totalByDoctor: Record<string, number> = {};
  records.forEach(r => {
    totalByDoctor[r.doctor_name] = (totalByDoctor[r.doctor_name] || 0) + r.duration_seconds;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {Object.keys(totalByDoctor).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(totalByDoctor).map(([name, secs]) => (
            <Card key={name} className="bg-card-background shadow-sm rounded-xl border-l-4 border-red-400">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-red-400" />
                  <div>
                    <p className="font-semibold text-sm font-michroma">{name}</p>
                    <p className="text-muted-text text-xs font-sans">Total: {formatDuration(secs)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Records Table */}
      <Card className="bg-card-background shadow-[0_4px_14px_rgba(0,0,0,0.07)] rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-michroma flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary-blue" />
            Phone Usage Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-center text-muted-text font-sans py-10">No phone usage recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-michroma">Doctor</TableHead>
                    <TableHead className="font-michroma">Session Start</TableHead>
                    <TableHead className="font-michroma">Session End</TableHead>
                    <TableHead className="font-michroma">Duration</TableHead>
                    <TableHead className="font-michroma">Camera</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-sans font-medium">{r.doctor_name}</TableCell>
                      <TableCell className="font-sans text-sm">
                        {format(new Date(r.session_start), "PPp")}
                      </TableCell>
                      <TableCell className="font-sans text-sm">
                        {format(new Date(r.session_end), "PPp")}
                      </TableCell>
                      <TableCell>
                        <span className={`font-sans font-semibold ${r.duration_seconds > 120 ? "text-red-500" : "text-yellow-600"}`}>
                          {formatDuration(r.duration_seconds)}
                        </span>
                      </TableCell>
                      <TableCell className="font-sans text-muted-text text-sm">{r.camera_location}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PhoneUsageTab;
