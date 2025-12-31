"use client";

import React, { useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import DoctorCardColumn from "./DoctorCardColumn";
import { Doctor, fetchAllDoctors } from "@/data/doctors";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const DoctorsSlider: React.FC = () => {
  const [doctors, setDoctors] = React.useState<Doctor[]>([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const getDoctors = async () => {
      setLoading(true);
      const fetchedDoctors = await fetchAllDoctors();
      setDoctors(fetchedDoctors.slice(0, 6)); // Curated list for slider
      setLoading(false);
    };
    getDoctors();
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );
  const [prevBtnDisabled, setPrevBtnDisabled] = React.useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = React.useState(true);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  const scrollPrev = React.useCallback(() => {
    emblaApi && emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    emblaApi && emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = React.useCallback(
    (index: number) => {
      emblaApi && emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = React.useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  const onInit = React.useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect(emblaApi);
  }, [onSelect]);

  React.useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    emblaApi.on("reInit", onInit);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onInit, onSelect]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
      </div>
    );
  }

  if (doctors.length === 0) {
    return <p className="text-center text-muted-text font-sans">No doctors available for the slider.</p>;
  }

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="flex-none w-full sm:w-1/2 lg:w-1/3 pl-4">
              <DoctorCardColumn doctor={doctor} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="outline"
        size="icon"
        onClick={scrollPrev}
        disabled={prevBtnDisabled}
        className="absolute top-1/2 -translate-y-1/2 left-0 -ml-6 z-10 rounded-full bg-card-background dark:bg-card shadow-md hover:bg-card-background/90 dark:hover:bg-card/90 hidden md:flex"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={scrollNext}
        disabled={nextBtnDisabled}
        className="absolute top-1/2 -translate-y-1/2 right-0 -mr-6 z-10 rounded-full bg-card-background dark:bg-card shadow-md hover:bg-card-background/90 dark:hover:bg-card/90 hidden md:flex"
      >
        <ArrowRight className="h-4 w-4" />
      </Button>

      {/* Dots Navigation */}
      <div className="flex justify-center mt-6 space-x-2">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={cn(
              "h-2 w-2 rounded-full bg-muted-text transition-colors duration-200",
              index === selectedIndex && "bg-primary-blue w-6"
            )}
            onClick={() => scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default DoctorsSlider;