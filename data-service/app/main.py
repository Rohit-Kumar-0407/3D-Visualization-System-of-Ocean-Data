from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
import xarray as xr
import json
import os

app = FastAPI(title="Ocean Data Service")

class SliceQuery(BaseModel):
    variable: str
    depth: float
    time: str

class TimestepQuery(BaseModel):
    variable: str

@app.get("/api/model-data")
async def get_model_data(
    variable: str = Query(...),
    depth: float = Query(...),
    time: str = Query(...)
):
    try:
        ds = xr.open_dataset(
            os.environ.get("NETCDF_DATA_PATH", "./cleaned-data"),
            engine="netcdf4",
            chunks={}
        )
        var_data = ds[variable].sel(
            depth=depth, time=time, method="nearest"
        )
        result = {
            "variable": variable,
            "depth": depth,
            "time": time,
            "lat": var_data.lat.values.tolist(),
            "lon": var_data.lon.values.tolist(),
            "values": var_data.values.tolist()
        }
        ds.close()
        return result
    except KeyError:
        raise HTTPException(status_code=404, detail="Variable not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/model-data/timesteps")
async def get_timesteps(variable: str = Query(...)):
    try:
        ds = xr.open_dataset(
            os.environ.get("NETCDF_DATA_PATH", "./cleaned-data"),
            engine="netcdf4",
            chunks={}
        )
        times = ds[variable].time.values.tolist()
        ds.close()
        return {"variable": variable, "timesteps": times}
    except KeyError:
        raise HTTPException(status_code=404, detail="Variable not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from app.routers import argo, glider
app.include_router(argo.router, prefix="/api/argo", tags=["argo"])
app.include_router(glider.router, prefix="/api/glider", tags=["glider"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)