import { useState } from "react";
import { useParking, SlotStatus } from "@/contexts/ParkingContext";
import SlotCard from "@/components/SlotCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DoorOpen, DoorClosed, Search, ShieldCheck, XCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const AdminDashboard = () => {
  const {
    slots, bookings, gateOpen, toggleGate, verifyBooking, allowEntry,
    setSlotStatus, cancelBooking, approveBooking,
  } = useParking();
  const [verifyCode, setVerifyCode] = useState("");
  const [foundBooking, setFoundBooking] = useState<ReturnType<typeof verifyBooking>>(null);

  const handleVerify = () => {
    if (verifyCode.length !== 6) {
      toast.error("Enter a valid 6-digit code");
      return;
    }
    const b = verifyBooking(verifyCode);
    setFoundBooking(b);
    if (!b) toast.error("No active booking found for this code");
  };

  const handleAllowEntry = () => {
    if (foundBooking) {
      allowEntry(foundBooking.id);
      setFoundBooking(null);
      setVerifyCode("");
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* Top row: Gate + Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gate control */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Gate Control</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${gateOpen ? "bg-slot-available-bg" : "bg-slot-occupied-bg"}`}>
              {gateOpen ? <DoorOpen className="h-6 w-6 text-slot-available" /> : <DoorClosed className="h-6 w-6 text-slot-occupied" />}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{gateOpen ? "Gate Open" : "Gate Closed"}</p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant={gateOpen ? "default" : "outline"} onClick={() => !gateOpen && toggleGate()}>
                  Open Gate
                </Button>
                <Button size="sm" variant={!gateOpen ? "default" : "outline"} onClick={() => gateOpen && toggleGate()}>
                  Close Gate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-base">Verify Booking Code</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Enter 6-digit code"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                className="font-mono text-lg tracking-widest max-w-[200px]"
              />
              <Button onClick={handleVerify}><Search className="h-4 w-4 mr-1" /> Verify</Button>
            </div>
            {foundBooking && (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">User: </span><span className="font-medium">{foundBooking.userName}</span></div>
                  <div><span className="text-muted-foreground">Slot: </span><span className="font-medium">Slot {foundBooking.slotId}</span></div>
                  <div><span className="text-muted-foreground">Time: </span><span className="font-medium">{foundBooking.date} {foundBooking.time}</span></div>
                  <div><span className="text-muted-foreground">Duration: </span><span className="font-medium">{foundBooking.duration} min</span></div>
                </div>
                <Button className="w-full mt-2" onClick={handleAllowEntry}>
                  <ShieldCheck className="h-4 w-4 mr-1" /> Verify & Allow Entry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Slots with manual control */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Parking Slots</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {slots.map((slot) => (
            <div key={slot.id} className="space-y-2">
              <SlotCard slot={slot} showTimer />
              <Select value={slot.status} onValueChange={(v) => setSlotStatus(slot.id, v as SlotStatus)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>

      {/* All bookings */}
      <div>
        <h2 className="text-lg font-semibold mb-3">All Bookings</h2>
        {bookings.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">No bookings yet</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {bookings.map((b) => (
              <Card key={b.id}>
                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{b.id}</span>
                      <Badge variant={b.status === "active" ? "default" : "secondary"}>{b.status}</Badge>
                      {b.verified && <Badge variant="outline" className="border-slot-available text-slot-available">Verified</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {b.userName} • Slot {b.slotId} • {b.date} {b.time} • {b.duration}min
                    </p>
                    <p className="text-xs font-mono text-muted-foreground">Code: {b.verificationCode}</p>
                  </div>
                  {b.status === "active" && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => approveBooking(b.id)}>
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => cancelBooking(b.id)}>
                        <XCircle className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
