import { z } from 'zod';

export const createCustomerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  fatherName: z.string().optional(),
  mobile: z.string().regex(/^[0-9]{10}$/, 'Mobile must be a valid 10-digit number'),
  alternateMobile: z.string().regex(/^[0-9]{10}$/, 'Alternate mobile must be a 10-digit number').optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  aadhaar: z.string().regex(/^[0-9]{12}$/, 'Aadhaar must be a 12-digit number').optional().or(z.literal('')),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number format').optional().or(z.literal('')),
  occupation: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Pincode must be 6 digits').optional().or(z.literal('')),
  nominee: z
    .object({
      name: z.string(),
      relation: z.string(),
      phone: z.string(),
    })
    .optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const createPlotSchema = z.object({
  plotNumber: z.string().min(1, 'Plot number is required'),
  block: z.enum(['Block A', 'Block B', 'Block C']),
  areaSqFt: z.number().positive('Area must be positive'),
  dimensions: z.string().optional(),
  facing: z.enum(['North', 'South', 'East', 'West', 'Corner', 'North-East', 'South-East']).optional(),
  type: z.enum(['Residential', 'Commercial', 'Villa']).optional(),
  ratePerSqFt: z.number().positive().optional(),
  price: z.number().positive('Price must be positive'),
});

export const reservePlotSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  durationHours: z.number().min(1).max(72).default(24),
});

export const createBookingSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  plotId: z.string().min(1, 'Plot ID is required'),
  bookingAmount: z.number().min(1000, 'Minimum booking token is ₹1,000'),
  agreementValue: z.number().positive('Agreement value must be positive'),
  discount: z.number().min(0).default(0),
  paymentPlan: z.enum(['Cash', 'EMI', 'Installment']).default('Installment'),
  bookingExecutiveId: z.string().optional(),
  remarks: z.string().optional(),
});

export const updateBookingSchema = z.object({
  discount: z.number().min(0).optional(),
  paymentPlan: z.enum(['Cash', 'EMI', 'Installment']).optional(),
  bookingExecutiveId: z.string().optional(),
  remarks: z.string().optional(),
});

export const cancelBookingSchema = z.object({
  reason: z.string().min(3, 'Cancellation reason is required'),
});

export const createPaymentSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  amount: z.number().positive('Payment amount must be greater than 0'),
  mode: z.enum(['UPI', 'Cash', 'Cheque', 'Bank Transfer']),
  transactionId: z.string().optional(),
  paymentDate: z.string().optional(),
  remarks: z.string().optional(),
});

export const verifyPaymentSchema = z.object({
  approved: z.boolean(),
  remarks: z.string().optional(),
});
