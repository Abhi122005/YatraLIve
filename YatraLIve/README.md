# YatraLIve - KSRTC Smart Terminal

A real-time passenger information system for Kerala State Road Transport Corporation (KSRTC) bus depots. This application provides real-time bus tracking, arrival forecasting, delay alerts, and depot management capabilities.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Frontend Components](#frontend-components)
- [Database Schema](#database-schema)
- [Architecture](#architecture)
- [Technologies Used](#technologies-used)
- [Configuration](#configuration)

## ✨ Features

### Admin Dashboard
- Real-time bus monitoring on an interactive map.
- Arrival board showing approaching buses.
- Delay alerts and management.
- Bus status tracking (SCHEDULED, APPROACHING, NEAR, ARRIVED, DEPARTED, DELAYED).
- Add new buses to the system.
- Simulation controls (start, stop, reset).
- Depot location configuration.
- Mark buses as delayed/undelayed.

### Passenger Display Board (Enhanced)
- **Multilingual Support**: Information perfectly translated and displayed in English 🇬🇧, Malayalam 🇮🇳, and Hindi 🇮🇳 simultaneously.
- **Auto-Responsive Text Scaling**: Ensures the UI is beautiful and readable on any screen, from 320px mobile devices to 5120px+ large TV monitors installed in the terminal.
- **Natural Malayalam Text-to-Speech**: Broadcasts real-time voice announcements of arrived or approaching buses via Web Speech APIs, with smart language detection.
- **Status Color Scheme**: Quick visual parsing for users.
  - 🟢 **Green**: Arriving, Approaching, or Near Depot.
  - 🔴 **Red**: Delayed.
  - 🟠 **Orange**: Departed.
  - 🟡 **Gray**: Scheduled.
- Live arrival board with ETA and distance computations.

### Core Features
- **Geofence-based Status**: Automatic status updates based on distance from depot (Arrived <= 100m, Near <= 400m, Approaching <= 800m).
- **Real-time Simulation**: Simulate bus movements toward depot for robust testing.
- **Database Persistence**: SQLite database for bus and depot configuration.
- **Bus State Management**: Zustand store for efficient client state management.
- **Polling System**: Automatic data refresh with failure detection and offline recovery banner.

## 📁 Project Structure

```text
YatraLIve/
├── backend/
│   ├── main.py                 # FastAPI application & endpoints
│   ├── models.py               # SQLAlchemy database models
│   ├── database.py             # Database configuration & session management
│   ├── bus_manager.py          # Bus state & business logic
│   ├── geofence.py             # Distance calculations & status logic
│   └── simulation.py           # Bus movement simulation engine
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminMap.jsx          # Interactive map component
│   │   │   ├── ArrivalBoard.jsx      # Real-time arrival information
│   │   │   ├── AnnouncementBar.jsx   # Announcements display
│   │   │   ├── DelayAlerts.jsx       # Delay notifications
│   │   │   └── RecentDepartures.jsx  # Recent departures table
│   │   ├── hooks/
│   │   │   └── usePoll.js            # Polling hook for API calls
│   │   ├── i18n/
│   │   │   └── translations.js       # Multilingual translation dictionary
│   │   ├── pages/
│   │   │   ├── AdminPage.jsx         # Admin dashboard
│   │   │   ├── DisplayPage.jsx       # Passenger display board
│   │   │   └── LoginPage.jsx         # Authentication page
│   │   ├── services/
│   │   │   └── ttsService.js         # Text-to-Speech logic
│   │   ├── store/
│   │   │   └── busStore.js           # Zustand store for state
│   │   ├── utils/
│   │   │   └── responsiveText.js     # Responsive text utilities
│   │   ├── App.jsx                   
│   │   └── index.css                 # Global styles and terminal theme
├── requirements.txt                  
├── ksrtc_terminal.db                 
└── README.md                         
```

## 🔧 Prerequisites

- **Python** 3.8+
- **Node.js** 16+ with npm
- **Git**

## 📦 Installation

### Backend Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

### Frontend Setup

2. **Install Node.js dependencies:**
   ```bash
   cd frontend
   npm install
   ```

## 🚀 Running the Application

### Start Backend (Port 8000)

```bash
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`
- Interactive API docs: `http://localhost:8000/docs`

### Start Frontend (Port 5173)

```bash
cd frontend
npm run dev
```

The application will be available at: `http://localhost:5173`

### Default Login
- **Username**: (optional, any value)
- **Password**: `ksrtc2024`

## 🔌 API Endpoints
- `GET /buses` - Get all buses
- `POST /buses` - Add a new bus
- `POST /buses/{id}/delay` - Mark bus as delayed
- `POST /buses/{id}/undelay` - Mark bus as on-time
- `GET /arrival_board` - Get buses approaching depot
- `GET /delay_alerts` - Get delayed buses
- `GET /recent_departures` - Get recently departed buses
- `PUT /depot/location` - Update depot coordinates
- `GET /depot/config` - Get depot configuration
- `POST /simulate/start` - Start bus movement simulation
- `POST /simulate/stop` - Stop simulation
- `POST /simulate/reset` - Reset simulation and buses
- `POST /auth/login` - Authenticate admin user

## 🏗️ Architecture

- The system uses a FastAPI backend with a lightweight SQLite database for persistence. 
- Real-time bus geofencing checks are run tightly in-memory during execution with regular DB syncs to prioritize speed.
- Frontend polling happens every 3 seconds for near-real-time updates without WebSockets overhead.
- A highly resilient Responsive Text scaling hook adjusts the viewport dynamically on window resize events to ensure the Passenger display is perfect from a mobile phone to a 4K resolution terminal TV.
- Uses the native Browser Web Speech API for low-latency Text-to-Speech notifications in English, Hindi, and Malayalam.

## 🛠 Technologies Used

### Backend
- **FastAPI**: Modern async Python web framework
- **SQLAlchemy**: ORM for database operations
- **Pydantic**: Data validation
- **Uvicorn**: ASGI server
- **SQLite**: Lightweight embedded database

### Frontend
- **React 19**: UI framework
- **Vite**: Build tool & dev server
- **React Leaflet**: Map visualization
- **Zustand**: State management
- **React Router**: Client-side routing

## ⚙️ Configuration

### Environment Variables
Create `.env` file in root directory:
```env
DATABASE_URL=sqlite:///./ksrtc_terminal.db
ADMIN_PASSWORD=ksrtc2024
API_URL=http://localhost:8000
```

### Depot Location
Default depot coordinates (Ernakulam):
- Latitude: `9.9816`
- Longitude: `76.2999`

## 📄 License
This project is part of the KSRTC Smart Terminal initiative.