const DAY_MS = 24 * 60 * 60 * 1000;
export class BaseRental {
    constructor(id, vehicleId, customerName, licenseSeries, insurancePolicyToken, startDate, endDate, dailyRate) {
        this.id = id;
        this.vehicleId = vehicleId;
        this.customerName = customerName;
        this.licenseSeries = licenseSeries;
        this.insurancePolicyToken = insurancePolicyToken;
        this.startDate = startDate;
        this.endDate = endDate;
        this.dailyRate = dailyRate;
        this.status = "Pending";
    }
    get totalPrice() {
        return this.calculateFinalPrice();
    }
    getDays() {
        return Math.max(1, Math.ceil((this.endDate.getTime() - this.startDate.getTime()) / DAY_MS));
    }
    overlaps(start, end) {
        return this.startDate < end && start < this.endDate;
    }
    toPublicConfirmation() {
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
    calculateFinalPrice() {
        // 1-6 დღე: ფასდაკლების გარეშე
        return +(this.dailyRate * this.getDays()).toFixed(2);
    }
}
export class LongTermRental extends BaseRental {
    calculateFinalPrice() {
        const days = this.getDays();
        const discount = days >= 30 ? 0.2 : 0.1; // 7+ დღე: 10%, 30+ დღე: 20%
        return +(this.dailyRate * days * (1 - discount)).toFixed(2);
    }
}
export class CorporateRental extends LongTermRental {
    constructor(id, vehicleId, customerName, licenseSeries, insurancePolicyToken, startDate, endDate, dailyRate, companyName, companyBalance) {
        super(id, vehicleId, customerName, licenseSeries, insurancePolicyToken, startDate, endDate, dailyRate);
        this.companyName = companyName;
        this.companyBalance = companyBalance;
    }
    calculateFinalPrice() {
        // კორპორატიული დამატებითი 5%
        return +(super.calculateFinalPrice() * 0.95).toFixed(2);
    }
    toPublicConfirmation() {
        return { ...super.toPublicConfirmation(), companyName: this.companyName, companyBalance: this.companyBalance };
    }
}
