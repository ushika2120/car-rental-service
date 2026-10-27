import { VehicleId } from "../fleet/types.js";

export type BookingId = string;

export type BookingStatus = "Pending" | "Active" | "Completed" | "Cancelled";

export interface IBooking {
  id: BookingId;
  vehicleId: VehicleId;
  customerName: string;
  licenseSeries: string;
  insurancePolicyToken: string;
  startDate: Date;
  endDate: Date;
  status: BookingStatus;
  readonly totalPrice: number;
  getDays(): number;
  overlaps(start: Date, end: Date): boolean;
  calculateFinalPrice(): number;
  toPublicConfirmation(): PublicBookingConfirmation;
}

export interface ICorporateBooking extends IBooking {
  companyName: string;
  companyBalance: number;
}

type Sensitive = "licenseSeries" | "insurancePolicyToken";
type Behavior = "getDays" | "overlaps" | "calculateFinalPrice" | "toPublicConfirmation";

// საჯარო დასტურში მართვის მოწმობის სერია და პოლისის ტოკენი ამოჭრილია
export type PublicBookingConfirmation = Omit<IBooking, Sensitive | Behavior>;
export type PublicCorporateConfirmation = Omit<ICorporateBooking, Sensitive | Behavior>;
