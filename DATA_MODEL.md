# GIS Engine v2 — Data Model & JSON Schemas

## 1. Modular Dataset Repositories

GIS Engine v2 decouples raw PDF extraction outputs into specialized, modular JSON repositories:

- `src/features/gis-engine/data/roads.json`
- `src/features/gis-engine/data/parks.json`
- `src/features/gis-engine/data/plots.json`
- `src/features/gis-engine/data/labels.json`
- `src/features/gis-engine/data/commercial.json`
- `src/features/gis-engine/data/utilities.json`
- `src/features/gis-engine/data/boundaries.json`

---

## 2. JSON Schema Definitions

### 2.1 Plot Schema (`plots.json`)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "GISPlotDataset",
  "type": "object",
  "patternProperties": {
    "^[A-Z]-[0-9]+$": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "plotNo": { "type": "string" },
        "block": { "type": "string", "enum": ["Block A", "Block B", "Block C", "Commercial"] },
        "status": { "type": "string", "enum": ["available", "reserved", "booked", "sold", "unreleased"] },
        "polygon": {
          "type": "array",
          "items": {
            "type": "array",
            "items": { "type": "number" },
            "minItems": 2,
            "maxItems": 2
          },
          "minItems": 3
        },
        "bbox": {
          "type": "array",
          "items": { "type": "number" },
          "minItems": 4,
          "maxItems": 4
        },
        "areaSqFt": { "type": "number" },
        "dimensions": { "type": "string" },
        "facing": { "type": "string", "enum": ["North", "East", "West", "South", "North-East", "North-West", "South-East", "South-West"] },
        "price": { "type": "number" },
        "nearbyRoad": { "type": "string" },
        "nearbyPark": { "type": "string" }
      },
      "required": ["id", "plotNo", "block", "status", "polygon", "bbox", "areaSqFt", "price"]
    }
  }
}
```

### 2.2 Civil Utilities Schema (`utilities.json`)
```json
{
  "title": "GISUtilityInfrastructure",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": { "type": "string" },
      "utilityType": { "type": "string", "enum": ["electricity", "water", "sewer", "street_light", "drainage"] },
      "geometryType": { "type": "string", "enum": ["LineString", "Point", "Polygon"] },
      "coordinates": { "type": "array" },
      "capacity": { "type": "string" },
      "status": { "type": "string", "enum": ["active", "planned", "under_construction"] }
    },
    "required": ["id", "utilityType", "geometryType", "coordinates"]
  }
}
```

### 2.3 Road Network Schema (`roads.json`)
```json
{
  "title": "GISRoadCorridors",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": { "type": "string" },
      "name": { "type": "string" },
      "widthFt": { "type": "number" },
      "surfaceType": { "type": "string" },
      "centerLine": { "type": "array" },
      "polygon": { "type": "array" }
    },
    "required": ["id", "name", "widthFt", "centerLine"]
  }
}
```
