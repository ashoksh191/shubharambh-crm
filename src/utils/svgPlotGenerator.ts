import type { Plot } from '../types';
import type { EnhancedPlot, EnhancedPlotStatus, PlotCategory, PlotHistoryStage } from '../types/propertyMap';

export const enhancePlotData = (rawPlots: Plot[]): EnhancedPlot[] => {
  const PLOTS_PER_ROW = 12;
  const CELL_WIDTH = 110;
  const CELL_HEIGHT = 80;
  const PLOT_WIDTH = 98;
  const PLOT_HEIGHT = 56;

  const blockAOffset = 180;
  const blockBOffset = 2500;
  const blockCOffset = 5200;

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

  return rawPlots.map((p, idx) => {
    let blockOffset = blockAOffset;
    let localIdx = idx;

    if (p.block === 'Block B') {
      blockOffset = blockBOffset;
      localIdx = idx - 316;
    } else if (p.block === 'Block C') {
      blockOffset = blockCOffset;
      localIdx = idx - 680;
    }

    const col = Math.max(0, localIdx % PLOTS_PER_ROW);
    const row = Math.floor(Math.max(0, localIdx) / PLOTS_PER_ROW);

    const x = 50 + col * CELL_WIDTH;
    const y = blockOffset + row * CELL_HEIGHT;

    const points = `${x},${y} ${x + PLOT_WIDTH},${y} ${x + PLOT_WIDTH},${y + PLOT_HEIGHT} ${x},${y + PLOT_HEIGHT}`;

    let enhancedStatus: EnhancedPlotStatus = 'available';
    if (p.status === 'booked') enhancedStatus = 'booked';
    else if (p.status === 'sold') enhancedStatus = 'sold';
    else if (idx % 23 === 0) enhancedStatus = 'reserved';
    else if (idx % 41 === 0) enhancedStatus = 'unreleased';

    let category: PlotCategory = 'Residential';
    if (idx < 20 || p.plotNo.includes('Comm')) category = 'Commercial';
    else if (col === 0 || col === PLOTS_PER_ROW - 1) category = 'Corner';
    else if (row === 0 || p.facing === 'Corner') category = 'Park Facing';
    else if (row === 1) category = 'Road Facing';

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
      w: PLOT_WIDTH,
      h: PLOT_HEIGHT,
      svgPathPoints: points,
      enhancedStatus,
      category,
      plcRate: category === 'Corner' ? 10 : category === 'Park Facing' ? 7.5 : category === 'Commercial' ? 15 : 0,
      description: `Premium ${category} Plot in ${p.block} facing ${p.facing}. Direct access to ${p.roadWidth} Wide Road.`,
      amenities: defaultAmenities,
      history,
      documents: defaultDocs,
      assignedSalesperson: 'Vikramaditya Singh (Senior Lead)',
    };
  });
};
