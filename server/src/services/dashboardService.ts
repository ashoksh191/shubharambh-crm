import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Plot from '../models/Plot.js';
import Customer from '../models/Customer.js';

export const getDashboardStatsService = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);
  const endOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth() + 1, 0, 23, 59, 59, 999);

  const startOfLastMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth() - 1, 1);
  const endOfLastMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 0, 23, 59, 59, 999);

  // 1. Today's Bookings
  const todaysBookingsCount = await Booking.countDocuments({
    createdAt: { $gte: startOfToday, $lte: endOfToday },
    isDeleted: false,
    bookingStatus: { $ne: 'CANCELLED' },
  });

  // 2. Monthly Bookings & Growth %
  const [thisMonthBookingsCount, lastMonthBookingsCount] = await Promise.all([
    Booking.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      isDeleted: false,
      bookingStatus: { $ne: 'CANCELLED' },
    }),
    Booking.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      isDeleted: false,
      bookingStatus: { $ne: 'CANCELLED' },
    }),
  ]);

  let monthlyBookingGrowth = 100;
  if (lastMonthBookingsCount > 0) {
    monthlyBookingGrowth = Math.round(
      ((thisMonthBookingsCount - lastMonthBookingsCount) / lastMonthBookingsCount) * 100
    );
  }

  // 3. Today's Revenue & Monthly Revenue
  const [todayPayments, monthPayments] = await Promise.all([
    Payment.aggregate([
      { $match: { paymentDate: { $gte: startOfToday, $lte: endOfToday }, isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Payment.aggregate([
      { $match: { paymentDate: { $gte: startOfMonth, $lte: endOfMonth }, isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const todaysRevenue = todayPayments[0]?.total || 0;
  const monthlyRevenue = monthPayments[0]?.total || 0;

  // 4. Pending Payments Amount (Sum of balanceDue across all non-cancelled bookings)
  const pendingPaymentsAgg = await Booking.aggregate([
    { $match: { isDeleted: false, bookingStatus: { $nin: ['CANCELLED', 'REGISTERED'] } } },
    { $group: { _id: null, totalBalanceDue: { $sum: '$balanceDue' } } },
  ]);
  const pendingPaymentsAmount = pendingPaymentsAgg[0]?.totalBalanceDue || 0;

  // 5. Pending Registration Count
  const pendingRegistrationCount = await Booking.countDocuments({
    isDeleted: false,
    bookingStatus: { $in: ['FULLY_PAID', 'REGISTRATION_PENDING'] },
  });

  // 6. Recent Bookings Stream (Top 10)
  const recentBookings = await Booking.find({ isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('customer', 'fullName mobile email')
    .populate('plot', 'plotNumber block areaSqFt facing price')
    .populate('bookingExecutive', 'fullName username role')
    .lean();

  // 7. Top Sales Executive Leaderboard
  const topExecutivesAgg = await Booking.aggregate([
    { $match: { isDeleted: false, bookingStatus: { $ne: 'CANCELLED' } } },
    {
      $group: {
        _id: '$bookingExecutive',
        totalBookings: { $sum: 1 },
        totalVolume: { $sum: '$finalAmount' },
        totalAdvance: { $sum: '$paidAmount' },
      },
    },
    { $sort: { totalVolume: -1 } },
    { $limit: 5 },
  ]);

  await Booking.populate(topExecutivesAgg, { path: '_id', model: 'User', select: 'fullName username role email' });

  const topExecutives = topExecutivesAgg.map((exec) => ({
    executive: exec._id || { fullName: 'Direct / Unassigned' },
    totalBookings: exec.totalBookings,
    totalVolume: exec.totalVolume,
    totalAdvance: exec.totalAdvance,
  }));

  // 8. Booking Status Distribution & Inventory Occupancy
  const [totalPlotsCount, availablePlotsCount, bookedPlotsCount, soldPlotsCount, holdPlotsCount] =
    await Promise.all([
      Plot.countDocuments({ isDeleted: false }),
      Plot.countDocuments({ isDeleted: false, status: 'AVAILABLE' }),
      Plot.countDocuments({ isDeleted: false, status: 'BOOKED' }),
      Plot.countDocuments({ isDeleted: false, status: 'SOLD' }),
      Plot.countDocuments({ isDeleted: false, status: 'HOLD' }),
    ]);

  const occupancyRate = totalPlotsCount > 0 ? Math.round(((bookedPlotsCount + soldPlotsCount) / totalPlotsCount) * 100) : 0;

  return {
    summary: {
      todaysBookingsCount,
      thisMonthBookingsCount,
      lastMonthBookingsCount,
      monthlyBookingGrowth,
      todaysRevenue,
      monthlyRevenue,
      pendingPaymentsAmount,
      pendingRegistrationCount,
    },
    inventoryHealth: {
      totalPlotsCount,
      availablePlotsCount,
      bookedPlotsCount,
      soldPlotsCount,
      holdPlotsCount,
      occupancyRate,
    },
    recentBookings,
    topExecutives,
  };
};
