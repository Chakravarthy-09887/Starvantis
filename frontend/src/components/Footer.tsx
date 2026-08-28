'use client';

import React from 'react';
import StarvantisWordmark from './StarvantisWordmark';
import StarvantisLogo from './StarvantisLogo';
import { ShieldCheck, Code2, Users, Sparkles, Orbit } from 'lucide-react';

const FOOTER_LINKS = [
  { label: 'Mission', href: '#mission' },
  { label: 'Intelligence', href: '#intelligence' },
  { label: 'Orbital Risk', href: '#orbital' },
  { label: 'Digital Twin', href: '#digital-twin' },
  { label: 'Technology', href: '#technology' },
  { label: 'Alerts', href: '#alerts' },
  { label: 'Administration', href: '#admin' },
];

const TEAM_MEMBERS = [
  { name: 'CHAKRAVARTHY A', role: 'LEAD ARCHITECT CORE SYSTEMS, BACKEND' },
  { name: 'DHARSHINI K', role: 'FRONTEND, VFX' },
  { name: 'JAYARAJ J', role: 'DATABASE AND ORBITAL DYNAMICS' },
  { name: 'SANTHOSH KUMAR N', role: 'AI TELEMETRY AND RISK ANALYTICS' },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#03060a] border-t border-cyan-glow/15 pt-20 pb-16 px-4 md:px-8 overflow-hidden">
      {/* Subtle Galaxy Glow in Footer */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(99,199,255,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Top Branding & Navigation */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 border-b border-cyan-glow/10 pb-10">
          <div className="flex flex-col items-center lg:items-start">
            <div className="flex items-center gap-3 mb-2">
              <StarvantisLogo size={36} glow={true} />
              <div className="w-56 md:w-64">
                <StarvantisWordmark glowIntensity={1.2} />
              </div>
            </div>
            <p className="font-space text-[10px] tracking-[0.35em] text-cyan-glow/80 uppercase mt-1">
              FUSED SATELLITE HEALTH &amp; ORBITAL THREAT INTELLIGENCE
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-inter text-xs tracking-widest text-star-white/60 hover:text-cyan-glow transition-colors uppercase font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* PROMINENT TEAM CREDITS: QUANTUM SQUAD */}
        <div className="p-8 rounded-3xl border border-cyan-glow/20 bg-[#060c14]/90 shadow-[0_0_50px_rgba(4,18,34,0.8)] backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-cyan-glow/15 pb-6 mb-6">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-2xl bg-cyan-glow/15 border border-cyan-glow/30 text-cyan-glow shadow-[0_0_20px_rgba(99,199,255,0.25)]">
                <Users size={22} />
              </div>
              <div>
                <span className="font-space text-[10px] tracking-[0.3em] text-cyan-glow uppercase font-bold block">
                  ENGINEERED &amp; DEVELOPED BY
                </span>
                <h3 className="font-space text-xl md:text-2xl font-bold text-star-white tracking-wide text-glow">
                  QUANTUM SQUAD
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-space tracking-wider bg-cyan-glow/10 border border-cyan-glow/25 text-cyan-glow font-semibold flex items-center gap-1.5">
                <Sparkles size={13} />
                <span>Space Intelligence Prototype Team</span>
              </span>
            </div>
          </div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEAM_MEMBERS.map((member) => (
              <div
                key={member.name}
                className="p-4 rounded-2xl border border-cyan-glow/15 bg-space-navy/50 hover:border-cyan-glow/40 hover:bg-space-navy/80 transition-all duration-300 group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2 h-2 rounded-full bg-cyan-glow group-hover:animate-ping" />
                  <h4 className="font-space text-sm font-bold text-star-white group-hover:text-cyan-glow transition-colors">
                    {member.name}
                  </h4>
                </div>
                <p className="font-space text-[10px] tracking-wider text-cyan-glow/80 uppercase font-medium mt-0.5">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section Prototype Project Disclaimer */}
        <div className="p-6 rounded-2xl border border-white/10 bg-black/70 max-w-4xl mx-auto text-center space-y-2">
          <span className="font-space text-[10px] tracking-[0.25em] text-amber-400 uppercase font-bold block">
            PROJECT DISCLAIMER &amp; COMPLIANCE
          </span>
          <p className="font-inter text-xs text-star-white/60 leading-relaxed font-light">
            Starvantis is an educational engineering prototype. Health anomaly diagnostics, orbital predictions, and collision risk classifications are strictly intended for educational exploration and must not be presented as certified spacecraft-control or collision-avoidance guidance.
          </p>
        </div>

        {/* Bottom Copyright & Version */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-space text-star-white/40 pt-6 border-t border-cyan-glow/10 gap-4">
          <span>© 2026 Starvantis Aerospace. Developed by Quantum Squad.</span>
          <div className="flex items-center gap-3">
            <span className="text-cyan-glow/70">ALL SYSTEMS OPERATIONAL</span>
            <span>•</span>
            <span>v2.5.0 STABLE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
