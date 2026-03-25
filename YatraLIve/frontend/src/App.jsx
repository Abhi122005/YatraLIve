import React, { useState, useEffect, useRef } from 'react';
import { Simulation } from './simulation';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './index.css'; // Terminal styles
import { t, translateField } from './i18n/translations';
import { addManualBus as saveManualBus, getManualBuses } from './api';
import { ttsService } from './services/ttsService';

const BOARD_LABELS = ['ARRIVALS', 'DELAYS', 'DEPARTURES'];
const MALAYALAM_DESTINATION_ANNOUNCEMENT_FORMS = {
  KOZHIKODE: '\u0d15\u0d4b\u0d34\u0d3f\u0d15\u0d4d\u0d15\u0d4b\u0d1f\u0d4d\u0d1f\u0d47\u0d15\u0d4d\u0d15\u0d41\u0d33\u0d4d\u0d33',
};

const SCRIPT_CONFIG = {
  hi: {
    independentVowels: { a: '\u0905', aa: '\u0906', i: '\u0907', ii: '\u0908', u: '\u0909', uu: '\u090a', e: '\u090f', ai: '\u0910', o: '\u0913', au: '\u0914' },
    vowelMarks: { a: '', aa: '\u093e', i: '\u093f', ii: '\u0940', u: '\u0941', uu: '\u0942', e: '\u0947', ai: '\u0948', o: '\u094b', au: '\u094c' },
    consonants: { k: '\u0915', g: '\u0917', c: '\u0915', j: '\u091c', t: '\u091f', d: '\u0921', n: '\u0928', p: '\u092a', b: '\u092c', m: '\u092e', y: '\u092f', r: '\u0930', l: '\u0932', v: '\u0935', w: '\u0935', s: '\u0938', h: '\u0939', q: '\u0915', f: '\u092b', z: '\u091c', x: '\u0915\u094d\u0938' },
    virama: '\u094d',
  },
  ml: {
    independentVowels: { a: '\u0d05', aa: '\u0d06', i: '\u0d07', ii: '\u0d08', u: '\u0d09', uu: '\u0d0a', e: '\u0d0f', ai: '\u0d10', o: '\u0d13', au: '\u0d14' },
    vowelMarks: { a: '', aa: '\u0d3e', i: '\u0d3f', ii: '\u0d40', u: '\u0d41', uu: '\u0d42', e: '\u0d47', ai: '\u0d48', o: '\u0d4b', au: '\u0d4c' },
    consonants: { k: '\u0d15', g: '\u0d17', c: '\u0d15', j: '\u0d1c', t: '\u0d1f', d: '\u0d21', n: '\u0d28', p: '\u0d2a', b: '\u0d2c', m: '\u0d2e', y: '\u0d2f', r: '\u0d30', l: '\u0d32', v: '\u0d35', w: '\u0d35', s: '\u0d38', h: '\u0d39', q: '\u0d15', f: '\u0d2b', z: '\u0d38', x: '\u0d15\u0d4d\u0d38' },
    virama: '\u0d4d',
  },
};

const DIGRAPH_REPLACEMENTS = [['tch', 'c'], ['ch', 'c'], ['sh', 's'], ['zh', 'z'], ['kh', 'k'], ['gh', 'g'], ['ph', 'f'], ['bh', 'b'], ['dh', 'd'], ['th', 't'], ['ng', 'n']];
const VOWEL_TOKENS = ['aa', 'ai', 'au', 'ee', 'ii', 'oo', 'uu', 'a', 'e', 'i', 'o', 'u'];
const CONSONANT_TOKENS = ['x', 'k', 'g', 'c', 'j', 't', 'd', 'n', 'p', 'b', 'm', 'y', 'r', 'l', 'v', 'w', 's', 'h', 'q', 'f', 'z'];

const normalizeRomanWord = (word = '') => {
  let normalized = word.toLowerCase();
  DIGRAPH_REPLACEMENTS.forEach(([from, to]) => {
    normalized = normalized.replaceAll(from, to);
  });
  return normalized;
};

const tokenizeRomanWord = (word = '') => {
  const normalized = normalizeRomanWord(word);
  const tokens = [];
  let index = 0;

  while (index < normalized.length) {
    const vowel = VOWEL_TOKENS.find(token => normalized.startsWith(token, index));
    if (vowel) {
      tokens.push({ type: 'vowel', value: vowel === 'ee' ? 'ii' : vowel === 'oo' ? 'uu' : vowel });
      index += vowel.length;
      continue;
    }

    const consonant = CONSONANT_TOKENS.find(token => normalized.startsWith(token, index));
    if (consonant) {
      tokens.push({ type: 'consonant', value: consonant });
      index += consonant.length;
      continue;
    }

    tokens.push({ type: 'literal', value: normalized[index] });
    index += 1;
  }

  return tokens;
};

const transliterateWord = (word, lang) => {
  const config = SCRIPT_CONFIG[lang];
  if (!config || !/[a-z]/i.test(word)) return word;

  const tokens = tokenizeRomanWord(word);
  let output = '';
  let index = 0;

  while (index < tokens.length) {
    const token = tokens[index];

    if (token.type === 'literal') {
      output += token.value;
      index += 1;
      continue;
    }

    if (token.type === 'vowel') {
      output += config.independentVowels[token.value] || token.value;
      index += 1;
      continue;
    }

    const cluster = [];
    while (index < tokens.length && tokens[index].type === 'consonant') {
      cluster.push(tokens[index].value);
      index += 1;
    }

    const nextToken = tokens[index];
    const vowel = nextToken?.type === 'vowel' ? nextToken.value : 'a';

    cluster.forEach((consonant, clusterIndex) => {
      const glyph = config.consonants[consonant] || consonant;
      const isLast = clusterIndex === cluster.length - 1;
      output += isLast ? glyph + (config.vowelMarks[vowel] ?? '') : glyph + config.virama;
    });

    if (nextToken?.type === 'vowel') {
      index += 1;
    }
  }

  return output;
};

const transliterateText = (text, lang) =>
  text
    .split(/([^A-Za-z]+)/)
    .map(part => (/^[A-Za-z]+$/.test(part) ? transliterateWord(part, lang) : part))
    .join('');

const translateOrTransliterate = (field, value, lang) => {
  const translated = translateField(field, value, lang);
  if (translated && translated !== value) return translated;
  return transliterateText(value, lang);
};

const buildLocalizedManualFields = ({ route, destination }) => ({
  route: {
    ml: translateOrTransliterate('routes', route, 'ml'),
    hi: translateOrTransliterate('routes', route, 'hi'),
  },
  destination: {
    ml: translateOrTransliterate('destinations', destination, 'ml'),
    hi: translateOrTransliterate('destinations', destination, 'hi'),
  },
});

const getBusFieldValue = (bus, field, lang = 'en') => {
  if (lang === 'en') return bus[field];
  const manualValue = bus.localizedFields?.[field]?.[lang];
  if (manualValue) return manualValue;
  const translationField = field === 'bus_type' ? 'busTypes' : `${field}s`;
  return translateField(translationField, bus[field], lang);
};

const getMalayalamDestinationAnnouncementText = (bus) => {
  const key = (bus.destination || '').trim().toUpperCase();
  return MALAYALAM_DESTINATION_ANNOUNCEMENT_FORMS[key] || `${getBusFieldValue(bus, 'destination', 'ml')} \u0d32\u0d47\u0d15\u0d4d\u0d15\u0d41\u0d33\u0d4d\u0d33`;
};

export default function App() {
  const [view, setView] = useState('login'); // 'login' | 'location' | 'dashboard'

  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Location State
  const [locLat, setLocLat] = useState('9.9816');
  const [locLng, setLocLng] = useState('76.2999');
  const [mode, setMode] = useState('ADMIN'); // 'ADMIN' or 'DISPLAY'
  const [radiusArrived, setRadiusArrived] = useState('100');
  const [radiusNear, setRadiusNear] = useState('400');
  const [radiusAppr, setRadiusAppr] = useState('800');
  const [manualBus, setManualBus] = useState({
    bus_number: '',
    bus_type: '',
    route: '',
    destination: '',
    status: 'APPROACHING'
  });
  const [manualBusMessage, setManualBusMessage] = useState('');

  // Dashboard Data State
  const [buses, setBuses] = useState([]);
  const [departures, setDepartures] = useState([]);
  const simRef = useRef(null);
  const announcedRef = useRef(new Set());

  // Carousel state for DISPLAY mode
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Map Ref
  const mapRef = useRef(null);
  const mapInst = useRef(null);
  const markers = useRef({});
  const circles = useRef([]);

  // Handles simple login auth
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'ksrtc2024') {
      setError('');
      setView('location');
    } else {
      setError('ACCESS DENIED. Invalid Credentials.');
    }
  };

  // Handles setting location and starting simulation
  const loadStoredManualBuses = async (simulation) => {
    try {
      const storedBuses = await getManualBuses();
      storedBuses.forEach(bus => simulation.addManualBus(bus));
    } catch (err) {
      console.warn('Failed to load manual buses from backend:', err);
    }
  };

  const handleSetLocation = async (e) => {
    e.preventDefault();
    const lat = parseFloat(locLat);
    const lng = parseFloat(locLng);
    if (isNaN(lat) || isNaN(lng)) {
      setError('INVALID COORDINATES.');
      return;
    }
    setError('');

    // Start Simulation standalone
    if (simRef.current) simRef.current.stop();
    const radii = {
      arrived: parseInt(radiusArrived) || 100,
      near: parseInt(radiusNear) || 400,
      approaching: parseInt(radiusAppr) || 800
    };
    simRef.current = new Simulation(lat, lng, radii);
    simRef.current.start((updatedBuses, updatedDepartures) => {
      setBuses(updatedBuses);
      setDepartures(updatedDepartures);
    });
    await loadStoredManualBuses(simRef.current);

    setView('dashboard');
  };

  const handleManualBusSubmit = async (e) => {
    e.preventDefault();
    if (!simRef.current) {
      setManualBusMessage('SIMULATION NOT INITIALISED.');
      return;
    }

    const requiredValues = [
      manualBus.bus_number,
      manualBus.bus_type,
      manualBus.route,
      manualBus.destination
    ];

    if (requiredValues.some(value => !value.trim())) {
      setManualBusMessage('ENTER ALL REQUIRED BUS DETAILS.');
      return;
    }

    const payload = {
      bus_number: manualBus.bus_number.trim().toUpperCase(),
      bus_type: manualBus.bus_type.trim(),
      route: manualBus.route.trim(),
      destination: manualBus.destination.trim(),
      status: manualBus.status,
      localizedFields: buildLocalizedManualFields({
        route: manualBus.route.trim(),
        destination: manualBus.destination.trim(),
      })
    };

    try {
      const savedBus = await saveManualBus(payload);
      simRef.current.addManualBus(savedBus);
    } catch (err) {
      console.error('Failed to save manual bus:', err);
      simRef.current.addManualBus(payload);
      setManualBusMessage('BUS ADDED LOCALLY. START BACKEND TO SYNC ACROSS MODES.');
      setManualBus({
        bus_number: '',
        bus_type: '',
        route: '',
        destination: '',
        status: 'APPROACHING'
      });
      return;
    }

    setManualBus({
      bus_number: '',
      bus_type: '',
      route: '',
      destination: '',
      status: 'APPROACHING'
    });
    setManualBusMessage('BUS ADDED TO ADMIN TRACKING.');
  };

  // Cleanup simulation on unmount
  useEffect(() => {
    return () => {
      if (simRef.current) simRef.current.stop();
    };
  }, []);

  // Carousel rotation every 40 seconds (only in DISPLAY mode)
  useEffect(() => {
    if (view !== 'dashboard' || mode !== 'DISPLAY') return;
    const interval = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % 3);
    }, 40000);
    return () => clearInterval(interval);
  }, [view, mode]);

  // Handle Announcements
  useEffect(() => {
    const arrivedBuses = buses.filter(b => b.status === 'ARRIVED');

    arrivedBuses.forEach(bus => {
      const busKey = `${bus.id}-${bus.arrivedAt}`;
      if (!announcedRef.current.has(busKey)) {
        announcedRef.current.add(busKey);

        // Translate destination and route to proper Malayalam for natural TTS
        const mlDestAnnouncement = getMalayalamDestinationAnnouncementText(bus);
        const mlRoute = getBusFieldValue(bus, 'route', 'ml') || bus.route;
        const mlText = `യാത്രക്കാരുടെ ശ്രദ്ധയ്ക്ക്. ${mlRoute} ${mlDestAnnouncement} ബസ് സ്റ്റേഷനിൽ എത്തിയിരിക്കുന്നു.`;

        ttsService.speakAnnouncement(mlText, 'ml').catch((err) => {
          console.warn('Malayalam TTS failed:', err);
        });
      }
    });
  }, [buses]);

  // Initialize Map when entering Dashboard
  useEffect(() => {
    if (view === 'dashboard' && mapRef.current && !mapInst.current) {

      const map = L.map(mapRef.current, {
        center: [parseFloat(locLat), parseFloat(locLng)],
        zoom: 14,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: 'Terminal Map',
        maxZoom: 19
      }).addTo(map);

      mapInst.current = map;

      const radii = [
        { r: parseInt(radiusAppr) || 800, color: '#39ff14', fill: 0.05 },
        { r: parseInt(radiusNear) || 400, color: '#39ff14', fill: 0.1 },
        { r: parseInt(radiusArrived) || 100, color: '#39ff14', fill: 0.2 }
      ];

      radii.forEach(c => {
        const circle = L.circle([parseFloat(locLat), parseFloat(locLng)], {
          radius: c.r,
          color: c.color,
          fillColor: c.color,
          fillOpacity: c.fill,
          weight: 2,
          dashArray: '4'
        }).addTo(map);
        circles.current.push(circle);
      });

      L.circleMarker([parseFloat(locLat), parseFloat(locLng)], {
        radius: 5, color: '#fff', fillColor: '#fff', fillOpacity: 1
      }).addTo(map).bindPopup('DEPOT CENTER');
    }
  }, [view]);

  // Update Bus Markers on Map
  useEffect(() => {
    if (!mapInst.current) return;
    const map = mapInst.current;

    const currentBusIds = new Set();

    buses.forEach(b => {
      if (b.status === 'DEPARTED' || b.latitude == null || b.longitude == null) return;
      currentBusIds.add(b.id);

      let color = '#00ff00';
      if (b.status === 'DELAYED') color = '#ff0000';

      const iconHtml = `<div style="width: 15px; height: 15px; background: ${color}; border-radius: 50%; box-shadow: 0 0 10px ${color};"></div>`;
      const customIcon = L.divIcon({ className: 'custom-bus', html: iconHtml, iconSize: [15, 15], iconAnchor: [7.5, 7.5] });

      if (markers.current[b.id]) {
        markers.current[b.id].setLatLng([b.latitude, b.longitude]);
        markers.current[b.id].setIcon(customIcon);
      } else {
        const m = L.marker([b.latitude, b.longitude], { icon: customIcon }).addTo(map);
        m.bindTooltip(`[${b.bus_number}] ${b.status} (${b.distance}m)`, { direction: 'top', className: 'terminal-tooltip' });
        markers.current[b.id] = m;
      }
    });

    Object.keys(markers.current).forEach(id => {
      if (!currentBusIds.has(Number(id))) {
        markers.current[id].remove();
        delete markers.current[id];
      }
    });
  }, [buses]);

  // Derived Tables
  const arrivalBoard = buses.filter(b => b.status === 'APPROACHING' || b.status === 'NEAR' || b.status === 'ARRIVED').sort((a, b) => a.distance - b.distance);
  const delayBoard = buses.filter(b => b.is_delayed || b.status === 'DELAYED');
  const adminBoard = buses
    .filter(b => b.status !== 'DEPARTED')
    .sort((a, b) => {
      if (a.isManualEntry && !b.isManualEntry) return -1;
      if (!a.isManualEntry && b.isManualEntry) return 1;
      return (a.distance ?? Number.MAX_SAFE_INTEGER) - (b.distance ?? Number.MAX_SAFE_INTEGER);
    });

  // Helper: get row color based on status
  const getRowColor = (status) => {
    if (status === 'DELAYED') return '#ff0000';
    if (status === 'DEPARTED') return 'orange';
    return '#00ff00';
  };

  // Render one board at a time for DISPLAY mode
  const renderArrivalBoard = () => (
    <div className="board-panel" style={{ flex: 1 }}>
      <div className="board-title">
        <span className="lang-en">{t('display', 'arrivalBoard', 'en')}</span>
        <span className="lang-ml">{t('display', 'arrivalBoard', 'ml')}</span>
        <span className="lang-hi">{t('display', 'arrivalBoard', 'hi')}</span>
      </div>
      <table className="board-table">
        <thead>
          <tr>
            <th><span className="lang-en">{t('display', 'busNumber', 'en')}</span><span className="lang-ml">{t('display', 'busNumber', 'ml')}</span><span className="lang-hi">{t('display', 'busNumber', 'hi')}</span></th>
            <th><span className="lang-en">{t('display', 'type', 'en')}</span><span className="lang-ml">{t('display', 'type', 'ml')}</span><span className="lang-hi">{t('display', 'type', 'hi')}</span></th>
            <th><span className="lang-en">{t('display', 'route', 'en')}</span><span className="lang-ml">{t('display', 'route', 'ml')}</span><span className="lang-hi">{t('display', 'route', 'hi')}</span></th>
            <th><span className="lang-en">{t('display', 'destination', 'en')}</span><span className="lang-ml">{t('display', 'destination', 'ml')}</span><span className="lang-hi">{t('display', 'destination', 'hi')}</span></th>
            <th><span className="lang-en">{t('display', 'status', 'en')}</span><span className="lang-ml">{t('display', 'status', 'ml')}</span><span className="lang-hi">{t('display', 'status', 'hi')}</span></th>
          </tr>
        </thead>
        <tbody>
          {arrivalBoard.length === 0 ? (
            <tr><td colSpan="5" className="empty-row">
              <span className="lang-en">{t('display', 'noData', 'en')}</span>
              <span className="lang-ml">{t('display', 'noData', 'ml')}</span>
              <span className="lang-hi">{t('display', 'noData', 'hi')}</span>
            </td></tr>
          ) : (
            arrivalBoard.map(b => (
              <tr key={b.id} style={{ color: getRowColor(b.status) }}>
                <td>{b.bus_number}</td>
                <td>
                  <span className="lang-en">{b.bus_type}</span>
                  <span className="lang-ml">{getBusFieldValue(b, 'bus_type', 'ml')}</span>
                  <span className="lang-hi">{getBusFieldValue(b, 'bus_type', 'hi')}</span>
                </td>
                <td>
                  <span className="lang-en">{b.route}</span>
                  <span className="lang-ml">{getBusFieldValue(b, 'route', 'ml')}</span>
                  <span className="lang-hi">{getBusFieldValue(b, 'route', 'hi')}</span>
                </td>
                <td>
                  <span className="lang-en">{b.destination}</span>
                  <span className="lang-ml">{getBusFieldValue(b, 'destination', 'ml')}</span>
                  <span className="lang-hi">{getBusFieldValue(b, 'destination', 'hi')}</span>
                </td>
                <td>{b.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderDelayBoard = () => (
    <div className="board-panel" style={{ flex: 1 }}>
      <div className="board-title" style={{ color: '#ff0000' }}>
        <span className="lang-en">{t('display', 'delayAlerts', 'en')}</span>
        <span className="lang-ml">{t('display', 'delayAlerts', 'ml')}</span>
        <span className="lang-hi">{t('display', 'delayAlerts', 'hi')}</span>
      </div>
      <table className="board-table">
        <thead>
          <tr>
            <th><span className="lang-en">{t('display', 'busNumber', 'en')}</span><span className="lang-ml">{t('display', 'busNumber', 'ml')}</span><span className="lang-hi">{t('display', 'busNumber', 'hi')}</span></th>
            <th><span className="lang-en">{t('display', 'type', 'en')}</span><span className="lang-ml">{t('display', 'type', 'ml')}</span><span className="lang-hi">{t('display', 'type', 'hi')}</span></th>
            <th><span className="lang-en">{t('display', 'route', 'en')}</span><span className="lang-ml">{t('display', 'route', 'ml')}</span><span className="lang-hi">{t('display', 'route', 'hi')}</span></th>
            <th><span className="lang-en">{t('display', 'destination', 'en')}</span><span className="lang-ml">{t('display', 'destination', 'ml')}</span><span className="lang-hi">{t('display', 'destination', 'hi')}</span></th>
            <th><span className="lang-en">{t('display', 'status', 'en')}</span><span className="lang-ml">{t('display', 'status', 'ml')}</span><span className="lang-hi">{t('display', 'status', 'hi')}</span></th>
          </tr>
        </thead>
        <tbody>
          {delayBoard.length === 0 ? (
            <tr><td colSpan="5" className="empty-row">
              <span className="lang-en">✅ No delays reported</span>
              <span className="lang-ml">✅ കാലതാമസം റിപോർട്ട് ചെയ്യപ്പെട്ടില്ല</span>
              <span className="lang-hi">✅ कोई विलंब सूचित नहीं</span>
            </td></tr>
          ) : (
            delayBoard.map(b => (
              <tr key={b.id} style={{ color: '#ff0000' }}>
                <td>{b.bus_number}</td>
                <td>
                  <span className="lang-en">{b.bus_type}</span>
                  <span className="lang-ml">{getBusFieldValue(b, 'bus_type', 'ml')}</span>
                  <span className="lang-hi">{getBusFieldValue(b, 'bus_type', 'hi')}</span>
                </td>
                <td>
                  <span className="lang-en">{b.route}</span>
                  <span className="lang-ml">{getBusFieldValue(b, 'route', 'ml')}</span>
                  <span className="lang-hi">{getBusFieldValue(b, 'route', 'hi')}</span>
                </td>
                <td>
                  <span className="lang-en">{b.destination}</span>
                  <span className="lang-ml">{getBusFieldValue(b, 'destination', 'ml')}</span>
                  <span className="lang-hi">{getBusFieldValue(b, 'destination', 'hi')}</span>
                </td>
                <td>DELAYED</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderDepartureBoard = () => (
    <div className="board-panel" style={{ flex: 1 }}>
      <div className="board-title" style={{ color: 'orange' }}>
        <span className="lang-en">{t('display', 'recentDepartures', 'en')}</span>
        <span className="lang-ml">{t('display', 'recentDepartures', 'ml')}</span>
        <span className="lang-hi">{t('display', 'recentDepartures', 'hi')}</span>
      </div>
      <table className="board-table">
        <thead>
          <tr>
            <th><span className="lang-en">{t('display', 'busNumber', 'en')}</span><span className="lang-ml">{t('display', 'busNumber', 'ml')}</span><span className="lang-hi">{t('display', 'busNumber', 'hi')}</span></th>
            <th><span className="lang-en">{t('display', 'type', 'en')}</span><span className="lang-ml">{t('display', 'type', 'ml')}</span><span className="lang-hi">{t('display', 'type', 'hi')}</span></th>
            <th><span className="lang-en">{t('display', 'destination', 'en')}</span><span className="lang-ml">{t('display', 'destination', 'ml')}</span><span className="lang-hi">{t('display', 'destination', 'hi')}</span></th>
            <th><span className="lang-en">{t('display', 'route', 'en')}</span><span className="lang-ml">{t('display', 'route', 'ml')}</span><span className="lang-hi">{t('display', 'route', 'hi')}</span></th>
            <th><span className="lang-en">{t('display', 'status', 'en')}</span><span className="lang-ml">{t('display', 'status', 'ml')}</span><span className="lang-hi">{t('display', 'status', 'hi')}</span></th>
          </tr>
        </thead>
        <tbody>
          {departures.length === 0 ? (
            <tr><td colSpan="5" className="empty-row">
              <span className="lang-en">{t('display', 'noData', 'en')}</span>
              <span className="lang-ml">{t('display', 'noData', 'ml')}</span>
              <span className="lang-hi">{t('display', 'noData', 'hi')}</span>
            </td></tr>
          ) : (
            departures.map((b, idx) => (
              <tr key={`dep-${idx}`} style={{ color: 'orange' }}>
                <td>{b.bus_number}</td>
                <td>
                  <span className="lang-en">{b.bus_type}</span>
                  <span className="lang-ml">{getBusFieldValue(b, 'bus_type', 'ml')}</span>
                  <span className="lang-hi">{getBusFieldValue(b, 'bus_type', 'hi')}</span>
                </td>
                <td>
                  <span className="lang-en">{b.destination}</span>
                  <span className="lang-ml">{getBusFieldValue(b, 'destination', 'ml')}</span>
                  <span className="lang-hi">{getBusFieldValue(b, 'destination', 'hi')}</span>
                </td>
                <td>
                  <span className="lang-en">{b.route}</span>
                  <span className="lang-ml">{getBusFieldValue(b, 'route', 'ml')}</span>
                  <span className="lang-hi">{getBusFieldValue(b, 'route', 'hi')}</span>
                </td>
                <td>DEPARTED</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderAdminControlBoard = () => (
    <div className="board-panel admin-control-panel" style={{ flex: 1 }}>
      <div className="board-title">ADMIN BUS ENTRY</div>
      <form className="manual-bus-form" onSubmit={handleManualBusSubmit}>
        <input
          className="terminal-input"
          placeholder="BUS NUMBER"
          value={manualBus.bus_number}
          onChange={(e) => setManualBus({ ...manualBus, bus_number: e.target.value })}
        />
        <input
          className="terminal-input"
          placeholder="BUS TYPE"
          value={manualBus.bus_type}
          onChange={(e) => setManualBus({ ...manualBus, bus_type: e.target.value })}
        />
        <input
          className="terminal-input"
          placeholder="ROUTE"
          value={manualBus.route}
          onChange={(e) => setManualBus({ ...manualBus, route: e.target.value })}
        />
        <input
          className="terminal-input"
          placeholder="DESTINATION"
          value={manualBus.destination}
          onChange={(e) => setManualBus({ ...manualBus, destination: e.target.value })}
        />
        <select
          className="terminal-input"
          value={manualBus.status}
          onChange={(e) => setManualBus({ ...manualBus, status: e.target.value })}
        >
          <option value="DELAYED">DELAY</option>
          <option value="ARRIVED">ARRIVED</option>
          <option value="APPROACHING">APPROACHING</option>
          <option value="NEAR">NEAR</option>
        </select>
        <button className="terminal-btn" type="submit">ADD BUS MANUALLY</button>
      </form>
      {manualBusMessage && <div className="manual-bus-message">{manualBusMessage}</div>}

      <div className="admin-bus-list">
        <table className="board-table">
          <thead>
            <tr>
              <th>BUS</th>
              <th>TYPE</th>
              <th>ROUTE</th>
              <th>DESTINATION</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {adminBoard.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-row">NO ACTIVE BUSES</td>
              </tr>
            ) : (
              adminBoard.map((bus) => (
                <tr key={`admin-${bus.id}`} className={`status-row-${bus.status}`}>
                  <td>{bus.bus_number}{bus.isManualEntry ? ' [MANUAL]' : ''}</td>
                  <td>
                    <span className="lang-en">{bus.bus_type}</span>
                    <span className="lang-ml">{getBusFieldValue(bus, 'bus_type', 'ml')}</span>
                    <span className="lang-hi">{getBusFieldValue(bus, 'bus_type', 'hi')}</span>
                  </td>
                  <td>
                    <span className="lang-en">{bus.route}</span>
                    <span className="lang-ml">{getBusFieldValue(bus, 'route', 'ml')}</span>
                    <span className="lang-hi">{getBusFieldValue(bus, 'route', 'hi')}</span>
                  </td>
                  <td>
                    <span className="lang-en">{bus.destination}</span>
                    <span className="lang-ml">{getBusFieldValue(bus, 'destination', 'ml')}</span>
                    <span className="lang-hi">{getBusFieldValue(bus, 'destination', 'hi')}</span>
                  </td>
                  <td>{bus.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        .terminal-tooltip {
            background: #000; border: 1px solid #39ff14; color: #39ff14; font-family: 'Courier Prime', monospace;
            box-shadow: 0 0 5px #39ff14; padding: 2px 5px; font-weight: bold;
        }
        .leaflet-tooltip-top:before { border-top-color: #39ff14 !important; }
      `}</style>

      {/* LOGIN VIEW */}
      {view === 'login' && (
        <div className="terminal-container">
          <div className="terminal-header">KSRTC TERMINAL OS - V 1.0</div>
          <div className="terminal-body">
            <form className="terminal-box" onSubmit={handleLogin}>
              <div>AUTH REQUIREMENT DETECTED</div>
              <input
                className="terminal-input"
                placeholder="USERNAME"
                value={username} onChange={e => setUsername(e.target.value)}
                autoFocus
              />
              <input
                className="terminal-input"
                type="password"
                placeholder="PASSWORD"
                value={password} onChange={e => setPassword(e.target.value)}
              />
              {error && <div className="error-text">{error}</div>}
              <button className="terminal-btn" type="submit">ACCESS GRANTED</button>
            </form>
          </div>
        </div>
      )}

      {/* LOCATION VIEW */}
      {view === 'location' && (
        <div className="terminal-container">
          <div className="terminal-header">SYSTEM CONFIGURATION</div>
          <div className="terminal-body">
            <form className="terminal-box" onSubmit={handleSetLocation}>
              <div>SET DEPOT LOCATION COORDINATES</div>
              <p style={{ fontSize: '12px', color: 'gray' }}>(DEFAULT ERNAKULAM KSRTC: 9.9816, 76.2999)</p>
              <input
                className="terminal-input"
                placeholder="LATITUDE"
                value={locLat} onChange={e => setLocLat(e.target.value)}
              />
              <input
                className="terminal-input"
                placeholder="LONGITUDE"
                value={locLng} onChange={e => setLocLng(e.target.value)}
              />
              <select className="terminal-input" value={mode} onChange={e => setMode(e.target.value)}>
                <option value="ADMIN">ADMIN MODE (WITH MAP)</option>
                <option value="DISPLAY">DISPLAY MODE (BOARDS ONLY)</option>
              </select>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input className="terminal-input" placeholder="APPR RADIUS (800)" value={radiusAppr} onChange={e => setRadiusAppr(e.target.value)} title="Approaching Radius" />
                <input className="terminal-input" placeholder="NEAR RADIUS (400)" value={radiusNear} onChange={e => setRadiusNear(e.target.value)} title="Near Radius" />
                <input className="terminal-input" placeholder="ARR RADIUS (100)" value={radiusArrived} onChange={e => setRadiusArrived(e.target.value)} title="Arrived Radius" />
              </div>
              {error && <div className="error-text">{error}</div>}
              <button className="terminal-btn" type="submit">INITIALISE RADAR</button>
            </form>
          </div>
        </div>
      )}

      {/* DASHBOARD VIEW */}
      {view === 'dashboard' && (
        <div className={`dashboard-layout ${mode === 'DISPLAY' ? 'display-mode' : ''}`}>
          {/* Map (Hidden in DISPLAY mode) */}
          {mode === 'ADMIN' && (
            <div className="dashboard-map" ref={mapRef}></div>
          )}

          {/* Bottom Half: Boards */}
          <div className="dashboard-boards">

            {/* ADMIN mode: show all 3 boards stacked */}
            {mode === 'ADMIN' && (
              <>
                {renderAdminControlBoard()}
                {renderArrivalBoard()}
                {renderDelayBoard()}
                {renderDepartureBoard()}
              </>
            )}

            {/* DISPLAY mode: carousel - one board at a time */}
            {mode === 'DISPLAY' && (
              <>
                {/* Tab bar */}
                <div className="carousel-tab-bar">
                  {BOARD_LABELS.map((label, i) => (
                    <span
                      key={i}
                      className={`carousel-tab ${carouselIndex === i ? 'active' : ''}`}
                      onClick={() => setCarouselIndex(i)}
                    >
                      {label}
                    </span>
                  ))}
                </div>

                {/* Show only the active board */}
                {carouselIndex === 0 && renderArrivalBoard()}
                {carouselIndex === 1 && renderDelayBoard()}
                {carouselIndex === 2 && renderDepartureBoard()}
              </>
            )}

          </div>
        </div>
      )}
    </>
  );
}
