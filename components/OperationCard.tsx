
import React from 'react';
import { Job } from '../types';

interface OperationCardProps {
  job: Job;
}

const OperationCard: React.FC<OperationCardProps> = ({ job }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-6 animate-in slide-in-from-bottom duration-500">
      <div className="bg-slate-900 px-5 py-3.5 flex justify-between items-center text-white border-b-2 border-blue-600">
        <div className="flex flex-col">
          <span className="font-black text-xs uppercase tracking-widest text-blue-400">Status Operacional</span>
          <span className="font-black text-lg">DADOS DA CARGA</span>
        </div>
        <div className="text-right">
          <span className="block text-[8px] opacity-60 uppercase font-bold">Protocolo</span>
          <span className="font-mono text-xs font-black">#{job.id}</span>
        </div>
      </div>
      <div className="p-5 grid grid-cols-2 gap-5">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <label className="text-[9px] uppercase font-black text-slate-400 block mb-1 tracking-wider">Container</label>
          <p className="font-black text-lg text-slate-800 font-mono tracking-tight">{job.container}</p>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <label className="text-[9px] uppercase font-black text-slate-400 block mb-1 tracking-wider">Lacre</label>
          <p className="font-black text-lg text-slate-800 font-mono tracking-tight">{job.lacre}</p>
        </div>
        <div className="col-span-2 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <label className="text-[9px] uppercase font-black text-blue-700 block tracking-wider">Janela de Atendimento</label>
          </div>
          <p className="text-blue-900 font-black text-base">{job.janela}</p>
        </div>
        <div className="col-span-2 space-y-3 pt-1">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center mt-1">
              <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div>
              <div className="w-0.5 h-6 bg-slate-200"></div>
            </div>
            <div>
              <label className="text-[9px] uppercase font-black text-slate-400 block tracking-widest">Ponto de Coleta (Origem)</label>
              <p className="text-sm font-black text-slate-700">{job.origem}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center mt-1">
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            </div>
            <div>
              <label className="text-[9px] uppercase font-black text-slate-400 block tracking-widest">Ponto de Entrega (Destino)</label>
              <p className="text-sm font-black text-slate-700">{job.destino}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-slate-50 px-5 py-2 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">DRB Logística Integrada</span>
        </div>
        <span className="text-[8px] font-bold text-slate-300">ISO 9001 CERTIFIED</span>
      </div>
    </div>
  );
};

export default OperationCard;
