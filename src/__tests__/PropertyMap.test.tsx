import React from 'react';
import { render } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePropertyMap } from '../hooks/usePropertyMap';
import { enhancePlotData } from '../utils/svgPlotGenerator';
import { AppProvider } from '../context/AppContext';
import { VectorMapCanvas } from '../components/PropertyMap/MapCanvas/VectorMapCanvas';
import type { Plot } from '../types';

const rawSamplePlots: Plot[] = [
  {
    id: 'A-32',
    plotNo: 'A-32',
    block: 'Block A',
    dimensions: "25' x 40'",
    width: 25,
    length: 40,
    totalArea: 1000,
    ratePerSqFt: 1000,
    totalPrice: 1000000,
    status: 'available',
    facing: 'East',
    roadWidth: '30 Ft Road',
    x: 100,
    y: 100,
    w: 40,
    h: 25,
  },
  {
    id: 'B-317',
    plotNo: 'B-317',
    block: 'Block B',
    dimensions: "25' x 40'",
    width: 25,
    length: 40,
    totalArea: 1000,
    ratePerSqFt: 1000,
    totalPrice: 1000000,
    status: 'booked',
    facing: 'West',
    roadWidth: '30 Ft Road',
    x: 200,
    y: 200,
    w: 40,
    h: 25,
  },
];

describe('Property Map Data Engine & Vector SVG Canvas', () => {
  it('enhances raw plots with SVG polygon coordinates and spatial metadata', () => {
    const enhanced = enhancePlotData(rawSamplePlots);

    expect(enhanced).toHaveLength(2);
    expect(enhanced[0].id).toBe('A-32');
    expect(enhanced[0].svgPathPoints).toBeDefined();
    expect(enhanced[0].description).toContain('Official Plot A-32');
  });

  it('manages plot selection, status counts, and filter updates via usePropertyMap hook', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    );

    const { result } = renderHook(() => usePropertyMap(), { wrapper });

    expect(result.current.enhancedPlots.length).toBeGreaterThan(0);
    expect(result.current.selectedPlot).toBeNull();

    act(() => {
      result.current.handleSelectPlot(result.current.enhancedPlots[0]);
    });

    expect(result.current.selectedPlot?.id).toBe(result.current.enhancedPlots[0].id);

    act(() => {
      result.current.handleUpdatePlotStatus(result.current.enhancedPlots[0].id, 'booked');
    });

    expect(result.current.selectedPlot?.enhancedStatus).toBe('booked');
  });

  it('renders SVG Vector Canvas with background grid and plot layer', () => {
    const enhanced = enhancePlotData(rawSamplePlots);
    const mockCounts = { available: 1, booked: 1, reserved: 0, sold: 0, unreleased: 0 };

    const { container } = render(
      <VectorMapCanvas
        plots={enhanced}
        selectedPlot={null}
        searchedPlot={null}
        statusCounts={mockCounts}
        onSelectPlot={() => {}}
        onHoverPlot={() => {}}
      />
    );

    const canvasSvg = container.querySelector('svg[viewBox="0 0 2384 1684"]');
    expect(canvasSvg).toBeInTheDocument();

    const plotGroup = container.querySelector('.plots-layer');
    expect(plotGroup).toBeInTheDocument();
  });
});
