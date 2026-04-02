import { useEffect, useState } from 'react';
import CarModel from '@/components/3d/CarModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Navigation, Settings, Car, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import TripTracker from '@/components/TripTracker';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [hasProblems, setHasProblems] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
    
    const handleTripCompleted = () => {
      fetchData();
    };
    
    window.addEventListener('trip-completed', handleTripCompleted);
    return () => window.removeEventListener('trip-completed', handleTripCompleted);
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch primary vehicle
      const { data: vData } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (vData) {
        setVehicle(vData);
      }

      // Fetch recent maintenance
      const { data: mData } = await supabase
        .from('maintenance')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(3);

      // Fetch recent expenses
      const { data: eData } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(3);

      // Fetch recent trips
      const { data: tData } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch recent problems
      const { data: pData } = await supabase
        .from('problems')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);

      const hasUnresolvedProblems = pData?.some(p => p.status === 'unresolved') || false;

      const combined = [
        ...(mData || []).map(m => ({ ...m, activityType: 'maintenance', title: getMaintenanceName(m.type), amount: `${m.cost} FCFA`, amount_val: m.cost })),
        ...(eData || []).map(e => ({ ...e, activityType: 'expense', title: e.description || getExpenseName(e.category), amount: `${e.amount} FCFA`, amount_val: e.amount })),
        ...(tData || []).map(t => ({ ...t, activityType: 'trip', title: 'Trajet', date: t.start_time, amount: `${t.distance_km} km`, amount_val: 0 })),
        ...(pData || []).map(p => ({ ...p, activityType: 'problem', title: p.title, amount: p.status === 'fixed' ? 'Résolu' : 'En cours', amount_val: 0 }))
      ];

      combined.sort((a, b) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime());
      setRecentActivity(combined.slice(0, 4));
      
      // We can store hasUnresolvedProblems in state if we want to pass it to CarModel
      setHasProblems(hasUnresolvedProblems);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMaintenanceName = (type: string) => {
    const types: Record<string, string> = {
      'oil': "Vidange d'huile",
      'brakes': "Freins",
      'tires': "Pneus",
      'inspection': "Révision Générale",
      'repair': "Réparation"
    };
    return types[type] || type;
  };

  const getExpenseName = (category: string) => {
    const categories: Record<string, string> = {
      'fuel': "Carburant",
      'maintenance': "Entretien",
      'insurance': "Assurance",
      'toll': "Péage",
      'other': "Autre"
    };
    return categories[category] || category;
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-4 gap-4 overflow-y-auto pb-20">
      {/* 3D Dashboard Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-64 shrink-0 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden"
      >
        {vehicle ? (
          <>
            <div className="absolute top-4 left-4 z-10">
              <h2 className="text-xl font-bold text-zinc-100">{vehicle.make} {vehicle.model}</h2>
              <p className="text-zinc-400 text-sm">{vehicle.year} • {vehicle.type === 'car' ? 'Voiture' : vehicle.type === 'motorcycle' ? 'Moto' : vehicle.type}</p>
            </div>
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-semibold border border-green-500/30">
                En ligne
              </div>
            </div>
            
            <div className="w-full h-full flex items-center justify-center">
              <CarModel isProblem={hasProblems} vehicleType={vehicle?.type + ' ' + vehicle?.make + ' ' + vehicle?.model} />
            </div>
          </>
        ) : !loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Car className="w-12 h-12 text-zinc-600 mb-4" />
            <h3 className="text-lg font-bold text-zinc-200 mb-2">Aucun véhicule</h3>
            <p className="text-sm text-zinc-400 mb-4">Ajoutez un véhicule pour commencer à utiliser AutoCarnet.</p>
            <Link to="/vehicles" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-medium text-sm">
              Ajouter un véhicule
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        )}
      </motion.div>

      {/* Trip Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <TripTracker vehicleId={vehicle?.id} />
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-none bg-transparent shadow-none">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-orange-500" />
                Kilométrage
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-zinc-100">{vehicle?.mileage || 0} <span className="text-sm font-normal text-zinc-500">km</span></div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-none bg-transparent shadow-none">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-500" />
                Dépenses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-zinc-100">
                {recentActivity.filter(a => a.activityType === 'expense').reduce((sum, a) => sum + a.amount_val, 0) || 0}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-zinc-100 mb-3 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Activité Récente
        </h3>
        <div className="space-y-3">
          {recentActivity.length > 0 ? (
            recentActivity.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
                <div>
                  <p className="font-medium text-zinc-200">{item.title}</p>
                  <p className="text-xs text-zinc-500">{new Date(item.date || item.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-sm font-semibold text-orange-500">{item.amount}</div>
              </div>
            ))
          ) : (
            <div className="text-center p-4 text-zinc-500 text-sm">
              Aucune activité récente
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
