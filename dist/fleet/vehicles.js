export class Vehicle {
    constructor(id, brand, pricePerDay, vin, gpsTrackerId) {
        this.id = id;
        this.brand = brand;
        this.pricePerDay = pricePerDay;
        this.vin = vin;
        this.gpsTrackerId = gpsTrackerId;
    }
    getInfo() {
        return `${this.brand} (#${this.id}) - $${this.calculateRentalRate()}/დღე`;
    }
    toPublic() {
        return { id: this.id, brand: this.brand, pricePerDay: this.pricePerDay, dailyRate: this.calculateRentalRate() };
    }
}
export class PassengerCar extends Vehicle {
    constructor(id, brand, pricePerDay, vin, gpsTrackerId, seats) {
        super(id, brand, pricePerDay, vin, gpsTrackerId);
        this.seats = seats;
    }
    calculateRentalRate() {
        // ყოველი მეხუთე და მეტი ადგილი +5%
        const extraSeats = Math.max(0, this.seats - 4);
        return +(this.pricePerDay * (1 + 0.05 * extraSeats)).toFixed(2);
    }
}
export class CargoVan extends Vehicle {
    constructor(id, brand, pricePerDay, vin, gpsTrackerId, payloadKg) {
        super(id, brand, pricePerDay, vin, gpsTrackerId);
        this.payloadKg = payloadKg;
    }
    calculateRentalRate() {
        // ყოველ 100 კგ-ზე +$2
        return +(this.pricePerDay + (this.payloadKg / 100) * 2).toFixed(2);
    }
}
export class ElectricVehicle extends PassengerCar {
    constructor(id, brand, pricePerDay, vin, gpsTrackerId, seats, batteryCapacity, chargerType) {
        super(id, brand, pricePerDay, vin, gpsTrackerId, seats);
        this.batteryCapacity = batteryCapacity;
        this.chargerType = chargerType;
    }
    calculateRentalRate() {
        // ელექტრო პრემიუმი +10%
        return +(super.calculateRentalRate() * 1.1).toFixed(2);
    }
    getInfo() {
        return `${super.getInfo()} | ბატარეა: ${this.batteryCapacity} kWh | დამტენი: ${this.chargerType}`;
    }
    toPublic() {
        return { ...super.toPublic(), batteryCapacity: this.batteryCapacity, chargerType: this.chargerType };
    }
}
