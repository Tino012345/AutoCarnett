type VehicleType = 'moto' | 'voiture' | 'tricycle' | 'camion' | string;

function MotoSVG({ color }: { color: string }) {
  return (
    <img 
      src="/src/components/3d/moto.png" 
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
    <svg viewBox="0 0 240 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect x="20" y="55" width="200" height="45" rx="10" fill={color}/>
      <path d="M50 55 L75 25 L165 25 L190 55 Z" fill={color} opacity="0.9"/>
      <rect x="78" y="30" width="40" height="25" rx="3" fill="#88ccff" opacity="0.7"/>
      <rect x="122" y="30" width="40" height="25" rx="3" fill="#88ccff" opacity="0.7"/>
      <circle cx="65" cy="98" r="20" fill="#222" stroke="#555" strokeWidth="4"/>
      <circle cx="65" cy="98" r="8" fill="#555"/>
      <circle cx="175" cy="98" r="20" fill="#222" stroke="#555" strokeWidth="4"/>
      <circle cx="175" cy="98" r="8" fill="#555"/>
      <rect x="22" y="62" width="18" height="12" rx="3" fill="#ffd700" opacity="0.9"/>
      <rect x="200" y="62" width="18" height="12" rx="3" fill="#ff4444" opacity="0.8"/>
      <rect x="90" y="58" width="60" height="6" rx="3" fill="#000" opacity="0.2"/>
    </svg>
  );
}

function TricycleSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect x="60" y="30" width="130" height="60" rx="8" fill={color} opacity="0.9"/>
      <rect x="65" y="35" width="120" height="45" rx="6" fill={color}/>
      <rect x="70" y="38" width="50" height="30" rx="4" fill="#88ccff" opacity="0.6"/>
      <rect x="60" y="20" width="130" height="15" rx="4" fill={color}/>
      <circle cx="45" cy="95" r="22" fill="#222" stroke="#555" strokeWidth="5"/>
      <circle cx="45" cy="95" r="8" fill="#555"/>
      <circle cx="140" cy="100" r="22" fill="#222" stroke="#555" strokeWidth="5"/>
      <circle cx="140" cy="100" r="8" fill="#555"/>
      <circle cx="185" cy="100" r="22" fill="#222" stroke="#555" strokeWidth="5"/>
      <circle cx="185" cy="100" r="8" fill="#555"/>
      <path d="M45 95 L60 88" stroke={color} strokeWidth="6" strokeLinecap="round"/>
      <rect x="25" y="60" width="20" height="30" rx="4" fill={color} opacity="0.7"/>
      <rect x="62" y="65" width="14" height="10" rx="2" fill="#ffd700" opacity="0.9"/>
    </svg>
  );
}

function CamionSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 260 130" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect x="10" y="40" width="160" height="70" rx="5" fill={color} opacity="0.8"/>
      <rect x="170" y="20" width="80" height="90" rx="8" fill={color}/>
      <rect x="175" y="28" width="45" height="35" rx="4" fill="#88ccff" opacity="0.6"/>
      <circle cx="50" cy="108" r="20" fill="#222" stroke="#555" strokeWidth="4"/>
      <circle cx="50" cy="108" r="7" fill="#555"/>
      <circle cx="110" cy="108" r="20" fill="#222" stroke="#555" strokeWidth="4"/>
      <circle cx="110" cy="108" r="7" fill="#555"/>
      <circle cx="210" cy="108" r="20" fill="#222" stroke="#555" strokeWidth="4"/>
      <circle cx="210" cy="108" r="7" fill="#555"/>
      <rect x="172" y="68" width="12" height="8" rx="2" fill="#ffd700" opacity="0.9"/>
      <rect x="12" y="68" width="12" height="8" rx="2" fill="#ff4444" opacity="0.8"/>
    </svg>
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
