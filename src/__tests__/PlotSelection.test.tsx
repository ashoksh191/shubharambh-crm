import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PlotPolygon } from '../components/PropertyMap/PlotPolygon/PlotPolygon';
import { PlotDrawer } from '../components/PropertyMap/PlotDrawer/PlotDrawer';
import { AuthProvider } from '../context/AuthContext';
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

describe('Plot Selection & PlotPolygon Interaction', () => {
  it('renders SVG polygon element with exact points and visiblePainted pointer events', () => {
    const { container } = render(
      <svg>
        <PlotPolygon
          plot={mockPlot}
          isSelected={false}
          isSearched={false}
          onSelect={() => {}}
          onHover={() => {}}
        />
      </svg>
    );

    const polygon = container.querySelector('polygon');
    expect(polygon).toBeInTheDocument();
    expect(polygon?.getAttribute('points')).toBe('100,100 150,100 150,130 100,130');
    expect(polygon?.style.pointerEvents).toMatch(/visiblepainted/i);
  });

  it('triggers onSelect when plot polygon is clicked', () => {
    const handleSelect = vi.fn();
    const { container } = render(
      <svg>
        <PlotPolygon
          plot={mockPlot}
          isSelected={false}
          isSearched={false}
          onSelect={handleSelect}
          onHover={() => {}}
        />
      </svg>
    );

    const polygon = container.querySelector('polygon')!;
    fireEvent.click(polygon);

    expect(handleSelect).toHaveBeenCalledWith(mockPlot);
  });

  it('triggers onHover when mouse enters and leaves plot polygon', () => {
    const handleHover = vi.fn();
    const { container } = render(
      <svg>
        <PlotPolygon
          plot={mockPlot}
          isSelected={false}
          isSearched={false}
          onSelect={() => {}}
          onHover={handleHover}
        />
      </svg>
    );

    const polygon = container.querySelector('polygon')!;
    fireEvent.mouseEnter(polygon);
    expect(handleHover).toHaveBeenCalledWith(mockPlot, expect.anything());

    fireEvent.mouseLeave(polygon);
    expect(handleHover).toHaveBeenCalledWith(null);
  });

  it('displays selected plot metadata inside PlotDrawer', () => {
    render(
      <AuthProvider>
        <PlotDrawer
          plot={mockPlot}
          onClose={() => {}}
          onBookPlot={() => {}}
          onUpdateStatus={() => {}}
          onUpdatePrice={() => {}}
          onOpenAdminEditor={() => {}}
        />
      </AuthProvider>
    );

    expect(screen.getAllByText(/Plot A-101/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Block A/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/30' x 50'/i)).toBeInTheDocument();
  });
});
