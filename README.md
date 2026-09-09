# Ocean Data Visualization Platform — Backend

> **Smart India Hackathon 2024 · Problem Statement 26067 — INCOIS**
> A web-based 3D ocean data visualization platform serving interactive ocean model outputs (temperature, salinity, current vectors, chlorophyll) overlaid with real-time Argo float and Glider sensor data.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Docker Compose](#docker-compose)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Data Format](#data-format)
- [MongoDB Schemas](#mongodb-schemas)
- [Technology Stack](#technology-stack)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This is the **backend-only** portion of the Ocean Data Visualization Platform. The backend consists of a hybrid architecture combining a Node.js/Express API Gateway with a Python/FastAPI data service, backed by MongoDB for metadata storage and Redis for caching. The frontend (React + Three.js/Cesium.js) is assumed to be a separate project that consumes this backend's REST API.

**Key responsibilities:**
- Serve NetCDF-based ocean model data slices (variable, depth, time)
- Provide Argo float and Glider station/profile data
- Cache frequently accessed model data in Redis
- Store metadata (stations, observations, model runs, user views) in MongoDB
- Forward extraction requests from the gateway to the Python data service

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Separate)                   │
│                   React + Three.js / Cesium.js               │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API Calls
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              API Gateway (Node.js + Express)                 │
│                        Port: 4000                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐ │
│  │  Routes   │ │ Middleware│ │ Controllers│ │  Services     │ │
│  │ modelData │ │  auth/    │ │ modelData  │ │ pythonService │ │
│  │ argo      │ │ rateLimit │ │ argo       │ │ cache.service │ │
│  │ glider    │ │ validate  │ │ glider     │ │ mongo.service │ │
│  │ views     │ │ errorHan. │ │ views      │ │               │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────┘ │
│                        │                                     │
│              ┌─────────┴─────────┐                          │
│              │  MongoDB (Meta)   │    ┌──────────────────┐  │
│              └───────────────────┘    │  Redis Cache      │  │
│                                       │  key:model:var:…  │  │
│                                       └──────────────────┘  │
│              ┌─────────────────────┐                          │
│              │  Python Data Service│                          │
│              │  FastAPI :8000      │                          │
│              │  xarray/netCDF4     │                          │
│              │  Argo/Glider Parsers│                          │
│              └─────────────────────┘                          │
│              ▲              ▲                                 │
│              │              │                                 │
│         ./cleaned-data/   ./cleaned-data/                    │
│      (NetCDF files)      (Argo/Glider CSVs)                 │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Technology | Port | Responsibility |
|-----------|-----------|------|----------------|
| **API Gateway** | Node.js + Express | 4000 | Routing, request validation, Redis caching, MongoDB access, proxying to Python service |
| **Data Service** | Python + FastAPI | 8000 | NetCDF slicing, Argo/Glider parsing, serving cleaned data |
| **MongoDB** | MongoDB 7 | 27017 | Metadata storage (stations, observations, model runs, user views) |
| **Redis** | Redis 7 Alpine | 6379 | Caching model data slices keyed as `model:{variable}:{depth}:{time}` |

---

## Project Structure

```
ocean-data-platform/
├── docker-compose.yml              # Docker orchestration
├── index.html                      # Placeholder frontend entry
├── package-lock.json               # Root npm lockfile
│
├── backend-gateway/                # Task 1 — Express API Gateway
│   ├── .env                        # Environment variables (local)
│   ├── .env.example                # Environment template
│   ├── Dockerfile                  # Node 18 Alpine container
│   ├── package.json                # Dependencies & scripts
│   ├── package-lock.json           # Node lockfile
│   ├── node_modules/               # Installed dependencies
│   └── src/
│       ├── app.js                  # Express app entry point
│       ├── config/
│       │   └── env.js              # Environment config loader
│       ├── controllers/
│       │   ├── modelData.controller.js
│       │   ├── argo.controller.js
│       │   ├── glider.controller.js
│       │   └── userViews.controller.js
│       ├── middleware/
│       │   ├── auth.middleware.js    # X-API-Key validation
│       │   ├── errorHandler.js       # Centralized error handling
│       │   └── validateRequest.js    # Joi query validation
│       ├── models/
│       │   ├── Station.js            # Mongoose Station schema
│       │   ├── Observation.js        # Mongoose Observation schema
│       │   ├── ModelRun.js           # Mongoose ModelRun schema
│       │   └── UserView.js           # Mongoose UserView schema
│       ├── routes/
│       │   ├── modelData.routes.js
│       │   ├── argo.routes.js
│       │   ├── glider.routes.js
│       │   └── userViews.routes.js
│       └── services/
│           ├── cache.service.js      # Redis get/set helpers
│           ├── mongo.service.js      # Mongoose connection
│           └── pythonService.client.js # Axios wrapper for FastAPI
│
├── data-service/                   # Task 2 — Python FastAPI Service
│   ├── Dockerfile                  # Python 3.11-slim container
│   ├── requirements.txt            # Python dependencies
│   ├── app/
│   │   ├── main.py                 # FastAPI app entry point
│   │   ├── config.py               # Environment configuration
│   │   ├── core/
│   │   │   ├── netcdf_reader.py    # xarray NetCDF loading
│   │   │   ├── slice_extractor.py  # SliceResult dataclass
│   │   │   └── format_converter.py # GeoJSON & array conversion
│   │   ├── parsers/
│   │   │   ├── argo_parser.py      # Argo ASCII/CSV parsing
│   │   │   └── glider_parser.py    # Glider ASCII/CSV parsing
│   │   └── routers/
│   │       ├── argo.py             # Argo stations & profile endpoints
│   │       └── glider.py           # Glider stations endpoints
│   └── cleaned-data/               # Mounted volume for data files
│
├── cleaned-data/                   # Local cleaned data directory
│   └── (NetCDF files, Argo/Glider CSVs)
│
└── vscode_scaffold_prompt.md       # VS Code AI scaffold prompt
```

---

## Features

### API Gateway Features
- **RESTful API** with 8 endpoints covering model data, Argo, Glider, and user views
- **Redis caching** to avoid repeated NetCDF reads for identical slice requests
- **Rate limiting** (100 requests per 15-minute window) via `express-rate-limit`
- **Request validation** using Joi schema validation middleware
- **Centralized error handling** with custom error handler middleware
- **MongoDB integration** for metadata persistence (Mongoose ODM)
- **CORS support** for cross-origin frontend requests
- **API key authentication** middleware (`x-api-key` header)

### Data Service Features
- **Lazy NetCDF loading** using `xarray.open_dataset` with chunking — never loads full files into memory
- **Nearest-neighbor slicing** via `.sel(method="nearest")` for variable/depth/time extraction
- **Argo/Glider CSV parsing** with normalization to standard schema
- **GeoJSON conversion** for spatial data visualization
- **Pydantic validation** for query parameters
- **Proper HTTP status codes** (200, 404, 422, 500) for error cases

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Node.js** | 18+ | For API Gateway |
| **Python** | 3.11+ | For Data Service |
| **Docker & Docker Compose** | 20.10+ | Recommended for local/dev/prod |
| **MongoDB** | 7+ | Or use Docker container |
| **Redis** | 7+ | Or use Docker container |
| **npm** | 9+ | Package manager |
| **pip** | 23+ | Python package manager |

### Optional: Local Development (without Docker)
- Install Node.js and run `cd backend-gateway && npm install`
- Install Python packages: `pip install -r data-service/requirements.txt`
- Ensure MongoDB and Redis are running locally
- Place cleaned data files in `cleaned-data/`

---

## Quick Start

### Option 1: Docker Compose (Recommended)

This is the fastest way to get everything running:

```bash
# Clone the repository
git clone <repo-url>
cd ocean-data-platform

# Ensure cleaned data files are in cleaned-data/ directory
# Place NetCDF files and Argo/Glider CSVs there

# Start all services
docker compose up --build
```

This starts:
- **Gateway** at `http://localhost:4000`
- **Data Service** at `http://localhost:8000` (internal only)
- **MongoDB** at `localhost:27017`
- **Redis** at `localhost:6379`

### Option 2: Manual Local Development

#### 1. Start Infrastructure Services
Start MongoDB and Redis (via Docker or local installation).

#### 2. Set Up API Gateway
```bash
cd backend-gateway
npm install
cp .env.example .env
# Edit .env to point to your services
npm start
# Gateway runs on port 4000
```

#### 3. Set Up Data Service
```bash
cd data-service
pip install -r requirements.txt
# Ensure cleaned-data/ directory exists with data files
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
# Data Service runs on port 8000
```

#### 4. Verify
```bash
curl http://localhost:4000/api/model-data/timesteps?variable=temperature
curl http://localhost:4000/api/glider/stations
```

---

## Docker Compose

The `docker-compose.yml` orchestrates all four services:

```yaml
version: "3.8"
services:
  gateway:
    build: ./backend-gateway
    ports:
      - "4000:4000"
    depends_on:
      - mongo
      - redis
      - data-service
    environment:
      - MONGO_URI=mongodb://mongo:27017/ocean_data
      - REDIS_URL=redis://redis:6379
      - PYTHON_SERVICE_URL=http://data-service:8000
      - PORT=4000
    command: npm start

  data-service:
    build: ./data-service
    volumes:
      - ./cleaned-data:/app/cleaned-data
    environment:
      - NETCDF_DATA_PATH=/app/cleaned-data
      - CLEANED_DATA_PATH=/app/cleaned-data
    expose:
      - "8000"

  mongo:
    image: mongo:7
    volumes:
      - mongo-data:/data/db
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=ocean_data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  mongo-data:
  redis-data:
```

**Key points:**
- `data-service` has **no public port** — it's internal-only, accessed via `PYTHON_SERVICE_URL`
- `./cleaned-data` is mounted as a volume into the `data-service` container
- Named volumes (`mongo-data`, `redis-data`) persist data across restarts
- Gateway depends on all services being healthy before starting

---

## API Endpoints

All endpoints are prefixed with `/api` and served through the **API Gateway** at port 4000.

### Model Data Endpoints

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|-------------|
| `GET` | `/api/model-data` | Get a model data slice | `variable` (req), `depth` (req), `time` (req, ISO date) |
| `GET` | `/api/model-data/timesteps` | List available time steps | `variable` (req) |

**Example:**
```bash
curl "http://localhost:4000/api/model-data?variable=temperature&depth=10&time=2024-01-01T00:00:00Z"
```

**Response:**
```json
{
  "variable": "temperature",
  "depth": 10,
  "time": "2024-01-01T00:00:00Z",
  "lat": [...],
  "lon": [...],
  "values": [[...]]
}
```

### Argo Endpoints

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|-------------|
| `GET` | `/api/argo/stations` | Get Argo stations in a bounding box | `bbox` (req: `minLat,minLon,maxLat,maxLon`) |
| `GET` | `/api/argo/:stationId/profile` | Get depth-vs-variable profile for one float | — |

**Example:**
```bash
curl "http://localhost:4000/api/argo/stations?bbox=10,70,20,80"
curl "http://localhost:4000/api/argo/ARGO_001/profile"
```

### Glider Endpoints

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|-------------|
| `GET` | `/api/glider/stations` | Get all active glider stations | — |

**Example:**
```bash
curl "http://localhost:4000/api/glider/stations"
```

### User Views Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/api/views` | Save a user's view configuration | `{ userId, colorbarConfig, cameraPosition, selectedVariable }` |
| `GET` | `/api/views/:userId` | Retrieve saved views for a user | — |

**Example:**
```bash
curl -X POST http://localhost:4000/api/views \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_KEY" \
  -d '{"userId": "user123", "selectedVariable": "temperature", "colorbarConfig": {"palette": "viridis", "min": 0, "max": 30}}'
```

### Response Format
All successful responses return JSON. Error responses follow:
```json
{ "error": "Error message" }
```

### Rate Limiting
All `/api/*` endpoints are rate-limited to **100 requests per 15 minutes** per client.

### Authentication
All write operations (POST `/api/views`) require an `x-api-key` header. The middleware returns `401` if missing.

---

## Environment Variables

### API Gateway (`.env` in `backend-gateway/`)

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URI` | `mongodb://localhost:27017/ocean_data` | MongoDB connection string |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL |
| `PYTHON_SERVICE_URL` | `http://localhost:8000` | URL of the Python FastAPI service |
| `PORT` | `4000` | Port for the Express gateway |

### Data Service (`.env` in `data-service/`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NETCDF_DATA_PATH` | `./cleaned-data` | Path to NetCDF files |
| `CLEANED_DATA_PATH` | `./cleaned-data` | Path to cleaned data (CSV files) |
| `HOST` | `0.0.0.0` | Host to bind |
| `PORT` | `8000` | Port for FastAPI |

### Docker Compose Environment Mapping
In Docker Compose, the `.env` values are overridden by the `environment` block in `docker-compose.yml`. The container uses:
- `MONGO_URI=mongodb://mongo:27017/ocean_data`
- `REDIS_URL=redis://redis:6379`
- `PYTHON_SERVICE_URL=http://data-service:8000`
- `NETCDF_DATA_PATH=/app/cleaned-data`
- `CLEANED_DATA_PATH=/app/cleaned-data`

---

## Data Format

### NetCDF Data
Ocean model outputs are stored as NetCDF files. The data service uses `xarray` to lazily open datasets and extract slices.

**Expected dimensions:** `lat`, `lon`, `depth`, `time`

**Expected variables:** `temperature`, `salinity`, `chlorophyll`, `current_u`, `current_v` (or any oceanographic variable)

**Slice extraction:** Uses `.sel(depth=depth, time=time, method="nearest")` for nearest-neighbor matching.

**Response format from `/api/model-data`:**
```json
{
  "variable": "temperature",
  "depth": 10.0,
  "time": "2024-01-01T00:00:00Z",
  "lat": [/* array of lat values */],
  "lon": [/* array of lon values */],
  "values": [[/* 2D grid of values */]]
}
```

### Argo Float Data
Delimited ASCII/CSV files with columns:

| Column | Type | Description |
|--------|------|-------------|
| `stationId` | String | Unique float identifier |
| `lat` | Float | Latitude |
| `lon` | Float | Longitude |
| `timestamp` | String | Observation timestamp |
| `depth` | Float | Depth in meters |
| `temperature` | Float | Sea surface temperature (°C) |
| `salinity` | Float | Practical salinity (PSU) |
| `chlorophyll` | Float | Chlorophyll concentration (mg/m³) |
| `status` | String | `active` or `inactive` |

### Glider Data
Delimited ASCII/CSV files with columns:

| Column | Type | Description |
|--------|------|-------------|
| `stationId` | String | Unique glider identifier |
| `lat` | Float | Latitude |
| `lon` | Float | Longitude |
| `timestamp` | String | Track timestamp |
| `depth` | Float | Depth in meters |
| `temperature` | Float | Temperature (°C) |
| `salinity` | Float | Salinity (PSU) |
| `chlorophyll` | Float | Chlorophyll concentration |
| `trackId` | String | Track identifier |
| `status` | String | `active` or `inactive` |

### Normalized Observation Schema
Both Argo and Glider parsers normalize data to:
```json
{
  "stationId": "string",
  "lat": float,
  "lon": float,
  "timestamp": "string",
  "depth": float,
  "temperature": float,
  "salinity": float,
  "chlorophyll": float
}
```

---

## MongoDB Schemas

### Station
Stores information about Argo floats and Glider platforms.

```javascript
{
  stationId:      { type: String, required: true, unique: true },
  instrumentType: { type: String, enum: ["argo", "glider", "ctd"], required: true },
  lat:            { type: Number, required: true },
  lon:            { type: Number, required: true },
  deployedAt:     { type: Date },
  lastUpdated:    { type: Date },
  status:         { type: String, enum: ["active", "inactive"], default: "active" }
}
```
**Indexes:** `{ stationId: 1 }`, `{ instrumentType: 1, status: 1 }`

### Observation
Stores depth-profile observations from stations.

```javascript
{
  stationId:   { type: String, required: true },
  timestamp:   { type: Date, required: true },
  depth:       { type: Number, required: true },
  temperature: { type: Number },
  salinity:    { type: Number },
  chlorophyll: { type: Number }
}
```
**Indexes:** `{ stationId: 1, timestamp: -1 }` (compound)

### ModelRun
Tracks ocean model run metadata.

```javascript
{
  modelName:   { type: String, required: true },
  variable:    { type: String, required: true },
  timeStep:    { type: String, required: true },
  filePath:    { type: String, required: true },
  boundingBox: {
    minLat: { type: Number },
    maxLat: { type: Number },
    minLon: { type: Number },
    maxLon: { type: Number }
  },
  resolution:  { type: Number }
}
```
**Indexes:** `{ modelName: 1, variable: 1 }`, `{ timeStep: 1 }`

### UserView
Stores user-configured visualization settings.

```javascript
{
  userId:         { type: String, required: true },
  colorbarConfig: {
    palette: { type: String },
    min:     { type: Number },
    max:     { type: Number },
    scale:   { type: String }
  },
  cameraPosition: {
    x: { type: Number },
    y: { type: Number },
    z: { type: Number }
  },
  selectedVariable: { type: String }
}
```
**Indexes:** `{ userId: 1 }`

---

## Technology Stack

### Backend Services
| Layer | Technology | Details |
|-------|-----------|---------|
| **API Gateway** | Node.js 18 + Express 4.18 | REST API framework |
| **Data Service** | Python 3.11 + FastAPI 0.104+ | Async web framework |
| **Database** | MongoDB 7 + Mongoose 7.8 | Document store + ODM |
| **Cache** | Redis 7 Alpine | In-memory key-value cache |
| **HTTP Client** | Axios 1.6 | Gateway → Data Service communication |
| **Validation** | Joi 17 | Query parameter validation |
| **Rate Limiting** | express-rate-limit 7.1 | API request throttling |
| **CORS** | cors 2.8.5 | Cross-origin resource sharing |
| **Environment** | dotenv 16.3.1 | Environment variable management |

### Data Processing
| Library | Language | Purpose |
|---------|----------|---------|
| **xarray** | Python | Lazy NetCDF dataset loading |
| **netCDF4** | Python | NetCDF file engine |
| **pydantic** | Python | Query parameter validation |
| **uvicorn** | Python | ASGI server |

### Containerization
| Tool | Purpose |
|------|---------|
| **Docker** | Containerization of all services |
| **Docker Compose** | Multi-service orchestration |

---

## Contributing

1. **Create a feature branch**: `git checkout -b feature/your-feature`
2. **Make your changes**: Follow the existing code conventions
3. **Test locally**: Run `docker compose up --build` and verify endpoints
4. **Commit**: Use descriptive commit messages
5. **Push**: Push to your fork and open a Pull Request

### Adding New Endpoints
1. Add route in `backend-gateway/src/routes/`
2. Add controller in `backend-gateway/src/controllers/`
3. Add Mongoose model in `backend-gateway/src/models/` if needed
4. Add FastAPI router in `data-service/app/routers/` if new data source needed
5. Update `docker-compose.yml` environment variables if new services needed

### Adding New Variables
NetCDF variables are accessed dynamically via query parameter `variable`. Ensure the variable name exists in your NetCDF files. No code changes needed for new model variables.

---

## VS Code AI Scaffold Prompt

The `vscode_scaffold_prompt.md` file contains a detailed prompt for VS Code AI assistants (GitHub Copilot Chat, Claude Code, Cursor) to generate this project scaffold. It can be split by task (Task 1–4) for tools with smaller context windows.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Gateway won't start** | Verify MongoDB and Redis are running; check `.env` values |
| **Python service unreachable** | Ensure `PYTHON_SERVICE_URL` matches the service URL from gateway's perspective |
| **NetCDF file not found** | Verify files are in `cleaned-data/` and `NETCDF_DATA_PATH` is correct |
| **Argo/Glider stations empty** | Check CSV column names match expected schema; verify `CLEANED_DATA_PATH` |
| **Redis connection errors** | Confirm Redis is running on port 6379; check `REDIS_URL` |
| **MongoDB connection fails** | Ensure MongoDB is accessible at the URI specified in `.env` |
| **Docker build fails** | Check that `cleaned-data/` directory exists before running `docker compose up` |
| **CORS errors** | Verify frontend origin is allowed; `cors()` middleware is configured in `app.js` |
| **422 validation errors** | Check query parameters match Joi schema (variable: string, depth: number, time: ISO date) |

---

## License

This project is part of the **Smart India Hackathon 2024** submission for Problem Statement 26067 (INCOIS). All rights reserved.

---

## Acknowledgments

- **INCOIS** (Indian National Centre for Ocean Information Services) for the problem statement
- **Smart India Hackathon** for the platform and opportunity
- **xarray**, **netCDF4**, **FastAPI**, **Express.js**, **Mongoose**, **Redis** communities for the open-source tools
