import { useAuth } from "@/contexts/AuthContext";
import { useParking } from "@/contexts/ParkingContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const MyBookings = () => {
  const { user } = useAuth();
  const { bookings, cancelBooking } = useParking();

  const userBookings = bookings.filter((b) => b.userId === user?.id);
  const activeBookings = userBookings.filter((b) => b.status === "active");
  const pastBookings = userBookings.filter((b) => b.status !== "active");

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied!");
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Bookings</h1>

      <div>
        <h2 className="text-lg font-semibold mb-3">Active Bookings</h2>
        {activeBookings.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">No active bookings</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {activeBookings.map((b) => (
              <BookingCard key={b.id} booking={b} onCancel={cancelBooking} onCopy={copyCode} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Past Bookings</h2>
        {pastBookings.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">No past bookings</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {pastBookings.map((b) => (
              <BookingCard key={b.id} booking={b} onCopy={copyCode} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function RemainingTime({ booking }: { booking: { createdAt: number; duration: number } }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const endTime = booking.createdAt + booking.duration * 60 * 1000;
      const diff = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      setRemaining(`${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [booking]);

  return <span className="text-xs text-muted-foreground">Remaining: {remaining}</span>;
}

function BookingCard({
  booking,
  onCancel,
  onCopy,
}: {
  booking: any;
  onCancel?: (id: string) => void;
  onCopy: (code: string) => void;
}) {
  const statusColor: Record<string, string> = {
    active: "bg-slot-available text-primary-foreground",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-slot-occupied text-primary-foreground",
    expired: "bg-slot-reserved text-foreground",
  };

  return (
    <Card>
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{booking.id}</span>
            <Badge className={statusColor[booking.status]}>{booking.status}</Badge>
            {booking.verified && <Badge variant="outline" className="border-slot-available text-slot-available">Verified</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">
            Slot {booking.slotId} • {booking.date} {booking.time} • {booking.duration} min
          </p>
          {booking.status === "active" && <RemainingTime booking={booking} />}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-md bg-muted px-3 py-1.5">
            <span className="font-mono font-bold tracking-widest">{booking.verificationCode}</span>
            <button onClick={() => onCopy(booking.verificationCode)}>
              <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
          {onCancel && booking.status === "active" && (
            <Button variant="destructive" size="sm" onClick={() => onCancel(booking.id)}>
              <XCircle className="h-4 w-4 mr-1" /> Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default MyBookings;
