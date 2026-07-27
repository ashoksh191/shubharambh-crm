export type PlotStatus = 'available' | 'booked' | 'sold';

export type BlockName = 'Block A' | 'Block B' | 'Block C';

export interface Plot {
  id: string;
  plotNo: string;
  block: BlockName;
  dimensions: string;
  width: number;
  length: number;
  totalArea: number;
  ratePerSqFt: number;
  totalPrice: number;
  status: PlotStatus;
  facing: 'North' | 'South' | 'East' | 'West' | 'Corner';
  roadWidth: string;
  x: number; // Grid/Canvas position x
  y: number; // Grid/Canvas position y
  w: number; // Visual width
  h: number; // Visual height
  bookingId?: string;
}

export type UserRole = 'admin' | 'accountant' | 'leader' | 'associate';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  email: string;
  parentId?: string;
  downlineIds?: string[];
  totalBookingsCount: number;
  totalSalesVolume: number;
  totalCommissionEarned: number;
  commissionPaid: number;
  commissionPending: number;
  joinedDate: string;
}

export interface Booking {
  bookingId: string;
  plotId: string;
  plotNo: string;
  block: BlockName;
  customerName: string;
  customerPhone: string;
  customerAadhaar: string;
  customerPan: string;
  customerAddress: string;
  bookingAmount: number;
  totalAmount: number;
  balanceDue: number;
  utrNumber: string;
  paymentMode: string;
  bookingDate: string;
  associateId: string;
  associateName: string;
  status: 'pending_verification' | 'verified' | 'sold' | 'cancelled';
  registryDueDate: string;
}

export interface Transaction {
  txnId: string;
  bookingId: string;
  plotId: string;
  customerName: string;
  amount: number;
  utrNumber: string;
  paymentMode: string;
  date: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verifiedBy?: string;
}

export interface SiteUSP {
  icon: string;
  title: string;
  description: string;
}
