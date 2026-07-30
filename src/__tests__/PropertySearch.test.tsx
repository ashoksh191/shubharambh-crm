import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MapSearch } from '../components/PropertyMap/Search/MapSearch';
import type { EnhancedPlot } from '../types/propertyMap';

const mockPlots: EnhancedPlot[] = [
  {
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
    roadWidth: '40 Ft Road',
    x: 100,
    y: 100,
    w: 50,
    h: 30,
    category: 'Commercial',
    amenities: [],
    history: [],
    documents: [],
    svgPathPoints: '100,100 150,100 150,130 100,130',
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
    status: 'available',
    enhancedStatus: 'available',
    facing: 'West',
    roadWidth: '30 Ft Road',
    x: 200,
    y: 200,
    w: 40,
    h: 25,
    category: 'Park Facing',
    amenities: [],
    history: [],
    documents: [],
    svgPathPoints: '200,200 240,200 240,225 200,225',
  },
];

describe('Property Search Module (MapSearch)', () => {
  it('renders search input field with placeholder', () => {
    render(
      <MapSearch
        plots={mockPlots}
        searchQuery=""
        onSearchChange={() => {}}
        onSelectPlot={() => {}}
      />
    );

    const input = screen.getByPlaceholderText(/Search A-101/i);
    expect(input).toBeInTheDocument();
  });

  it('triggers onSearchChange when user types query', () => {
    const handleSearchChange = vi.fn();
    render(
      <MapSearch
        plots={mockPlots}
        searchQuery=""
        onSearchChange={handleSearchChange}
        onSelectPlot={() => {}}
      />
    );

    const input = screen.getByPlaceholderText(/Search A-101/i);
    fireEvent.change(input, { target: { value: 'A-101' } });

    expect(handleSearchChange).toHaveBeenCalledWith('A-101');
  });

  it('displays matching dropdown suggestions when focus and query are active', () => {
    const handleSelectPlot = vi.fn();
    render(
      <MapSearch
        plots={mockPlots}
        searchQuery="A-1"
        onSearchChange={() => {}}
        onSelectPlot={handleSelectPlot}
      />
    );

    const input = screen.getByPlaceholderText(/Search A-101/i);
    fireEvent.focus(input);

    const suggestionItem = screen.getByText(/Plot A-101/i);
    expect(suggestionItem).toBeInTheDocument();

    fireEvent.click(suggestionItem);
    expect(handleSelectPlot).toHaveBeenCalledWith(mockPlots[0]);
  });
});
