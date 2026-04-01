import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, Clock, Plus, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Problems() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    vehicle_id: '',
    title: '',
    description: '',
    status: 'unresolved'
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch vehicles
      const { data: vData } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user?.id);
      
      if (vData) {
        setVehicles(vData);
        if (vData.length > 0 && !formData.vehicle_id) {
          setFormData(prev => ({ ...prev, vehicle_id: vData[0].id }));
        }
      }

      // Fetch problems
      const { data: pData } = await supabase
        .from('problems')
        .select('*, vehicles(make, model)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (pData) setRecords(pData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.vehicle_id || !formData.title) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('problems').insert([{
        user_id: user?.id,
        vehicle_id: formData.vehicle_id,
        title: formData.title,
        description: formData.description,
        status: formData.status
      }]);

      if (error) throw error;
      
      toast.success("Problème signalé avec succès");
      setIsOpen(false);
      setFormData({
        vehicle_id: vehicles.length > 0 ? vehicles[0].id : '',
        title: '',
        description: '',
        status: 'unresolved'
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'ajout");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('problems')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success("Statut mis à jour");
      fetchData();
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="p-4 flex flex-col h-full bg-zinc-950 text-zinc-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Problèmes</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button className="bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 p-0 shadow-lg shadow-red-500/20"><Plus className="w-5 h-5" /></Button>} />
          <DialogContent className="bg-zinc-950/90 backdrop-blur-2xl border-white/10 text-zinc-50 sm:max-w-md shadow-2xl">
            <DialogHeader>
              <DialogTitle>Signaler un problème</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle">Véhicule</Label>
                <Select value={formData.vehicle_id} onValueChange={(v) => setFormData({...formData, vehicle_id: v})}>
                  <SelectTrigger id="vehicle" className="bg-white/5 border-white/10 backdrop-blur-md">
                    <SelectValue placeholder="Sélectionner un véhicule" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950/90 backdrop-blur-2xl border-white/10 text-zinc-50">
                    {vehicles.map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.make} {v.model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Titre du problème</Label>
                <Input 
                  id="title" 
                  placeholder="ex: Bruit moteur étrange" 
                  className="bg-white/5 border-white/10 backdrop-blur-md" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description détaillée</Label>
                <Input 
                  id="description" 
                  placeholder="Détails..." 
                  className="bg-white/5 border-white/10 backdrop-blur-md" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="pt-2">
                <Button 
                  className="w-full bg-red-500 hover:bg-red-600 text-white" 
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Enregistrer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4 overflow-y-auto pb-20">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center p-8 text-zinc-500">
            Aucun problème signalé
          </div>
        ) : (
          records.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-md p-4 shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
                    {item.status === 'unresolved' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    {item.status === 'in-progress' && <Clock className="w-4 h-4 text-yellow-500" />}
                    {item.status === 'fixed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {item.title}
                  </h3>
                  <Badge variant="outline" className={
                    item.status === 'unresolved' ? "text-red-500 border-red-500/30 bg-red-500/10" :
                    item.status === 'in-progress' ? "text-yellow-500 border-yellow-500/30 bg-yellow-500/10" :
                    "text-green-500 border-green-500/30 bg-green-500/10"
                  }>
                    {item.status === 'unresolved' ? 'Non résolu' : item.status === 'in-progress' ? 'En cours' : 'Résolu'}
                  </Badge>
                </div>
                <p className="text-sm text-zinc-400 mb-1">{item.description}</p>
                <p className="text-xs text-zinc-500 mb-3">{item.vehicles?.make} {item.vehicles?.model}</p>
                <div className="flex justify-between items-center text-xs text-zinc-500">
                  <span>Signalé: {new Date(item.date).toLocaleDateString()}</span>
                  {item.status !== 'fixed' && (
                    <div className="flex gap-2">
                      {item.status === 'unresolved' && (
                        <Button variant="link" className="h-auto p-0 text-yellow-500 text-xs" onClick={() => updateStatus(item.id, 'in-progress')}>
                          Mettre en cours
                        </Button>
                      )}
                      <Button variant="link" className="h-auto p-0 text-green-500 text-xs" onClick={() => updateStatus(item.id, 'fixed')}>
                        Marquer résolu
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
