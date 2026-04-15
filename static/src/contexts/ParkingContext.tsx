import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { toast } from "sonner";

export type SlotStatus = "available" | "occupied" | "reserved";

export interface ParkingSlot {
  id: number;
  status: SlotStatus;
  bookingId?: string;
  occupiedSince?: number; // timestamp
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  slotId: number;
  verificationCode: string;
  date: string;
  time: string;
  duration: number; // minutes
  status: "active" | "completed" | "cancelled" | "expired";
  createdAt: number;
  verified: boolean;
}

interface ParkingContextType {
  slots: ParkingSlot[];
  bookings: Booking[];
  gateOpen: boolean;
  bookSlot: (userId: string, userName: string, date: string, time: string, duration: number) => Booking | null;
  cancelBooking: (bookingId: string) => void;
  verifyBooking: (code: string) => Booking | null;
  allowEntry: (bookingId: string) => void;
  toggleGate: () => void;
  setSlotStatus: (slotId: number, status: SlotStatus) => void;
  approveBooking: (bookingId: string) => void;
  availableCount: number;
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

const generateCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateBookingId = (): string => {
  return "BK" + Math.random().toString(36).slice(2, 8).toUpperCase();
};

const initialSlots: ParkingSlot[] = [
  { id: 1, status: "available" },
  { id: 2, status: "available" },
  { id: 3, status: "available" },
  { id: 4, status: "reserved" },
  { id: 5, status: "reserved" },
  { id: 6, status: "reserved" },
];

export const ParkingProvider = ({ children }: { children: ReactNode }) => {
  const [slots, setSlots] = useState<ParkingSlot[]>(initialSlots);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [gateOpen, setGateOpen] = useState(false);

  const availableCount = slots.filter((s) => s.status === "available").length;

  // Auto-expire bookings after duration
  useEffect(() => {
    const interval = setInterval(() => {
      setBookings((prev) =>
        prev.map((b) => {
          if (b.status === "active" && Date.now() - b.createdAt > b.duration * 60 * 1000) {
            setSlots((ss) =>
              ss.map((s) => (s.bookingId === b.id ? { ...s, status: "reserved" as SlotStatus, bookingId: undefined, occupiedSince: undefined } : s))
            );
            toast.info(`Booking ${b.id} has expired`);
            return { ...b, status: "expired" as const };
          }
          return b;
        })
      );
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const bookSlot = useCallback((userId: string, userName: string, date: string, time: string, duration: number): Booking | null => {
    const reservedSlot = slots.find((s) => s.status === "reserved" && !s.bookingId);
    if (!reservedSlot) {
      toast.error("No reserved slots available for booking");
      return null;
    }

    const booking: Booking = {
      id: generateBookingId(),
      userId,
      userName,
      slotId: reservedSlot.id,
      verificationCode: generateCode(),
      date,
      time,
      duration,
      status: "active",
      createdAt: Date.now(),
      verified: false,
    };

    setSlots((prev) =>
      prev.map((s) => (s.id === reservedSlot.id ? { ...s, bookingId: booking.id } : s))
    );
    setBookings((prev) => [...prev, booking]);
    toast.success("Booking successful!");
    return booking;
  }, [slots]);

  const cancelBooking = useCallback((bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" as const } : b))
    );
    setSlots((prev) =>
      prev.map((s) => (s.bookingId === bookingId ? { ...s, bookingId: undefined, status: "reserved" as SlotStatus } : s))
    );
    toast.info("Booking cancelled");
  }, []);

  const verifyBooking = useCallback((code: string): Booking | null => {
    return bookings.find((b) => b.verificationCode === code && b.status === "active") || null;
  }, [bookings]);

  const allowEntry = useCallback((bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, verified: true } : b))
    );
    setSlots((prev) =>
      prev.map((s) =>
        s.bookingId === bookingId ? { ...s, status: "occupied" as SlotStatus, occupiedSince: Date.now() } : s
      )
    );
    setGateOpen(true);
    toast.success("Entry allowed! Gate opened.");
    setTimeout(() => setGateOpen(false), 5000);
  }, []);

  const toggleGate = useCallback(() => {
    setGateOpen((prev) => !prev);
    toast.info(gateOpen ? "Gate closed" : "Gate opened");
  }, [gateOpen]);

  const setSlotStatus = useCallback((slotId: number, status: SlotStatus) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, status, bookingId: undefined, occupiedSince: status === "occupied" ? Date.now() : undefined } : s))
    );
  }, []);

  const approveBooking = useCallback((bookingId: string) => {
    toast.success(`Booking ${bookingId} approved`);
  }, []);

  return (
    <ParkingContext.Provider
      value={{ slots, bookings, gateOpen, bookSlot, cancelBooking, verifyBooking, allowEntry, toggleGate, setSlotStatus, approveBooking, availableCount }}
    >
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = () => {
  const ctx = useContext(ParkingContext);
  if (!ctx) throw new Error("useParking must be used within ParkingProvider");
  return ctx;
};
