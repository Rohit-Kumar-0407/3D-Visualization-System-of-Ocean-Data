from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
import json
import os

router = APIRouter()

@router.get("/stations")
async def get_argo_stations(bbox: str = Query(...)):
    try:
        coords = [float(c) for c in bbox.split(",")]
        if len(coords) != 4:
            raise HTTPException(status_code=422, detail="bbox must be minLat,minLon,maxLat,maxLon")
        data_path = os.environ.get("CLEANED_DATA_PATH", "./cleaned-data")
        stations_file = os.path.join(data_path, "argo_stations.csv")
        if not os.path.exists(stations_file):
            raise HTTPException(status_code=404, detail="Argo stations file not found")
        import csv
        stations = []
        with open(stations_file) as f:
            reader = csv.DictReader(f)
            for row in reader:
                lat = float(row["lat"])
                lon = float(row["lon"])
                if (min(coords[0], coords[2]) <= lat <= max(coords[0], coords[2]) and
                    min(coords[1], coords[3]) <= lon <= max(coords[1], coords[3])):
                    stations.append({
                        "stationId": row["stationId"],
                        "lat": lat,
                        "lon": lon,
                        "timestamp": row.get("timestamp", ""),
                        "status": row.get("status", "active")
                    })
        return stations
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{stationId}/profile")
async def get_argo_profile(stationId: str):
    try:
        data_path = os.environ.get("CLEANED_DATA_PATH", "./cleaned-data")
        profile_file = os.path.join(data_path, f"argo_{stationId}_profile.csv")
        if not os.path.exists(profile_file):
            raise HTTPException(status_code=404, detail=f"Profile for {stationId} not found")
        import csv
        profile = []
        with open(profile_file) as f:
            reader = csv.DictReader(f)
            for row in reader:
                profile.append({
                    "stationId": row["stationId"],
                    "depth": float(row["depth"]),
                    "temperature": float(row.get("temperature", 0)),
                    "salinity": float(row.get("salinity", 0)),
                    "chlorophyll": float(row.get("chlorophyll", 0)),
                    "timestamp": row.get("timestamp", "")
                })
        return {"stationId": stationId, "profile": profile}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))