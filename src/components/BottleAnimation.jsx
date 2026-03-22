import React, { useState } from "react";

const BottleAnimation = () => {
  const atomCount = 12; // Aumentado a 12 átomos
  const [isHovered, setIsHovered] = useState(false);
  
  const orbitRadii = [180, 190, 175, 185, 200, 170, 195, 185, 180, 190, 175, 185];
  const orbitSpeeds = [9, 8, 10, 7.5, 8.5, 9.5, 8, 7, 9, 8.2, 7.8, 8.8];
  const atomColors = [
    "bg-cyan-500 dark:bg-cyan-400",
    "bg-emerald-500 dark:bg-emerald-400",
    "bg-blue-500 dark:bg-blue-400",
    "bg-purple-500 dark:bg-purple-400",
    "bg-teal-500 dark:bg-teal-400",
    "bg-indigo-500 dark:bg-indigo-400",
    "bg-cyan-500 dark:bg-cyan-400",
    "bg-emerald-500 dark:bg-emerald-400",
    "bg-blue-500 dark:bg-blue-400",
    "bg-purple-500 dark:bg-purple-400",
    "bg-pink-500 dark:bg-pink-400",
    "bg-cyan-500 dark:bg-cyan-400"
  ];

  return (
    <div 
      className="relative w-[700px] h-[750px] mx-auto cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Líneas orbitales más grandes y más visibles */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={`orbit-${i}`}
            className="absolute top-1/2 left-1/2 rounded-full border border-cyan-400/50 dark:border-cyan-400/60"
            style={{
              width: `${280 + i * 55}px`,
              height: `${280 + i * 55}px`,
              transform: "translate(-50%, -50%) rotateX(65deg)",
              transformStyle: "preserve-3d",
            }}
          />
        ))}
      </div>

      {/* Botella más grande con mejor sombra */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-500/30 dark:bg-cyan-400/40 blur-3xl rounded-full scale-150 animate-pulse" />
          
          <img
            src="/src/assets/bottle.png"
            alt="Chemical Bottle"
            className={`w-72 h-auto relative z-10 animate-float transition-all duration-300 ${
              isHovered ? "scale-110" : ""
            }`}
            style={{
              filter: "drop-shadow(0 0 25px rgba(6, 182, 212, 0.8))",
            }}
          />
          
          <div className="absolute top-5 left-5 w-20 h-28 bg-gradient-to-br from-white/60 to-transparent rounded-full blur-sm pointer-events-none" />
        </div>
      </div>

      {/* Átomos más grandes y más visibles */}
      {[...Array(atomCount)].map((_, i) => {
        const angle = (360 / atomCount) * i;
        const radius = orbitRadii[i % orbitRadii.length];
        const speed = orbitSpeeds[i % orbitSpeeds.length];
        const colorClass = atomColors[i % atomColors.length];
        
        return (
          <div
            key={i}
            className={`absolute w-6 h-6 rounded-full ${colorClass} transition-all duration-300 ${
              isHovered ? "scale-150 shadow-xl" : "shadow-md"
            }`}
            style={{
              top: "50%",
              left: "50%",
              animation: `orbit-3d ${speed}s linear infinite`,
              animationDelay: `${i * 0.3}s`,
              transformOrigin: `0 0`,
              "--radius": `${radius}px`,
              "--start-angle": `${angle}deg`,
              boxShadow: "0 0 15px currentColor",
            }}
          />
        );
      })}

      {/* Partículas flotantes más numerosas */}
      {[...Array(35)].map((_, i) => (
        <div
          key={`particle-${i}`}
          className="absolute w-2 h-2 bg-cyan-500/50 dark:bg-cyan-400/50 rounded-full animate-float-particle"
          style={{
            top: `${15 + Math.random() * 75}%`,
            left: `${5 + Math.random() * 90}%`,
            animationDelay: `${i * 0.12}s`,
            animationDuration: `${3 + Math.random() * 3}s`,
            "--direction": Math.random(),
          }}
        />
      ))}
    </div>
  );
};

export default BottleAnimation;