import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Car, Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Vehicles() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [type, setType] = useState('car');
  const [mileage, setMileage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchVehicles();
    }
  }, [user]);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setVehicles(data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des véhicules");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('vehicles')
        .insert([
          { user_id: user.id, make, model, year: parseInt(year), type, mileage: parseInt(mileage) || 0 }
        ]);
        
      if (error) throw error;
      
      toast.success("Véhicule ajouté !");
      setIsDialogOpen(false);
      setMake('');
      setModel('');
      setYear('');
      setType('car');
      setMileage('');
      fetchVehicles();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'ajout");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      toast.success("Véhicule supprimé");
      fetchVehicles();
    } catch (error: any) {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="p-4 flex flex-col h-full bg-zinc-950 text-zinc-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Mes Véhicules</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-10 h-10 p-0 shadow-lg shadow-orange-500/20"><Plus className="w-5 h-5" /></Button>} />
          <DialogContent className="bg-zinc-950/90 backdrop-blur-2xl border-white/10 text-zinc-50 sm:max-w-md shadow-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter un véhicule</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddVehicle} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type de véhicule</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="type" className="bg-white/5 border-white/10 backdrop-blur-md">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950/90 backdrop-blur-2xl border-white/10 text-zinc-50">
                    <SelectItem value="car">Voiture</SelectItem>
                    <SelectItem value="motorcycle">Moto</SelectItem>
                    <SelectItem value="truck">Camion</SelectItem>
                    <SelectItem value="van">Utilitaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="make">Marque</Label>
                <Input id="make" value={make} onChange={(e) => setMake(e.target.value)} required className="bg-white/5 border-white/10 backdrop-blur-md" placeholder="ex: Toyota" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modèle</Label>
                <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} required className="bg-white/5 border-white/10 backdrop-blur-md" placeholder="ex: Corolla" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Année</Label>
                <Input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} required className="bg-white/5 border-white/10 backdrop-blur-md" placeholder="ex: 2020" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">Kilométrage</Label>
                <Input id="mileage" type="number" value={mileage} onChange={(e) => setMileage(e.target.value)} className="bg-white/5 border-white/10 backdrop-blur-md" placeholder="ex: 50000" />
              </div>
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Enregistrer
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4 overflow-y-auto pb-20">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center p-8 text-zinc-500">
            <Car className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Aucun véhicule enregistré.</p>
          </div>
        ) : (
          vehicles.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-md p-4 shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <Car className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">{v.make} {v.model}</h3>
                    <p className="text-sm text-zinc-400">{v.year} • {v.type === 'car' ? 'Voiture' : v.type === 'motorcycle' ? 'Moto' : v.type}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                  <Trash2 className="w-5 h-5" />
                </Button>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
