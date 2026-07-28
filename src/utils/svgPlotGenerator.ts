import plotsJsonData from '../data/plots.json';
import type { Plot } from '../types';
import type { EnhancedPlot, EnhancedPlotStatus, PlotCategory, PlotHistoryStage } from '../types/propertyMap';

export interface PlotJsonEntry {
  plotNo: string;
  block: 'Block A' | 'Block B' | 'Block C';
  points: [number, number][];
  dimensions: string;
  size: number;
  price: number;
  status: EnhancedPlotStatus;
  facing: string;
  category: PlotCategory;
  owner: string;
  bookingAmount: number;
  description: string;
}

export const loadPlotsFromJson = (): Record<string, PlotJsonEntry> => {
  return plotsJsonData as unknown as Record<string, PlotJsonEntry>;
};

export const enhancePlotData = (rawPlots: Plot[]): EnhancedPlot[] => {
  const plotsJson = loadPlotsFromJson();

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

  return rawPlots.map((p) => {
    const jsonEntry = plotsJson[p.plotNo];

    let x = p.x;
    let y = p.y;
    let w = p.w || 98;
    let h = p.h || 56;
    let pointsStr = `${x},${y} ${x + w},${y} ${x + w},${y + h} ${x},${y + h}`;

    if (jsonEntry && Array.isArray(jsonEntry.points)) {
      pointsStr = jsonEntry.points.map(([px, py]) => `${px},${py}`).join(' ');
      x = jsonEntry.points[0][0];
      y = jsonEntry.points[0][1];
      w = jsonEntry.points[1][0] - jsonEntry.points[0][0];
      h = jsonEntry.points[2][1] - jsonEntry.points[1][1];
    }

    let enhancedStatus: EnhancedPlotStatus = 'available';
    if (p.status === 'booked') enhancedStatus = 'booked';
    else if (p.status === 'sold') enhancedStatus = 'sold';
    else if (jsonEntry?.status) enhancedStatus = jsonEntry.status;

    const category = jsonEntry?.category || (p.plotNo.includes('A-') ? 'Residential' : 'Park Facing');

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
      plcRate: category === 'Corner' ? 10 : category === 'Park Facing' ? 7.5 : category === 'Commercial' ? 15 : 0,
      description: jsonEntry?.description || `Premium ${category} Plot in ${p.block} facing ${p.facing}. Direct access to ${p.roadWidth} Wide Road.`,
      amenities: defaultAmenities,
      history,
      documents: defaultDocs,
      assignedSalesperson: 'Vikramaditya Singh (Senior Lead)',
    };
  });
};
