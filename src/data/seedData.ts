import type { Plot, User, Booking, Transaction } from '../types';
import plotsJsonData from './plots.json';

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
    phone: '+91 98222 33445',
    email: 'vikram.singh@gmail.com',
    joinedDate: '2025-01-20',
    totalBookingsCount: 8,
    totalSalesVolume: 12500000,
    totalCommissionEarned: 625000,
    commissionPaid: 500000,
    commissionPending: 125000,
    downlineIds: ['SGC-L003', 'SGC-L004'],
  },
  {
    id: 'SGC-L002',
    name: 'Anjali Gupta',
    role: 'leader',
    phone: '+91 98333 44556',
    email: 'anjali.gupta@yahoo.com',
    joinedDate: '2025-01-22',
    totalBookingsCount: 5,
    totalSalesVolume: 7800000,
    totalCommissionEarned: 390000,
    commissionPaid: 390000,
    commissionPending: 0,
    downlineIds: ['SGC-L005'],
  },
  {
    id: 'SGC-L003',
    name: 'Rahul Yadav',
    role: 'associate',
    phone: '+91 98444 55667',
    email: 'rahul.yadav@gmail.com',
    joinedDate: '2025-02-01',
    totalBookingsCount: 3,
    totalSalesVolume: 4200000,
    totalCommissionEarned: 126000,
    commissionPaid: 100000,
    commissionPending: 26000,
  },
  {
    id: 'SGC-L004',
    name: 'Suresh Kumar',
    role: 'associate',
    phone: '+91 98555 66778',
    email: 'suresh.k@gmail.com',
    joinedDate: '2025-02-05',
    totalBookingsCount: 2,
    totalSalesVolume: 3100000,
    totalCommissionEarned: 93000,
    commissionPaid: 93000,
    commissionPending: 0,
  },
  {
    id: 'SGC-L005',
    name: 'Neha Srivastava',
    role: 'associate',
    phone: '+91 98666 77889',
    email: 'neha.s@gmail.com',
    joinedDate: '2025-02-10',
    totalBookingsCount: 1,
    totalSalesVolume: 1500000,
    totalCommissionEarned: 45000,
    commissionPaid: 0,
    commissionPending: 45000,
  },
];

/**
 * Generates the complete Plot Inventory directly mapped from 4K Architect Blueprint (plots.json)
 * Ensures 100% exact alignment between printed map numbers (e.g. C-891) and clickable polygons.
 */
export function generatePlots(): Plot[] {
  const plots: Plot[] = [];
  const entries = Object.entries(plotsJsonData as Record<string, any>);

  for (const [key, item] of entries) {
    const points = item.points || [];
    const x = points[0]?.[0] || 0;
    const y = points[0]?.[1] || 0;
    const w = points[1] && points[0] ? Math.abs(points[1][0] - points[0][0]) : 54;
    const h = points[2] && points[1] ? Math.abs(points[2][1] - points[1][1]) : 32;

    const blockName = item.block || (key.startsWith('A') ? 'Block A' : key.startsWith('B') ? 'Block B' : 'Block C');
    const facingVal = item.facing === 'East' || item.facing === 'West' || item.facing === 'North' || item.facing === 'South' || item.facing === 'Corner'
      ? item.facing
      : 'East';

    const statusVal = item.status === 'booked' ? 'booked' : item.status === 'sold' ? 'sold' : 'available';

    plots.push({
      id: key,
      plotNo: item.plotNo || key,
      block: blockName,
      dimensions: item.dimensions || "25' x 40'",
      width: parseInt(item.dimensions?.split("'")[0] || '25', 10),
      length: parseInt(item.dimensions?.split("x")[1] || '40', 10),
      totalArea: item.size || 1000,
      ratePerSqFt: item.price && item.size ? Math.round(item.price / item.size) : 1000,
      totalPrice: item.price || 1000000,
      status: statusVal,
      facing: facingVal,
      roadWidth: blockName === 'Block A' ? '40 Ft Main Boulevard Road' : '30 Ft Sector Road',
      x,
      y,
      w: w > 0 ? w : 54,
      h: h > 0 ? h : 32,
    });
  }

  return plots;
}

export const INITIAL_BOOKINGS: Booking[] = [];
export const INITIAL_TRANSACTIONS: Transaction[] = [];
