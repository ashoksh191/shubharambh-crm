const API_BASE_URL = 'http://localhost:5000/api';

export interface BookingPayload {
  plotId: string;
  customerName: string;
  customerPhone: string;
  bookingAmount: number;
  utrNumber: string;
  paymentMode: string;
}

/**
 * Fetches plot datasets from backend API with offline fallback.
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
 * Submits booking application to backend API.
 */
export const submitBookingApi = async (payload: BookingPayload) => {
  try {
    const res = await fetch(`${API_BASE_URL}/booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data;
  } catch (_err) {
    console.warn('Backend API offline, booking registered in local state...');
    return {
      success: true,
      booking: {
        bookingId: `BK-${Date.now().toString().slice(-6)}`,
        ...payload,
        date: new Date().toISOString(),
      },
    };
  }
};
