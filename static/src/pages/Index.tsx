import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Car, Shield, CircleParking, Clock, Smartphone, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const features = [
    { icon: CircleParking, title: "Real-Time Slots", desc: "See live availability of all 6 parking slots" },
    { icon: Clock, title: "Smart Booking", desc: "Reserve your spot with date, time & duration selection" },
    { icon: Shield, title: "Secure Verification", desc: "6-digit code verification system for entry" },
    { icon: Smartphone, title: "Mobile Friendly", desc: "Manage parking from any device, anywhere" },
    { icon: Zap, title: "Instant Updates", desc: "Real-time status changes and notifications" },
    { icon: Car, title: "Gate Control", desc: "Automated gate management for seamless entry" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm mb-6">
            <div className="h-2 w-2 rounded-full status-dot-available animate-pulse" />
            <span className="text-muted-foreground">Smart Parking System</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Park <span className="text-primary">Smarter</span>,<br /> Not Harder
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            A modern parking management system with real-time slot monitoring, instant booking, and secure 6-digit code verification.
          </p>
          <div className="flex items-center justify-center gap-3">
            {isAuthenticated ? (
              <Button size="lg" onClick={() => navigate(user?.role === "admin" ? "/admin" : "/dashboard")}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button size="lg" onClick={() => navigate("/login")}>
                  Get Started
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/signup")}>
                  Create Account
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-6 hover:shadow-lg transition-shadow">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 SmartPark. Prototype — Smart Parking Management System.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
