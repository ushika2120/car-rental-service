import { Fleet } from "../fleet/Fleet.js";
import { VehicleId } from "../fleet/types.js";
import { BaseRental, CorporateRental, LongTermRental, ShortTermRental } from "./BaseRental.js";
import { BookingId, IBooking } from "./types.js";

const LONG_TERM_MIN_DAYS = 7;

export interface CustomerInfo {
  name: string;
  licenseSeries: string;
  insurancePolicyToken: string;
}

export interface CompanyInfo {
  name: string;
  balance: number;
}

export class BookingService {
  private bookings = new Map<BookingId, IBooking>();
  private nextId = 1;

  constructor(private fleet: Fleet) {}

  book(vehicleId: VehicleId, customer: CustomerInfo, start: Date, end: Date, company?: CompanyInfo): IBooking {
    if (end <= start) throw new Error("დასრულების თარიღი უნდა იყოს დაწყების შემდეგ");

    const vehicle = this.fleet.get(vehicleId);
    if (!vehicle) throw new Error(`ავტომობილი ${vehicleId} ვერ მოიძებნა`);
    if (!this.isAvailable(vehicleId, start, end)) {
      throw new Error(`ავტომობილი ${vehicleId} მითითებულ პერიოდში დაკავებულია`);
    }

    const id = `B${this.nextId++}`;
    const rate = vehicle.calculateRentalRate();
    const args = [id, vehicleId, customer.name, customer.licenseSeries, customer.insurancePolicyToken, start, end, rate] as const;

    let booking: BaseRental;
    if (company) {
      const corporate = new CorporateRental(...args, company.name, company.balance);
      const price = corporate.calculateFinalPrice();
      if (corporate.companyBalance < price) throw new Error("კომპანიის ბალანსი არასაკმარისია");
      corporate.companyBalance -= price;
      booking = corporate;
    } else {
      const days = Math.ceil((end.getTime() - start.getTime()) / 86_400_000);
      booking = days >= LONG_TERM_MIN_DAYS ? new LongTermRental(...args) : new ShortTermRental(...args);
    }

    this.bookings.set(id, booking);
    return booking;
  }

  isAvailable(vehicleId: VehicleId, start: Date, end: Date): boolean {
    return !this.getAll().some(
      (b) => b.vehicleId === vehicleId && b.status !== "Cancelled" && b.status !== "Completed" && b.overlaps(start, end)
    );
  }

  start(id: BookingId): void {
    this.require(id).status = "Active";
  }

  complete(id: BookingId): void {
    this.require(id).status = "Completed";
  }

  cancel(id: BookingId): void {
    const b = this.require(id);
    if (b.status === "Completed") throw new Error("დასრულებული ჯავშანი ვერ გაუქმდება");
    b.status = "Cancelled";
  }

  getAll(): IBooking[] {
    return [...this.bookings.values()];
  }

  private require(id: BookingId): IBooking {
    const b = this.bookings.get(id);
    if (!b) throw new Error(`ჯავშანი ${id} ვერ მოიძებნა`);
    return b;
  }
}
