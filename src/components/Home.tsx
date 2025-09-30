// components/Home.tsx — FULL WITH ENHANCED BUDGET SLIDER + SMART RECOMMENDATIONS DESIGN
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { APIProvider, Map, useMap, Marker } from '@vis.gl/react-google-maps';
import { Coordinates } from '../types/environmental';

type Unit = 'm²' | 'sqft';
type Mode = 'Manual' | 'Map';
type DrawingPhase = 'idle' | 'rooftop' | 'property' | 'complete';

interface HomeProps {
  onCalculate: (data: {
    location: Coordinates;
    rooftopArea: number;
    openSpaceArea: number;
    budget: number;
  }) => void;
}

interface IconProps {
  name: string;
  className?: string;
}
const Icon: React.FC<IconProps> = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

/* =========================
   Budget Slider (Enhanced)
   ========================= */
interface BudgetSliderProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  steps?: number[];
  className?: string;
}
const formatBudget = (v: number) => {
  if (v >= 100000) return `₹${(v / 100000).toFixed(v % 100000 === 0 ? 0 : 1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  return `₹${v}`;
};
const parseBudgetInput = (raw: string): number | null => {
  const s = raw.trim().toLowerCase().replace(/[,₹\s]/g, '');
  if (!s) return null;
  const mK = s.match(/^(\d+(\.\d+)?)k$/);
  const mL = s.match(/^(\d+(\.\d+)?)l$/);
  const mNum = s.match(/^(\d+(\.\d+)?)$/);
  if (mK) return Math.round(parseFloat(mK[1]) * 1000);
  if (mL) return Math.round(parseFloat(mL[1]) * 100000);
  if (mNum) return Math.round(parseFloat(mNum[1]));
  return null;
};
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const BudgetSlider: React.FC<BudgetSliderProps> = ({
  value,
  onChange,
  min = 10000,
  max = 200000,
  steps = [10000, 25000, 50000, 75000, 100000, 150000, 200000],
  className = '',
}) => {
  const [text, setText] = useState(formatBudget(value));
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!dragging) setText(formatBudget(value));
  }, [value, dragging]);

  const percent = ((value - min) / (max - min)) * 100;

  const snap = (v: number) => {
    const range = max - min;
    let best = v;
    let diff = Infinity;
    for (const s of steps) {
      const d = Math.abs(s - v);
      if (d < diff) {
        diff = d;
        best = s;
      }
    }
    return diff <= Math.max(0.025 * range, 3000) ? best : v;
  };

  const handleRange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = clamp(Number(e.target.value), min, max);
    setDragging(true);
    onChange(snap(raw));
  };
  const handleRangeEnd = () => {
    setDragging(false);
    setText(formatBudget(value));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    const parsed = parseBudgetInput(e.target.value);
    if (parsed != null) onChange(clamp(parsed, min, max));
  };
  const handleTextBlur = () => {
    const parsed = parseBudgetInput(text);
    setText(formatBudget(clamp(parsed ?? value, min, max)));
  };

  const ticks = steps
    .filter(s => s >= min && s <= max)
    .map(s => ({ val: s, left: ((s - min) / (max - min)) * 100, label: formatBudget(s) }));

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <label className="text-slate-100 font-semibold text-lg">Your budget</label>
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          onFocus={e => e.currentTarget.select()}
          className="bg-gradient-to-r from-teal-400 to-cyan-400 text-black px-4 py-1.5 rounded-full font-bold text-sm w-28 text-center shadow outline-none focus:ring-2 focus:ring-cyan-400/50"
          aria-label="Budget amount"
        />
      </div>

      <div className="relative pt-6 pb-6">
        {/* Native range input (now visible for interaction) */}
        <input
          type="range"
          min={min}
          max={max}
          step={1000}
          value={value}
          onChange={handleRange}
          onMouseUp={handleRangeEnd}
          onTouchEnd={handleRangeEnd}
          className="w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, #2dd4bf 0%, #06b6d4 ${percent}%, #06b6d4 ${percent}%, #06b6d4 ${percent}%, #06b6d4 ${percent}%, #06b6d4 ${percent}%, #2dd4bf 100%)`,
          }}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />

        {/* Custom slider styling */}
        <style dangerouslySetInnerHTML={{
          __html: `
            input[type="range"].slider-thumb::-webkit-slider-thumb {
              appearance: none;
              height: 28px;
              width: 28px;
              border-radius: 50%;
              background: white;
              border: 2px solid #e2e8f0;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              cursor: pointer;
              position: relative;
              z-index: 10;
            }

            input[type="range"].slider-thumb::-webkit-slider-thumb:hover {
              box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.15);
              transform: scale(1.05);
            }

            input[type="range"].slider-thumb::-webkit-slider-track {
              height: 8px;
              border-radius: 4px;
              background: #374151;
              border: none;
            }

            input[type="range"].slider-thumb::-moz-range-thumb {
              height: 28px;
              width: 28px;
              border-radius: 50%;
              background: white;
              border: 2px solid #e2e8f0;
              cursor: pointer;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }

            input[type="range"].slider-thumb::-moz-range-track {
              height: 8px;
              border-radius: 4px;
              background: #374151;
              border: none;
            }
          `
        }} />

        {/* Thumb + bubble */}
        <div className="absolute -top-4" style={{ left: `calc(${percent}% - 14px)` }} aria-hidden>
          <div className="w-7 h-7 rounded-full bg-white shadow-lg flex items-center justify-center border border-slate-200">
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-teal-400 to-blue-500" />
          </div>
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <div className="px-2 py-1 rounded-md text-xs font-semibold text-white bg-slate-900/90 border border-slate-700 shadow">
              {formatBudget(value)}
            </div>
            <div className="mx-auto w-2 h-2 rotate-45 -mt-1 bg-slate-900/90 border-r border-b border-slate-700" />
          </div>
        </div>

        {/* Ticks */}
        <div className="absolute left-0 right-0 -bottom-1.5">
          <div className="relative h-6">
            {ticks.map(t => (
              <div key={t.val} className="absolute -translate-x-1/2" style={{ left: `${t.left}%` }}>
                <div className="w-px h-3 bg-slate-600 mx-auto" />
                <div className="text-[10px] text-slate-400 mt-1 text-center">{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
        <p className="text-sm text-blue-300">
          Type values like <span className="font-semibold text-blue-200">75k</span> or <span className="font-semibold text-blue-200">1.5L</span>, or drag to snap at recommended points.
        </p>
      </div>
    </div>
  );
};

/* =========================
   Unit Toggle
   ========================= */
interface UnitToggleProps {
  activeUnit: Unit;
  onUnitChange: (unit: Unit) => void;
}
const UnitToggle: React.FC<UnitToggleProps> = ({ activeUnit, onUnitChange }) => (
  <div className="flex bg-slate-800/70 border border-slate-700/60 rounded-lg m-1 p-0.5">
    {(['m²', 'sqft'] as Unit[]).map(u => (
      <button
        key={u}
        onClick={() => onUnitChange(u)}
        className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
          activeUnit === u ? 'bg-teal-400 text-black shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
        }`}
      >
        {u}
      </button>
    ))}
  </div>
);

/* =========================
   Map helpers and drawing
   ========================= */
interface EnhancedAreaDisplayProps {
  rooftopArea: number;
  propertyArea: number;
  openSpaceArea: number;
  unit: Unit;
  phase: DrawingPhase;
}
const EnhancedAreaDisplay: React.FC<EnhancedAreaDisplayProps> = ({
  rooftopArea,
  propertyArea,
  openSpaceArea,
  unit,
  phase,
}) => {
  const fmt = (m2: number) => (unit === 'sqft' ? `${Math.round(m2 * 10.764).toLocaleString()} sqft` : `${Math.round(m2).toLocaleString()} m²`);
  if (rooftopArea === 0 && propertyArea === 0) return null;
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
      <div className="bg-slate-900/85 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-teal-400/30 min-w-64 shadow-2xl">
        <div className="text-sm space-y-1">
          {rooftopArea > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-teal-300">🏠 Rooftop:</span>
              <span className="text-teal-300 font-semibold">{fmt(rooftopArea)}</span>
            </div>
          )}
          {propertyArea > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-amber-300">📐 Property:</span>
              <span className="text-amber-300 font-semibold">{fmt(propertyArea)}</span>
            </div>
          )}
          {openSpaceArea > 0 && (
            <div className="flex justify-between items-center border-t border-slate-600 pt-1 mt-1">
              <span className="text-green-300">🌿 Open Space:</span>
              <span className="text-green-300 font-semibold">{fmt(openSpaceArea)}</span>
            </div>
          )}
        </div>
        <div className="text-xs text-slate-400 mt-2 text-center">
          Phase: {phase === 'idle' ? 'Ready' : phase === 'rooftop' ? 'Draw Rooftop' : phase === 'property' ? 'Draw Property' : 'Complete'}
        </div>
      </div>
    </div>
  );
};

const MapController: React.FC<{ location: { lat: number; lng: number } | null }> = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (map && location) {
      map.setCenter(location);
      map.setZoom(18);
    }
  }, [map, location]);
  return null;
};

const EnhancedDrawingManager: React.FC<{
  onAreaChange: (rooftopArea: number, openSpaceArea: number) => void;
  phase: DrawingPhase;
  onPhaseChange: (p: DrawingPhase) => void;
}> = ({ onAreaChange, phase, onPhaseChange }) => {
  const map = useMap();
  const [rooftop, setRooftop] = useState<google.maps.Polygon | null>(null);
  const [property, setProperty] = useState<google.maps.Polygon | null>(null);

  const updateAreas = useCallback(() => {
    const r = rooftop ? google.maps.geometry.spherical.computeArea(rooftop.getPath()) : 0;
    const p = property ? google.maps.geometry.spherical.computeArea(property.getPath()) : 0;

    if (!rooftop && !property) {
      onAreaChange(0, 0);
      return;
    }

    if (!rooftop || !property) {
      // If only one polygon exists, use it directly
      onAreaChange(r, p);
      return;
    }

    // Both polygons exist - calculate open space properly
    // For better accuracy, use the property area minus rooftop area
    // but ensure we don't get negative values due to geometric precision issues
    const openSpace = Math.max(0, p - r);
    onAreaChange(r, openSpace);
  }, [rooftop, property, onAreaChange]);

  useEffect(() => {
    if (!map || !window.google || phase === 'idle' || phase === 'complete') {
      console.log('Drawing manager not initialized:', { map: !!map, google: !!window.google, phase });
      return;
    }

    console.log('Initializing drawing manager for phase:', phase);
    const polygonStyle =
      phase === 'rooftop'
        ? { fillColor: '#2dd4bf', fillOpacity: 0.35, strokeWeight: 3, strokeColor: '#2dd4bf' }
        : { fillColor: '#f59e0b', fillOpacity: 0.25, strokeWeight: 2, strokeColor: '#f59e0b' };

    const mgr = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: { position: google.maps.ControlPosition.TOP_RIGHT, drawingModes: [google.maps.drawing.OverlayType.POLYGON] },
      polygonOptions: { ...polygonStyle, editable: true, draggable: false },
    });
    mgr.setMap(map);

    google.maps.event.addListener(mgr, 'polygoncomplete', (poly: google.maps.Polygon) => {
      console.log('Polygon completed:', { phase, polygonArea: google.maps.geometry.spherical.computeArea(poly.getPath()) });
      if (phase === 'rooftop') {
        rooftop?.setMap(null);
        setRooftop(poly);
        onPhaseChange('property');
      } else if (phase === 'property') {
        property?.setMap(null);
        setProperty(poly);
        onPhaseChange('complete');
      }
      mgr.setDrawingMode(null);
      const path = poly.getPath();
      google.maps.event.addListener(path, 'set_at', updateAreas);
      google.maps.event.addListener(path, 'insert_at', updateAreas);
    });

    return () => {
      console.log('Cleaning up drawing manager');
      mgr.setMap(null);
    };
  }, [map, phase, rooftop, property, onPhaseChange, updateAreas]);

  useEffect(() => {
    updateAreas();
  }, [updateAreas]);

  return null;
};

const SearchBox: React.FC<{ onPlaceSelect: (place: google.maps.places.PlaceResult) => void }> = ({ onPlaceSelect }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sb, setSb] = useState<google.maps.places.SearchBox | null>(null);

  useEffect(() => {
    if (!window.google || !inputRef.current) return;
    setSb(new google.maps.places.SearchBox(inputRef.current));
  }, []);

  useEffect(() => {
    if (!sb) return;
    const listener = sb.addListener('places_changed', () => {
      const places = sb.getPlaces();
      if (places && places.length > 0) onPlaceSelect(places[0]);
    });
    return () => google.maps.event.removeListener(listener);
  }, [sb, onPlaceSelect]);

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search for a location"
        className="w-full px-4 py-3 bg-white/95 text-black rounded-xl shadow-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-600"
      />
    </div>
  );
};

interface MapViewProps {
  onAreaChange: (rooftopArea: number, openSpaceArea: number) => void;
}
const EnhancedMapView: React.FC<
  MapViewProps & {
    userLocation: { lat: number; lng: number } | null;
    getCurrentLocation: () => void;
    onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  }
> = ({ onAreaChange, userLocation, getCurrentLocation, onPlaceSelect }) => {
  const [rooftopArea, setRooftopArea] = useState(0);
  const [propertyArea, setPropertyArea] = useState(0);
  const [openSpaceArea, setOpenSpaceArea] = useState(0);
  const [phase, setPhase] = useState<DrawingPhase>('idle');
  const [isFull, setIsFull] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const handleAreaChange = useCallback(
    (r: number, o: number) => {
      console.log('Area change:', { rooftop: r, openSpace: o, property: r + o });
      setRooftopArea(r);
      setOpenSpaceArea(o);
      setPropertyArea(r + o);
      onAreaChange(r, o);
    },
    [onAreaChange]
  );

  const start = useCallback(() => setPhase('rooftop'), []);
  const reset = useCallback(() => {
    setPhase('idle');
    setRooftopArea(0);
    setPropertyArea(0);
    setOpenSpaceArea(0);
    onAreaChange(0, 0);
  }, [onAreaChange]);

  const toggleFull = useCallback(() => {
    if (!wrapRef.current) return;
    if (!document.fullscreenElement) wrapRef.current.requestFullscreen().catch(() => {});
    else document.exitFullscreen();
  }, []);

  useEffect(() => {
    const onChange = () => setIsFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const mapCenter = { lat: 40.7128, lng: -74.006 };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-5 shadow-2xl">
        <h3 className="font-bold text-blue-400 mb-3 flex items-center">
          <Icon name="auto_awesome" className="mr-2 text-lg" />
          Smart Property Analysis
        </h3>
        {phase === 'idle' && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-slate-300">
              Draw the <span className="text-teal-300 font-semibold">rooftop</span> first, then the <span className="text-amber-300 font-semibold">property boundary</span>.
            </p>
            <button
              onClick={start}
              className="bg-gradient-to-r from-teal-400 to-cyan-400 text-black px-4 py-2 rounded-xl font-semibold hover:from-teal-500 hover:to-cyan-500 transition-colors shadow"
            >
              Start Smart Analysis
            </button>
          </div>
        )}
        {phase === 'rooftop' && (
          <div className="text-sm text-teal-300">
            Step 1: Draw rooftop polygon. Click to add points, click first point to finish.
          </div>
        )}
        {phase === 'property' && (
          <div className="text-sm text-amber-300">Step 2: Draw property boundary to compute open space.</div>
        )}
        {phase === 'complete' && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-300">✅ Analysis complete. Areas calculated.</p>
            <button onClick={reset} className="text-xs text-slate-300 hover:text-white underline">
              Start over
            </button>
          </div>
        )}
      </div>

      <div ref={wrapRef} className={`relative w-full h-80 rounded-2xl overflow-hidden bg-slate-900 ${isFull ? 'fixed inset-0 z-50 !rounded-none' : ''}`}>
        <Map
          mapId="aquaplan-enhanced-map"
          style={{ width: '100%', height: '100%' }}
          defaultCenter={mapCenter}
          defaultZoom={18}
          mapTypeId="satellite"
          gestureHandling="greedy"
          disableDefaultUI={false}
          zoomControl
          streetViewControl={false}
          fullscreenControl={false}
        >
          <EnhancedDrawingManager onAreaChange={handleAreaChange} phase={phase} onPhaseChange={setPhase} />
          <MapController location={userLocation} />
          {userLocation && <Marker position={userLocation} />}
        </Map>

        <div className="hidden md:block absolute top-4 left-1/2 -translate-x-1/2 z-10 w-3/4 max-w-md">
          <SearchBox
            onPlaceSelect={place => {
              if (!place.geometry || !place.geometry.location) return;
              const evt = new CustomEvent('maps-place-selected', { detail: place });
              window.dispatchEvent(evt);
            }}
          />
        </div>

        <div className="absolute bottom-4 left-4 z-10 flex flex-col space-y-2 md:top-4 md:bottom-auto">
          <button
            onClick={getCurrentLocation}
            className="p-3 bg-slate-900/80 backdrop-blur-sm rounded-xl text-white hover:bg-slate-900/95 transition-colors shadow"
            title="Use current location"
          >
            <Icon name="my_location" className="text-xl" />
          </button>
          {phase !== 'idle' && (
            <button
              onClick={reset}
              className="p-3 bg-red-500/80 backdrop-blur-sm rounded-xl text-white hover:bg-red-500/90 transition-colors shadow"
              title="Reset drawing"
            >
              <Icon name="refresh" className="text-xl" />
            </button>
          )}
          <button
            onClick={toggleFull}
            className="p-3 bg-slate-900/80 backdrop-blur-sm rounded-xl text-white hover:bg-slate-900/95 transition-colors shadow"
            title={isFull ? 'Exit fullscreen' : 'Fullscreen'}
          >
            <Icon name={isFull ? 'fullscreen_exit' : 'fullscreen'} className="text-xl" />
          </button>
        </div>

        <EnhancedAreaDisplay rooftopArea={rooftopArea} propertyArea={propertyArea} openSpaceArea={openSpaceArea} unit="m²" phase={phase} />
      </div>
    </div>
  );
};

/* =========================
   Main Home Component
   ========================= */
const Home: React.FC<HomeProps> = ({ onCalculate }) => {
  const [mode, setMode] = useState<Mode>('Manual');
  const [rooftopArea, setRooftopArea] = useState('');
  const [openSpaceArea, setOpenSpaceArea] = useState('');
  const [rooftopUnit, setRooftopUnit] = useState<Unit>('m²');
  const [openSpaceUnit, setOpenSpaceUnit] = useState<Unit>('m²');
  const [budget, setBudget] = useState<number>(50000);

  const [mapRooftopArea, setMapRooftopArea] = useState(0);
  const [mapOpenSpaceArea, setMapOpenSpaceArea] = useState(0);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [formattedLocation, setFormattedLocation] = useState('N/A');

  const handleMapAreaChange = useCallback((r: number, o: number) => {
    setMapRooftopArea(r);
    setMapOpenSpaceArea(o);
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      const place = e.detail as google.maps.places.PlaceResult;
      if (place.geometry && place.geometry.location) {
        const loc = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
        setUserLocation(loc);
        setFormattedLocation(place.formatted_address || place.name || 'Selected Location');
      }
    };
    window.addEventListener('maps-place-selected', handler as any);
    return () => window.removeEventListener('maps-place-selected', handler as any);
  }, []);

  const handlePlaceSelect = useCallback((place: google.maps.places.PlaceResult) => {
    if (place.geometry && place.geometry.location) {
      const loc = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
      setUserLocation(loc);
      setFormattedLocation(place.formatted_address || place.name || 'Selected Location');
    }
  }, []);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported. Using default.');
      setUserLocation({ lat: 28.6139, lng: 77.209 });
      setFormattedLocation('Delhi, India (Default)');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: new google.maps.LatLng(loc.lat, loc.lng) }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const comps = results[0].address_components;
            const city = comps.find(c => c.types.includes('locality'))?.long_name;
            const state = comps.find(c => c.types.includes('administrative_area_level_1'))?.long_name;
            setFormattedLocation(city && state ? `${city}, ${state}` : results[0].formatted_address || 'Selected Location');
          }
        });
      },
      () => {
        alert('Location blocked. Using default.');
        setUserLocation({ lat: 28.6139, lng: 77.209 });
        setFormattedLocation('Delhi, India (Default)');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const convertAreaToM2 = useCallback((val: string, unit: Unit) => {
    const n = parseFloat(val) || 0;
    return unit === 'sqft' ? n / 10.764 : n;
  }, []);

  const handleCalculate = useCallback(() => {
    if (mode === 'Manual') {
      if (!rooftopArea || parseFloat(rooftopArea) <= 0) return alert('Please enter a valid rooftop area');
      if (!openSpaceArea || parseFloat(openSpaceArea) <= 0) return alert('Please enter a valid open space area');
    } else {
      if (mapRooftopArea <= 0) return alert('Complete smart analysis (draw rooftop and property).');
      if (mapOpenSpaceArea <= 0 && (!openSpaceArea || parseFloat(openSpaceArea) <= 0))
        return alert('Complete smart analysis or enter open space manually.');
    }
    if (!userLocation) return alert('Please select a location or enable location services');
    if (!budget || budget < 10000) return alert('Set a budget of at least ₹10,000');

    const finalRooftop = mode === 'Manual' ? convertAreaToM2(rooftopArea, rooftopUnit) : mapRooftopArea;
    const finalOpen =
      mode === 'Manual'
        ? convertAreaToM2(openSpaceArea, openSpaceUnit)
        : mapOpenSpaceArea > 0
        ? mapOpenSpaceArea
        : convertAreaToM2(openSpaceArea, openSpaceUnit);

    onCalculate({
      location: { lat: userLocation.lat, lng: userLocation.lng },
      rooftopArea: finalRooftop,
      openSpaceArea: finalOpen,
      budget,
    });
  }, [
    mode,
    rooftopArea,
    rooftopUnit,
    openSpaceArea,
    openSpaceUnit,
    mapRooftopArea,
    mapOpenSpaceArea,
    userLocation,
    budget,
    convertAreaToM2,
    onCalculate,
  ]);

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={['drawing', 'geometry', 'places']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 font-inter text-white">
        <header className="sticky top-0 bg-slate-900/95 backdrop-blur-lg z-30 border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                  <Icon name="water_drop" className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold">JalNiti</h1>
                  <p className="text-xs text-slate-400 hidden sm:block">Smart Water Solutions</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg border border-green-500/30 text-xs hidden sm:flex items-center">
                  <Icon name="check_circle" className="text-sm mr-1" />
                  Ready
                </div>
                <div className="bg-purple-500/20 text-purple-400 px-3 py-1.5 rounded-lg border border-purple-500/30 text-xs hidden sm:flex items-center">
                  <Icon name="psychology" className="text-sm mr-1" />
                  AI Powered
                </div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 pb-10">
          <div className="max-w-6xl mx-auto py-6 sm:py-8 lg:py-12">
            <section className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full mb-4">
                <Icon name="map" className="text-blue-400 text-sm" />
                <span className="text-blue-400 text-sm font-medium">Location-Aware Planning</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-3">
                Plan Rooftop Rainwater
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">
                  In Minutes
                </span>
              </h2>
              <p className="text-slate-300 text-lg max-w-3xl mx-auto">
                Choose manual inputs or use smart map analysis to auto-calculate areas with budget-optimized recommendations.
              </p>
            </section>

            <section className="mb-6">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-1.5 flex shadow-xl">
                {(['Manual', 'Map'] as Mode[]).map(opt => (
                  <button
                    key={opt}
                    onClick={() => setMode(opt)}
                    className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                      mode === opt ? 'bg-gradient-to-r from-teal-400 to-cyan-400 text-black shadow' : 'text-slate-200 hover:bg-slate-700/50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </section>

            {mode === 'Manual' ? (
              <section className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl">
                <div className="mb-8">
                  <label htmlFor="rooftopArea" className="block text-slate-100 font-semibold mb-3 text-lg">
                    Rooftop area
                  </label>
                  <div className="flex items-center bg-slate-900/50 border border-slate-700/60 rounded-2xl">
                    <input
                      id="rooftopArea"
                      type="number"
                      placeholder="e.g., 100"
                      value={rooftopArea}
                      onChange={e => setRooftopArea(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none px-4 py-4 text-white placeholder-slate-400 text-lg rounded-l-2xl focus:ring-0"
                    />
                    <UnitToggle activeUnit={rooftopUnit} onUnitChange={setRooftopUnit} />
                  </div>
                  <p className="text-slate-400 text-sm mt-2 ml-1">Enter the total roof area.</p>
                </div>

                <div className="mb-8">
                  <label className="block text-slate-100 font-semibold mb-3 text-lg">Location</label>
                  <div className="flex items-center bg-slate-900/50 border border-slate-700/60 rounded-2xl">
                    <input
                      type="text"
                      readOnly
                      value={formattedLocation}
                      className="flex-1 bg-transparent border-none outline-none px-4 py-4 text-white placeholder-slate-400 text-lg rounded-l-2xl focus:ring-0"
                    />
                    <button
                      onClick={getCurrentLocation}
                      className="p-3 bg-slate-800 rounded-r-2xl text-white hover:bg-slate-700 transition-colors"
                      title="Use current location"
                    >
                      <Icon name="my_location" className="text-xl" />
                    </button>
                  </div>
                </div>

                <div className="mb-8">
                  <label htmlFor="openSpaceArea" className="block text-slate-100 font-semibold mb-3 text-lg">
                    Open space area
                  </label>
                  <div className="flex items-center bg-slate-900/50 border border-slate-700/60 rounded-2xl">
                    <input
                      id="openSpaceArea"
                      type="number"
                      placeholder="e.g., 50"
                      value={openSpaceArea}
                      onChange={e => setOpenSpaceArea(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none px-4 py-4 text-white placeholder-slate-400 text-lg rounded-l-2xl focus:ring-0"
                    />
                    <UnitToggle activeUnit={openSpaceUnit} onUnitChange={setOpenSpaceUnit} />
                  </div>
                  <p className="text-slate-400 text-sm mt-2 ml-1">Paved areas, patios, etc.</p>
                </div>

                {/* New Budget Slider */}
                <BudgetSlider value={budget} onChange={setBudget} />

                <button
                  onClick={handleCalculate}
                  disabled={!rooftopArea || !openSpaceArea || !userLocation || budget < 10000}
                  className={`w-full mt-6 py-4 rounded-2xl font-bold text-lg transition-all ${
                    !rooftopArea || !openSpaceArea || !userLocation || budget < 10000
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-teal-400 via-blue-500 to-purple-400 text-black hover:from-teal-500 hover:via-blue-600 hover:to-purple-500 shadow-2xl'
                  }`}
                >
                  {budget < 10000 ? 'Set Budget ≥ ₹10,000' : 'Calculate with Budget Analysis'}
                </button>
              </section>
            ) : (
              <section className="space-y-6">
                <div className="md:hidden mb-4">
                  <SearchBox onPlaceSelect={handlePlaceSelect} />
                </div>

                <EnhancedMapView
                  onAreaChange={handleMapAreaChange}
                  userLocation={userLocation}
                  getCurrentLocation={getCurrentLocation}
                  onPlaceSelect={handlePlaceSelect}
                />

                {(mapRooftopArea > 0 || mapOpenSpaceArea > 0) && (
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
                    <h3 className="text-lg font-semibold text-teal-300 mb-3 flex items-center">
                      <Icon name="analytics" className="mr-2" />
                      Smart Analysis Results
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                      <div>
                        <div className="text-slate-400">Rooftop Area</div>
                        <div className="text-teal-300 font-semibold">{Math.round(mapRooftopArea)} m²</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Property Area</div>
                        <div className="text-amber-300 font-semibold">{Math.round(mapRooftopArea + mapOpenSpaceArea)} m²</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Open Space</div>
                        <div className="text-green-300 font-semibold">{Math.round(mapOpenSpaceArea)} m²</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* New Budget Slider for Map mode */}
                <BudgetSlider value={budget} onChange={setBudget} />

                <button
                  onClick={() => {
                    console.log('Button clicked. Debug info:', {
                      mapRooftopArea,
                      mapOpenSpaceArea,
                      openSpaceArea,
                      userLocation,
                      budget,
                      conditions: {
                        rooftopZero: mapRooftopArea === 0,
                        openSpaceZero: mapOpenSpaceArea === 0 && !openSpaceArea,
                        noLocation: !userLocation,
                        budgetLow: budget < 10000
                      }
                    });
                    handleCalculate();
                  }}
                  disabled={mapRooftopArea === 0 || (mapOpenSpaceArea === 0 && !openSpaceArea) || !userLocation || budget < 10000}
                  className={`w-full mt-2 py-4 rounded-2xl font-bold text-lg transition-all ${
                    mapRooftopArea === 0 || (mapOpenSpaceArea === 0 && !openSpaceArea) || !userLocation || budget < 10000
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-teal-400 via-blue-500 to-purple-400 text-black hover:from-teal-500 hover:via-blue-600 hover:to-purple-500 shadow-2xl'
                  }`}
                >
                  {mapRooftopArea === 0
                    ? 'Complete Smart Analysis'
                    : budget < 10000
                    ? 'Set Budget ≥ ₹10,000'
                    : mapOpenSpaceArea > 0
                    ? `Calculate with Smart Analysis (${formatBudget(budget)})`
                    : `Calculate with Budget (${formatBudget(budget)})`}
                </button>
              </section>
            )}
          </div>
        </main>
      </div>
    </APIProvider>
  );
};

export default Home;
