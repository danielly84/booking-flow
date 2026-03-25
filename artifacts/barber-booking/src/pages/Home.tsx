import React, { useState, useRef, useEffect, useMemo } from "react";
import { format, addDays, isSameDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Check, MapPin, Clock, Star, CalendarDays, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// --- Mock Data ---
type Service = {
  id: string;
  name: string;
  price: number;
  duration: number;
  icon: string;
  description: string;
};

const SERVICES: Service[] = [
  { id: "s1", name: "Classic Haircut", price: 35, duration: 30, icon: "✂️", description: "Precision cut, wash, and style." },
  { id: "s2", name: "Beard Trim", price: 20, duration: 20, icon: "🧔", description: "Sculpting, hot towel, and oil." },
  { id: "s3", name: "Hair + Beard", price: 50, duration: 45, icon: "🔥", description: "The complete grooming package." },
  { id: "s4", name: "Kids Cut", price: 25, duration: 20, icon: "👦", description: "Ages 12 and under. Quick and sharp." },
];

type DayAvailability = {
  date: Date;
  spots: number;
  isFull: boolean;
};

const generateDays = (): DayAvailability[] => {
  return Array.from({ length: 14 }).map((_, i) => {
    const date = addDays(new Date(), i);
    // Pseudo-random spots based on date string so it stays consistent across renders
    const pseudoRandom = (date.getTime() % 10); 
    const spots = pseudoRandom > 7 ? 0 : pseudoRandom + 1; // Some full days
    return {
      date,
      spots,
      isFull: spots === 0,
    };
  });
};

type TimeSlot = {
  time: string;
  available: boolean;
  isSoonest?: boolean;
};

type TimeGroups = {
  Morning: TimeSlot[];
  Afternoon: TimeSlot[];
  Evening: TimeSlot[];
};

const generateTimes = (date: Date): TimeGroups => {
  // Simple mock generation
  const pseudoSeed = date.getDate();
  const makeSlot = (hour: number, min: string): TimeSlot => {
    const isAvail = (hour + pseudoSeed) % 4 !== 0; // Random-ish availability
    return {
      time: `${hour > 12 ? hour - 12 : hour}:${min} ${hour >= 12 ? 'PM' : 'AM'}`,
      available: isAvail,
    };
  };

  const times: TimeGroups = {
    Morning: [makeSlot(9, "00"), makeSlot(9, "30"), makeSlot(10, "00"), makeSlot(10, "30"), makeSlot(11, "00"), makeSlot(11, "30")],
    Afternoon: [makeSlot(12, "00"), makeSlot(12, "30"), makeSlot(13, "00"), makeSlot(13, "30"), makeSlot(14, "00"), makeSlot(14, "30"), makeSlot(15, "00"), makeSlot(15, "30"), makeSlot(16, "00"), makeSlot(16, "30")],
    Evening: [makeSlot(17, "00"), makeSlot(17, "30"), makeSlot(18, "00"), makeSlot(18, "30"), makeSlot(19, "00")],
  };

  // Tag the first available as 'soonest'
  let foundSoonest = false;
  for (const group of Object.values(times)) {
    for (const slot of group) {
      if (slot.available && !foundSoonest) {
        slot.isSoonest = true;
        foundSoonest = true;
      }
    }
  }

  return times;
};

export default function Home() {
  // --- State ---
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // --- Refs for scrolling ---
  const topRef = useRef<HTMLDivElement>(null);
  const daysRef = useRef<HTMLDivElement>(null);
  const timesRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  // --- Derived Data ---
  const availableDays = useMemo(() => generateDays(), []);
  const availableTimes = useMemo(() => selectedDay ? generateTimes(selectedDay) : null, [selectedDay]);

  const canSubmit = selectedService && selectedDay && selectedTime && name.trim().length > 2 && phone.trim().length > 7;

  // --- Handlers ---
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    // Reset subsequent steps if we change service significantly? Optional.
    setTimeout(() => {
      daysRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const handleDaySelect = (day: DayAvailability) => {
    if (day.isFull) return;
    setSelectedDay(day.date);
    setSelectedTime(null); // Reset time when day changes
    setTimeout(() => {
      timesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const handleTimeSelect = (time: TimeSlot) => {
    if (!time.available) return;
    setSelectedTime(time.time);
    setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    
    setIsSubmitting(true);
    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1500);
  };

  // --- Render ---
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6"
        >
          <Check className="w-10 h-10" />
        </motion.div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-4">You're All Set!</h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-md">
          Your appointment for a <span className="font-semibold text-foreground">{selectedService?.name}</span> on <span className="font-semibold text-foreground">{selectedDay && format(selectedDay, "EEEE, MMM do")}</span> at <span className="font-semibold text-foreground">{selectedTime}</span> has been confirmed.
        </p>
        <div className="bg-card p-6 rounded-2xl border shadow-sm max-w-sm w-full text-left">
          <div className="flex items-start gap-4 mb-4">
            <MapPin className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="font-semibold">Gentleman's Grooming</p>
              <p className="text-muted-foreground text-sm">123 Vintage Ave, Suite 100<br/>New York, NY 10012</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full mt-4 py-3 rounded-xl font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            Book Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-[140px]" ref={topRef}>
      
      {/* Header */}
      <header className="pt-12 pb-6 px-6 md:px-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold leading-tight">Gentleman's Grooming</h1>
            <div className="flex items-center text-sm text-muted-foreground gap-1">
              <Star className="w-3.5 h-3.5 fill-primary text-primary" />
              <span className="font-medium text-foreground">4.9</span>
              <span>(128 reviews)</span>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 md:px-8 max-w-3xl mx-auto space-y-12">
        
        {/* SECTION 1: Services */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-display font-bold">What are you booking?</h2>
            <p className="text-muted-foreground mt-1">Select a service to get started.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SERVICES.map((service) => {
              const isSelected = selectedService?.id === service.id;
              return (
                <motion.button
                  key={service.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleServiceSelect(service)}
                  className={cn(
                    "relative text-left p-5 rounded-2xl border-2 transition-all duration-300 overflow-hidden group outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
                    isSelected 
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/5" 
                      : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-3xl bg-secondary/50 w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      {service.icon}
                    </span>
                    <div className="text-right">
                      <div className="font-bold text-lg">${service.price}</div>
                      <div className="text-xs font-medium text-muted-foreground flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" /> {service.duration} min
                      </div>
                    </div>
                  </div>
                  <h3 className={cn("font-bold text-lg", isSelected ? "text-primary" : "text-foreground")}>
                    {service.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                    {service.description}
                  </p>
                  
                  {isSelected && (
                    <div className="absolute top-4 right-4 text-primary">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <div className="bg-primary text-white p-1 rounded-full shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </motion.div>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: Days */}
        <section 
          ref={daysRef} 
          className={cn("space-y-4 pt-4", !selectedService ? "section-dimmed" : "section-active")}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold">Pick a day</h2>
              <p className="text-muted-foreground mt-1">When works best for you?</p>
            </div>
            <div className="bg-secondary text-secondary-foreground text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              {format(availableDays[0].date, "MMM yyyy")}
            </div>
          </div>

          {/* Horizontal scroll container */}
          <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0 snap-x">
            {availableDays.map((day, idx) => {
              const dateObj = day.date;
              const isSelected = selectedDay && isSameDay(selectedDay, dateObj);
              const isToday = isSameDay(new Date(), dateObj);
              
              return (
                <button
                  key={dateObj.toISOString()}
                  onClick={() => handleDaySelect(day)}
                  disabled={day.isFull || !selectedService}
                  className={cn(
                    "snap-start flex-shrink-0 w-[100px] flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all duration-300 outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
                    isSelected 
                      ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
                      : day.isFull 
                        ? "border-transparent bg-muted/50 opacity-50 cursor-not-allowed" 
                        : "border-border bg-card hover:border-primary/40 hover:bg-card/80",
                    !isSelected && !day.isFull && "hover:-translate-y-1"
                  )}
                >
                  <span className={cn("text-xs font-bold uppercase tracking-wider mb-1", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")}>
                    {isToday ? "Today" : format(dateObj, "EEE")}
                  </span>
                  <span className="text-3xl font-display font-bold mb-2">
                    {format(dateObj, "d")}
                  </span>
                  
                  {/* Availability Badge */}
                  <div className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    isSelected 
                      ? "bg-white/20 text-white" 
                      : day.isFull 
                        ? "bg-destructive/10 text-destructive"
                        : day.spots <= 2 
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary text-secondary-foreground"
                  )}>
                    {day.isFull ? "Full" : `${day.spots} spot${day.spots > 1 ? 's' : ''}`}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: Times */}
        <section 
          ref={timesRef} 
          className={cn("space-y-6 pt-4", !selectedDay ? "section-dimmed" : "section-active")}
        >
          <div>
            <h2 className="text-2xl font-display font-bold">Pick a time</h2>
            <p className="text-muted-foreground mt-1">Available slots for {selectedDay ? format(selectedDay, "EEEE, MMMM d") : "your selected day"}.</p>
          </div>

          <div className="space-y-6">
            {availableTimes && Object.entries(availableTimes).map(([period, slots]) => {
              // Only render period if there are slots
              if (slots.length === 0) return null;

              return (
                <div key={period} className="space-y-3">
                  <h3 className="text-sm font-bold tracking-wider uppercase text-muted-foreground pl-1 flex items-center gap-2">
                    {period === 'Morning' ? '🌅' : period === 'Afternoon' ? '☀️' : '🌙'} {period}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {slots.map((slot) => {
                      const isSelected = selectedTime === slot.time;
                      
                      return (
                        <button
                          key={slot.time}
                          onClick={() => handleTimeSelect(slot)}
                          disabled={!slot.available || !selectedDay}
                          className={cn(
                            "relative py-3.5 px-4 rounded-xl font-semibold border-2 transition-all duration-200 outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                              : !slot.available
                                ? "border-transparent bg-muted/30 text-muted-foreground line-through opacity-60 cursor-not-allowed"
                                : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-card/80 hover:-translate-y-0.5"
                          )}
                        >
                          {slot.time}
                          
                          {/* Soonest Badge */}
                          {slot.isSoonest && !isSelected && slot.available && (
                            <span className="absolute -top-2.5 -right-2 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full border border-background shadow-sm">
                              Soonest
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 4: Details */}
        <section 
          ref={detailsRef} 
          className={cn("space-y-6 pt-4", !selectedTime ? "section-dimmed" : "section-active")}
        >
          <div>
            <h2 className="text-2xl font-display font-bold">Your details</h2>
            <p className="text-muted-foreground mt-1">Almost done! Just need your info.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 bg-transparent md:bg-white md:p-8 md:rounded-3xl md:border md:shadow-sm">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-foreground ml-1">Full Name <span className="text-destructive">*</span></label>
              <Input 
                id="name"
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!selectedTime || isSubmitting}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-semibold text-foreground ml-1">Phone Number <span className="text-destructive">*</span></label>
              <Input 
                id="phone"
                type="tel"
                placeholder="(555) 123-4567" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!selectedTime || isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="note" className="text-sm font-semibold text-foreground ml-1 flex justify-between">
                <span>Appointment Note</span>
                <span className="text-muted-foreground font-normal">Optional</span>
              </label>
              <Textarea 
                id="note"
                placeholder="Anything we should know? (e.g. keeping the top long)" 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={!selectedTime || isSubmitting}
              />
            </div>
            
            {/* Desktop-only submit button (Mobile uses sticky footer) */}
            <div className="hidden md:block pt-4">
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none disabled:shadow-none"
              >
                {isSubmitting ? "Confirming..." : "Request Appointment"}
              </button>
            </div>
          </form>
        </section>

      </main>

      {/* STICKY FOOTER (Mobile / Always visible) */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-[env(safe-area-inset-bottom)]"
        >
          {/* Subtle gradient wash over content */}
          <div className="absolute inset-0 -top-8 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none -z-10" />
          
          <div className="bg-background/80 backdrop-blur-xl border-t border-border/50 p-4 shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.1)]">
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
              
              <div className="flex-1 min-w-0">
                {selectedService && selectedDay && selectedTime ? (
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground truncate">{selectedService.name}</span>
                    <span className="text-xs text-muted-foreground font-medium truncate flex items-center gap-1">
                      {format(selectedDay, "MMM d")} <span className="w-1 h-1 rounded-full bg-border inline-block" /> {selectedTime}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <span className="font-semibold text-muted-foreground">Total</span>
                    <span className="font-bold text-lg text-foreground">
                      {selectedService ? `$${selectedService.price}` : "—"}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className={cn(
                  "px-6 py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center whitespace-nowrap",
                  canSubmit 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-95" 
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                {isSubmitting ? "..." : (
                  <>
                    Book Now
                    <ChevronRight className="w-4 h-4 ml-1 -mr-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      
    </div>
  );
}
