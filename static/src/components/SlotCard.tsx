import { ParkingSlot } from "@/contexts/ParkingContext";
import { Car, CircleParking } from "lucide-react";
import { useEffect, useState } from "react";

interface SlotCardProps {
  slot: ParkingSlot;
  onClick?: () => void;
  showTimer?: boolean;
}

const SlotCard = ({ slot, onClick, showTimer }: SlotCardProps) => {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (slot.status !== "occupied" || !slot.occupiedSince) return;
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - slot.occupiedSince!) / 1000);
      const mins = Math.floor(diff / 60);
      const secs = diff % 60;
      setElapsed(`${mins}m ${secs}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [slot.status, slot.occupiedSince]);

  const statusClass =
    slot.status === "available" ? "slot-available" : slot.status === "occupied" ? "slot-occupied" : "slot-reserved";

  const statusLabel =
    slot.status === "available" ? "Available" : slot.status === "occupied" ? "Occupied" : "Reserved";

  const dotClass =
    slot.status === "available" ? "status-dot-available" : slot.status === "occupied" ? "status-dot-occupied" : "status-dot-reserved";

  return (
    <button
      onClick={onClick}
      className={`${statusClass} rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer min-h-[140px] justify-center`}
    >
      {slot.status === "occupied" ? (
        <Car className="h-10 w-10 text-slot-occupied" />
      ) : (
        <CircleParking className={`h-10 w-10 ${slot.status === "available" ? "text-slot-available" : "text-slot-reserved"}`} />
      )}
      <span className="font-semibold text-foreground">Slot {slot.id}</span>
      <div className="flex items-center gap-1.5">
        <div className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
        <span className="text-xs font-medium text-muted-foreground">{statusLabel}</span>
      </div>
      {showTimer && slot.status === "occupied" && elapsed && (
        <span className="text-xs text-muted-foreground">Parked: {elapsed}</span>
      )}
    </button>
  );
};

export default SlotCard;
