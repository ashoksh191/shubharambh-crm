import type { Plot, User, Booking, Transaction } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'SGC-ADM01',
    name: 'Ramesh Sharma',
    role: 'admin',
    phone: '+91 98765 43210',
    email: 'admin@shubharambhgreencity.com',
    joinedDate: '2025-01-10',
    totalBookingsCount: 0,
    totalSalesVolume: 0,
    totalCommissionEarned: 0,
    commissionPaid: 0,
    commissionPending: 0,
    downlineIds: ['SGC-L001', 'SGC-L002', 'SGC-ACC01'],
  },
  {
    id: 'SGC-ACC01',
    name: 'Priya Verma',
    role: 'accountant',
    phone: '+91 98111 22334',
    email: 'finance@shubharambhgreencity.com',
    joinedDate: '2025-01-15',
    totalBookingsCount: 0,
    totalSalesVolume: 0,
    totalCommissionEarned: 0,
    commissionPaid: 0,
    commissionPending: 0,
  },
  {
    id: 'SGC-L001',
    name: 'Vikram Singh',
    role: 'leader',
    phone: '+91 99887 76655',
    email: 'vikram.singh@sgc.com',
    parentId: 'SGC-ADM01',
    downlineIds: ['SGC-A001', 'SGC-A002'],
    joinedDate: '2025-02-01',
    totalBookingsCount: 0,
    totalSalesVolume: 0,
    totalCommissionEarned: 0,
    commissionPaid: 0,
    commissionPending: 0,
  },
  {
    id: 'SGC-L002',
    name: 'Anita Roy',
    role: 'leader',
    phone: '+91 97766 55443',
    email: 'anita.roy@sgc.com',
    parentId: 'SGC-ADM01',
    downlineIds: ['SGC-A003', 'SGC-A004'],
    joinedDate: '2025-02-05',
    totalBookingsCount: 0,
    totalSalesVolume: 0,
    totalCommissionEarned: 0,
    commissionPaid: 0,
    commissionPending: 0,
  },
  {
    id: 'SGC-A001',
    name: 'Rajesh Kumar',
    role: 'associate',
    phone: '+91 96543 21098',
    email: 'rajesh.k@sgc.com',
    parentId: 'SGC-L001',
    downlineIds: [],
    joinedDate: '2025-03-01',
    totalBookingsCount: 0,
    totalSalesVolume: 0,
    totalCommissionEarned: 0,
    commissionPaid: 0,
    commissionPending: 0,
  },
  {
    id: 'SGC-A002',
    name: 'Suresh Gupta',
    role: 'associate',
    phone: '+91 95432 10987',
    email: 'suresh.g@sgc.com',
    parentId: 'SGC-L001',
    downlineIds: [],
    joinedDate: '2025-03-10',
    totalBookingsCount: 0,
    totalSalesVolume: 0,
    totalCommissionEarned: 0,
    commissionPaid: 0,
    commissionPending: 0,
  },
  {
    id: 'SGC-A003',
    name: 'Pooja Mehta',
    role: 'associate',
    phone: '+91 94321 09876',
    email: 'pooja.m@sgc.com',
    parentId: 'SGC-L002',
    downlineIds: [],
    joinedDate: '2025-03-15',
    totalBookingsCount: 0,
    totalSalesVolume: 0,
    totalCommissionEarned: 0,
    commissionPaid: 0,
    commissionPending: 0,
  },
  {
    id: 'SGC-A004',
    name: 'Amit Patel',
    role: 'associate',
    phone: '+91 93210 98765',
    email: 'amit.p@sgc.com',
    parentId: 'SGC-L002',
    downlineIds: [],
    joinedDate: '2025-04-01',
    totalBookingsCount: 0,
    totalSalesVolume: 0,
    totalCommissionEarned: 0,
    commissionPaid: 0,
    commissionPending: 0,
  },
];

/**
 * Generates Clean 980-Plot Inventory in 100% Available State (0 Booked, 0 Sold)
 * Block A: A-1 to A-316 (30'x50', 25'x50', 20'x50')
 * Block B: B-317 to B-680 (25'x40', 20'x40', 15'x40')
 * Block C: C-681 to C-980 (25'x40', 20'x40', 15'x40')
 */
export function generatePlots(): Plot[] {
  const plots: Plot[] = [];

  // 1. BLOCK A (Plots A-1 to A-316)
  const blockASpecs = [
    { dim: "30' x 50'", w: 30, l: 50, area: 1500, rate: 1200 },
    { dim: "25' x 50'", w: 25, l: 50, area: 1250, rate: 1200 },
    { dim: "20' x 50'", w: 20, l: 50, area: 1000, rate: 1200 },
  ];

  for (let num = 1; num <= 316; num++) {
    const plotNo = num === 13 ? 'A-12A' : `A-${num}`;
    const spec = blockASpecs[num % blockASpecs.length];
    const isCorner = num % 12 === 0 || num % 12 === 1;

    const col = (num - 1) % 16;
    const row = Math.floor((num - 1) / 16);

    plots.push({
      id: `A-${num}`,
      plotNo: plotNo,
      block: 'Block A',
      dimensions: spec.dim,
      width: spec.w,
      length: spec.l,
      totalArea: spec.area,
      ratePerSqFt: spec.rate,
      totalPrice: spec.area * spec.rate,
      status: 'available', // Clean 0 Booked, 0 Sold
      facing: isCorner ? 'Corner' : (num % 2 === 0 ? 'East' : 'North'),
      roadWidth: num < 100 ? '40 Ft Main Boulevard Road' : '30 Ft Sector Road',
      x: 35 + col * 40,
      y: 45 + row * 40,
      w: 36,
      h: 36,
    });
  }

  // 2. BLOCK B (Plots B-317 to B-680)
  const blockBSpecs = [
    { dim: "25' x 40'", w: 25, l: 40, area: 1000, rate: 1000 },
    { dim: "20' x 40'", w: 20, l: 40, area: 800, rate: 1000 },
    { dim: "15' x 40'", w: 15, l: 40, area: 600, rate: 1000 },
  ];

  for (let num = 317; num <= 680; num++) {
    const plotNo = `B-${num}`;
    const spec = blockBSpecs[num % blockBSpecs.length];
    const isCorner = num % 10 === 0 || num % 10 === 1;

    const index = num - 317;
    const col = index % 16;
    const row = Math.floor(index / 16);

    plots.push({
      id: `B-${num}`,
      plotNo: plotNo,
      block: 'Block B',
      dimensions: spec.dim,
      width: spec.w,
      length: spec.l,
      totalArea: spec.area,
      ratePerSqFt: spec.rate,
      totalPrice: spec.area * spec.rate,
      status: 'available', // Clean 0 Booked, 0 Sold
      facing: isCorner ? 'Corner' : (num % 2 === 0 ? 'South' : 'West'),
      roadWidth: '30 Ft Park Avenue Road',
      x: 35 + col * 40,
      y: 380 + row * 38,
      w: 36,
      h: 34,
    });
  }

  // 3. BLOCK C (Plots C-681 to C-980)
  const blockCSpecs = [
    { dim: "25' x 40'", w: 25, l: 40, area: 1000, rate: 900 },
    { dim: "20' x 40'", w: 20, l: 40, area: 800, rate: 900 },
    { dim: "15' x 40'", w: 15, l: 40, area: 600, rate: 900 },
  ];

  for (let num = 681; num <= 980; num++) {
    const plotNo = `C-${num}`;
    const spec = blockCSpecs[num % blockCSpecs.length];
    const isCorner = num % 10 === 0 || num % 10 === 1;

    const index = num - 681;
    const col = index % 16;
    const row = Math.floor(index / 16);

    plots.push({
      id: `C-${num}`,
      plotNo: plotNo,
      block: 'Block C',
      dimensions: spec.dim,
      width: spec.w,
      length: spec.l,
      totalArea: spec.area,
      ratePerSqFt: spec.rate,
      totalPrice: spec.area * spec.rate,
      status: 'available', // Clean 0 Booked, 0 Sold
      facing: isCorner ? 'Corner' : (num % 2 === 0 ? 'East' : 'North'),
      roadWidth: '25 Ft Internal Sector Road',
      x: 35 + col * 40,
      y: 690 + row * 38,
      w: 36,
      h: 34,
    });
  }

  return plots;
}

export const INITIAL_BOOKINGS: Booking[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];
