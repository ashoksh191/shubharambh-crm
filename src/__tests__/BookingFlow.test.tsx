import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <AppProvider>{children}</AppProvider>
  </AuthProvider>
);

describe('Booking Flow Module (BookingFormModal)', () => {
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
    expect(screen.getByPlaceholderText('e.g. Anand Mahindra')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ABCDE1234F')).toBeInTheDocument();
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

    const nameInput = screen.getByPlaceholderText('e.g. Anand Mahindra') as HTMLInputElement;
    expect(nameInput.value).toBe('');
  });

  it('submits booking successfully when valid required inputs are entered', async () => {
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

    fireEvent.change(screen.getByPlaceholderText('e.g. Anand Mahindra'), { target: { value: 'Amit Patel' } });
    fireEvent.change(screen.getByPlaceholderText('+91 98765 43210'), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByPlaceholderText('1234 5678 9012'), { target: { value: '123456789012' } });
    fireEvent.change(screen.getByPlaceholderText('ABCDE1234F'), { target: { value: 'ABCDE1234F' } });
    fireEvent.change(screen.getByPlaceholderText('House / Flat No, Street, City, State, Pincode'), { target: { value: '123 Green Street, Lucknow' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. UTR887766554433'), { target: { value: 'UTR9988776655' } });

    const submitBtn = screen.getByRole('button', { name: /Confirm Booking/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalled();
    });
  });
});
