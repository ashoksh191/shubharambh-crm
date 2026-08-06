import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectMongoDB, { disconnectMongoDB } from './config/mongodb.js';
import Customer from './models/Customer.js';
import Plot from './models/Plot.js';
import Booking from './models/Booking.js';
import Payment from './models/Payment.js';
import BookingHistory from './models/BookingHistory.js';

dotenv.config();

export const seedBookingsData = async () => {
  console.log('🌱 Starting MongoDB Booking Module Seeding...');
  await connectMongoDB();

  // Clear existing collections
  await Promise.all([
    Customer.deleteMany({}),
    Plot.deleteMany({}),
    Booking.deleteMany({}),
    Payment.deleteMany({}),
    BookingHistory.deleteMany({}),
  ]);

  console.log('🧹 Existing collections cleared.');

  // 1. Seed Customers
  const customerDocs = [
    {
      customerId: 'CUST-2026-0001',
      fullName: 'Ramesh Kumar Gupta',
      fatherName: 'Harish Chandra Gupta',
      mobile: '9826012345',
      alternateMobile: '9425098765',
      email: 'ramesh.gupta@gmail.com',
      aadhaar: '451298341029',
      pan: 'ABCDE1234F',
      occupation: 'Business Owner',
      address: '45, Saket Nagar',
      city: 'Indore',
      state: 'Madhya Pradesh',
      pincode: '452001',
      nominee: { name: 'Sunita Gupta', relation: 'Wife', phone: '9826099999' },
      documents: [{ title: 'Aadhaar Card', url: '/uploads/docs/ramesh_aadhaar.pdf', uploadedAt: new Date() }],
    },
    {
      customerId: 'CUST-2026-0002',
      fullName: 'Dr. Priya Sharma',
      fatherName: 'Dr. R. K. Sharma',
      mobile: '9810098765',
      email: 'priya.sharma@apollo.org',
      aadhaar: '891023456789',
      pan: 'PQRST5678G',
      occupation: 'Senior Physician',
      address: '102, Vijay Nagar Extension',
      city: 'Indore',
      state: 'Madhya Pradesh',
      pincode: '452010',
      documents: [],
    },
    {
      customerId: 'CUST-2026-0003',
      fullName: 'Vikramaditya Singh Solanki',
      fatherName: 'Rajendra Singh Solanki',
      mobile: '9977011223',
      email: 'vikram.solanki@rediffmail.com',
      aadhaar: '671234890123',
      pan: 'JKLMN9012K',
      occupation: 'IT Director',
      address: 'Plot 12, Mahalakshmi Nagar',
      city: 'Indore',
      state: 'Madhya Pradesh',
      pincode: '452016',
      documents: [],
    },
  ];

  const customers = await Customer.insertMany(customerDocs);
  console.log(`✅ Seeded ${customers.length} Customers.`);

  // 2. Seed Master 980 Plots
  const plotDocs = [];
  const blocks: ('Block A' | 'Block B' | 'Block C')[] = ['Block A', 'Block B', 'Block C'];

  let globalPlotCounter = 101;
  for (const block of blocks) {
    const plotsPerBlock = block === 'Block A' ? 400 : block === 'Block B' ? 380 : 200;
    const type = block === 'Block A' ? 'Residential' : block === 'Block B' ? 'Villa' : 'Commercial';
    const rate = block === 'Block A' ? 1850 : block === 'Block B' ? 2250 : 3500;

    for (let i = 1; i <= plotsPerBlock; i++) {
      const plotNo = `${block.replace('Block ', '')}-${globalPlotCounter++}`;
      const area = block === 'Block C' ? 2400 : 1500;
      const price = area * rate;

      plotDocs.push({
        plotNumber: plotNo,
        block,
        areaSqFt: area,
        dimensions: block === 'Block C' ? '40x60 ft' : '30x50 ft',
        facing: (['North', 'East', 'South', 'West', 'Corner'] as const)[i % 5],
        type,
        ratePerSqFt: rate,
        price,
        status: 'AVAILABLE',
      });
    }
  }

  const seededPlots = await Plot.insertMany(plotDocs);
  console.log(`✅ Seeded ${seededPlots.length} Master Plots across Blocks A, B, C.`);

  // Pick 3 plots for demo Bookings
  const plot1 = seededPlots[0]; // A-101
  const plot2 = seededPlots[1]; // A-102
  const plot3 = seededPlots[2]; // A-103

  // 3. Seed Bookings
  const booking1 = new Booking({
    bookingId: 'SGC-BK-2026-0101',
    customer: customers[0]._id,
    plot: plot1._id,
    plotNumber: plot1.plotNumber,
    block: plot1.block,
    bookingAmount: 100000,
    agreementValue: plot1.price,
    discount: 25000,
    finalAmount: plot1.price - 25000,
    paidAmount: 500000,
    balanceDue: plot1.price - 25000 - 500000,
    paymentPlan: 'Installment',
    bookingStatus: 'PARTIAL_PAID',
    paymentStatus: 'PARTIAL',
    remarks: 'Token paid via HDFC Bank UTR',
  });

  const booking2 = new Booking({
    bookingId: 'SGC-BK-2026-0102',
    customer: customers[1]._id,
    plot: plot2._id,
    plotNumber: plot2.plotNumber,
    block: plot2.block,
    bookingAmount: 200000,
    agreementValue: plot2.price,
    discount: 50000,
    finalAmount: plot2.price - 50000,
    paidAmount: plot2.price - 50000,
    balanceDue: 0,
    paymentPlan: 'Cash',
    bookingStatus: 'FULLY_PAID',
    paymentStatus: 'FULL',
    remarks: 'Full payment completed. Ready for registry deed.',
  });

  await booking1.save();
  await booking2.save();

  // Update plot status for booked plots
  plot1.status = 'BOOKED';
  plot1.currentBookingId = booking1._id as any;
  await plot1.save();

  plot2.status = 'BOOKED';
  plot2.currentBookingId = booking2._id as any;
  await plot2.save();

  console.log(`✅ Seeded 2 Active Plot Bookings.`);

  // 4. Seed Payments
  await Payment.insertMany([
    {
      paymentId: 'PAY-2026-0001',
      bookingId: booking1._id,
      amount: 100000,
      mode: 'Bank Transfer',
      transactionId: 'UTR9812374912',
      paymentDate: new Date(),
      verified: true,
      remarks: 'Token Booking Amount',
    },
    {
      paymentId: 'PAY-2026-0002',
      bookingId: booking1._id,
      amount: 400000,
      mode: 'UPI',
      transactionId: 'UPI/20260806/88912',
      paymentDate: new Date(),
      verified: true,
      remarks: 'Second Instalment Paid',
    },
    {
      paymentId: 'PAY-2026-0003',
      bookingId: booking2._id,
      amount: booking2.finalAmount,
      mode: 'Bank Transfer',
      transactionId: 'RTGS/HDFC/990123',
      paymentDate: new Date(),
      verified: true,
      remarks: 'Full settlement lump sum payment',
    },
  ]);

  console.log(`✅ Seeded 3 Verified Payment Records.`);

  // 5. Seed Booking History
  await BookingHistory.insertMany([
    {
      historyId: 'HIST-00001',
      bookingId: booking1._id,
      action: 'BOOKING_CREATED',
      previousStatus: 'AVAILABLE',
      newStatus: 'BOOKED',
      details: { plotNumber: plot1.plotNumber, token: 100000 },
    },
    {
      historyId: 'HIST-00002',
      bookingId: booking1._id,
      action: 'PAYMENT_ADDED',
      newStatus: 'PARTIAL_PAID',
      details: { amount: 400000, UTR: 'UPI/20260806/88912' },
    },
  ]);

  console.log(`✅ Seeded Booking History Stream.`);
  console.log('🎉 MongoDB Booking Module Seeding Completed Successfully!');
};

if (process.argv[1]?.includes('seedBookings')) {
  seedBookingsData()
    .then(() => disconnectMongoDB())
    .catch((err) => {
      console.error('Seeding Failed:', err);
      process.exit(1);
    });
}
