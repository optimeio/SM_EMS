import React from 'react';
import logoImg from '../assets/sm_groups_logo.png';

const LogoSpinner = ({ fullScreen = false, label = 'Loading...' }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 select-none animate-fade-in my-auto">
      {/* Prominent Bull Logo Container */}
      <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24">
        <img
          src={logoImg}
          alt="THE SM GROUPS"
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain animate-subtle-breath filter drop-shadow-sm"
        />
      </div>

      {/* 3 Sequential Jumping Wave Dots (No Background) */}
      <div className="flex items-center gap-2 pt-2 h-6">
        <span className="w-2.5 h-2.5 rounded-full bg-slate-900 animate-dot-jump" style={{ animationDelay: '0s' }} />
        <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-dot-jump" style={{ animationDelay: '0.18s' }} />
        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-dot-jump" style={{ animationDelay: '0.36s' }} />
      </div>

      {label && (
        <span className="text-xs font-semibold text-slate-500 tracking-tight pt-0.5">
          {label}
        </span>
      )}

      <style>{`
        @keyframes subtleBreath {
          0%, 100% {
            transform: scale(1);
            opacity: 0.88;
          }
          50% {
            transform: scale(1.08);
            opacity: 1;
          }
        }
        @keyframes dotJump {
          0%, 100% {
            transform: translateY(0px) scale(1);
            opacity: 0.5;
          }
          40% {
            transform: translateY(-9px) scale(1.2);
            opacity: 1;
          }
          80% {
            transform: translateY(0px) scale(1);
            opacity: 0.7;
          }
        }
        .animate-subtle-breath {
          animation: subtleBreath 1.8s infinite ease-in-out;
        }
        .animate-dot-jump {
          animation: dotJump 1.1s infinite cubic-bezier(0.45, 0, 0.55, 1);
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center min-h-screen">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-12 w-full">{content}</div>;
};

export default LogoSpinner;
