import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, isSameDay } from "date-fns";
import { Check, Clock, ChevronRight, Sparkles, MapPin, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Mock Data ---

type Category = "Haircuts" | "Color" | "Styling" | "Treatments" | "Extensions";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  desc: string;
}

const SERVICES: Record<Category, Service[]> = {
  Haircuts: [
    { id: "h1", name: "Women's Haircut", price: 85, duration: "60 min", desc: "Cut and finish tailored to your shape" },
    { id: "h2", name: "Trim", price: 45, duration: "30 min", desc: "Clean up ends and refresh your look" },
    { id: "h3", name: "Blowout", price: 55, duration: "45 min", desc: "Full wash, blow-dry, and style" },
  ],
  Color: [
    { id: "c1", name: "Root Touch-Up", price: 120, duration: "1.5 hr", desc: "Cover regrowth with precision color" },
    { id: "c2", name: "Full Color", price: 180, duration: "2 hr", desc: "All-over color with deep conditioning" },
    { id: "c3", name: "Highlights", price: 220, duration: "2.5 hr", desc: "Hand-painted highlights for natural dimension" },
    { id: "c4", name: "Balayage", price: 280, duration: "3 hr", desc: "Seamless sun-kissed color melt" },
  ],
  Styling: [
    { id: "s1", name: "Blowout", price: 55, duration: "45 min", desc: "Full wash, blow-dry, and style" },
    { id: "s2", name: "Event Styling", price: 95, duration: "1 hr", desc: "Elegant updo or polished finish" },
    { id: "s3", name: "Bridal Trial", price: 150, duration: "1.5 hr", desc: "Test your wedding day look" },
  ],
  Treatments: [
    { id: "t1", name: "Deep Conditioning", price: 40, duration: "30 min", desc: "Intensive moisture and repair" },
    { id: "t2", name: "Keratin Treatment", price: 250, duration: "2 hr", desc: "Long-lasting frizz control and shine" },
    { id: "t3", name: "Scalp Treatment", price: 70, duration: "45 min", desc: "Targeted scalp health and comfort" },
  ],
  Extensions: [],
};

// Generate next 7 days
const today = new Date();
const DAYS = Array.from({ length: 7 }).map((_, i) => {
  const date = addDays(today, i);
  // Mock availability
  let status: "available" | "few" | "full" = "available";
  if (i === 1 || i === 4) status = "few";
  if (i === 3) status = "full";
  
  return {
    date,
    status,
    label: status === "available" ? "Available" : status === "few" ? "Few spots left" : "Full"
  };
});

// Mock times
const TIME_GROUPS = [
  {
    name: "Morning",
    times: [
      { id: "m1", label: "9:00 AM", status: "available" },
      { id: "m2", label: "9:30 AM", status: "booked" },
      { id: "m3", label: "10:00 AM", status: "available" },
      { id: "m4", label: "10:30 AM", status: "available", isSoonest: true },
      { id: "m5", label: "11:00 AM", status: "booked" },
    ]
  },
  {
    name: "Afternoon",
    times: [
      { id: "a1", label: "12:00 PM", status: "available" },
      { id: "a2", label: "1:00 PM", status: "booked" },
      { id: "a3", label: "2:30 PM", status: "available" },
      { id: "a4", label: "3:00 PM", status: "available" },
      { id: "a5", label: "4:00 PM", status: "available" },
    ]
  },
  {
    name: "Evening",
    times: [
      { id: "e1", label: "4:30 PM", status: "booked" },
      { id: "e2", label: "5:00 PM", status: "available" },
      { id: "e3", label: "6:00 PM", status: "available" },
      { id: "e4", label: "7:00 PM", status: "available" },
    ]
  }
];

export default function BookingPage() {
  // State
  const [activeCategory, setActiveCategory] = useState<Category>("Haircuts");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: "", phone: "", note: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Refs for smooth scrolling
  const dayRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  // Computed state
  const isDayEnabled = !!selectedService;
  const isTimeEnabled = !!selectedDay;
  const isDetailsEnabled = !!selectedTime;
  const isFormValid = selectedService && selectedDay && selectedTime && formData.name.trim() !== "" && formData.phone.trim() !== "";

  // Handlers
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    // Reset subsequent selections if changing upstream
    setSelectedDay(null);
    setSelectedTime(null);
    setTimeout(() => {
      dayRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
  };

  const handleDaySelect = (day: typeof DAYS[0]) => {
    if (day.status === "full") return;
    setSelectedDay(day.date);
    setSelectedTime(null);
    setTimeout(() => {
      timeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const handleTimeSelect = (time: any) => {
    if (time.status === "booked") return;
    setSelectedTime(time.label);
    setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const handleSubmit = () => {
    if (!isFormValid) return;
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card p-10 rounded-3xl shadow-xl shadow-black/5 text-center border border-border"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
            <Check className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-display font-medium text-foreground mb-4">Request Sent</h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Thank you, {formData.name.split(' ')[0]}. We've received your request for a {selectedService?.name} on {selectedDay && format(selectedDay, "MMM d")} at {selectedTime}. We'll confirm shortly!
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-secondary text-secondary-foreground rounded-2xl font-medium hover:bg-secondary/80 transition-colors"
          >
            Book Another Appointment
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-40 selection:bg-primary/20">
      {/* Header/Hero */}
      <header className="pt-12 px-6 pb-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-primary mb-3">
          <Sparkles className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-sm font-semibold tracking-widest uppercase">Studio Lumière</span>
        </div>
        <h1 className="text-5xl font-display text-foreground leading-tight">What would you<br />like today?</h1>
        <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4"/> 124 Design Dist.</div>
          <div className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-amber-400 text-amber-400"/> 4.9 (120+)</div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* 1. SERVICE SELECTION */}
        <section className="mb-16">
          {/* Categories */}
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-4 mb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {(Object.keys(SERVICES) as Category[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                  activeCategory === cat 
                    ? "bg-foreground text-background shadow-md" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Service List */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {SERVICES[activeCategory].length > 0 ? (
                SERVICES[activeCategory].map((service) => {
                  const isSelected = selectedService?.id === service.id;
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className={cn(
                        "group cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden",
                        isSelected 
                          ? "border-primary bg-primary/5 shadow-md shadow-primary/5" 
                          : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
                      )}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className={cn("text-lg font-medium mb-1", isSelected ? "text-primary" : "text-foreground")}>
                            {service.name}
                          </h3>
                          <p className="text-muted-foreground text-sm leading-relaxed">{service.desc}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-lg font-semibold text-foreground">${service.price}</div>
                          <div className="text-xs text-muted-foreground flex items-center justify-end gap-1 mt-1">
                            <Clock className="w-3 h-3" /> {service.duration}
                          </div>
                        </div>
                      </div>
                      
                      {/* Selection Indicator */}
                      <div className={cn(
                        "absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300",
                        isSelected ? "bg-primary" : "bg-transparent group-hover:bg-primary/20"
                      )} />
                    </motion.div>
                  )
                })
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="p-8 text-center bg-secondary/50 rounded-2xl border border-border border-dashed"
                >
                  <p className="text-muted-foreground">Extensions coming soon to Studio Lumière.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* 2. DAY SELECTION */}
        <section 
          ref={dayRef}
          className={cn(
            "mb-16 transition-all duration-500",
            !isDayEnabled && "opacity-40 pointer-events-none blur-[1px] grayscale-[50%]"
          )}
        >
          <h2 className="text-3xl font-display text-foreground mb-6">Pick a day</h2>
          
          <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            {DAYS.map((day, i) => {
              const isSelected = selectedDay && isSameDay(selectedDay, day.date);
              const isToday = i === 0;
              
              return (
                <button
                  key={i}
                  onClick={() => handleDaySelect(day)}
                  disabled={day.status === "full"}
                  className={cn(
                    "flex flex-col items-center min-w-[100px] p-4 rounded-2xl border transition-all duration-300 shrink-0",
                    day.status === "full" ? "opacity-50 cursor-not-allowed bg-secondary/50" : "cursor-pointer",
                    isSelected 
                      ? "bg-foreground border-foreground text-background shadow-lg shadow-black/10" 
                      : day.status !== "full" ? "bg-card border-border hover:border-primary/40 hover:shadow-sm" : ""
                  )}
                >
                  <span className={cn(
                    "text-xs font-semibold uppercase tracking-wider mb-2",
                    isSelected ? "text-background/80" : "text-muted-foreground"
                  )}>
                    {isToday ? "Today" : format(day.date, "EEE")}
                  </span>
                  <span className="text-3xl font-display font-medium mb-3">
                    {format(day.date, "d")}
                  </span>
                  
                  <span className={cn(
                    "text-[10px] font-medium px-2 py-1 rounded-full whitespace-nowrap",
                    isSelected ? "bg-background/20 text-background" :
                    day.status === "available" ? "bg-emerald-50 text-emerald-700" :
                    day.status === "few" ? "bg-amber-50 text-amber-700" :
                    "bg-secondary text-muted-foreground"
                  )}>
                    {day.label}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* 3. TIME SELECTION */}
        <section 
          ref={timeRef}
          className={cn(
            "mb-16 transition-all duration-500",
            !isTimeEnabled && "opacity-40 pointer-events-none blur-[1px] grayscale-[50%]"
          )}
        >
          <h2 className="text-3xl font-display text-foreground mb-6">Pick a time</h2>
          
          <div className="space-y-8">
            {TIME_GROUPS.map((group) => (
              <div key={group.name}>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4 ml-1">
                  {group.name}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {group.times.map((time) => {
                    const isSelected = selectedTime === time.label;
                    return (
                      <button
                        key={time.id}
                        onClick={() => handleTimeSelect(time)}
                        disabled={time.status === "booked"}
                        className={cn(
                          "relative p-4 rounded-xl text-center border transition-all duration-300 flex items-center justify-center font-medium",
                          time.status === "booked" 
                            ? "bg-secondary/40 border-transparent text-muted-foreground/50 cursor-not-allowed line-through" 
                            : isSelected
                              ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20"
                              : "bg-card border-border text-foreground hover:border-primary/50 hover:shadow-sm"
                        )}
                      >
                        {time.label}
                        
                        {time.isSoonest && !isSelected && time.status !== "booked" && (
                          <span className="absolute -top-2 -right-2 bg-foreground text-background text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            Soonest
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. DETAILS SECTION */}
        <section 
          ref={detailsRef}
          className={cn(
            "transition-all duration-500 pb-12",
            !isDetailsEnabled && "opacity-40 pointer-events-none blur-[1px] grayscale-[50%]"
          )}
        >
          <h2 className="text-3xl font-display text-foreground mb-6">Your details</h2>
          
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground ml-1">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                className="w-full h-14 px-4 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-base"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-foreground ml-1">Phone Number</label>
              <input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                className="w-full h-14 px-4 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-base"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="note" className="text-sm font-medium text-foreground ml-1">Note for Stylist <span className="text-muted-foreground font-normal">(Optional)</span></label>
              <textarea
                id="note"
                placeholder="Any details we should know before your visit?"
                value={formData.note}
                onChange={(e) => setFormData(p => ({ ...p, note: e.target.value }))}
                className="w-full p-4 min-h-[120px] bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none text-base"
              />
            </div>
          </div>
        </section>

      </main>

      {/* 5. STICKY FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border z-50 px-4 py-4 pb-safe sm:py-5 sm:px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex-1 w-full text-center sm:text-left">
            {selectedService ? (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {selectedService.name} <span className="text-muted-foreground font-normal text-xs ml-1">${selectedService.price}</span>
                </span>
                <span className="text-xs text-muted-foreground mt-0.5 flex items-center justify-center sm:justify-start gap-1.5">
                  {selectedDay ? format(selectedDay, "EEEE, MMM d") : "No date"} 
                  <span className="w-1 h-1 rounded-full bg-border inline-block" /> 
                  {selectedTime ? selectedTime : "No time"}
                </span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Select a service to begin</span>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className={cn(
              "w-full sm:w-auto h-14 sm:h-12 px-8 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300",
              isFormValid 
                ? "bg-foreground text-background hover:bg-foreground/90 shadow-lg shadow-black/10 active:scale-95" 
                : "bg-secondary text-muted-foreground cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <span className="animate-pulse">Requesting...</span>
            ) : (
              <>
                Request Appointment
                <ChevronRight className="w-4 h-4 opacity-70" />
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Utility to handle iOS safe area padding at bottom */}
      <style>{`
        .pb-safe { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
      `}</style>
    </div>
  );
}
