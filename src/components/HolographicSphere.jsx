import { Play } from "lucide-react";

const HolographicSphere = () => {
  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto animate-float">
      <div className="absolute inset-0 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute inset-4 animate-sphere" style={{ perspective: "600px", transformStyle: "preserve-3d" }}>
        {[0, 60, 120].map((rot, i) => (
          <div key={i} className="absolute inset-0 rounded-full border border-primary/40" style={{ transform: `rotateY(${rot}deg)` }} />
        ))}
        {[0, 45, 90, 135].map((rot, i) => (
          <div key={`h-${i}`} className="absolute inset-0 rounded-full border border-emerald/30" style={{ transform: `rotateX(${rot}deg)` }} />
        ))}
      </div>

      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = 50 + Math.cos(angle) * 35;
        const y = 50 + Math.sin(angle) * 35;
        return <div key={`node-${i}`} className="absolute w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_hsl(185_100%_50%/0.8)]" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.2}s` }} />;
      })}

      <button className="absolute inset-0 m-auto w-16 h-16 rounded-full glass flex items-center justify-center border border-primary/30 hover:neon-glow-box transition-all duration-300 hover:scale-110 z-10">
        <Play size={24} className="text-primary ml-1" />
      </button>
    </div>
  );
};

export default HolographicSphere;