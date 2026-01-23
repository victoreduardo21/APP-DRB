
import React, { useState } from 'react';
import { Job, Issue } from '../types';

const LOGO_URL = "https://media.licdn.com/dms/image/v2/C4D0BAQHFeZ2qK66-ow/company-logo_200_200/company-logo_200_200/0/1660330615044?e=2147483647&v=beta&t=b4ByKgKdb_l825tt68RwOTrv8tjFV-YLQj_OjcUvdTM";

interface OperationCardProps {
  job: Job;
  onSendMessage?: (text: string) => void;
  readOnly?: boolean;
}

const OperationCard: React.FC<OperationCardProps> = ({ job, onSendMessage, readOnly = false }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(message);
      setMessage('');
    }
  };

  // Fix: Ensure formatDateTime always returns an object to prevent TS errors on property access
  const formatDateTime = (timestamp?: number) => {
    if (!timestamp) return { date: '---', time: '---' };
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const finishedInfo = formatDateTime(job.checkpoints.finished);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6 animate-in slide-in-from-bottom duration-500 shadow-lg shadow-blue-900/5">
      <div className="bg-slate-900 px-5 py-4 flex justify-between items-center text-white border-b border-blue-600">
        <div className="flex flex-col">
          <span className="font-black text-[9px] uppercase tracking-widest text-blue-400 mb-0.5">Operação Sincronizada</span>
          <span className="font-black text-base italic tracking-tight uppercase">Manifesto de Transporte</span>
        </div>
        <div className="text-right">
          <span className="block text-[7px] opacity-40 uppercase font-black tracking-widest mb-0.5">ID Ref</span>
          <span className="font-mono text-[10px] font-black bg-white/10 px-2 py-0.5 rounded">#{job.id}</span>
        </div>
      </div>
      
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <label className="text-[8px] uppercase font-black text-slate-400 block mb-1 tracking-widest">Container</label>
            <p className="font-black text-sm text-blue-700 font-mono tracking-wider">{job.container}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <label className="text-[8px] uppercase font-black text-slate-400 block mb-1 tracking-widest">Lacre</label>
            <p className="font-black text-sm text-slate-800 font-mono tracking-wider">{job.lacre}</p>
          </div>
        </div>

        <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100/50">
          <div className="flex items-center gap-2 mb-1.5">
            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <label className="text-[8px] uppercase font-black text-blue-600 block tracking-widest">Janela Agendada</label>
          </div>
          <p className="text-blue-900 font-black text-sm tracking-tight">{job.janela}</p>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center mt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]"></div>
              <div className="w-px h-8 bg-slate-200 my-1"></div>
            </div>
            <div>
              <label className="text-[8px] uppercase font-black text-slate-400 block tracking-[0.2em] mb-0.5">Origem</label>
              <p className="text-xs font-bold text-slate-600 leading-tight uppercase">{job.origem}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center mt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
            </div>
            <div>
              <label className="text-[8px] uppercase font-black text-slate-400 block tracking-[0.2em] mb-0.5">Destino</label>
              <p className="text-xs font-bold text-slate-900 leading-tight uppercase">{job.destino}</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <label className="text-[8px] uppercase font-black text-slate-400 block tracking-[0.2em] mb-3">Ocorrências e Mensagens</label>
          
          <div className="space-y-2 mb-4 max-h-32 overflow-y-auto pr-1">
            {job.issues && job.issues.length > 0 ? (
              job.issues.map((issue) => (
                <div key={issue.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <p className="text-[11px] text-slate-700 font-bold leading-tight">{issue.text}</p>
                  <span className="text-[7px] text-slate-400 font-black uppercase mt-1 block">
                    {new Date(issue.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[9px] text-slate-300 font-black uppercase tracking-widest italic text-center py-2">Sem ocorrências registradas</p>
            )}
          </div>

          {!readOnly && (
            <div className="flex gap-2">
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Relatar problema ou aviso..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[11px] font-bold focus:border-blue-500 outline-none transition-all"
              />
              <button 
                onClick={handleSend}
                className="bg-blue-600 text-white p-3 rounded-xl shadow-lg shadow-blue-200 active:scale-90 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`px-5 py-4 border-t flex items-center justify-between ${readOnly ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
        {readOnly ? (
          <div className="flex flex-col w-full">
            <div className="flex justify-between items-center w-full mb-1">
               <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Viagem Finalizada</span>
               <div className="flex gap-2 items-center">
                  <span className="text-[10px] font-black text-slate-700">{finishedInfo.date}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="text-[10px] font-black text-slate-700">{finishedInfo.time}</span>
               </div>
            </div>
            <div className="flex items-center gap-2">
               <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
               <span className="text-[7px] font-bold text-emerald-500 uppercase tracking-widest">Sincronizado com Sucesso</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="DRB" className="w-5 h-5 rounded-sm grayscale opacity-30" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">DRB Cloud Sync Actived</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperationCard;
