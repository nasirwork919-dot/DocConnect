"use client";

import React, { useState } from "react";
import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { showSuccess, showError } from "@/utils/toast"; // Assuming these exist from previous steps

// Dummy data for doctors (should ideally come from an API)
const DUMMY_DOCTORS = [
  {
    id: "1",
    name: "Dr. Emily White",
    specialization: "Cardiology",
    fees: 150,
    availability: {
      "2024-08-10": ["09:00 AM", "10:00 AM", "11:00 AM"],
      "2024-08-11": ["02:00 PM", "03:00 PM"],
    },
  },
  {
    id: "2",
    name: "Dr. John Smith",
    specialization: "Neurology",
    fees: 120,
    availability: {
      "2024-08-10": ["01:00 PM", "02:00 PM", "04:00 PM"],
      "2024-08-12": ["09:00 AM", "10:00 AM"],
    },
  },
  {
    id: "3",
    name: "Dr. Sarah Chen",
    specialization: "Pediatrics",
    fees: 180,
    availability: {
      "2024-08-13": ["08:00 AM", "09:00 AM", "10:00 AM"],
      "2024-08-14": ["01:00 PM", "02:00 PM"],
    },
  },
  {
    id: "4",
    name: "Dr. Michael Brown",
    specialization: "Dermatology",
    fees: 130,
    availability: {
      "2024-08-15": ["11:00 AM", "12:00 PM", "03:00 PM"],
      "2024-08-16": ["09:00 AM", "10:00 AM"],
    },
  },
];

const formSchema = z.object({
  doctorId: z.string().min(1, { message: "Please select a doctor." }),
  appointmentDate: z.date({
    required_error: "A date for your appointment is required.",
  }),
  appointmentTime: z.string().min(1, { message: "Please select a time slot." }),
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, { message: "Please enter a valid phone number." }),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select your gender.",
  }),
  age: z.string().min(1, { message: "Age is required." }).transform(Number).refine(age => age > 0 && age < 120, {
    message: "Age must be between 1 and 119.",
  }),
  reasonForVisit: z.string().min(10, { message: "Please describe your reason for visit (at least 10 characters)." }),
});

const AppointmentBookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialDoctorId = searchParams.get("doctorId");

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointmentConfirmed, setAppointmentConfirmed] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState<z.infer<typeof formSchema> | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doctorId: initialDoctorId || "",
      appointmentDate: undefined,
      appointmentTime: "",
      fullName: "",
      email: "",
      phone: "",
      gender: undefined,
      age: undefined, // Changed from "" to undefined
      reasonForVisit: "",
    },
  });

  const watchDoctorId = form.watch("doctorId");
  const watchAppointmentDate = form.watch("appointmentDate");

  React.useEffect(() => {
    if (watchDoctorId && watchAppointmentDate) {
      const doctor = DUMMY_DOCTORS.find(d => d.id === watchDoctorId);
      if (doctor) {
        const formattedDate = format(watchAppointmentDate, "yyyy-MM-dd");
        const slots = doctor.availability[formattedDate] || [];
        setAvailableTimeSlots(slots);
        form.setValue("appointmentTime", ""); // Reset time when date changes
      }
    } else {
      setAvailableTimeSlots([]);
    }
  }, [watchDoctorId, watchAppointmentDate, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Appointment booked:", values);
      setAppointmentDetails(values);
      setAppointmentConfirmed(true);
      showSuccess("Appointment booked successfully!");
    } catch (error) {
      console.error("Booking error:", error);
      showError("Failed to book appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const doctor = DUMMY_DOCTORS.find(d => d.id === form.getValues("doctorId"));

  if (appointmentConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50 py-8">
        <Card className="w-full max-w-md p-6 text-center shadow-lg">
          <CardHeader>
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <CardTitle className="text-3xl font-bold">Appointment Confirmed!</CardTitle>
            <CardDescription className="text-lg">Your appointment has been successfully booked.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {appointmentDetails && (
              <>
                <p><strong>Doctor:</strong> {DUMMY_DOCTORS.find(d => d.id === appointmentDetails.doctorId)?.name}</p>
                <p><strong>Date:</strong> {format(appointmentDetails.appointmentDate, "PPP")}</p>
                <p><strong>Time:</strong> {appointmentDetails.appointmentTime}</p>
                <p><strong>Patient:</strong> {appointmentDetails.fullName}</p>
                <p><strong>Reason:</strong> {appointmentDetails.reasonForVisit}</p>
              </>
            )}
            <Button onClick={() => navigate("/")} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Return to Home
            </Button>
            <Button variant="outline" onClick={() => navigate("/doctors")} className="w-full">
              Browse More Doctors
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button variant="link" asChild className="mb-6 pl-0 text-blue-600 dark:text-blue-400">
          <Link to={initialDoctorId ? `/doctors/${initialDoctorId}` : "/doctors"}>
            ← Back to {initialDoctorId ? "Doctor Profile" : "Doctors Listing"}
          </Link>
        </Button>

        <Card className="p-6 shadow-lg bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Book Your Appointment</CardTitle>
            <CardDescription className="text-center">
              Please fill in the details to book your consultation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {step === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold mb-4">Step 1: Select Doctor & Time</h2>
                    <FormField
                      control={form.control}
                      name="doctorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Doctor</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a doctor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DUMMY_DOCTORS.map((doc) => (
                                <SelectItem key={doc.id} value={doc.id}>
                                  {doc.name} - {doc.specialization} (${doc.fees})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchDoctorId && (
                      <>
                        <FormField
                          control={form.control}
                          name="appointmentDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Appointment Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={(date) => {
                                      field.onChange(date);
                                      setSelectedDate(date);
                                    }}
                                    disabled={(date) =>
                                      date < new Date() ||
                                      !Object.keys(DUMMY_DOCTORS.find(d => d.id === watchDoctorId)?.availability || {}).includes(format(date, "yyyy-MM-dd"))
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {watchAppointmentDate && availableTimeSlots.length > 0 && (
                          <FormField
                            control={form.control}
                            name="appointmentTime"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>Available Time Slots</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-wrap gap-2"
                                  >
                                    {availableTimeSlots.map((slot) => (
                                      <FormItem key={slot}>
                                        <FormControl>
                                          <RadioGroupItem value={slot} id={`time-slot-${slot}`} className="sr-only" />
                                        </FormControl>
                                        <FormLabel
                                          htmlFor={`time-slot-${slot}`}
                                          className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary text-sm cursor-pointer"
                                        >
                                          {slot}
                                        </FormLabel>
                                      </FormItem>
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        {watchAppointmentDate && availableTimeSlots.length === 0 && (
                          <p className="text-red-500 text-sm">No slots available for this date.</p>
                        )}
                      </>
                    )}
                    <Button
                      type="button"
                      onClick={() => {
                        form.trigger(["doctorId", "appointmentDate", "appointmentTime"]).then((isValid) => {
                          if (isValid) {
                            setStep(2);
                          } else {
                            showError("Please complete all fields in Step 1.");
                          }
                        });
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Next: Patient Details
                    </Button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold mb-4">Step 2: Patient Details</h2>
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john.doe@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+15551234567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Gender</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="male" />
                                </FormControl>
                                <FormLabel className="font-normal">Male</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="female" />
                                </FormControl>
                                <FormLabel className="font-normal">Female</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="other" />
                                </FormControl>
                                <FormLabel className="font-normal">Other</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="30" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="reasonForVisit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason for Visit</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Briefly describe your symptoms or reason for visit."
                              className="resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-between gap-4">
                      <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-full">
                        Previous
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          form.trigger(["fullName", "email", "phone", "gender", "age", "reasonForVisit"]).then((isValid) => {
                            if (isValid) {
                              setStep(3);
                            } else {
                              showError("Please complete all patient details.");
                            }
                          });
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Next: Review & Confirm
                      </Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold mb-4">Step 3: Review & Confirm</h2>
                    <Card className="p-4 bg-blue-50 dark:bg-blue-950">
                      <CardHeader className="p-0 mb-4">
                        <CardTitle className="text-xl">Appointment Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 space-y-2 text-gray-700 dark:text-gray-300">
                        <p><strong>Doctor:</strong> {doctor?.name} ({doctor?.specialization})</p>
                        <p><strong>Date:</strong> {form.getValues("appointmentDate") ? format(form.getValues("appointmentDate"), "PPP") : "N/A"}</p>
                        <p><strong>Time:</strong> {form.getValues("appointmentTime")}</p>
                        <p><strong>Consultation Fee:</strong> ${doctor?.fees}</p>
                        <p><strong>Patient Name:</strong> {form.getValues("fullName")}</p>
                        <p><strong>Email:</strong> {form.getValues("email")}</p>
                        <p><strong>Phone:</strong> {form.getValues("phone")}</p>
                        <p><strong>Gender:</strong> {form.getValues("gender")}</p>
                        <p><strong>Age:</strong> {form.getValues("age")}</p>
                        <p><strong>Reason:</strong> {form.getValues("reasonForVisit")}</p>
                      </CardContent>
                    </Card>
                    <div className="flex justify-between gap-4">
                      <Button type="button" variant="outline" onClick={() => setStep(2)} className="w-full">
                        Previous
                      </Button>
                      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirming...
                          </>
                        ) : (
                          "Confirm Appointment"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentBookingPage;