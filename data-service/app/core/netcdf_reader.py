import xarray as xr
import json
import os

def load_netcdf(file_path):
    return xr.open_dataset(file_path, engine="netcdf4", chunks={})

def get_variable_names(ds):
    return list(ds.data_vars)

def get_timesteps(ds, variable):
    return ds[variable].time.values.tolist() if variable in ds else []

def extract_slice(ds, variable, depth, time):
    if variable not in ds:
        raise ValueError(f"Variable {variable} not found in dataset")
    var_data = ds[variable].sel(depth=depth, time=time, method="nearest")
    return {
        "variable": variable,
        "depth": depth,
        "time": str(time),
        "lat": var_data.lat.values.tolist(),
        "lon": var_data.lon.values.tolist(),
        "values": var_data.values.tolist()
    }