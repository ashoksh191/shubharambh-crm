import Customer, { ICustomer } from '../models/Customer.js';
import Booking from '../models/Booking.js';

export interface ListCustomerFilter {
  search?: string;
  city?: string;
  state?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Generate Auto-Increment Customer ID: CUST-YYYY-XXXX
 */
export const generateCustomerId = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const count = await Customer.countDocuments({});
  const nextNumber = (count + 1).toString().padStart(4, '0');
  return `CUST-${currentYear}-${nextNumber}`;
};

export const createCustomerService = async (data: Partial<ICustomer>): Promise<ICustomer> => {
  const customerId = await generateCustomerId();

  // Check if mobile or aadhaar already registered
  if (data.mobile) {
    const existing = await Customer.findOne({ mobile: data.mobile, isDeleted: false });
    if (existing) {
      throw { statusCode: 400, message: `Customer with mobile ${data.mobile} already exists.` };
    }
  }

  if (data.aadhaar) {
    const existingAadhaar = await Customer.findOne({ aadhaar: data.aadhaar, isDeleted: false });
    if (existingAadhaar) {
      throw { statusCode: 400, message: `Customer with Aadhaar ${data.aadhaar} already exists.` };
    }
  }

  const customer = new Customer({
    ...data,
    customerId,
  });

  return await customer.save();
};

export const listCustomersService = async (filters: ListCustomerFilter = {}) => {
  const {
    search,
    city,
    state,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = filters;

  const query: any = { isDeleted: false };

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { customerId: { $regex: search, $options: 'i' } },
      { aadhaar: { $regex: search, $options: 'i' } },
    ];
  }

  if (city) {
    query.city = { $regex: city, $options: 'i' };
  }

  if (state) {
    query.state = { $regex: state, $options: 'i' };
  }

  const skip = (page - 1) * limit;
  const sortOption: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [items, total] = await Promise.all([
    Customer.find(query).sort(sortOption).skip(skip).limit(limit).lean(),
    Customer.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCustomerByIdService = async (id: string) => {
  const customer = await Customer.findOne({
    $or: [{ _id: mongooseTypesValid(id) ? id : null }, { customerId: id }],
    isDeleted: false,
  }).lean();

  if (!customer) {
    throw { statusCode: 404, message: 'Customer record not found.' };
  }

  // Get active bookings for this customer
  const customerBookings = await Booking.find({ customer: customer._id, isDeleted: false })
    .populate('plot')
    .sort({ createdAt: -1 })
    .lean();

  return {
    ...customer,
    bookings: customerBookings,
  };
};

export const updateCustomerService = async (id: string, updateData: Partial<ICustomer>) => {
  const customer = await Customer.findOneAndUpdate(
    { $or: [{ _id: mongooseTypesValid(id) ? id : null }, { customerId: id }], isDeleted: false },
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!customer) {
    throw { statusCode: 404, message: 'Customer record not found.' };
  }

  return customer;
};

export const deleteCustomerService = async (id: string) => {
  const customer = await Customer.findOneAndUpdate(
    { $or: [{ _id: mongooseTypesValid(id) ? id : null }, { customerId: id }], isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!customer) {
    throw { statusCode: 404, message: 'Customer record not found.' };
  }

  return { message: 'Customer deleted successfully (soft delete).' };
};

function mongooseTypesValid(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}
