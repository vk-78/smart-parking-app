import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParking } from "@/contexts/ParkingContext";
import SlotCard from "@/components/SlotCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Booking } from "@/contexts/ParkingContext";

const UserDashboard = () => {
  const { user } = useAuth();
  const { slots, bookSlot, availableCount } = useParking();
  const [showBooking, setShowBooking] = useState(false);
  const [bookingResult, setBookingResult] = useState<Booking | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("30");

  const handleBook = () => {
    if (!date || !time || !user) {
      toast.error("Please fill in all fields");
      return;
    }
    const result = bookSlot(user.id, user.name, date, time, parseInt(duration));
    if (result) {
      setBookingResult(result);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied!");
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Parking Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user?.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-card border px-4 py-2 text-center">
            <p className="text-2xl font-bold text-slot-available">{availableCount}</p>
            <p className="text-xs text-muted-foreground">Available</p>
          </div>
          <Button onClick={() => { setBookingResult(null); setShowBooking(true); }}>
            Book a Slot
          </Button>
        </div>
      </div>

      {/* Status legend */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full status-dot-available" /><span className="text-sm">Available</span></div>
        <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full status-dot-occupied" /><span className="text-sm">Occupied</span></div>
        <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full status-dot-reserved" /><span className="text-sm">Reserved</span></div>
      </div>

      {/* Slots grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {slots.map((slot) => (
          <SlotCard key={slot.id} slot={slot} showTimer />
        ))}
      </div>

      {/* Booking dialog */}
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{bookingResult ? "Booking Confirmed!" : "Book a Parking Slot"}</DialogTitle>
            <DialogDescription>
              {bookingResult
                ? "Your slot has been reserved. Save your verification code."
                : "Select your preferred date, time and duration."}
            </DialogDescription>
          </DialogHeader>

          {bookingResult ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-slot-available mx-auto" />
                <p className="text-sm text-muted-foreground">Verification Code</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-mono font-bold tracking-[0.3em] text-foreground">
                    {bookingResult.verificationCode}
                  </span>
                  <button onClick={() => copyCode(bookingResult.verificationCode)}>
                    <Copy className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-muted p-3">
                  <p className="text-muted-foreground">Booking ID</p>
                  <p className="font-semibold">{bookingResult.id}</p>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <p className="text-muted-foreground">Slot</p>
                  <p className="font-semibold">Slot {bookingResult.slotId}</p>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <p className="text-muted-foreground">Date & Time</p>
                  <p className="font-semibold">{bookingResult.date} {bookingResult.time}</p>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-semibold">{bookingResult.duration} min</p>
                </div>
              </div>
              <Button className="w-full" onClick={() => setShowBooking(false)}>Done</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="date" className="pl-10" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="time" className="pl-10" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleBook}>Confirm Booking</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDashboard;
