import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Load plots JSON data store
const plotsFilePath = path.join(__dirname, '../src/data/plots.json');

let plotsData = {};
try {
  if (fs.existsSync(plotsFilePath)) {
    plotsData = JSON.parse(fs.readFileSync(plotsFilePath, 'utf8'));
  }
} catch (e) {
  console.error('Error loading plots.json:', e);
}

// 1. GET /api/plots — Fetch all plots with optional status/block filters
app.get('/api/plots', (req, res) => {
  const { status, block, category, search } = req.query;

  let plots = Object.values(plotsData);

  if (block && block !== 'All') {
    plots = plots.filter((p) => p.block === block);
  }

  if (status && status !== 'All') {
    plots = plots.filter((p) => p.status === status);
  }

  if (category && category !== 'All') {
    plots = plots.filter((p) => p.category === category);
  }

  if (search) {
    const q = search.toString().toLowerCase();
    plots = plots.filter((p) => p.plotNo.toLowerCase().includes(q));
  }

  res.json({
    success: true,
    total: plots.length,
    data: plots,
  });
});

// 2. GET /api/plot/:id — Fetch single plot detail by plot number or ID
app.get('/api/plot/:id', (req, res) => {
  const plotId = req.params.id;
  const plot = plotsData[plotId] || Object.values(plotsData).find((p) => p.plotNo === plotId);

  if (!plot) {
    return res.status(404).json({ success: false, message: 'Plot not found' });
  }

  const enrichedPlot = {
    ...plot,
    gallery: plot.gallery || [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
    ],
    latitude: 26.8467,
    longitude: 80.9462,
    updatedAt: new Date().toISOString(),
  };

  res.json({ success: true, data: enrichedPlot });
});

// 3. PUT /api/plot/:id — Admin plot update API (price, status, details, gallery)
app.put('/api/plot/:id', (req, res) => {
  const plotId = req.params.id;
  const targetKey = plotsData[plotId] ? plotId : Object.keys(plotsData).find((k) => plotsData[k].plotNo === plotId);

  if (!targetKey) {
    return res.status(404).json({ success: false, message: 'Plot not found' });
  }

  const { price, status, description, category, facing, gallery } = req.body;

  plotsData[targetKey] = {
    ...plotsData[targetKey],
    ...(price !== undefined && { price: Number(price) }),
    ...(status && { status }),
    ...(description && { description }),
    ...(category && { category }),
    ...(facing && { facing }),
    ...(gallery && { gallery }),
    updatedAt: new Date().toISOString(),
  };

  // Persist update back to plots.json
  try {
    fs.writeFileSync(plotsFilePath, JSON.stringify(plotsData, null, 2));
  } catch (e) {
    console.error('Failed to write plots.json update:', e);
  }

  res.json({
    success: true,
    message: `Plot ${plotId} updated successfully`,
    data: plotsData[targetKey],
  });
});

// 4. POST /api/booking — Execute customer booking workflow & update status to 'booked'
app.post('/api/booking', (req, res) => {
  const { plotId, customerName, customerPhone, bookingAmount, utrNumber, paymentMode } = req.body;

  const targetKey = plotsData[plotId] ? plotId : Object.keys(plotsData).find((k) => plotsData[k].plotNo === plotId);

  if (!targetKey) {
    return res.status(404).json({ success: false, message: 'Plot not found for booking' });
  }

  const bookingId = `BK-${Date.now().toString().slice(-6)}`;

  plotsData[targetKey] = {
    ...plotsData[targetKey],
    status: 'booked',
    owner: customerName || 'Booked Customer',
    bookingId,
    updatedAt: new Date().toISOString(),
  };

  try {
    fs.writeFileSync(plotsFilePath, JSON.stringify(plotsData, null, 2));
  } catch (e) {
    console.error('Failed to persist booking:', e);
  }

  res.status(201).json({
    success: true,
    message: `Plot ${targetKey} booked successfully!`,
    booking: {
      bookingId,
      plotId: targetKey,
      customerName,
      customerPhone,
      bookingAmount: bookingAmount || 50000,
      utrNumber,
      paymentMode,
      date: new Date().toISOString(),
    },
    plot: plotsData[targetKey],
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', totalPlots: Object.keys(plotsData).length, timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Shubharambh Green City CRM Backend API running on port ${PORT}`);
});
