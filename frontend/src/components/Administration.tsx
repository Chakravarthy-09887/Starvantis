'use client';

import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Shield, UserCheck, Key, FileText, CheckCircle2, AlertTriangle, Terminal, Clock, Wifi } from 'lucide-react';
import { useMission } from '../context/MissionContext';

const FALLBACK_OPERATORS = [
  { username: 'commander.vance', full_name: 'Commander Vance', role: 'Mission Director', assigned_satellites: 'ALL ASSETS', access_level: 'LEVEL 5 (EXEC)', status: 'ACTIVE' },
  { username: 'elena.rostova', full_name: 'Dr. Elena Rostova', role: 'Systems Engineer', assigned_satellites: 'SENTINEL-6A', access_level: 'LEVEL 4 (SYS)', status: 'ACTIVE' },
  { username: 'k.chen', full_name: 'K. Chen', role: 'Orbital Analyst', assigned_satellites: 'CHANDRAYAAN-3, SENTINEL-6A', access_level: 'LEVEL 4 (ORBIT)', status: 'ACTIVE' },
  { username: 'm.mansoor', full_name: 'M. Al-Mansoor', role: 'Telemetry Operator', assigned_satellites: 'STARLINK-4012, LANDSAT-9', access_level: 'LEVEL 3 (OPS)', status: 'IDLE' },
  { username: 's.tanaka', full_name: 'S. Tanaka', role: 'ML Ops Engineer', assigned_satellites: 'FLEET MODELS', access_level: 'LEVEL 4 (DEV)', status: 'STANDBY' },
];

export default function Administration() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const { operators, auditLogs, wsConnected } = useMission();
  const [activeTab, setActiveTab] = useState<'operators' | 'audit'>('operators');

  const displayOperators = operators.length > 0 ? operators : FALLBACK_OPERATORS;

  return (
    <section id="admin" className="section-spacing relative overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-glow/20 bg-cyan-glow/5 mb-3">
            <Shield size={13} className="text-cyan-glow" />
            <span className="font-space text-[10px] tracking-[0.3em] text-cyan-glow uppercase">
              Mission Control Security &amp; Governance
            </span>
          </div>
          <h2 className="font-space text-2xl md:text-4xl lg:text-5xl font-light tracking-wide text-star-white">
            MISSION ADMINISTRATION
          </h2>
          <p className="font-inter text-xs md:text-sm text-muted-gray mt-3 max-w-xl mx-auto">
            Role-based operator access control, immutable cryptographic audit logging, and flight-software configuration governance backed by PostgreSQL.
          </p>
          <motion.div
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-glow/50 to-transparent mx-auto mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
          />
        </motion.div>

        {/* Administration Main Glass Panel */}
        <motion.div
          className="glass-panel rounded-2xl p-6 md:p-8 border border-glass-border"
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Navigation Bar */}
          <div className="flex items-center justify-between border-b border-glass-border pb-4 mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div role="button" tabIndex={0} onClick={() => setActiveTab('operators')}
                className={`px-4 py-2 rounded-xl text-xs font-space tracking-wider uppercase transition-all cursor-pointer ${
                  activeTab === 'operators'
                    ? 'bg-cyan-glow/20 border border-cyan-glow text-star-white font-bold'
                    : 'glass-panel border border-glass-border text-muted-gray hover:text-star-white'
                }`}
              >
                Operators &amp; Roles ({displayOperators.length})
              </div>
              <div role="button" tabIndex={0} onClick={() => setActiveTab('audit')}
                className={`px-4 py-2 rounded-xl text-xs font-space tracking-wider uppercase transition-all cursor-pointer ${
                  activeTab === 'audit'
                    ? 'bg-cyan-glow/20 border border-cyan-glow text-star-white font-bold'
                    : 'glass-panel border border-glass-border text-muted-gray hover:text-star-white'
                }`}
              >
                Audit Log Trail ({auditLogs.length})
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-space text-muted-gray">
              <span className="flex items-center gap-1.5 text-cyan-glow">
                <CheckCircle2 size={14} /> POSTGRESQL 16: NOMINAL
              </span>
              <span>SEC-LEVEL: TOP SECRET // ORCON</span>
            </div>
          </div>

          {/* Tab 1: Operators Table */}
          {activeTab === 'operators' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-space">
                <thead>
                  <tr className="border-b border-glass-border/60 text-muted-gray uppercase text-[10px] tracking-widest">
                    <th className="pb-3">Operator</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Assigned Satellite</th>
                    <th className="pb-3">Access Level</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border/30 font-inter">
                  {displayOperators.map((op, idx) => (
                    <tr key={op.username || idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 font-space font-medium text-star-white flex items-center gap-2">
                        <UserCheck size={14} className="text-cyan-glow" />
                        {op.full_name || op.username}
                      </td>
                      <td className="py-3.5 text-star-white/80">{op.role}</td>
                      <td className="py-3.5 font-space text-cyan-glow">{op.assigned_satellites}</td>
                      <td className="py-3.5 text-muted-gray font-space text-[11px]">{op.access_level}</td>
                      <td className="py-3.5 text-right font-space">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] tracking-wider border ${
                            op.status === 'ACTIVE'
                              ? 'bg-cyan-glow/15 border-cyan-glow/30 text-cyan-glow'
                              : 'bg-white/5 border-glass-border text-muted-gray'
                          }`}
                        >
                          {op.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: Cryptographic Audit Trail */}
          {activeTab === 'audit' && (
            <div className="space-y-3 font-space max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-muted-gray text-xs">No audit logs recorded yet.</div>
              ) : (
                auditLogs.map((log) => {
                  const timeStr = typeof log.timestamp === 'string'
                    ? (log.timestamp.includes('T') ? log.timestamp.substring(11, 19) + ' UTC' : log.timestamp)
                    : new Date(log.timestamp).toISOString().substring(11, 19) + ' UTC';

                  return (
                    <div
                      key={log.id}
                      className="glass-panel p-3.5 rounded-xl border border-glass-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 flex-wrap">
                        <Clock size={14} className="text-cyan-glow shrink-0" />
                        <span className="text-muted-gray text-[11px]">{timeStr}</span>
                        <span className="text-star-white font-medium">{log.user}</span>
                        <span className="text-cyan-glow/90 font-inter">{log.action}</span>
                      </div>
                      <div className="flex items-center gap-3 self-end md:self-auto">
                        <span className="text-muted-gray text-[11px]">TARGET: {log.target}</span>
                        <span className="px-2 py-0.5 rounded bg-cyan-glow/10 border border-cyan-glow/20 text-[10px] text-cyan-glow font-bold">
                          {log.result}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
