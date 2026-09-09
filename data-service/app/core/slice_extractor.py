from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class SliceResult:
    variable: str
    depth: float
    time: str
    lat: List[float] = field(default_factory=list)
    lon: List[float] = field(default_factory=list)
    values: List[List[float]] = field(default_factory=list)

    def to_dict(self):
        return {
            "variable": self.variable,
            "depth": self.depth,
            "time": self.time,
            "lat": self.lat,
            "lon": self.lon,
            "values": self.values,
        }