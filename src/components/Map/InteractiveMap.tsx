import React from 'react';
import type { Plot } from '../../types';
import { PropertyMapContainer } from '../PropertyMap/PropertyMapContainer';

interface InteractiveMapProps {
  onOpenBooking: (plot: Plot) => void;
  onOpenReceipt: (bookingId: string) => void;
  onOpenBond: (bookingId: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  onOpenBooking,
  onOpenReceipt,
  onOpenBond,
}) => {
  return (
    <PropertyMapContainer
      onOpenBooking={onOpenBooking}
      onOpenReceipt={onOpenReceipt}
      onOpenBond={onOpenBond}
    />
  );
};
