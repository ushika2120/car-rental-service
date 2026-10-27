import { VehicleId } from "../fleet/types.js";
import {
  BookingId,
  BookingStatus,
  IBooking,
  ICorporateBooking,
  PublicBookingConfirmation,
  PublicCorporateConfirmation,
} from "./types.js";

const DAY_MS = 24 * 60 * 60 * 1000;

export abstract class BaseRental implements IBooking {
  status: BookingStatus = "Pending";

  constructor(
    public readonly id: BookingId,
    public readonly vehicleId: VehicleId,
    public customerName: string,
    public readonly licenseSeries: string,
    public readonly insurancePolicyToken: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    protected readonly dailyRate: number
  ) {}

  abstract calculateFinalPrice(): number;

  get totalPrice(): number {
    return this.calculateFinalPrice();
  }

  getDays(): number {
    return Math.max(1, Math.ceil((this.endDate.getTime() - this.startDate.getTime()) / DAY_MS));
  }

  overlaps(start: Date, end: Date): boolean {
    return this.startDate < end && start < this.endDate;
  }

  toPublicConfirmation(): PublicBookingConfirmation {
    return {
      id: this.id,
      vehicleId: this.vehicleId,
      customerName: this.customerName,
      startDate: this.startDate,
      endDate: this.endDate,
      status: this.status,
      totalPrice: this.totalPrice,
    };
  }
}

export class ShortTermRental extends BaseRental {
  calculateFinalPrice(): number {
    // 1-6 დღე: ფასდაკლების გარეშე
    return +(this.dailyRate * this.getDays()).toFixed(2);
  }
}

export class LongTermRental extends BaseRental {
  calculateFinalPrice(): number {
    const days = this.getDays();
    const discount = days >= 30 ? 0.2 : 0.1; // 7+ დღე: 10%, 30+ დღე: 20%
    return +(this.dailyRate * days * (1 - discount)).toFixed(2);
  }
}

export class CorporateRental extends LongTermRental implements ICorporateBooking {
  constructor(
    id: BookingId,
    vehicleId: VehicleId,
    customerName: string,
    licenseSeries: string,
    insurancePolicyToken: string,
    startDate: Date,
    endDate: Date,
    dailyRate: number,
    public companyName: string,
    public companyBalance: number
  ) {
    super(id, vehicleId, customerName, licenseSeries, insurancePolicyToken, startDate, endDate, dailyRate);
  }

  override calculateFinalPrice(): number {
    // კორპორატიული დამატებითი 5%
    return +(super.calculateFinalPrice() * 0.95).toFixed(2);
  }

  override toPublicConfirmation(): PublicCorporateConfirmation {
    return { ...super.toPublicConfirmation(), companyName: this.companyName, companyBalance: this.companyBalance };
  }
}
