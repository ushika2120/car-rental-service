import { ChargerType, IElectricVehicle, IVehicle, PublicElectricVehicle, PublicVehicle, VehicleId } from "./types.js";

export abstract class Vehicle implements IVehicle {
  constructor(
    public readonly id: VehicleId,
    public brand: string,
    public pricePerDay: number,
    public readonly vin: string,
    public readonly gpsTrackerId: string
  ) {}

  abstract calculateRentalRate(): number;

  getInfo(): string {
    return `${this.brand} (#${this.id}) - $${this.calculateRentalRate()}/დღე`;
  }

  toPublic(): PublicVehicle {
    return { id: this.id, brand: this.brand, pricePerDay: this.pricePerDay, dailyRate: this.calculateRentalRate() };
  }
}

export class PassengerCar extends Vehicle {
  constructor(
    id: VehicleId,
    brand: string,
    pricePerDay: number,
    vin: string,
    gpsTrackerId: string,
    public seats: number
  ) {
    super(id, brand, pricePerDay, vin, gpsTrackerId);
  }

  calculateRentalRate(): number {
    // ყოველი მეხუთე და მეტი ადგილი +5%
    const extraSeats = Math.max(0, this.seats - 4);
    return +(this.pricePerDay * (1 + 0.05 * extraSeats)).toFixed(2);
  }
}

export class CargoVan extends Vehicle {
  constructor(
    id: VehicleId,
    brand: string,
    pricePerDay: number,
    vin: string,
    gpsTrackerId: string,
    public payloadKg: number
  ) {
    super(id, brand, pricePerDay, vin, gpsTrackerId);
  }

  calculateRentalRate(): number {
    // ყოველ 100 კგ-ზე +$2
    return +(this.pricePerDay + (this.payloadKg / 100) * 2).toFixed(2);
  }
}

export class ElectricVehicle extends PassengerCar implements IElectricVehicle {
  constructor(
    id: VehicleId,
    brand: string,
    pricePerDay: number,
    vin: string,
    gpsTrackerId: string,
    seats: number,
    public batteryCapacity: number,
    public chargerType: ChargerType
  ) {
    super(id, brand, pricePerDay, vin, gpsTrackerId, seats);
  }

  override calculateRentalRate(): number {
    // ელექტრო პრემიუმი +10%
    return +(super.calculateRentalRate() * 1.1).toFixed(2);
  }

  override getInfo(): string {
    return `${super.getInfo()} | ბატარეა: ${this.batteryCapacity} kWh | დამტენი: ${this.chargerType}`;
  }

  override toPublic(): PublicElectricVehicle {
    return { ...super.toPublic(), batteryCapacity: this.batteryCapacity, chargerType: this.chargerType };
  }
}
