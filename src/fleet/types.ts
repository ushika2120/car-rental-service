export type VehicleId = string;

export type ChargerType = "Type1" | "Type2" | "CCS" | "CHAdeMO" | "Tesla";

export interface IVehicle {
  id: VehicleId;
  brand: string;
  pricePerDay: number;
  vin: string;
  gpsTrackerId: string;
  calculateRentalRate(): number;
  getInfo(): string;
  toPublic(): PublicVehicle;
}

export interface IElectricVehicle extends IVehicle {
  batteryCapacity: number; // kWh
  chargerType: ChargerType;
}

type Hidden = "vin" | "gpsTrackerId";
type Behavior = "calculateRentalRate" | "getInfo" | "toPublic";

// საჯარო კატალოგისთვის VIN და GPS ID ამოჭრილია
export type PublicVehicle = Omit<IVehicle, Hidden | Behavior> & { dailyRate: number };
export type PublicElectricVehicle = Omit<IElectricVehicle, Hidden | Behavior> & { dailyRate: number };
