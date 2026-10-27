import { BookingService } from "./booking/BookingService.js";
import { IBooking } from "./booking/types.js";
import { Fleet } from "./fleet/Fleet.js";
import { CargoVan, ElectricVehicle, PassengerCar } from "./fleet/vehicles.js";
import { IVehicle } from "./fleet/types.js";

const fleet = new Fleet();
fleet.add(new PassengerCar("1", "Toyota Camry", 50, "VIN0001", "GPS-01", 5));
fleet.add(new PassengerCar("2", "BMW X5", 120, "VIN0002", "GPS-02", 7));
fleet.add(new CargoVan("3", "Ford Transit", 80, "VIN0003", "GPS-03", 1200));
fleet.add(new ElectricVehicle("4", "Tesla Model 3", 100, "VIN0004", "GPS-04", 5, 75, "Tesla"));
fleet.add(new ElectricVehicle("5", "Nissan Leaf", 70, "VIN0005", "GPS-05", 5, 40, "CHAdeMO"));

const bookings = new BookingService(fleet);

type Category = "passenger" | "electric" | "van";

const STATUS_LABELS = { Pending: "მოლოდინში", Active: "აქტიური", Completed: "დასრულებული", Cancelled: "გაუქმებული" } as const;
const CATEGORY_LABELS: Record<Category, string> = { passenger: "სამგზავრო", electric: "ელექტრო", van: "სატვირთო" };

const CAR_PATH =
  '<path d="M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11a2 2 0 011 1.7V17a1 1 0 01-1 1h-1a2 2 0 01-4 0h-4a2 2 0 01-4 0H5a1 1 0 01-1-1v-4.3A2 2 0 015 11zm3-4l-1.2 4h10.4L16 7H8z"/>';

const CATEGORY_ICONS: Record<Category, string> = {
  passenger: `<svg viewBox="0 0 24 24">${CAR_PATH}</svg>`,
  electric: `<svg viewBox="0 0 24 24">${CAR_PATH}<path fill="#2ee6a6" d="M13.5 6.5L9.5 12h2.6l-.9 4.5 4-5.5h-2.6z"/></svg>`,
  van: '<svg viewBox="0 0 24 24"><path d="M3 6a1 1 0 011-1h9a1 1 0 011 1v2h3.2a1 1 0 01.8.4l2.6 3.4a1 1 0 01.2.6V16a1 1 0 01-1 1h-.6a2.5 2.5 0 01-4.8 0h-5.8a2.5 2.5 0 01-4.8 0H4a1 1 0 01-1-1V6zm13 3.5V12h3.5L17.6 9.5H16z"/></svg>',
};

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function categoryOf(v: IVehicle): Category {
  if (Fleet.isElectric(v)) return "electric";
  return v instanceof CargoVan ? "van" : "passenger";
}

function specsOf(v: IVehicle): string[] {
  if (Fleet.isElectric(v)) return [`ბატარეა: ${v.batteryCapacity} kWh`, `დამტენი: ${v.chargerType}`];
  if (v instanceof CargoVan) return [`ტვირთამწეობა: ${v.payloadKg} კგ`];
  if (v instanceof PassengerCar) return [`ადგილები: ${v.seats}`];
  return [];
}

function renderCatalog(filter: Category | "all"): void {
  const grid = $("catalog");
  grid.replaceChildren();
  for (const v of fleet.getAll()) {
    const category = categoryOf(v);
    if (filter !== "all" && filter !== category) continue;

    const pub = v.toPublic();
    const card = el("article", "card");

    const visual = el("div", "card-visual");
    visual.innerHTML = CATEGORY_ICONS[category];

    const body = el("div", "card-body");
    const top = el("div", "card-top");
    top.append(el("h3", "", pub.brand), el("span", `tag ${category}`, CATEGORY_LABELS[category]));

    const specs = el("ul", "specs");
    for (const s of specsOf(v)) specs.append(el("li", "", s));

    const price = el("div", "price");
    const amount = el("div");
    amount.append(el("strong", "", `$${pub.dailyRate}`), el("small", "", " / დღე"));
    const btn = el("button", "btn btn-sm", "დაჯავშნა");
    btn.type = "button";
    btn.onclick = () => {
      $<HTMLSelectElement>("vehicle").value = pub.id;
      updateQuote();
      $("booking").scrollIntoView();
    };
    price.append(amount, btn);

    body.append(top, specs, price);
    card.append(visual, body);
    grid.append(card);
  }
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("ka-GE");
}

function renderBookings(): void {
  const list = $("bookings");
  list.replaceChildren();
  const all = bookings.getAll();
  if (all.length === 0) {
    list.append(el("p", "empty", "ჯავშნები ჯერ არ არის."));
    return;
  }
  for (const b of all) list.append(bookingCard(b));
}

function bookingCard(b: IBooking): HTMLElement {
  const card = el("div", "booking");
  const head = el("div", "booking-head");
  head.append(el("strong", "", `${b.id} · ${fleet.get(b.vehicleId)?.brand ?? ""}`), el("span", `status ${b.status}`, STATUS_LABELS[b.status]));

  const meta = el("div", "booking-meta", `${b.customerName} · ${formatDate(b.startDate)} - ${formatDate(b.endDate)} · ${b.getDays()} დღე`);

  const foot = el("div", "booking-foot");
  foot.append(el("strong", "", `$${b.totalPrice.toFixed(2)}`));

  const actions = el("div", "booking-actions");
  const act = (label: string, cls: string, fn: () => void) => {
    const btn = el("button", `btn btn-sm ${cls}`, label);
    btn.type = "button";
    btn.onclick = () => {
      fn();
      renderBookings();
    };
    actions.append(btn);
  };
  if (b.status === "Pending") act("დაწყება", "btn-ghost", () => bookings.start(b.id));
  if (b.status === "Active") act("დასრულება", "btn-ghost", () => bookings.complete(b.id));
  if (b.status === "Pending" || b.status === "Active") act("გაუქმება", "btn-danger", () => bookings.cancel(b.id));
  foot.append(actions);

  card.append(head, meta, foot);
  return card;
}

function readDates(): { start: Date; end: Date } | null {
  const s = $<HTMLInputElement>("start").value;
  const e = $<HTMLInputElement>("end").value;
  if (!s || !e) return null;
  return { start: new Date(s), end: new Date(e) };
}

function updateQuote(): void {
  const quote = $("quote");
  const dates = readDates();
  const vehicle = fleet.get($<HTMLSelectElement>("vehicle").value);
  if (!dates || !vehicle || dates.end <= dates.start) {
    quote.textContent = "-";
    return;
  }
  const days = Math.ceil((dates.end.getTime() - dates.start.getTime()) / 86_400_000);
  const corporate = $<HTMLInputElement>("is-corporate").checked;
  // იგივე წესები, რაც ShortTerm/LongTerm/CorporateRental-ში
  const longTerm = corporate || days >= 7;
  const discount = !longTerm ? 0 : days >= 30 ? 0.2 : 0.1;
  const total = vehicle.calculateRentalRate() * days * (1 - discount) * (corporate ? 0.95 : 1);
  quote.textContent = `$${total.toFixed(2)}`;
}

function init(): void {
  $("stat-total").textContent = String(fleet.getAll().length);
  $("stat-electric").textContent = String(fleet.getElectric().length);

  const select = $<HTMLSelectElement>("vehicle");
  for (const v of fleet.getAll()) select.add(new Option(`${v.brand} - $${v.calculateRentalRate()}/დღე`, v.id));

  const today = new Date().toISOString().slice(0, 10);
  $<HTMLInputElement>("start").min = today;
  $<HTMLInputElement>("end").min = today;

  $("filters").addEventListener("click", (e) => {
    const chip = (e.target as HTMLElement).closest<HTMLButtonElement>(".chip");
    if (!chip) return;
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    renderCatalog(chip.dataset.filter as Category | "all");
  });

  $("is-corporate").addEventListener("change", () => {
    $("corp-fields").classList.toggle("show", $<HTMLInputElement>("is-corporate").checked);
    updateQuote();
  });

  for (const id of ["vehicle", "start", "end"]) $(id).addEventListener("change", updateQuote);

  $("booking-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const error = $("error");
    error.textContent = "";
    const input = (id: string) => $<HTMLInputElement>(id).value.trim();
    const dates = readDates();
    try {
      if (!dates) throw new Error("აირჩიე თარიღები");
      if (!input("customer") || !input("license") || !input("policy")) throw new Error("შეავსე ყველა სავალდებულო ველი");
      const corporate = $<HTMLInputElement>("is-corporate").checked;
      if (corporate && !input("company")) throw new Error("მიუთითე კომპანიის სახელი");
      bookings.book(
        select.value,
        { name: input("customer"), licenseSeries: input("license"), insurancePolicyToken: input("policy") },
        dates.start,
        dates.end,
        corporate ? { name: input("company"), balance: Number(input("balance")) } : undefined
      );
      renderBookings();
      $<HTMLFormElement>("booking-form").reset();
      $("corp-fields").classList.remove("show");
      updateQuote();
    } catch (err) {
      error.textContent = (err as Error).message;
    }
  });

  renderCatalog("all");
  renderBookings();
  updateQuote();
}

init();
