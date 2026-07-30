#!/usr/bin/env python3
"""
PDF Extraction Engine for Shubharambh CRM
=========================================

This script extracts structured plot data directly from the township master layout PDF:
  `public/assets/layout_plan_master.pdf`

Extracted Entities:
  - Plot labels & unique plot IDs
  - Vector plot boundary polygons & bounding boxes (bbox)
  - Calculated plot area and plot center points
  - Spatial mapping to nearby road names and park/green zone names

Outputs:
  - `src/data/plots.generated.json`

Usage:
  python scratch/extract_pdf_property_map.py
"""

import os
import re
import sys
import math
import json

try:
    import fitz  # PyMuPDF
except ImportError:
    print("Error: PyMuPDF (fitz) is required. Install via: pip install PyMuPDF")
    sys.exit(1)


def extract_township_data(pdf_path, output_json_path):
    """
    Extracts plot labels, polygons, bboxes, nearby roads, and nearby parks from PDF.
    Saves structured JSON to `output_json_path`.
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found at path: {pdf_path}")

    doc = fitz.open(pdf_path)
    page = doc[0]

    # 1. Extract text spans and classify labels
    text_page = page.get_text("dict")
    plot_labels = []
    road_spans = []
    park_spans = []

    for b in text_page.get("blocks", []):
        if "lines" in b:
            for l in b["lines"]:
                for s in l["spans"]:
                    txt = s["text"].strip()
                    if not txt:
                        continue

                    bbox = [round(c, 2) for c in s["bbox"]]
                    cx = round((bbox[0] + bbox[2]) / 2, 2)
                    cy = round((bbox[1] + bbox[3]) / 2, 2)
                    item_data = {"name": txt, "bbox": bbox, "center": [cx, cy]}

                    # Classify into plot numbers, road names, or park names
                    if re.match(r'^[A-C]\s*[-_]?\s*\d+[A-Z]?$', txt, re.IGNORECASE) or re.match(r'^\d{1,4}$', txt):
                        plot_labels.append({"id": txt, "bbox": bbox, "center": [cx, cy]})
                    elif any(w in txt.upper() for w in ['ROAD', 'WIDE', 'EXPRESSWAY', 'GATE', 'PURWNACHAL']):
                        road_spans.append(item_data)
                    elif any(w in txt.upper() for w in ['PARK', 'GARDEN', 'GREEN', 'MANDIR', 'COMMERCIAL']):
                        park_spans.append(item_data)

    # 2. Extract vector drawing paths and build spatial grid index
    drawings = page.get_drawings()
    total_polygons = len(drawings)
    
    GRID_SIZE = 50
    grid = {}
    total_lines = 0

    for d in drawings:
        for item in d.get("items", []):
            if item[0] == 'l':
                total_lines += 1
                p1, p2 = item[1], item[2]
                x1, y1, x2, y2 = p1.x, p1.y, p2.x, p2.y
                min_gx = int(min(x1, x2) // GRID_SIZE)
                max_gx = int(max(x1, x2) // GRID_SIZE)
                min_gy = int(min(y1, y2) // GRID_SIZE)
                max_gy = int(max(y1, y2) // GRID_SIZE)
                line_obj = ((x1, y1), (x2, y2))
                for gx in range(min_gx, max_gx + 1):
                    for gy in range(min_gy, max_gy + 1):
                        grid.setdefault((gx, gy), []).append(line_obj)

    def get_nearby_lines(cx, cy, radius=50):
        gx = int(cx // GRID_SIZE)
        gy = int(cy // GRID_SIZE)
        candidate_lines = []
        r_cells = int(math.ceil(radius / GRID_SIZE))
        for dx in range(-r_cells, r_cells + 1):
            for dy in range(-r_cells, r_cells + 1):
                cell_lines = grid.get((gx + dx, gy + dy), [])
                for p1, p2 in cell_lines:
                    if abs(p1[0] - cx) <= radius and abs(p1[1] - cy) <= radius:
                        candidate_lines.append((p1, p2))
        return candidate_lines

    # 3. Process plot geometry & spatial associations
    matched_plots = 0
    unmatched_plots = 0
    plots_result = {}

    for plot in plot_labels:
        pid = plot["id"]
        cx, cy = plot["center"]

        lines = get_nearby_lines(cx, cy, radius=50)
        matched_boundary = False

        if lines:
            xs = [p[0] for line in lines for p in line]
            ys = [p[1] for line in lines for p in line]

            lefts = [x for x in xs if x <= cx - 1 and abs(x - cx) <= 45]
            rights = [x for x in xs if x >= cx + 1 and abs(x - cx) <= 45]
            tops = [y for y in ys if y <= cy - 1 and abs(y - cy) <= 30]
            bots = [y for y in ys if y >= cy + 1 and abs(y - cy) <= 30]

            if lefts and rights and tops and bots:
                px1 = max(lefts)
                px2 = min(rights)
                py1 = max(tops)
                py2 = min(bots)

                if 5 <= (px2 - px1) <= 70 and 5 <= (py2 - py1) <= 50:
                    matched_boundary = True

        if matched_boundary:
            matched_plots += 1
        else:
            px1, px2 = cx - 20, cx + 20
            py1, py2 = cy - 12, cy + 12
            unmatched_plots += 1

        px1, py1, px2, py2 = round(px1, 2), round(py1, 2), round(px2, 2), round(py2, 2)
        polygon = [
            [px1, py1],
            [px2, py1],
            [px2, py2],
            [px1, py2]
        ]
        bbox = [px1, py1, px2, py2]
        area = round((px2 - px1) * (py2 - py1), 2)

        # Nearest Road matching
        closest_road = "Internal Sector Road"
        min_road_dist = float('inf')
        for r in road_spans:
            rcx, rcy = r["center"]
            dist = math.hypot(rcx - cx, rcy - cy)
            if dist < min_road_dist:
                min_road_dist = dist
                closest_road = r["name"]

        # Nearest Park matching
        closest_park = "Green Zone Park"
        min_park_dist = float('inf')
        for p in park_spans:
            pcx, pcy = p["center"]
            dist = math.hypot(pcx - cx, pcy - cy)
            if dist < min_park_dist:
                min_park_dist = dist
                closest_park = p["name"]

        plots_result[pid] = {
            "id": pid,
            "polygon": polygon,
            "bbox": bbox,
            "center": [cx, cy],
            "area": area,
            "nearbyRoad": closest_road,
            "nearbyPark": closest_park
        }

    # 4. Save output file
    os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(plots_result, f, indent=2)

    # 5. Output logging required by specification
    print(f"Extraction Pipeline Summary:")
    print(f"-----------------------------")
    print(f"Total labels found: {len(plot_labels)}")
    print(f"Total polygons found: {total_polygons}")
    print(f"Matched plots: {matched_plots}")
    print(f"Unmatched plots: {unmatched_plots}")
    print(f"Output generated successfully: {output_json_path}")


if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    pdf_file = os.path.join(base_dir, "public", "assets", "layout_plan_master.pdf")
    output_file = os.path.join(base_dir, "src", "data", "plots.generated.json")
    
    extract_township_data(pdf_file, output_file)
