import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookingsTab from "@/components/admin/BookingsTab";
import PatientInquiriesTab from "@/components/admin/PatientInquiriesTab";
import AttendanceTab from "@/components/admin/AttendanceTab";
import { CalendarCheck, MessageSquare, UserCheck } from "lucide-react";

const AdminPanel = () => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-heading-dark text-heading-dark dark:text-gray-50 py-8 font-michroma">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold text-center mb-10 text-primary-blue dark:text-primary/70 font-michroma">Admin Panel</h1>

        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-8 bg-card-background dark:bg-card rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.07)]">
            <TabsTrigger value="bookings" className="flex items-center justify-center space-x-2 font-sans text-lg py-3 rounded-xl data-[state=active]:bg-primary-blue data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
              <CalendarCheck className="h-5 w-5" />
              <span>Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="flex items-center justify-center space-x-2 font-sans text-lg py-3 rounded-xl data-[state=active]:bg-primary-blue data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
              <MessageSquare className="h-5 w-5" />
              <span>Inquiries</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center justify-center space-x-2 font-sans text-lg py-3 rounded-xl data-[state=active]:bg-primary-blue data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
              <UserCheck className="h-5 w-5" />
              <span>Attendance</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <BookingsTab />
          </TabsContent>
          <TabsContent value="inquiries">
            <PatientInquiriesTab />
          </TabsContent>
          <TabsContent value="attendance">
            <AttendanceTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;