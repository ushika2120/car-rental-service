import { IElectricVehicle, IVehicle, PublicVehicle, VehicleId } from "./types.js";

export class Fleet {
  private vehicles = new Map<VehicleId, IVehicle>();

  add(vehicle: IVehicle): void {
    if (this.vehicles.has(vehicle.id)) {
      throw new Error(`ავტომობილი ID ${vehicle.id} უკვე არსებობს`);
    }
    this.vehicles.set(vehicle.id, vehicle);
  }

  remove(id: VehicleId): boolean {
    return this.vehicles.delete(id);
  }

  get(id: VehicleId): IVehicle | undefined {
    return this.vehicles.get(id);
  }

  getAll(): IVehicle[] {
    return [...this.vehicles.values()];
  }

  getElectric(): IElectricVehicle[] {
    return this.getAll().filter(Fleet.isElectric);
  }

  getPublicCatalog(): PublicVehicle[] {
    return this.getAll().map((v) => v.toPublic());
  }

  static isElectric(v: IVehicle): v is IElectricVehicle {
    return "batteryCapacity" in v && "chargerType" in v;
  }
}
