import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Wrench, FileText, Camera, Mic, Loader2, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Maintenance() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    vehicle_id: '',
    type: '',
    date: new Date().toISOString().split('T')[0],
    mileage: '',
    cost: '',
    notes: ''
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

      // Fetch maintenance records
      const { data: mData } = await supabase
        .from('maintenance')
        .select('*, vehicles(make, model)')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });
        
      if (mData) setRecords(mData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.vehicle_id || !formData.type || !formData.date || !formData.cost) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('maintenance').insert([{
        user_id: user?.id,
        vehicle_id: formData.vehicle_id,
        type: formData.type,
        date: formData.date,
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        cost: parseFloat(formData.cost),
        notes: formData.notes
      }]);

      if (error) throw error;
      
      toast.success("Entretien ajouté avec succès");
      setIsOpen(false);
      setFormData({
        vehicle_id: vehicles.length > 0 ? vehicles[0].id : '',
        type: '',
        date: new Date().toISOString().split('T')[0],
        mileage: '',
        cost: '',
        notes: ''
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'ajout");
    } finally {
      setSaving(false);
    }
  };

  const getTypeName = (type: string) => {
    const types: Record<string, string> = {
      'oil': "Vidange d'huile",
      'brakes': "Freins",
      'tires': "Pneus",
      'inspection': "Révision Générale",
      'repair': "Réparation"
    };
    return types[type] || type;
  };

  const exportToPDF = () => {
    if (records.length === 0) {
      toast.error("Aucune donnée à exporter");
      return;
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text("Carnet d'Entretien - AutoCarnet", 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.text(`Généré le: ${new Date().toLocaleDateString()}`, 14, 30);

    // Prepare table data
    const tableColumn = ["Date", "Véhicule", "Type", "Kilométrage", "Coût (FCFA)", "Notes"];
    const tableRows = records.map(record => [
      new Date(record.date).toLocaleDateString(),
      record.vehicles ? `${record.vehicles.make} ${record.vehicles.model}` : 'N/A',
      getTypeName(record.type),
      record.mileage ? `${record.mileage} km` : '-',
      record.cost.toLocaleString(),
      record.notes || '-'
    ]);

    // Generate table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'striped',
      headStyles: { fillColor: [249, 115, 22] }, // Orange 500
    });

    // Save PDF
    doc.save(`entretien_autocarnet_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("PDF exporté avec succès");
  };

  return (
    <div className="p-4 flex flex-col h-full bg-zinc-950 text-zinc-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Carnet d'Entretien</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={exportToPDF} className="border-white/10 bg-white/5 backdrop-blur-md text-zinc-300 hover:bg-white/10 rounded-full w-10 h-10 p-0">
            <Download className="w-5 h-5" />
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger render={<Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-10 h-10 p-0 shadow-lg shadow-orange-500/20"><Plus className="w-5 h-5" /></Button>} />
          <DialogContent className="bg-zinc-950/90 backdrop-blur-2xl border-white/10 text-zinc-50 sm:max-w-md shadow-2xl">
            <DialogHeader>
              <DialogTitle>Nouvel Entretien</DialogTitle>
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
                <Label htmlFor="type">Type d'intervention</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger id="type" className="bg-white/5 border-white/10 backdrop-blur-md">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950/90 backdrop-blur-2xl border-white/10 text-zinc-50">
                    <SelectItem value="oil">Vidange d'huile</SelectItem>
                    <SelectItem value="brakes">Freins</SelectItem>
                    <SelectItem value="tires">Pneus</SelectItem>
                    <SelectItem value="inspection">Révision Générale</SelectItem>
                    <SelectItem value="repair">Réparation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    className="bg-white/5 border-white/10 backdrop-blur-md" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage">Kilométrage</Label>
                  <Input 
                    id="mileage" 
                    type="number" 
                    placeholder="ex: 45000" 
                    className="bg-white/5 border-white/10 backdrop-blur-md" 
                    value={formData.mileage}
                    onChange={(e) => setFormData({...formData, mileage: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Coût (FCFA)</Label>
                <Input 
                  id="cost" 
                  type="number" 
                  placeholder="ex: 25000" 
                  className="bg-white/5 border-white/10 backdrop-blur-md" 
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <div className="relative">
                  <Input 
                    id="notes" 
                    placeholder="Détails de l'intervention..." 
                    className="bg-white/5 border-white/10 backdrop-blur-md pr-10" 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                  <Button size="icon" variant="ghost" className="absolute right-0 top-0 h-full text-zinc-400 hover:text-orange-500">
                    <Mic className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 border-white/10 bg-white/5 backdrop-blur-md text-zinc-300 hover:bg-white/10">
                  <Camera className="w-4 h-4 mr-2" />
                  Photo Facture
                </Button>
                <Button 
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white" 
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
      </div>

      <div className="space-y-4 overflow-y-auto pb-20">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center p-8 text-zinc-500">
            Aucun entretien enregistré
          </div>
        ) : (
          records.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="overflow-hidden bg-white/5 border-white/10 backdrop-blur-md">
                <div className="flex items-start p-4">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center mr-4 shrink-0">
                    <Wrench className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-zinc-100">{getTypeName(item.type)}</h3>
                      <span className="text-sm font-bold text-orange-500">{item.cost} FCFA</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 mb-2">
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                      {item.mileage && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-zinc-700" />
                          <span>{item.mileage} km</span>
                        </>
                      )}
                      <span className="w-1 h-1 rounded-full bg-zinc-700" />
                      <span>{item.vehicles?.make}</span>
                    </div>
                    {item.notes && (
                      <p className="text-sm text-zinc-500 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {item.notes}
                      </p>
                    )}
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
