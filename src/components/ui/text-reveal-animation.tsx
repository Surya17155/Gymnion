import { useState } from "react";

export function TextReveal({ word, className }: { word: string; className?: string }) {
  const [reset, setReset] = useState(0);
  const WORD = word || "Animations";
  
  return (
    <div className={className}>
      <div className="flex flex-wrap">
        {WORD.split("").map((char, i) => (
          <span
            key={`${i}-${reset}`}
            className="inline-block overflow-hidden"
            style={{
              animation: `reveal 0.7s cubic-bezier(0.77, 0, 0.175, 1) ${i * 0.05}s both`,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes reveal {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0%);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
