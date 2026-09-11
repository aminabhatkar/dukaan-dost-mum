import type { Catalog, Customer, Order, RateItem } from "./types";

export const ORDERS: Order[] = [
  {
    id: "o1",
    cust: "Meena Bhabhi",
    phone: "93725 10084",
    time: "Abhi, 9:42",
    state: "new",
    items: [
      { n: "Doodh (full cream)", q: "2 litre" },
      { n: "Dahi", q: "1 kg" },
      { n: "Paneer", q: "250 gram" },
    ],
    total: 410,
  },
  {
    id: "o2",
    cust: "Rakesh Yadav",
    phone: "97662 33019",
    time: "9:20 AM",
    state: "new",
    items: [
      { n: "Atta", q: "5 kg" },
      { n: "Chini", q: "1 kg" },
      { n: "Chai patti", q: "250 gram" },
      {
        n: "“roz wala tel”",
        q: "1 litre",
        vague: true,
        cat: "Tel",
        guess: "Fortune Sunflower 1L",
        guessWhy: "Rakesh ne 7 baar yahi liya hai",
      },
    ],
    total: 735,
  },
  {
    id: "o3",
    cust: "Sunita Devi",
    phone: "98220 41562",
    time: "8:55 AM",
    state: "new",
    items: [
      {
        n: "“wahi wala sabun”",
        q: "4 nag",
        vague: true,
        cat: "Sabun",
        guess: "Lifebuoy Total 75g",
        guessWhy: "Sunita ne 9 baar yahi liya hai",
      },
      { n: "Doodh (toned)", q: "1 litre" },
      { n: "Anda", q: "12 nag" },
    ],
    total: 145,
  },
  {
    id: "o4",
    cust: "Iqbal Bhai",
    phone: "98701 45520",
    time: "8:30 AM",
    state: "accepted",
    items: [
      { n: "Doodh (full cream)", q: "4 litre" },
      { n: "Makhan", q: "500 gram" },
    ],
    total: 620,
  },
  {
    id: "o5",
    cust: "Pooja Sharma",
    phone: "90048 92231",
    time: "8:10 AM",
    state: "accepted",
    items: [
      { n: "Dahi", q: "2 kg" },
      { n: "Namak", q: "1 kg" },
    ],
    total: 230,
  },
  {
    id: "o6",
    cust: "Ashok Kumar",
    phone: "99304 77812",
    time: "7:50 AM",
    state: "accepted",
    items: [
      { n: "Doodh (toned)", q: "2 litre" },
      { n: "Bread", q: "1 packet" },
    ],
    total: 130,
  },
  {
    id: "o7",
    cust: "Sunita Devi",
    phone: "98220 41562",
    time: "7:20 AM",
    state: "delivered",
    items: [{ n: "Chai patti", q: "500 gram" }],
    total: 290,
  },
  {
    id: "o8",
    cust: "Meena Bhabhi",
    phone: "93725 10084",
    time: "7:05 AM",
    state: "delivered",
    items: [
      { n: "Doodh (full cream)", q: "1 litre" },
      { n: "Biscuit", q: "3 packet" },
    ],
    total: 175,
  },
  {
    id: "o9",
    cust: "Rakesh Yadav",
    phone: "97662 33019",
    time: "6:45 AM",
    state: "delivered",
    items: [{ n: "Anda", q: "30 nag" }],
    total: 255,
  },
];

export const CATALOG: Catalog = {
  Sabun: [
    { n: "Lifebuoy Total", sub: "75 gram · ₹28 · 9 baar liya", count: 9 },
    { n: "Santoor Sandal", sub: "100 gram · ₹34 · 2 baar liya", count: 2 },
    { n: "Dettol Original", sub: "75 gram · ₹42 · 1 baar liya", count: 1 },
    { n: "Medimix", sub: "75 gram · ₹35 · kabhi nahi", count: 0 },
  ],
  Doodh: [
    { n: "Doodh (full cream)", sub: "per litre · ₹66 · 22 baar liya", count: 22 },
    { n: "Doodh (toned)", sub: "per litre · ₹54 · 4 baar liya", count: 4 },
  ],
  Atta: [
    { n: "Aashirvaad Atta", sub: "5 kg · ₹245 · 6 baar liya", count: 6 },
    { n: "Khula atta", sub: "per kg · ₹42 · 2 baar liya", count: 2 },
  ],
  Tel: [
    { n: "Fortune Sunflower", sub: "1 litre · ₹165 · 7 baar liya", count: 7 },
    { n: "Sarson ka tel", sub: "1 litre · ₹148 · 3 baar liya", count: 3 },
  ],
  "Chai patti": [
    { n: "Tata Tea Gold", sub: "250 gram · ₹130 · 11 baar liya", count: 11 },
    { n: "Red Label", sub: "250 gram · ₹118 · 2 baar liya", count: 2 },
  ],
};

export const CUSTOMERS: Customer[] = [
  {
    id: "c1",
    name: "Sunita Devi",
    phone: "98220 41562",
    due: 840,
    prefs: [
      { cat: "Sabun", item: "Lifebuoy Total", note: "75 gram wala, 4 ka pack" },
      { cat: "Doodh", item: "Doodh (toned)", note: "Roz subah 7 baje" },
      { cat: "Chai patti", item: "Tata Tea Gold", note: "250 gram" },
    ],
    entries: [
      { t: "order", label: "Order liya", sub: "Aaj, 8:55 AM · Doodh, Anda", amt: 145 },
      { t: "pay", label: "Paisa mila", sub: "Kal, 6:30 PM · Cash", amt: 500 },
      { t: "order", label: "Order liya", sub: "Kal, 9:10 AM · Chai patti", amt: 290 },
      { t: "order", label: "Order liya", sub: "3 Sept · Atta, Chini, Tel", amt: 905 },
    ],
  },
  {
    id: "c2",
    name: "Ashok Kumar",
    phone: "99304 77812",
    due: 0,
    entries: [
      { t: "pay", label: "Paisa mila", sub: "Aaj, 8:05 AM · UPI", amt: 130 },
      { t: "order", label: "Order liya", sub: "Aaj, 7:50 AM · Doodh, Bread", amt: 130 },
    ],
  },
  {
    id: "c3",
    name: "Meena Bhabhi",
    phone: "93725 10084",
    due: 1560,
    prefs: [
      { cat: "Doodh", item: "Doodh (full cream)", note: "Dono waqt, subah aur shaam" },
      { cat: "Atta", item: "Aashirvaad Atta", note: "5 kg ka packet" },
    ],
    entries: [
      { t: "order", label: "Order liya", sub: "Aaj, 9:42 AM · Doodh, Dahi, Paneer", amt: 410 },
      { t: "order", label: "Order liya", sub: "Aaj, 7:05 AM · Doodh, Biscuit", amt: 175 },
      { t: "pay", label: "Paisa mila", sub: "2 Sept · Cash", amt: 1000 },
      { t: "order", label: "Order liya", sub: "1 Sept · Mahine ka saman", amt: 1975 },
    ],
  },
  {
    id: "c4",
    name: "Rakesh Yadav",
    phone: "97662 33019",
    due: 275,
    prefs: [
      { cat: "Tel", item: "Fortune Sunflower", note: "1 litre ki bottle" },
      { cat: "Chai patti", item: "Tata Tea Gold", note: "250 gram" },
    ],
    entries: [
      { t: "order", label: "Order liya", sub: "Aaj, 9:20 AM · Atta, Chini, Tel", amt: 735 },
      { t: "pay", label: "Paisa mila", sub: "Aaj, 7:00 AM · Cash", amt: 715 },
      { t: "order", label: "Order liya", sub: "Aaj, 6:45 AM · Anda", amt: 255 },
    ],
  },
  {
    id: "c5",
    name: "Pooja Sharma",
    phone: "90048 92231",
    due: 0,
    entries: [
      { t: "pay", label: "Paisa mila", sub: "Aaj, 8:15 AM · UPI", amt: 230 },
      { t: "order", label: "Order liya", sub: "Aaj, 8:10 AM · Dahi, Namak", amt: 230 },
    ],
  },
  {
    id: "c6",
    name: "Iqbal Bhai",
    phone: "98701 45520",
    due: 3200,
    entries: [
      { t: "order", label: "Order liya", sub: "Aaj, 8:30 AM · Doodh, Makhan", amt: 620 },
      { t: "order", label: "Order liya", sub: "Kal · Hotel ka doodh", amt: 1580 },
      { t: "pay", label: "Paisa mila", sub: "31 Aug · Cash", amt: 2000 },
      { t: "order", label: "Order liya", sub: "30 Aug · Hafte ka hisaab", amt: 3000 },
    ],
  },
];

export const ITEMS: RateItem[] = [
  { id: "i1", n: "Doodh (full cream)", u: "per litre", p: 66 },
  { id: "i2", n: "Doodh (toned)", u: "per litre", p: 54 },
  { id: "i3", n: "Dahi", u: "per kg", p: 90 },
  { id: "i4", n: "Paneer", u: "per 250 gram", p: 110 },
  { id: "i5", n: "Makhan", u: "per 500 gram", p: 280 },
  { id: "i6", n: "Atta", u: "per 5 kg", p: 245 },
  { id: "i7", n: "Chini", u: "per kg", p: 48 },
  { id: "i8", n: "Chai patti", u: "per 250 gram", p: 130 },
  { id: "i9", n: "Tel", u: "per litre", p: 165 },
  { id: "i10", n: "Anda", u: "per 12 nag", p: 84 },
];
