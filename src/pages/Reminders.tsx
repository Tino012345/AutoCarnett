import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, Calendar, Navigation, Settings, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function Reminders() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
    
    // Request notification permission
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
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
      
      if (!vData) {
        setLoading(false);
        return;
      }

      // Fetch latest maintenance records
      const { data: mData } = await supabase
        .from('maintenance')
        .select('*')
        .eq('vehicle_id', vData.id)
        .order('date', { ascending: false });

      const currentMileage = vData.mileage || 0;
      const generatedReminders = [];

      // Oil change reminder (every 10,000 km or 1 year)
      const lastOil = mData?.find(m => m.type === 'oil');
      if (lastOil) {
        const targetKm = (lastOil.mileage || 0) + 10000;
        const progress = Math.min(100, Math.max(0, ((currentMileage - (lastOil.mileage || 0)) / 10000) * 100));
        generatedReminders.push({
          title: "Vidange d'huile",
          type: "km",
          target: `${targetKm.toLocaleString()} km`,
          current: `${currentMileage.toLocaleString()} km`,
          progress: Math.round(progress),
          urgent: progress >= 90
        });
      } else {
        generatedReminders.push({
          title: "Vidange d'huile",
          type: "km",
          target: `${(currentMileage + 10000).toLocaleString()} km`,
          current: `${currentMileage.toLocaleString()} km`,
          progress: 0,
          urgent: false
        });
      }

      // Tires reminder (every 40,000 km)
      const lastTires = mData?.find(m => m.type === 'tires');
      if (lastTires) {
        const targetKm = (lastTires.mileage || 0) + 40000;
        const progress = Math.min(100, Math.max(0, ((currentMileage - (lastTires.mileage || 0)) / 40000) * 100));
        generatedReminders.push({
          title: "Changement Pneus",
          type: "km",
          target: `${targetKm.toLocaleString()} km`,
          current: `${currentMileage.toLocaleString()} km`,
          progress: Math.round(progress),
          urgent: progress >= 90
        });
      }

      // Inspection reminder (every 1 year)
      const lastInspection = mData?.find(m => m.type === 'inspection');
      const targetDate = lastInspection ? new Date(lastInspection.date) : new Date();
      targetDate.setFullYear(targetDate.getFullYear() + 1);
      
      const now = new Date();
      const totalDays = 365;
      const daysPassed = Math.floor((now.getTime() - (lastInspection ? new Date(lastInspection.date).getTime() : now.getTime())) / (1000 * 3600 * 24));
      const progressDate = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
      
      const daysLeft = Math.floor((targetDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

      generatedReminders.push({
        title: "Visite Technique",
        type: "date",
        target: targetDate.toLocaleDateString(),
        current: daysLeft > 0 ? `Dans ${daysLeft} jours` : `En retard de ${Math.abs(daysLeft)} jours`,
        progress: Math.round(progressDate),
        urgent: progressDate >= 90 || daysLeft <= 30
      });

      const sortedReminders = generatedReminders.sort((a, b) => b.progress - a.progress);
      setReminders(sortedReminders);

      // Trigger push notification for urgent reminders
      const urgentCount = sortedReminders.filter(r => r.urgent).length;
      if (urgentCount > 0 && "Notification" in window && Notification.permission === "granted") {
        new Notification("AutoCarnet - Rappel Urgent", {
          body: `Vous avez ${urgentCount} rappel(s) urgent(s) à vérifier !`,
          icon: '/vite.svg'
        });
      }

    } catch (error) {
      console.error("Error fetching reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 flex flex-col h-full bg-zinc-950 text-zinc-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Rappels</h2>
        <Button variant="outline" size="icon" className="border-white/10 bg-white/5 backdrop-blur-md text-zinc-300 hover:bg-white/10">
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-4 overflow-y-auto pb-20">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : reminders.length === 0 ? (
          <div className="text-center p-8 text-zinc-500">
            Aucun véhicule trouvé pour générer des rappels.
          </div>
        ) : (
          reminders.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-md p-4 relative overflow-hidden shadow-lg">
                <div className="flex items-start mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 shrink-0 ${item.urgent ? 'bg-red-500/10' : 'bg-orange-500/10'}`}>
                    <Bell className={`w-5 h-5 ${item.urgent ? 'text-red-500' : 'text-orange-500'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-zinc-100">{item.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-zinc-400 mt-1">
                      {item.type === 'km' ? <Navigation className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                      <span>Objectif: {item.target}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Actuel: {item.current}</span>
                    <span className={item.urgent ? "text-red-500 font-medium" : "text-orange-500 font-medium"}>
                      {item.progress}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${item.urgent ? 'bg-red-500' : 'bg-orange-500'}`} 
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
