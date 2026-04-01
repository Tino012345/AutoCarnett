import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, CreditCard, Shield, Zap, ChevronLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Subscription() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'business'>('pro');
  const [isPaying, setIsPaying] = useState(false);

  const handlePayment = () => {
    setIsPaying(true);
    // Mock Moneroo payment flow
    setTimeout(() => {
      setIsPaying(false);
      toast.success("Paiement réussi !", {
        description: "Votre abonnement PRO a été activé.",
      });
      navigate('/');
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-50 overflow-y-auto pb-safe">
      <div className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-xl p-4 flex items-center gap-3 border-b border-white/10">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-zinc-400 hover:text-zinc-100">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h2 className="text-xl font-bold">Abonnement</h2>
      </div>

      <div className="p-4 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Passez à la vitesse supérieure</h1>
          <p className="text-zinc-400 text-sm">Débloquez toutes les fonctionnalités pour gérer votre véhicule comme un pro.</p>
        </div>

        <div className="space-y-4">
          {/* Pro Plan */}
          <motion.div whileTap={{ scale: 0.98 }}>
            <Card 
              className={`p-5 cursor-pointer transition-all duration-200 ${selectedPlan === 'pro' ? 'bg-orange-500/20 border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.15)] backdrop-blur-xl' : 'bg-white/5 border-white/10 backdrop-blur-md'}`}
              onClick={() => setSelectedPlan('pro')}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-500" />
                    PRO
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1">Idéal pour les particuliers</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-zinc-100">1500</span>
                  <span className="text-xs text-zinc-500 block">FCFA / mois</span>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-500" /> Véhicules illimités</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-500" /> Rappels intelligents (Push + SMS)</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-500" /> Mode SOS complet</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-500" /> Suivi des dépenses & carburant</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-500" /> Export PDF</li>
              </ul>
            </Card>
          </motion.div>

          {/* Business Plan */}
          <motion.div whileTap={{ scale: 0.98 }}>
            <Card 
              className={`p-5 cursor-pointer transition-all duration-200 ${selectedPlan === 'business' ? 'bg-blue-500/20 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)] backdrop-blur-xl' : 'bg-white/5 border-white/10 backdrop-blur-md'}`}
              onClick={() => setSelectedPlan('business')}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    BUSINESS
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1">Pour les flottes et entreprises</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-zinc-100">3000</span>
                  <span className="text-xs text-zinc-500 block">FCFA / mois</span>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-500" /> Toutes les fonctionnalités PRO</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-500" /> Gestion de flotte avancée</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-500" /> Tableau de bord analytique</li>
              </ul>
            </Card>
          </motion.div>
        </div>

        {/* Payment Section */}
        {selectedPlan !== 'free' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-4"
          >
            <h3 className="font-semibold text-zinc-100">Paiement Mobile (Moneroo)</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Numéro de téléphone (Mobile Money)</Label>
                <Input id="phone" type="tel" placeholder="ex: 0123456789" className="bg-white/5 border-white/10 backdrop-blur-md text-lg py-6" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-14 border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:text-zinc-100">
                  MTN MoMo
                </Button>
                <Button variant="outline" className="h-14 border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:text-zinc-100">
                  Moov Money
                </Button>
              </div>

              <Button 
                className="w-full h-14 text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white mt-4"
                onClick={handlePayment}
                disabled={isPaying}
              >
                {isPaying ? (
                  <span className="flex items-center gap-2">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <CreditCard className="w-5 h-5" />
                    </motion.div>
                    Traitement...
                  </span>
                ) : (
                  `Payer ${selectedPlan === 'pro' ? '1500' : '3000'} FCFA`
                )}
              </Button>
              <p className="text-center text-xs text-zinc-500 mt-2">
                Paiement sécurisé via Moneroo. Renouvellement automatique.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
