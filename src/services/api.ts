const API_BASE_URL = 'http://localhost:5000/api';

export interface BookingPayload {
  plotId: string;
  customerName: string;
  customerPhone: string;
  bookingAmount: number;
  utrNumber: string;
  paymentMode: string;
  expectedStatus?: string;
  expectedVersion?: number;
}

export type TransactionStatus = 'pending' | 'success' | 'failed' | 'conflict';

export interface BookingApiResponse {
  success: boolean;
  status: TransactionStatus;
  booking?: {
    bookingId: string;
    plotId: string;
    customerName: string;
    customerPhone: string;
    bookingAmount: number;
    utrNumber: string;
    paymentMode: string;
    date: string;
  };
  message: string;
}

/**
 * Fetches plot datasets from backend API.
 */
export const fetchPlotsFromApi = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/plots`);
    if (!res.ok) throw new Error('API server unavailable');
    const data = await res.json();
    return data.data;
  } catch (_err) {
    console.warn('Backend API offline, using local plots.json dataset...');
    return null;
  }
};

/**
 * Fetches single plot details by ID from backend API.
 */
export const fetchPlotDetailFromApi = async (plotId: string) => {
  try {
    const res = await fetch(`${API_BASE_URL}/plot/${plotId}`);
    if (!res.ok) throw new Error('API server unavailable');
    const data = await res.json();
    return data.data;
  } catch (_err) {
    return null;
  }
};

/**
 * Sends plot property updates to backend API.
 */
export const updatePlotApi = async (plotId: string, updateData: Record<string, any>) => {
  try {
    const res = await fetch(`${API_BASE_URL}/plot/${plotId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    const data = await res.json();
    return data;
  } catch (_err) {
    console.warn('Backend API offline, update applied in memory...');
    return { success: true, localOnly: true };
  }
};

/**
 * Submits booking application to backend API with Server Authoritative Concurrency Control.
 * Booking MUST NEVER succeed locally via localStorage fallback if server communication fails.
 */
export const submitBookingApi = async (payload: BookingPayload): Promise<BookingApiResponse> => {
  try {
    const res = await fetch(`${API_BASE_URL}/booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.status === 409) {
      const conflictData = await res.json().catch(() => ({}));
      return {
        success: false,
        status: 'conflict',
        message: conflictData.message || 'Conflict: Plot has already been booked or reserved by another transaction.',
      };
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        status: 'failed',
        message: errorData.message || `Server error (${res.status}): Booking transaction failed.`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      status: 'success',
      booking: data.booking || {
        bookingId: `BK-${Date.now().toString().slice(-6)}`,
        ...payload,
        date: new Date().toISOString(),
      },
      message: 'Booking successfully confirmed by server.',
    };
  } catch (_err) {
    // STRICT RULE: Booking MUST NEVER succeed via localStorage fallback when server is unreachable!
    return {
      success: false,
      status: 'failed',
      message: 'Server Error: Unable to complete booking. Server communication failed or backend is unreachable.',
    };
  }
};
