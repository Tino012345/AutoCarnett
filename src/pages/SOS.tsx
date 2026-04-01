import { useState } from 'react';
import { motion } from 'motion/react';
import { PhoneCall, MapPin, Wrench, ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function SOS() {
  const [isPulsing, setIsPulsing] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const handleSOS = () => {
    setIsPulsing(true);
    setLoadingLocation(true);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoadingLocation(false);
          toast.success("Position trouvée !", {
            description: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`,
          });
          setTimeout(() => setIsPulsing(false), 3000);
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          setLoadingLocation(false);
          setIsPulsing(false);
          toast.error("Impossible d'obtenir votre position", {
            description: "Veuillez vérifier vos permissions de localisation.",
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLoadingLocation(false);
      setIsPulsing(false);
      toast.error("Géolocalisation non supportée par votre navigateur");
    }
  };

  return (
    <div className="p-4 flex flex-col h-full bg-zinc-950 text-zinc-50 items-center">
      <div className="w-full mb-8">
        <h2 className="text-2xl font-bold text-center">Urgence SOS</h2>
        <p className="text-zinc-400 text-center text-sm mt-2">
          En cas de panne, appuyez sur le bouton pour trouver de l'aide à proximité.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full relative">
        <div className="relative flex items-center justify-center w-48 h-48 mb-6">
          {isPulsing && (
            <>
              <motion.div 
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute w-48 h-48 rounded-full bg-red-500/30"
              />
              <motion.div 
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 1, delay: 0.2, repeat: Infinity }}
                className="absolute w-48 h-48 rounded-full bg-red-500/20"
              />
            </>
          )}
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSOS}
            disabled={loadingLocation}
            className="w-48 h-48 rounded-full bg-gradient-to-b from-red-500 to-red-700 shadow-[0_0_50px_rgba(239,68,68,0.4)] flex flex-col items-center justify-center border-4 border-red-400/30 z-10 disabled:opacity-80"
          >
            {loadingLocation ? (
              <Loader2 className="w-16 h-16 text-white mb-2 animate-spin" />
            ) : (
              <ShieldAlert className="w-16 h-16 text-white mb-2" />
            )}
            <span className="text-white font-bold text-2xl tracking-widest">
              {loadingLocation ? "..." : "SOS"}
            </span>
          </motion.button>
        </div>

        {location && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mt-6"
          >
            <div className="bg-white/5 border border-white/10 backdrop-blur-md px-4 py-2 rounded-full flex items-center justify-center gap-2 text-sm text-zinc-300 mb-4 mx-auto w-max">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>Position: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
            </div>
            
            <div className="w-full h-64 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=garage+mecanicien+near+${location.lat},${location.lng}&z=14&output=embed`}
              ></iframe>
            </div>
          </motion.div>
        )}
      </div>

      <div className="w-full space-y-3 mt-8 pb-20">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Services à proximité</h3>
        
        <Card className="bg-white/5 border-white/10 backdrop-blur-md p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-zinc-300" />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-100">Garage Auto Plus</h4>
              <p className="text-xs text-zinc-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> à 2.5 km
              </p>
            </div>
          </div>
          <Button size="icon" className="bg-green-500 hover:bg-green-600 text-white rounded-full">
            <PhoneCall className="w-4 h-4" />
          </Button>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-md p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-zinc-300" />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-100">Dépannage Express</h4>
              <p className="text-xs text-zinc-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> à 4.1 km
              </p>
            </div>
          </div>
          <Button size="icon" className="bg-green-500 hover:bg-green-600 text-white rounded-full">
            <PhoneCall className="w-4 h-4" />
          </Button>
        </Card>
      </div>
    </div>
  );
}
