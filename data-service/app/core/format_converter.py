import json

def convert_to_geojson(data):
    lat = data["lat"]
    lon = data["lon"]
    values = data["values"]
    features = []
    for i in range(len(lat)):
        for j in range(len(lon)):
            features.append({
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [lon[j], lat[i]]},
                "properties": {"value": values[i][j] if len(values) > i and len(values[i]) > j else None}
            })
    return {"type": "FeatureCollection", "features": features}

def normalize_array(data):
    return {"lat": data.get("lat", []), "lon": data.get("lon", []), "values": data.get("values", [])}