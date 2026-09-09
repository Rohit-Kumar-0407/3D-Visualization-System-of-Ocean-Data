import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    netcdf_data_path = os.environ.get("NETCDF_DATA_PATH", "./cleaned-data")
    cleaned_data_path = os.environ.get("CLEANED_DATA_PATH", "./cleaned-data")
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 8000))