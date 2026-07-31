import plotsGeneratedData from '../data/plots.generated.json';
import type { Plot } from '../types';
import type { EnhancedPlot, EnhancedPlotStatus, PlotCategory, PlotFacing, PlotHistoryStage } from '../types/propertyMap';

/**
 * Interface representing a plot entry from `plots.generated.json`.
 */
export interface PlotGeneratedEntry {
  id: string;
  polygon: [number, number][];
  bbox: [number, number, number, number];
  center: [number, number];
  area: number;
  nearbyRoad: string;
  nearbyPark: string;
}

/**
 * Loads generated plot entries from `src/data/plots.generated.json`.
 * @returns Map of plot IDs to extracted PDF plot entries.
 */
export const loadPlotsFromGeneratedJson = (): Record<string, PlotGeneratedEntry> => {
  return plotsGeneratedData as unknown as Record<string, PlotGeneratedEntry>;
};

/**
 * Enhances base Plot objects with vector polygon coordinates, spatial road/park names,
 * default amenities, document links, and historical audit trail entries.
 *
 * @param rawPlots - Array of base Plot inventory items.
 * @returns Array of fully enriched EnhancedPlot objects ready for SVG rendering.
 */
export const enhancePlotData = (rawPlots: Plot[]): EnhancedPlot[] => {
  const generatedPlots = loadPlotsFromGeneratedJson();

  const defaultAmenities = [
    { name: 'Shri Ganesha Temple', category: 'Temple' as const, distance: '100 Meters', icon: '🛕' },
    { name: 'St. Xavier Public School', category: 'School' as const, distance: '1.2 Km', icon: '🏫' },
    { name: 'Sanjay Gandhi Care Hospital', category: 'Hospital' as const, distance: '2.5 Km', icon: '🏥' },
    { name: 'Township Commercial Supermarket', category: 'Market' as const, distance: 'On Site', icon: '🛍️' },
    { name: 'Lucknow - Amethi 4-Lane Highway', category: 'Highway' as const, distance: '500 Meters', icon: '🛣️' },
    { name: 'Green City Luxury Club & Gym', category: 'Club' as const, distance: 'Within Sector', icon: '🏊' },
    { name: 'Central Jogging Park & Fountain', category: 'Garden' as const, distance: 'Adjacent', icon: '🌳' },
  ];

  const defaultDocs = [
    {
      id: 'doc-brochure',
      title: 'Shubharambh Master Brochure 2026',
      type: 'Brochure PDF' as const,
      fileUrl: './assets/layout_plan_master.pdf',
      updatedAt: '2026-01-15',
    },
    {
      id: 'doc-blueprint',
      title: 'Official Architect Blueprint Plan',
      type: 'Layout PDF' as const,
      fileUrl: './assets/layout_plan_master.pdf',
      updatedAt: '2026-02-01',
    },
    {
      id: 'doc-gov',
      title: 'Gram Panchayat & RERA Approved Layout Certificate',
      type: 'Government Approval' as const,
      fileUrl: './assets/layout_plan_master.pdf',
      updatedAt: '2025-11-20',
    },
    {
      id: 'doc-noc',
      title: 'District Land Clearance NOC',
      type: 'NOC' as const,
      fileUrl: './assets/layout_plan_master.pdf',
      updatedAt: '2025-10-10',
    },
  ];

  const enhancedList: EnhancedPlot[] = rawPlots.map((p) => {
    const genEntry = generatedPlots[p.plotNo] || generatedPlots[p.id];

    let x = p.x || 0;
    let y = p.y || 0;
    let w = p.w || 40;
    let h = p.h || 24;
    let pointsStr = '';
    let nearbyRoad = p.roadWidth || '40 Ft Sector Road';
    let nearbyPark = 'Central Park';

    if (genEntry && Array.isArray(genEntry.polygon) && genEntry.polygon.length >= 3) {
      pointsStr = genEntry.polygon.map(([px, py]) => `${px},${py}`).join(' ');
      x = genEntry.bbox[0];
      y = genEntry.bbox[1];
      w = genEntry.bbox[2] - genEntry.bbox[0];
      h = genEntry.bbox[3] - genEntry.bbox[1];
      nearbyRoad = genEntry.nearbyRoad || nearbyRoad;
      nearbyPark = genEntry.nearbyPark || nearbyPark;
    } else if (Array.isArray((p as any).points) && (p as any).points.length >= 3) {
      const pts: [number, number][] = (p as any).points;
      pointsStr = pts.map(([px, py]) => `${px},${py}`).join(' ');
      const xs = pts.map(([px]) => px);
      const ys = pts.map(([, py]) => py);
      x = Math.min(...xs);
      y = Math.min(...ys);
      w = Math.max(...xs) - x;
      h = Math.max(...ys) - y;
    } else {
      pointsStr = `${x},${y} ${x + w},${y} ${x + w},${y + h} ${x},${y + h}`;
    }

    const rawStatus = p.status as string;
    let enhancedStatus: EnhancedPlotStatus = 'available';
    if (rawStatus === 'booked' || rawStatus === 'sold' || rawStatus === 'reserved' || rawStatus === 'unreleased') {
      enhancedStatus = rawStatus as EnhancedPlotStatus;
    }

    const category = (p.plotNo.includes('A-') ? 'Residential' : p.plotNo.includes('B-') ? 'Park Facing' : 'Commercial') as PlotCategory;
    const facing = (p.facing || 'East') as PlotFacing;

    const history = [
      {
        id: `h-1-${p.id}`,
        timestamp: '2026-01-10 10:00 AM',
        stage: 'Created' as PlotHistoryStage,
        description: 'Plot added to Shubharambh Master Inventory System.',
        performedBy: 'System Master Architect',
      },
    ];

    if (enhancedStatus === 'reserved') {
      history.push({
        id: `h-2-${p.id}`,
        timestamp: '2026-02-14 03:30 PM',
        stage: 'Reserved' as PlotHistoryStage,
        description: 'Token reservation amount submitted.',
        performedBy: 'Sales Executive (Rahul Gupta)',
      });
    } else if (enhancedStatus === 'booked') {
      history.push(
        {
          id: `h-2-${p.id}`,
          timestamp: '2026-02-01 11:00 AM',
          stage: 'Reserved' as PlotHistoryStage,
          description: 'Token booking initiated.',
          performedBy: 'Senior Associate',
        },
        {
          id: `h-3-${p.id}`,
          timestamp: '2026-02-02 02:15 PM',
          stage: 'Booked' as PlotHistoryStage,
          description: '10% Booking Advance Received with UTR.',
          performedBy: 'Finance Desk',
        }
      );
    } else if (enhancedStatus === 'sold') {
      history.push(
        {
          id: `h-2-${p.id}`,
          timestamp: '2026-01-15 09:30 AM',
          stage: 'Booked' as PlotHistoryStage,
          description: 'Booking Verified.',
          performedBy: 'Finance Manager',
        },
        {
          id: `h-3-${p.id}`,
          timestamp: '2026-02-10 04:00 PM',
          stage: 'Registry Completed' as PlotHistoryStage,
          description: 'Full payment verified & Daakhil-Kharij sub-registrar deed completed.',
          performedBy: 'Legal Registrar Head',
        }
      );
    }

    return {
      ...p,
      x,
      y,
      w,
      h,
      svgPathPoints: pointsStr,
      enhancedStatus,
      category,
      facing,
      plcRate: category === 'Corner' ? 10 : category === 'Park Facing' ? 7.5 : category === 'Commercial' ? 15 : 0,
      description: `Official Plot ${p.plotNo} near ${nearbyRoad} and ${nearbyPark}.`,
      amenities: defaultAmenities,
      history,
      documents: defaultDocs,
      assignedSalesperson: 'Vikramaditya Singh (Senior Lead)',
    };
  });

  return enhancedList;
};
