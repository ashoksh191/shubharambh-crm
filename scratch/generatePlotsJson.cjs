const fs = require('fs');
const path = require('path');

const PLOTS_PER_ROW = 12;
const CELL_WIDTH = 110;
const CELL_HEIGHT = 80;
const PLOT_WIDTH = 98;
const PLOT_HEIGHT = 56;

const blockAOffset = 180;
const blockBOffset = 2500;
const blockCOffset = 5200;

const plotsMap = {};

const facings = ['East', 'West', 'North', 'South'];

// 1. Block A (A-101 to A-316)
for (let i = 1; i <= 316; i++) {
  const plotNo = `A-${100 + i}`;
  const idx = i - 1;
  const col = idx % PLOTS_PER_ROW;
  const row = Math.floor(idx / PLOTS_PER_ROW);

  const x = 50 + col * CELL_WIDTH;
  const y = blockAOffset + row * CELL_HEIGHT;

  let dim = "25' x 50'";
  let size = 1250;
  let price = 1125000;
  if (i <= 40) { dim = "30' x 50'"; size = 1500; price = 1800000; }
  else if (i > 200) { dim = "20' x 50'"; size = 1000; price = 900000; }

  let status = 'available';
  if (i % 7 === 0) status = 'booked';
  else if (i % 13 === 0) status = 'sold';
  else if (i % 23 === 0) status = 'reserved';

  let category = 'Residential';
  if (i <= 12) category = 'Commercial';
  else if (col === 0 || col === PLOTS_PER_ROW - 1) category = 'Corner';
  else if (row === 0) category = 'Park Facing';

  plotsMap[plotNo] = {
    plotNo,
    block: 'Block A',
    points: [
      [x, y],
      [x + PLOT_WIDTH, y],
      [x + PLOT_WIDTH, y + PLOT_HEIGHT],
      [x, y + PLOT_HEIGHT]
    ],
    dimensions: dim,
    size,
    price,
    status,
    facing: facings[i % 4],
    category,
    owner: status === 'available' ? 'Shubharambh Green City' : status === 'reserved' ? 'Rahul Verma (Token Hold)' : 'Suresh Sharma',
    bookingAmount: 50000,
    description: `Official ${category} Plot ${plotNo} in Block A. Direct access to 40Ft Main Boulevard Road.`
  };
}

// 2. Block B (B-317 to B-680)
for (let i = 317; i <= 680; i++) {
  const plotNo = `B-${i}`;
  const idx = i - 317;
  const col = idx % PLOTS_PER_ROW;
  const row = Math.floor(idx / PLOTS_PER_ROW);

  const x = 50 + col * CELL_WIDTH;
  const y = blockBOffset + row * CELL_HEIGHT;

  let dim = "25' x 40'";
  let size = 1000;
  let price = 1000000;
  if (i > 500) { dim = "20' x 40'"; size = 800; price = 800000; }

  let status = 'available';
  if (i % 9 === 0) status = 'booked';
  else if (i % 17 === 0) status = 'sold';
  else if (i % 29 === 0) status = 'reserved';

  let category = 'Residential';
  if (col === 0 || col === PLOTS_PER_ROW - 1) category = 'Corner';
  else if (row === 0) category = 'Park Facing';

  plotsMap[plotNo] = {
    plotNo,
    block: 'Block B',
    points: [
      [x, y],
      [x + PLOT_WIDTH, y],
      [x + PLOT_WIDTH, y + PLOT_HEIGHT],
      [x, y + PLOT_HEIGHT]
    ],
    dimensions: dim,
    size,
    price,
    status,
    facing: facings[i % 4],
    category,
    owner: status === 'available' ? 'Shubharambh Green City' : 'Priya Mehta',
    bookingAmount: 50000,
    description: `Central Park Facing Plot ${plotNo} in Block B near Luxury Club House.`
  };
}

// 3. Block C (C-681 to C-980)
for (let i = 681; i <= 980; i++) {
  const plotNo = `C-${i}`;
  const idx = i - 681;
  const col = idx % PLOTS_PER_ROW;
  const row = Math.floor(idx / PLOTS_PER_ROW);

  const x = 50 + col * CELL_WIDTH;
  const y = blockCOffset + row * CELL_HEIGHT;

  let dim = "20' x 40'";
  let size = 800;
  let price = 720000;
  if (i > 900) { dim = "15' x 40'"; size = 600; price = 540000; }

  let status = 'available';
  if (i % 11 === 0) status = 'booked';
  else if (i % 19 === 0) status = 'sold';
  else if (i % 31 === 0) status = 'reserved';

  let category = 'Residential';
  if (col === 0 || col === PLOTS_PER_ROW - 1) category = 'Corner';
  else if (row === 0) category = 'Park Facing';

  plotsMap[plotNo] = {
    plotNo,
    block: 'Block C',
    points: [
      [x, y],
      [x + PLOT_WIDTH, y],
      [x + PLOT_WIDTH, y + PLOT_HEIGHT],
      [x, y + PLOT_HEIGHT]
    ],
    dimensions: dim,
    size,
    price,
    status,
    facing: facings[i % 4],
    category,
    owner: status === 'available' ? 'Shubharambh Green City' : 'Amit Patel',
    bookingAmount: 50000,
    description: `Garden Sector Residential Plot ${plotNo} in Block C.`
  };
}

const outputPath = path.join(__dirname, '../src/data/plots.json');
fs.writeFileSync(outputPath, JSON.stringify(plotsMap, null, 2));
console.log(`Successfully generated ${Object.keys(plotsMap).length} plots in ${outputPath}`);
