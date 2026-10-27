export class Fleet {
    constructor() {
        this.vehicles = new Map();
    }
    add(vehicle) {
        if (this.vehicles.has(vehicle.id)) {
            throw new Error(`ავტომობილი ID ${vehicle.id} უკვე არსებობს`);
        }
        this.vehicles.set(vehicle.id, vehicle);
    }
    remove(id) {
        return this.vehicles.delete(id);
    }
    get(id) {
        return this.vehicles.get(id);
    }
    getAll() {
        return [...this.vehicles.values()];
    }
    getElectric() {
        return this.getAll().filter(Fleet.isElectric);
    }
    getPublicCatalog() {
        return this.getAll().map((v) => v.toPublic());
    }
    static isElectric(v) {
        return "batteryCapacity" in v && "chargerType" in v;
    }
}
