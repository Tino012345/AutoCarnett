type VehicleType = 'moto' | 'voiture' | 'tricycle' | 'camion' | string;

function MotoSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 300 160" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Roue arrière */}
      <circle cx="75" cy="115" r="38" fill="none" stroke="#333" strokeWidth="12"/>
      <circle cx="75" cy="115" r="26" fill="none" stroke="#444" strokeWidth="4"/>
      <circle cx="75" cy="115" r="8" fill="#555"/>
      <line x1="75" y1="89" x2="75" y2="115" stroke="#555" strokeWidth="2"/>
      <line x1="75" y1="115" x2="75" y2="141" stroke="#555" strokeWidth="2"/>
      <line x1="51" y1="115" x2="99" y2="115" stroke="#555" strokeWidth="2"/>
      <line x1="58" y1="98" x2="92" y2="132" stroke="#555" strokeWidth="2"/>
      <line x1="92" y1="98" x2="58" y2="132" stroke="#555" strokeWidth="2"/>

      {/* Roue avant */}
      <circle cx="225" cy="115" r="38" fill="none" stroke="#333" strokeWidth="12"/>
      <circle cx="225" cy="115" r="26" fill="none" stroke="#444" strokeWidth="4"/>
      <circle cx="225" cy="115" r="8" fill="#555"/>
      <line x1="225" y1="89" x2="225" y2="141" stroke="#555" strokeWidth="2"/>
      <line x1="201" y1="115" x2="249" y2="115" stroke="#555" strokeWidth="2"/>
      <line x1="208" y1="98" x2="242" y2="132" stroke="#555" strokeWidth="2"/>
      <line x1="242" y1="98" x2="208" y2="132" stroke="#555" strokeWidth="2"/>

      {/* Fourche avant */}
      <line x1="200" y1="60" x2="225" y2="115" stroke="#666" strokeWidth="6" strokeLinecap="round"/>
      <line x1="210" y1="55" x2="225" y2="115" stroke="#555" strokeWidth="4" strokeLinecap="round"/>

      {/* Cadre */}
      <path d="M75 115 L100 70 L160 55 L200 60" fill="none" stroke="#555" strokeWidth="8" strokeLinecap="round"/>
      <path d="M100 70 L150 75 L190 100 L75 115" fill="none" stroke="#444" strokeWidth="5" strokeLinecap="round"/>

      {/* Corps */}
      <path d="M95 72 L155 52 L195 62 L185 95 L140 100 L100 90 Z" fill={color} opacity="0.95"/>

      {/* Réservoir */}
      <ellipse cx="148" cy="68" rx="35" ry="18" fill={color}/>
      <ellipse cx="148" cy="65" rx="30" ry="12" fill={color} opacity="0.8"/>

      {/* Selle */}
      <path d="M108 73 L153 60 L170 66 L153 74 L112 78 Z" fill="#333"/>

      {/* Guidon */}
      <line x1="198" y1="58" x2="215" y2="48" stroke="#666" strokeWidth="5" strokeLinecap="round"/>
      <line x1="215" y1="48" x2="225" y2="52" stroke="#666" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="225" cy="52" r="5" fill="#444"/>

      {/* Phare */}
      <ellipse cx="238" cy="85" rx="10" ry="8" fill="#ffd700" opacity="0.9"/>
      <ellipse cx="238" cy="85" rx="6" ry="5" fill="#fff" opacity="0.7"/>

      {/* Feu arrière */}
      <ellipse cx="62" cy="85" rx="8" ry="6" fill="#ff3333" opacity="0.8"/>

      {/* Échappement */}
      <path d="M80 108 Q60 105 45 112" fill="none" stroke="#888" strokeWidth="5" strokeLinecap="round"/>

      {/* Moteur */}
      <rect x="115" y="85" width="45" height="25" rx="5" fill="#333" opacity="0.8"/>
      <rect x="120" y="88" width="35" height="8" rx="3" fill="#444"/>
      <rect x="120" y="98" width="35" height="8" rx="3" fill="#444"/>

      {/* Reflet */}
      <path d="M130 56 L160 50 L170 58 L155 62 Z" fill="white" opacity="0.15"/>
    </svg>
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
