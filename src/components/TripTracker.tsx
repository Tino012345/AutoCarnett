import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Play, Square, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// Helper to calculate distance between two coordinates in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const d = R * c; // Distance in km
  return d;
}

export default function TripTracker({ vehicleId }: { vehicleId?: string }) {
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [distance, setDistance] = useState(0);
  const [lastPosition, setLastPosition] = useState<{lat: number, lng: number} | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [startLocationName, setStartLocationName] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const startTracking = () => {
    if (!vehicleId) {
      toast.error("Veuillez sélectionner un véhicule d'abord");
      return;
    }

    if (!("geolocation" in navigator)) {
      toast.error("Géolocalisation non supportée par votre navigateur");
      return;
    }

    setIsTracking(true);
    setDistance(0);
    setStartTime(new Date());
    setLastPosition(null);
    setStartLocationName('');

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        setLastPosition(prev => {
          if (!prev) {
            // Fetch start location name on first position
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
              .then(res => res.json())
              .then(data => setStartLocationName(data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`))
              .catch(() => setStartLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`));
          } else {
            const dist = calculateDistance(prev.lat, prev.lng, latitude, longitude);
            // Only add if distance is significant (e.g., > 10 meters) to avoid GPS jitter
            if (dist > 0.01) {
              setDistance(d => d + dist);
            }
          }
          return { lat: latitude, lng: longitude };
        });
      },
      (error) => {
        console.error("Erreur de suivi GPS:", error);
        toast.error("Erreur de signal GPS");
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
    
    toast.success("Suivi de trajet démarré");
  };

  const stopTracking = async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    setIsTracking(false);
    
    if (distance > 0.1 && user && vehicleId && startTime) {
      setSaving(true);
      try {
        let endLocationName = '';
        if (lastPosition) {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lastPosition.lat}&lon=${lastPosition.lng}`);
            const data = await res.json();
            endLocationName = data.display_name || `${lastPosition.lat.toFixed(4)}, ${lastPosition.lng.toFixed(4)}`;
          } catch (e) {
            endLocationName = `${lastPosition.lat.toFixed(4)}, ${lastPosition.lng.toFixed(4)}`;
          }
        }

        const distanceKm = parseFloat(distance.toFixed(2));

        const { error } = await supabase.from('trips').insert([{
          user_id: user.id,
          vehicle_id: vehicleId,
          start_location: startLocationName,
          end_location: endLocationName,
          distance_km: distanceKm,
          start_time: startTime.toISOString(),
          end_time: new Date().toISOString(),
          status: 'completed'
        }]);

        if (error) throw error;

        // Update vehicle mileage
        const { data: vData } = await supabase.from('vehicles').select('mileage').eq('id', vehicleId).single();
        const currentMileage = vData?.mileage || 0;
        await supabase.from('vehicles').update({ mileage: currentMileage + distanceKm }).eq('id', vehicleId);

        toast.success(`Trajet enregistré : ${distanceKm} km`);
        // Dispatch custom event to notify Home page to refresh
        window.dispatchEvent(new Event('trip-completed'));
      } catch (error: any) {
        toast.error("Erreur lors de l'enregistrement du trajet");
      } finally {
        setSaving(false);
      }
    } else if (distance <= 0.1) {
      toast.info("Trajet trop court pour être enregistré");
    }
  };

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-4 shadow-2xl relative overflow-hidden">
      {isTracking && (
        <motion.div 
          className="absolute inset-0 bg-green-500/10"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isTracking ? 'bg-green-500/20 text-green-500' : 'bg-zinc-800 text-zinc-400'}`}>
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-100">Suivi de trajet</h3>
            <p className="text-sm text-zinc-400">
              {isTracking ? 'En cours...' : 'Prêt à démarrer'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{distance.toFixed(2)}</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider">km</div>
          </div>
          
          {isTracking ? (
            <Button 
              onClick={stopTracking}
              disabled={saving}
              className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white p-0 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Square className="w-5 h-5 fill-current" />}
            </Button>
          ) : (
            <Button 
              onClick={startTracking}
              className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 text-white p-0 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
            >
              <Play className="w-5 h-5 fill-current ml-1" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
