import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BookingFormModal } from '../components/Booking/BookingFormModal';
import { AuthProvider } from '../context/AuthContext';
import { AppProvider } from '../context/AppContext';
import type { EnhancedPlot } from '../types/propertyMap';

const mockPlot: EnhancedPlot = {
  id: 'A-101',
  plotNo: 'A-101',
  block: 'Block A',
  dimensions: "30' x 50'",
  width: 30,
  length: 50,
  totalArea: 1500,
  ratePerSqFt: 1200,
  totalPrice: 1800000,
  status: 'available',
  enhancedStatus: 'available',
  facing: 'East',
  roadWidth: '40 Ft Main Road',
  x: 100,
  y: 100,
  w: 50,
  h: 30,
  category: 'Commercial',
  amenities: [],
  history: [],
  documents: [],
  svgPathPoints: '100,100 150,100 150,130 100,130',
};

const mockUnavailablePlot: EnhancedPlot = {
  ...mockPlot,
  id: 'B-202',
  plotNo: 'B-202',
  status: 'booked',
  enhancedStatus: 'booked',
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <AppProvider>{children}</AppProvider>
  </AuthProvider>
);

describe('Booking Flow Module (BookingFormModal)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        status: 'success',
        booking: {
          bookingId: 'BK-TEST-123',
          plotId: 'A-101',
          customerName: 'Amit Patel',
          customerPhone: '9876543210',
          bookingAmount: 200000,
          utrNumber: 'UTR9988776655',
          paymentMode: 'NEFT',
          date: new Date().toISOString(),
        },
      }),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders booking modal with plot pricing and form inputs', () => {
    render(
      <Wrapper>
        <BookingFormModal
          plot={mockPlot}
          onClose={() => {}}
          onSuccess={() => {}}
        />
      </Wrapper>
    );

    const plotTitles = screen.getAllByText(/Plot A-101/i);
    expect(plotTitles.length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText('e.g. Rajesh Sharma')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. ABCDE1234F')).toBeInTheDocument();
  });

  it('validates required customer fields before submitting booking', async () => {
    render(
      <Wrapper>
        <BookingFormModal
          plot={mockPlot}
          onClose={() => {}}
          onSuccess={() => {}}
        />
      </Wrapper>
    );

    const submitBtn = screen.getByRole('button', { name: /Confirm Booking/i });
    fireEvent.click(submitBtn);

    const nameInput = screen.getByPlaceholderText('e.g. Rajesh Sharma') as HTMLInputElement;
    expect(nameInput.value).toBe('');
  });

  it('submits booking successfully when valid required inputs are entered and server confirms', async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    render(
      <Wrapper>
        <BookingFormModal
          plot={mockPlot}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      </Wrapper>
    );

    fireEvent.change(screen.getByPlaceholderText('e.g. Rajesh Sharma'), { target: { value: 'Amit Patel' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. 9876543210'), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. 1234 5678 9012'), { target: { value: '123456789012' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. ABCDE1234F'), { target: { value: 'ABCDE1234F' } });
    fireEvent.change(screen.getByPlaceholderText('Enter complete postal address...'), { target: { value: '123 Green Street, Lucknow' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. UTR887766554433'), { target: { value: 'UTR9988776655' } });

    const submitBtn = screen.getByRole('button', { name: /Confirm Booking/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalled();
    });
  });

  it('rejects booking with OCC conflict banner when plot is unavailable', async () => {
    const handleSuccess = vi.fn();

    render(
      <Wrapper>
        <BookingFormModal
          plot={mockUnavailablePlot}
          onClose={() => {}}
          onSuccess={handleSuccess}
        />
      </Wrapper>
    );

    fireEvent.change(screen.getByPlaceholderText('e.g. Rajesh Sharma'), { target: { value: 'Rajesh' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. 9876543210'), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. UTR887766554433'), { target: { value: 'UTR112233' } });

    const submitBtn = screen.getByRole('button', { name: /Confirm Booking/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Booking Conflict Detected/i)).toBeInTheDocument();
      expect(handleSuccess).not.toHaveBeenCalled();
    });
  });
});
