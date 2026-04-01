import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Receipt, Fuel, Wrench, Plus, ArrowUpRight, ArrowDownRight, Loader2, Car, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Expenses() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    vehicle_id: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: ''
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

      // Fetch expenses
      const { data: eData } = await supabase
        .from('expenses')
        .select('*, vehicles(make, model)')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });
        
      if (eData) {
        setRecords(eData);
        
        // Calculate chart data (last 6 months)
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        const now = new Date();
        const last6Months = Array.from({length: 6}, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
          return {
            name: months[d.getMonth()],
            month: d.getMonth(),
            year: d.getFullYear(),
            value: 0
          };
        });

        eData.forEach(exp => {
          const expDate = new Date(exp.date);
          const monthData = last6Months.find(m => m.month === expDate.getMonth() && m.year === expDate.getFullYear());
          if (monthData) {
            monthData.value += Number(exp.amount);
          }
        });

        setChartData(last6Months);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.vehicle_id || !formData.category || !formData.date || !formData.amount) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('expenses').insert([{
        user_id: user?.id,
        vehicle_id: formData.vehicle_id,
        category: formData.category,
        date: formData.date,
        amount: parseFloat(formData.amount),
        description: formData.description
      }]);

      if (error) throw error;
      
      toast.success("Dépense ajoutée avec succès");
      setIsOpen(false);
      setFormData({
        vehicle_id: vehicles.length > 0 ? vehicles[0].id : '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        description: ''
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'ajout");
    } finally {
      setSaving(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fuel': return <Fuel className="w-5 h-5" />;
      case 'maintenance': return <Wrench className="w-5 h-5" />;
      case 'insurance': return <Receipt className="w-5 h-5" />;
      case 'toll': return <Car className="w-5 h-5" />;
      default: return <Receipt className="w-5 h-5" />;
    }
  };

  const getCategoryName = (category: string) => {
    const categories: Record<string, string> = {
      'fuel': "Carburant",
      'maintenance': "Entretien",
      'insurance': "Assurance",
      'toll': "Péage",
      'other': "Autre"
    };
    return categories[category] || category;
  };

  const currentMonthTotal = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;
  const lastMonthTotal = chartData.length > 1 ? chartData[chartData.length - 2].value : 0;
  const percentChange = lastMonthTotal > 0 ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

  const exportToPDF = () => {
    if (records.length === 0) {
      toast.error("Aucune donnée à exporter");
      return;
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text("Rapport des Dépenses - AutoCarnet", 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.text(`Généré le: ${new Date().toLocaleDateString()}`, 14, 30);

    // Prepare table data
    const tableColumn = ["Date", "Véhicule", "Catégorie", "Description", "Montant (FCFA)"];
    const tableRows = records.map(record => [
      new Date(record.date).toLocaleDateString(),
      record.vehicles ? `${record.vehicles.make} ${record.vehicles.model}` : 'N/A',
      getCategoryName(record.category),
      record.description || '-',
      record.amount.toLocaleString()
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
    doc.save(`depenses_autocarnet_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("PDF exporté avec succès");
  };

  return (
    <div className="p-4 flex flex-col h-full bg-zinc-950 text-zinc-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dépenses</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={exportToPDF} className="border-white/10 bg-white/5 backdrop-blur-md text-zinc-300 hover:bg-white/10 rounded-full w-10 h-10 p-0">
            <Download className="w-5 h-5" />
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger render={<Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-10 h-10 p-0 shadow-lg shadow-orange-500/20"><Plus className="w-5 h-5" /></Button>} />
          <DialogContent className="bg-zinc-950/90 backdrop-blur-2xl border-white/10 text-zinc-50 sm:max-w-md shadow-2xl">
            <DialogHeader>
              <DialogTitle>Nouvelle Dépense</DialogTitle>
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
                <Label htmlFor="category">Catégorie</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                  <SelectTrigger id="category" className="bg-white/5 border-white/10 backdrop-blur-md">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950/90 backdrop-blur-2xl border-white/10 text-zinc-50">
                    <SelectItem value="fuel">Carburant</SelectItem>
                    <SelectItem value="maintenance">Entretien</SelectItem>
                    <SelectItem value="insurance">Assurance</SelectItem>
                    <SelectItem value="toll">Péage</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
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
                  <Label htmlFor="amount">Montant (FCFA)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="ex: 15000" 
                    className="bg-white/5 border-white/10 backdrop-blur-md" 
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optionnel)</Label>
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
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white" 
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

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="border-none bg-transparent shadow-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Ce mois</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold text-zinc-100">{currentMonthTotal.toLocaleString()}</div>
            <p className={`text-xs flex items-center mt-1 ${percentChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {percentChange > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />} 
              {Math.abs(percentChange).toFixed(1)}% vs mois dernier
            </p>
          </CardContent>
        </Card>
        <Card className="border-none bg-transparent shadow-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Carburant (Mois)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold text-zinc-100">
              {records
                .filter(r => r.category === 'fuel' && new Date(r.date).getMonth() === new Date().getMonth())
                .reduce((sum, r) => sum + Number(r.amount), 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none bg-transparent shadow-none mb-6 p-4">
        <h3 className="text-sm font-medium text-zinc-400 mb-4">Évolution des dépenses</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                itemStyle={{ color: '#f4f4f5' }}
                formatter={(value: number) => [`${value.toLocaleString()} FCFA`, 'Montant']}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#f97316' : '#3f3f46'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="space-y-4 overflow-y-auto pb-20">
        <h3 className="text-lg font-semibold text-zinc-100 mb-3">Transactions Récentes</h3>
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center p-8 text-zinc-500">
            Aucune dépense enregistrée
          </div>
        ) : (
          records.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <p className="font-medium text-zinc-200">{item.description || getCategoryName(item.category)}</p>
                    <p className="text-xs text-zinc-500">{getCategoryName(item.category)} • {new Date(item.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-sm font-semibold text-zinc-100">{item.amount.toLocaleString()} FCFA</div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
