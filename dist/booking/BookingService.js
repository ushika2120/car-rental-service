import { CorporateRental, LongTermRental, ShortTermRental } from "./BaseRental.js";
const LONG_TERM_MIN_DAYS = 7;
export class BookingService {
    constructor(fleet) {
        this.fleet = fleet;
        this.bookings = new Map();
        this.nextId = 1;
    }
    book(vehicleId, customer, start, end, company) {
        if (end <= start)
            throw new Error("დასრულების თარიღი უნდა იყოს დაწყების შემდეგ");
        const vehicle = this.fleet.get(vehicleId);
        if (!vehicle)
            throw new Error(`ავტომობილი ${vehicleId} ვერ მოიძებნა`);
        if (!this.isAvailable(vehicleId, start, end)) {
            throw new Error(`ავტომობილი ${vehicleId} მითითებულ პერიოდში დაკავებულია`);
        }
        const id = `B${this.nextId++}`;
        const rate = vehicle.calculateRentalRate();
        const args = [id, vehicleId, customer.name, customer.licenseSeries, customer.insurancePolicyToken, start, end, rate];
        let booking;
        if (company) {
            const corporate = new CorporateRental(...args, company.name, company.balance);
            const price = corporate.calculateFinalPrice();
            if (corporate.companyBalance < price)
                throw new Error("კომპანიის ბალანსი არასაკმარისია");
            corporate.companyBalance -= price;
            booking = corporate;
        }
        else {
            const days = Math.ceil((end.getTime() - start.getTime()) / 86400000);
            booking = days >= LONG_TERM_MIN_DAYS ? new LongTermRental(...args) : new ShortTermRental(...args);
        }
        this.bookings.set(id, booking);
        return booking;
    }
    isAvailable(vehicleId, start, end) {
        return !this.getAll().some((b) => b.vehicleId === vehicleId && b.status !== "Cancelled" && b.status !== "Completed" && b.overlaps(start, end));
    }
    start(id) {
        this.require(id).status = "Active";
    }
    complete(id) {
        this.require(id).status = "Completed";
    }
    cancel(id) {
        const b = this.require(id);
        if (b.status === "Completed")
            throw new Error("დასრულებული ჯავშანი ვერ გაუქმდება");
        b.status = "Cancelled";
    }
    getAll() {
        return [...this.bookings.values()];
    }
    require(id) {
        const b = this.bookings.get(id);
        if (!b)
            throw new Error(`ჯავშანი ${id} ვერ მოიძებნა`);
        return b;
    }
}
