from fastapi import APIRouter, Query, HTTPException
import os
import csv

router = APIRouter()

@router.get("/stations")
async def get_glider_stations():
    try:
        data_path = os.environ.get("CLEANED_DATA_PATH", "./cleaned-data")
        stations_file = os.path.join(data_path, "glider_stations.csv")
        if not os.path.exists(stations_file):
            raise HTTPException(status_code=404, detail="Glider stations file not found")
        stations = []
        with open(stations_file) as f:
            reader = csv.DictReader(f)
            for row in reader:
                stations.append({
                    "stationId": row["stationId"],
                    "lat": float(row["lat"]),
                    "lon": float(row["lon"]),
                    "timestamp": row.get("timestamp", ""),
                    "trackId": row.get("trackId", ""),
                    "status": row.get("status", "active")
                })
        return stations
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))