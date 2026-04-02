type VehicleType = 'moto' | 'voiture' | 'tricycle' | 'camion' | string;

function MotoSVG({ color }: { color: string }) {
  return (
    <img 
      src="/moto.png" 
      alt="moto"
      style={{ 
        width: "100%", 
        maxWidth: 280,
        filter: color === "#ef4444" ? "hue-rotate(180deg)" : "none"
      }}
    />
  );
}
function VoitureSVG({ color }: { color: string }) {
  return (
    <img 
      src="/voiture.png" 
      alt="voiture"
      style={{ width: "100%", maxWidth: 280 }}
    />
  );
}

function TricycleSVG({ color }: { color: string }) {
  return (
    <img 
      src="/tricycle.png" 
      alt="tricycle"
      style={{ width: "100%", maxWidth: 280 }}
    />
  );
}

function CamionSVG({ color }: { color: string }) {
  return (
    <img 
      src="/camion.png" 
      alt="camion"
      style={{ width: "100%", maxWidth: 280 }}
    />
  );
}
function getVehicleColor(isProblem: boolean) {
  return isProblem ? "#ef4444" : "#f97316";
}

function getVehicleType(vehicleType?: string): VehicleType {
  if (!vehicleType) return 'voiture';
  const t = vehicleType.toLowerCase();
  if (t.includes('moto') || t.includes('scooter') || t.includes('haojoue') || t.includes('haojue') || t.includes('honda') || t.includes('yamaha')) return 'moto';
  if (t.includes('tricycle') || t.includes('zem') || t.includes('keke') || t.includes('tuk')) return 'tricycle';
  if (t.includes('camion') || t.includes('truck') || t.includes('bus') || t.includes('minibus')) return 'camion';
  return 'voiture';
}

export default function CarModel({ isProblem = false, vehicleType }: { isProblem?: boolean; vehicleType?: string }) {
  const color = getVehicleColor(isProblem);
  const type = getVehicleType(vehicleType);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: isProblem ? 'shake 0.3s infinite' : 'float 3s ease-in-out infinite',
    }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
      <div style={{ width: '80%', maxWidth: 280 }}>
        {type === 'moto' && <MotoSVG color={color} />}
        {type === 'voiture' && <VoitureSVG color={color} />}
        {type === 'tricycle' && <TricycleSVG color={color} />}
        {type === 'camion' && <CamionSVG color={color} />}
      </div>
    </div>
  );
}
