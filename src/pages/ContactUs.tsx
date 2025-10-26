import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { showSuccess, showError } from "@/utils/toast";
import { motion } from "framer-motion"; // Import motion

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

const ContactUs = () => {
  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof contactFormSchema>) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Contact form submitted:", values);
      showSuccess("Your message has been sent successfully!");
      form.reset();
    } catch (error) {
      console.error("Contact form submission error:", error);
      showError("Failed to send your message. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 text-foreground dark:text-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-10 text-primary dark:text-primary/70 font-heading">Contact Us</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-6 shadow-lg bg-card dark:bg-gray-800 rounded-2xl h-full">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-semibold mb-2 font-heading">Get in Touch</CardTitle>
                <CardDescription className="font-sans text-muted-foreground">
                  We'd love to hear from you! Fill out the form below or reach us through other channels.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="font-sans">Name</Label>
                    <Input id="name" placeholder="Your Name" {...form.register("name")} className="rounded-xl font-sans" />
                    {form.formState.errors.name && (
                      <p className="text-destructive text-sm mt-1 font-sans">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email" className="font-sans">Email</Label>
                    <Input id="email" type="email" placeholder="your@example.com" {...form.register("email")} className="rounded-xl font-sans" />
                    {form.formState.errors.email && (
                      <p className="text-destructive text-sm mt-1 font-sans">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="subject" className="font-sans">Subject</Label>
                    <Input id="subject" placeholder="Subject of your message" {...form.register("subject")} className="rounded-xl font-sans" />
                    {form.formState.errors.subject && (
                      <p className="text-destructive text-sm mt-1 font-sans">{form.formState.errors.subject.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="message" className="font-sans">Message</Label>
                    <Textarea id="message" placeholder="Your message..." rows={5} {...form.register("message")} className="resize-y rounded-xl font-sans" />
                    {form.formState.errors.message && (
                      <p className="text-destructive text-sm mt-1 font-sans">{form.formState.errors.message.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-sans rounded-xl">
                    <Send className="mr-2 h-4 w-4" /> Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-6 shadow-lg bg-card dark:bg-gray-800 rounded-2xl h-full">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center font-heading">
                    <MapPin className="mr-3 h-6 w-6 text-primary" /> Our Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground dark:text-gray-300 font-sans">123 Hospital Road, Health City, HC 12345</p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400 mt-2 font-sans">
                    Visit us during business hours for in-person inquiries.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="p-6 shadow-lg bg-card dark:bg-gray-800 rounded-2xl h-full">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center font-heading">
                    <Phone className="mr-3 h-6 w-6 text-primary" /> Call Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground dark:text-gray-300 font-sans">+1 (555) 123-4567</p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400 mt-2 font-sans">
                    Available 24/7 for emergencies and general inquiries.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="p-6 shadow-lg bg-card dark:bg-gray-800 rounded-2xl h-full">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center font-heading">
                    <Mail className="mr-3 h-6 w-6 text-primary" /> Email Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground dark:text-gray-300 font-sans">info@hospital.com</p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400 mt-2 font-sans">
                    For non-urgent matters, expect a response within 24-48 hours.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;