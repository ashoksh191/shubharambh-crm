const fs = require('fs');
const path = require('path');

// Exact 3508 x 2480 Landscape PDF Blueprint Coordinate System
const MAP_WIDTH = 3508;
const MAP_HEIGHT = 2480;

const PLOT_W = 54;
const PLOT_H = 32;

const plotsMap = {};
const facings = ['East', 'West', 'North', 'South'];

// 1. Block A (Plots A-1 to A-316) - Mapped on Top Left / Center Sector
const aStartX = 850;
const aStartY = 450;
const aCols = 16;
const aCellW = 68;
const aCellH = 44;

for (let i = 1; i <= 316; i++) {
  const plotNo = `A-${100 + i}`;
  const idx = i - 1;
  const col = idx % aCols;
  const row = Math.floor(idx / aCols);

  const x = aStartX + col * aCellW;
  const y = aStartY + row * aCellH;

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
  if (i <= 16) category = 'Commercial';
  else if (col === 0 || col === aCols - 1) category = 'Corner';
  else if (row === 0) category = 'Park Facing';

  plotsMap[plotNo] = {
    plotNo,
    block: 'Block A',
    points: [
      [x, y],
      [x + PLOT_W, y],
      [x + PLOT_W, y + PLOT_H],
      [x, y + PLOT_H]
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

// 2. Block B (Plots B-317 to B-680) - Mapped on Top Right Sector
const bStartX = 1980;
const bStartY = 280;
const bCols = 18;
const bCellW = 66;
const bCellH = 42;

for (let i = 317; i <= 680; i++) {
  const plotNo = `B-${i}`;
  const idx = i - 317;
  const col = idx % bCols;
  const row = Math.floor(idx / bCols);

  const x = bStartX + col * bCellW;
  const y = bStartY + row * bCellH;

  let dim = "25' x 40'";
  let size = 1000;
  let price = 1000000;
  if (i > 500) { dim = "20' x 40'"; size = 800; price = 800000; }

  let status = 'available';
  if (i % 9 === 0) status = 'booked';
  else if (i % 17 === 0) status = 'sold';
  else if (i % 29 === 0) status = 'reserved';

  let category = 'Residential';
  if (col === 0 || col === bCols - 1) category = 'Corner';
  else if (row === 0) category = 'Park Facing';

  plotsMap[plotNo] = {
    plotNo,
    block: 'Block B',
    points: [
      [x, y],
      [x + PLOT_W, y],
      [x + PLOT_W, y + PLOT_H],
      [x, y + PLOT_H]
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

// 3. Block C (Plots C-681 to C-980) - Mapped on Far Right / Center Sector
const cStartx = 2250;
const cStartY = 1150;
const cCols = 16;
const cCellW = 66;
const cCellH = 42;

for (let i = 681; i <= 980; i++) {
  const plotNo = `C-${i}`;
  const idx = i - 681;
  const col = idx % cCols;
  const row = Math.floor(idx / cCols);

  const x = cStartx + col * cCellW;
  const y = cStartY + row * cCellH;

  let dim = "20' x 40'";
  let size = 800;
  let price = 720000;
  if (i > 900) { dim = "15' x 40'"; size = 600; price = 540000; }

  let status = 'available';
  if (i % 11 === 0) status = 'booked';
  else if (i % 19 === 0) status = 'sold';
  else if (i % 31 === 0) status = 'reserved';

  let category = 'Residential';
  if (col === 0 || col === cCols - 1) category = 'Corner';
  else if (row === 0) category = 'Park Facing';

  plotsMap[plotNo] = {
    plotNo,
    block: 'Block C',
    points: [
      [x, y],
      [x + PLOT_W, y],
      [x + PLOT_W, y + PLOT_H],
      [x, y + PLOT_H]
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
console.log(`Successfully generated ${Object.keys(plotsMap).length} landscape plots in ${outputPath}`);
