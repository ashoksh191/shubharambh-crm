import type { Plot, User, Booking, Transaction } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'SGC-ADM01',
    name: 'Ramesh Sharma',
    role: 'admin',
    phone: '+91 98765 43210',
    email: 'admin@shubharambhgreencity.com',
    joinedDate: '2025-01-10',
    totalBookingsCount: 45,
    totalSalesVolume: 67500000,
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
    totalBookingsCount: 18,
    totalSalesVolume: 24500000,
    totalCommissionEarned: 1225000,
    commissionPaid: 950000,
    commissionPending: 275000,
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
    totalBookingsCount: 14,
    totalSalesVolume: 18200000,
    totalCommissionEarned: 910000,
    commissionPaid: 700000,
    commissionPending: 210000,
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
    totalBookingsCount: 8,
    totalSalesVolume: 11200000,
    totalCommissionEarned: 560000,
    commissionPaid: 400000,
    commissionPending: 160000,
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
    totalBookingsCount: 5,
    totalSalesVolume: 6500000,
    totalCommissionEarned: 325000,
    commissionPaid: 250000,
    commissionPending: 75000,
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
    totalBookingsCount: 6,
    totalSalesVolume: 7800000,
    totalCommissionEarned: 390000,
    commissionPaid: 300000,
    commissionPending: 90000,
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
    totalBookingsCount: 3,
    totalSalesVolume: 3600000,
    totalCommissionEarned: 180000,
    commissionPaid: 100000,
    commissionPending: 80000,
  },
];

/**
 * Generates the complete 980-Plot Inventory matching the Official Master Blueprint Layout
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

    let status: 'available' | 'booked' | 'sold' = 'available';
    if (num % 5 === 0) status = 'sold';
    else if (num % 7 === 0) status = 'booked';

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
      status,
      facing: isCorner ? 'Corner' : (num % 2 === 0 ? 'East' : 'North'),
      roadWidth: num < 100 ? '40 Ft Main Boulevard Road' : '30 Ft Sector Road',
      x: 35 + col * 40,
      y: 45 + row * 40,
      w: 36,
      h: 36,
      bookingId: status !== 'available' ? `BK-2026-${1000 + num}` : undefined,
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

    let status: 'available' | 'booked' | 'sold' = 'available';
    if (num % 6 === 0) status = 'sold';
    else if (num % 8 === 0) status = 'booked';

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
      status,
      facing: isCorner ? 'Corner' : (num % 2 === 0 ? 'South' : 'West'),
      roadWidth: '30 Ft Park Avenue Road',
      x: 35 + col * 40,
      y: 380 + row * 38,
      w: 36,
      h: 34,
      bookingId: status !== 'available' ? `BK-2026-${1000 + num}` : undefined,
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

    let status: 'available' | 'booked' | 'sold' = 'available';
    if (num % 4 === 0) status = 'sold';
    else if (num % 9 === 0) status = 'booked';

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
      status,
      facing: isCorner ? 'Corner' : (num % 2 === 0 ? 'East' : 'North'),
      roadWidth: '25 Ft Internal Sector Road',
      x: 35 + col * 40,
      y: 690 + row * 38,
      w: 36,
      h: 34,
      bookingId: status !== 'available' ? `BK-2026-${1000 + num}` : undefined,
    });
  }

  return plots;
}

export const INITIAL_BOOKINGS: Booking[] = [
  {
    bookingId: 'BK-2026-202',
    plotId: 'A-5',
    plotNo: 'A-5',
    block: 'Block A',
    customerName: 'Sunil Sharma',
    customerPhone: '+91 98765 11223',
    customerAadhaar: '4589 1234 9876',
    customerPan: 'ABCPS1234F',
    customerAddress: 'Flat 402, Green Enclave, Sector 14, City',
    bookingAmount: 300000,
    totalAmount: 1800000,
    balanceDue: 1500000,
    utrNumber: 'UTR998877112233',
    paymentMode: 'NEFT',
    bookingDate: '2026-06-15',
    associateId: 'SGC-A001',
    associateName: 'Rajesh Kumar',
    status: 'sold',
    registryDueDate: '2026-09-15',
  },
  {
    bookingId: 'BK-2026-203',
    plotId: 'A-7',
    plotNo: 'A-7',
    block: 'Block A',
    customerName: 'Meenakshi Sundaram',
    customerPhone: '+91 97112 33445',
    customerAadhaar: '8877 6655 4433',
    customerPan: 'XYZPM9876K',
    customerAddress: '12, Sunrise Residency, Main Road',
    bookingAmount: 250000,
    totalAmount: 1200000,
    balanceDue: 950000,
    utrNumber: 'UTR334455667788',
    paymentMode: 'UPI',
    bookingDate: '2026-07-02',
    associateId: 'SGC-A002',
    associateName: 'Suresh Gupta',
    status: 'pending_verification',
    registryDueDate: '2026-10-02',
  },
  {
    bookingId: 'BK-2026-210',
    plotId: 'B-324',
    plotNo: 'B-324',
    block: 'Block B',
    customerName: 'Deepak Joshi',
    customerPhone: '+91 99554 43322',
    customerAadhaar: '1122 3344 5566',
    customerPan: 'PQRPD5432M',
    customerAddress: 'H.No 88, Civil Lines',
    bookingAmount: 200000,
    totalAmount: 800000,
    balanceDue: 600000,
    utrNumber: 'UTR556677889900',
    paymentMode: 'RTGS',
    bookingDate: '2026-07-10',
    associateId: 'SGC-A003',
    associateName: 'Pooja Mehta',
    status: 'pending_verification',
    registryDueDate: '2026-10-10',
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    txnId: 'TXN-901',
    bookingId: 'BK-2026-202',
    plotId: 'A-5',
    customerName: 'Sunil Sharma',
    amount: 300000,
    utrNumber: 'UTR998877112233',
    paymentMode: 'NEFT',
    date: '2026-06-15',
    verificationStatus: 'approved',
    verifiedBy: 'Priya Verma (Accountant)',
  },
  {
    txnId: 'TXN-902',
    bookingId: 'BK-2026-203',
    plotId: 'A-7',
    customerName: 'Meenakshi Sundaram',
    amount: 250000,
    utrNumber: 'UTR334455667788',
    paymentMode: 'UPI',
    date: '2026-07-02',
    verificationStatus: 'pending',
  },
  {
    txnId: 'TXN-903',
    bookingId: 'BK-2026-210',
    plotId: 'B-324',
    customerName: 'Deepak Joshi',
    amount: 200000,
    utrNumber: 'UTR556677889900',
    paymentMode: 'RTGS',
    date: '2026-07-10',
    verificationStatus: 'pending',
  },
];
