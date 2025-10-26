"use client";

import React, { useState } from "react";
import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
import { showSuccess, showError } from "@/utils/toast";
import { ALL_DOCTORS } from "@/data/doctors";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/components/SessionContextProvider";

// Create a motion-compatible Button component
const MotionButton = motion.create(Button);

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
  const { user, isLoading: isSessionLoading } = useSession();
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
      age: undefined,
      reasonForVisit: "",
    },
  });

  const watchDoctorId = form.watch("doctorId");
  const watchAppointmentDate = form.watch("appointmentDate");

  React.useEffect(() => {
    if (watchDoctorId && watchAppointmentDate) {
      const doctor = ALL_DOCTORS.find(d => d.id === watchDoctorId);
      if (doctor) {
        const formattedDate = format(watchAppointmentDate, "yyyy-MM-dd");
        // This part needs to be dynamic based on the doctor's availabilitySchedule
        // For now, using a simplified dummy availability for booking form
        const dummyBookingAvailability: { [key: string]: string[] } = {
          "2024-08-10": ["09:00 AM", "10:00 AM", "11:00 AM"],
          "2024-08-11": ["02:00 PM", "03:00 PM"],
          "2024-08-12": ["09:00 AM", "10:00 AM", "01:00 PM"],
          "2024-08-13": ["08:00 AM", "09:00 AM", "10:00 AM"],
          "2024-08-14": ["01:00 PM", "02:00 PM", "04:00 PM"],
          "2024-08-15": ["11:00 AM", "12:00 PM", "03:00 PM"],
          "2024-08-16": ["09:00 AM", "10:00 AM", "02:00 PM"],
          "2024-08-17": ["09:00 AM", "10:00 AM", "11:00 AM"],
          "2024-08-18": ["02:00 PM", "03:00 PM"],
          "2024-08-19": ["09:00 AM", "10:00 AM", "01:00 PM"],
          "2024-08-20": ["08:00 AM", "09:00 AM", "10:00 AM"],
          "2024-08-21": ["01:00 PM", "02:00 PM", "04:00 PM"],
          "2024-08-22": ["11:00 AM", "12:00 PM", "03:00 PM"],
          "2024-08-23": ["09:00 AM", "10:00 AM", "02:00 PM"],
        };
        const slots = dummyBookingAvailability[formattedDate] || [];
        setAvailableTimeSlots(slots);
        form.setValue("appointmentTime", ""); // Reset time when date changes
      }
    } else {
      setAvailableTimeSlots([]);
    }
  }, [watchDoctorId, watchAppointmentDate, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Booking form submitted. Values:", values); // Log submitted values

    if (!user) {
      console.warn("User not logged in. Redirecting to login."); // Log warning
      showError("Please log in to book an appointment.");
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingData = {
        user_id: user.id,
        doctor_id: values.doctorId,
        appointment_date: format(values.appointmentDate, "yyyy-MM-dd"),
        appointment_time: values.appointmentTime,
        full_name: values.fullName,
        email: values.email,
        phone: values.phone,
        gender: values.gender,
        age: values.age,
        reason_for_visit: values.reasonForVisit,
      };
      console.log("Attempting to insert booking data into Supabase:", bookingData); // Log data before insert

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData);

      if (error) {
        console.error("Supabase insert error:", error); // Log detailed Supabase error
        throw error;
      }

      console.log("Appointment booked successfully. Supabase response data:", data); // Log success data
      setAppointmentDetails(values);
      setAppointmentConfirmed(true);
      showSuccess("Appointment booked successfully!");
    } catch (error: any) {
      console.error("Booking process failed:", error.message); // Log general error message
      showError(`Failed to book appointment: ${error.message || "Please try again."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const doctor = ALL_DOCTORS.find(d => d.id === form.getValues("doctorId"));

  if (isSessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light text-heading-dark py-8 font-michroma">
        <Loader2 className="h-10 w-10 animate-spin text-primary-blue" />
        <p className="ml-3 text-lg font-sans">Loading user session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light text-heading-dark py-8 font-michroma">
        <Card className="w-full max-w-md p-6 text-center shadow-[0_4px_14px_rgba(0,0,0,0.07)] rounded-2xl bg-card-background">
          <CardHeader>
            <CardTitle className="text-3xl font-bold font-michroma">Authentication Required</CardTitle>
            <CardDescription className="text-lg font-sans text-muted-text">
              Please log in or sign up to book an appointment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MotionButton onClick={() => navigate('/login')} className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white rounded-xl font-sans" whileHover={{ scale: 1.05 }}>
              Go to Login
            </MotionButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (appointmentConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light text-heading-dark py-8 font-michroma">
        <Card className="w-full max-w-md p-6 text-center shadow-[0_4px_14px_rgba(0,0,0,0.07)] rounded-2xl bg-card-background">
          <CardHeader>
            <CheckCircle2 className="mx-auto h-16 w-16 text-secondary-teal mb-4" />
            <CardTitle className="text-3xl font-bold font-michroma">Appointment Confirmed!</CardTitle>
            <CardDescription className="text-lg font-sans text-muted-text">Your appointment has been successfully booked.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 font-sans text-heading-dark dark:text-gray-50">
            {appointmentDetails && (
              <>
                <p><strong>Doctor:</strong> {ALL_DOCTORS.find(d => d.id === appointmentDetails.doctorId)?.name}</p>
                <p><strong>Date:</strong> {appointmentDetails.appointmentDate ? format(appointmentDetails.appointmentDate, "PPP") : "N/A"}</p>
                <p><strong>Time:</strong> {appointmentDetails.appointmentTime}</p>
                <p><strong>Patient:</strong> {appointmentDetails.fullName}</p>
                <p><strong>Reason:</strong> {appointmentDetails.reasonForVisit}</p>
              </>
            )}
            <MotionButton onClick={() => navigate("/")} className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white rounded-xl font-sans" whileHover={{ scale: 1.05 }}>
              Return to Home
            </MotionButton>
            <MotionButton variant="outline" onClick={() => navigate("/doctors")} className="w-full rounded-xl border-muted-text text-muted-text hover:bg-muted-text/10 font-sans" whileHover={{ scale: 1.05 }}>
              Browse More Doctors
            </MotionButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stepVariants = {
    enter: { opacity: 0, x: 100 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };

  return (
    <div className="min-h-screen bg-background-light text-heading-dark py-8 font-michroma">
      <div className="container mx-auto px-4 max-w-3xl">
        <MotionButton variant="link" asChild className="mb-6 pl-0 text-primary-blue dark:text-primary/70 font-sans">
          <Link to={initialDoctorId ? `/doctors/${initialDoctorId}` : "/doctors"}>
            ← Back to {initialDoctorId ? "Doctor Profile" : "Doctors Listing"}
          </Link>
        </MotionButton>

        <Card className="p-6 shadow-[0_4px_14px_rgba(0,0,0,0.07)] bg-card-background rounded-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center font-michroma">Book Your Appointment</CardTitle>
            <CardDescription className="text-center font-sans text-muted-text">
              Please fill in the details to book your consultation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-semibold mb-4 font-michroma">Step 1: Select Doctor & Time</h2>
                      <FormField
                        control={form.control}
                        name="doctorId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-sans">Doctor</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-xl font-sans">
                                  <SelectValue placeholder="Select a doctor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ALL_DOCTORS.map((doc) => (
                                  <SelectItem key={doc.id} value={doc.id} className="font-sans">
                                    {doc.name} - {doc.specialization} (${doc.consultationFee})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="font-sans" />
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
                                <FormLabel className="font-sans">Appointment Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <MotionButton
                                        variant={"outline"}
                                        className={cn(
                                          "w-full pl-3 text-left font-normal rounded-xl font-sans",
                                          !field.value && "text-muted-text"
                                        )}
                                        whileHover={{ scale: 1.02 }}
                                      >
                                        <div className="flex items-center justify-between w-full">
                                          {field.value ? (
                                            format(field.value, "PPP")
                                          ) : (
                                            <span className="font-sans">Pick a date</span>
                                          )}
                                          <CalendarIcon className="h-4 w-4 opacity-50" />
                                        </div>
                                      </MotionButton>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0 rounded-2xl bg-card-background" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={(date) => {
                                        field.onChange(date);
                                        setSelectedDate(date);
                                      }}
                                      disabled={(date) =>
                                        date < new Date() ||
                                        !Object.keys(ALL_DOCTORS.find(d => d.id === watchDoctorId)?.availabilitySchedule || {}).includes(format(date, "EEEE").toLowerCase())
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage className="font-sans" />
                              </FormItem>
                            )}
                          />

                          {watchAppointmentDate && availableTimeSlots.length > 0 && (
                            <FormField
                              control={form.control}
                              name="appointmentTime"
                              render={({ field }) => (
                                <FormItem className="space-y-3">
                                  <FormLabel className="font-sans">Available Time Slots</FormLabel>
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
                                            className="flex items-center justify-center rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary-blue text-sm cursor-pointer font-sans"
                                          >
                                            {slot}
                                          </FormLabel>
                                        </FormItem>
                                      ))}
                                    </RadioGroup>
                                  </FormControl>
                                  <FormMessage className="font-sans" />
                                </FormItem>
                              )}
                            />
                          )}
                          {watchAppointmentDate && availableTimeSlots.length === 0 && (
                            <p className="text-destructive text-sm font-sans">No slots available for this date.</p>
                          )}
                        </>
                      )}
                      <MotionButton
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
                        className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white rounded-xl font-sans"
                        whileHover={{ scale: 1.05 }}
                      >
                        Next: Patient Details
                      </MotionButton>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-semibold mb-4 font-michroma">Step 2: Patient Details</h2>
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-sans">Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} className="rounded-xl font-sans" />
                            </FormControl>
                            <FormMessage className="font-sans" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-sans">Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john.doe@example.com" {...field} className="rounded-xl font-sans" />
                            </FormControl>
                            <FormMessage className="font-sans" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-sans">Phone Number</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="+15551234567" {...field} className="rounded-xl font-sans" />
                            </FormControl>
                            <FormMessage className="font-sans" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="font-sans">Gender</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="male" className="rounded-full" />
                                  </FormControl>
                                  <FormLabel className="font-normal font-sans">Male</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="female" className="rounded-full" />
                                  </FormControl>
                                  <FormLabel className="font-normal font-sans">Female</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="other" className="rounded-full" />
                                  </FormControl>
                                  <FormLabel className="font-normal font-sans">Other</FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage className="font-sans" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-sans">Age</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="30" {...field} className="rounded-xl font-sans" />
                            </FormControl>
                            <FormMessage className="font-sans" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="reasonForVisit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-sans">Reason for Visit</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Briefly describe your symptoms or reason for visit."
                                className="resize-y rounded-xl font-sans"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="font-sans" />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-between gap-4">
                        <MotionButton type="button" variant="outline" onClick={() => setStep(1)} className="w-full rounded-xl border-muted-text text-muted-text hover:bg-muted-text/10 font-sans" whileHover={{ scale: 1.05 }}>
                          Previous
                        </MotionButton>
                        <MotionButton
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
                          className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white rounded-xl font-sans"
                          whileHover={{ scale: 1.05 }}
                        >
                          Next: Review & Confirm
                        </MotionButton>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-semibold mb-4 font-michroma">Step 3: Review & Confirm</h2>
                      <Card className="p-4 bg-primary-blue/10 dark:bg-primary-blue/20 rounded-2xl">
                        <CardHeader className="p-0 mb-4">
                          <CardTitle className="text-xl font-michroma text-heading-dark dark:text-gray-50">Appointment Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-2 text-muted-text font-sans">
                          <p><strong>Doctor:</strong> {doctor?.name} ({doctor?.specialization})</p>
                          <p><strong>Date:</strong> {form.getValues("appointmentDate") ? format(form.getValues("appointmentDate"), "PPP") : "N/A"}</p>
                          <p><strong>Time:</strong> {form.getValues("appointmentTime")}</p>
                          <p><strong>Consultation Fee:</strong> ${doctor?.consultationFee}</p>
                          <p><strong>Patient Name:</strong> {form.getValues("fullName")}</p>
                          <p><strong>Email:</strong> {form.getValues("email")}</p>
                          <p><strong>Phone:</strong> {form.getValues("phone")}</p>
                          <p><strong>Gender:</strong> {form.getValues("gender")}</p>
                          <p><strong>Age:</strong> {form.getValues("age")}</p>
                          <p><strong>Reason:</strong> {form.getValues("reasonForVisit")}</p>
                        </CardContent>
                      </Card>
                      <div className="flex justify-between gap-4">
                        <MotionButton type="button" variant="outline" onClick={() => setStep(2)} className="w-full rounded-xl border-muted-text text-muted-text hover:bg-muted-text/10 font-sans" whileHover={{ scale: 1.05 }}>
                          Previous
                        </MotionButton>
                        <MotionButton type="submit" className="w-full bg-secondary-teal hover:bg-secondary-teal/90 text-white rounded-xl font-sans" disabled={isSubmitting} whileHover={{ scale: 1.05 }}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirming...
                            </>
                          ) : (
                            "Confirm Appointment"
                          )}
                        </MotionButton>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentBookingPage;