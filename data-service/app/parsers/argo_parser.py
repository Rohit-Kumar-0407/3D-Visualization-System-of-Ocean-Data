import csv
import os
from typing import List, Dict

def parse_argo_file(file_path: str) -> List[Dict]:
    records = []
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Argo file not found: {file_path}")
    with open(file_path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            records.append({
                "stationId": row["stationId"],
                "lat": float(row["lat"]),
                "lon": float(row["lon"]),
                "timestamp": row["timestamp"],
                "depth": float(row.get("depth", 0)),
                "temperature": float(row.get("temperature", 0)),
                "salinity": float(row.get("salinity", 0)),
                "chlorophyll": float(row.get("chlorophyll", 0)),
            })
    return records

def parse_glider_file(file_path: str) -> List[Dict]:
    records = []
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Glider file not found: {file_path}")
    with open(file_path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            records.append({
                "stationId": row["stationId"],
                "lat": float(row["lat"]),
                "lon": float(row["lon"]),
                "timestamp": row["timestamp"],
                "depth": float(row.get("depth", 0)),
                "temperature": float(row.get("temperature", 0)),
                "salinity": float(row.get("salinity", 0)),
                "chlorophyll": float(row.get("chlorophyll", 0)),
            })
    return records