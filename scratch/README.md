# PDF Plot Extraction Pipeline

This directory contains the standalone extraction pipeline script that reads the master layout PDF and generates structured plot data.

## Input File
- `public/assets/layout_plan_master.pdf`

## Output File
- `src/data/plots.generated.json`

## Requirements
- Python 3.8+
- PyMuPDF (`pip install PyMuPDF`)

## How to Regenerate `plots.generated.json`

Run the extraction script from the repository root:

```bash
python scratch/extract_pdf_property_map.py
```

### Extracted Plot Fields
Each plot entry in `src/data/plots.generated.json` contains:
- `id`: Plot number/identifier (e.g., `"A-101"`, `"B-317"`, `"C-681"`)
- `polygon`: 4-point bounding coordinate array `[[x1, y1], [x2, y1], [x2, y2], [x1, y2]]`
- `bbox`: Bounding box `[xmin, ymin, xmax, ymax]`
- `center`: Plot center coordinate `[cx, cy]`
- `area`: Calculated plot bounding area
- `nearbyRoad`: Nearest road label (e.g., `"50'-0\" WIDE ROAD"`)
- `nearbyPark`: Nearest park or green zone label (e.g., `"PARK"`)
