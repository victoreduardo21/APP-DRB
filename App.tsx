
import React, { useState, useEffect } from 'react';
import { AppStep, OperationStatus, Job, LocationData, DriverInfo, UserRole } from './types';
import { getCurrentLocation } from './services/locationService';
import OperationCard from './components/OperationCard';
import StatusTimeline from './components/StatusTimeline';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.CHAMADA);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [pastJobs, setPastJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('drb_past_jobs');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<LocationData | null>(null);
  
  // Perfil do motorista persistido
  const [driverInfo, setDriverInfo] = useState<DriverInfo>(() => {
    const saved = localStorage.getItem('drb_driver_info');
    return saved ? JSON.parse(saved) : { name: '', plate: '', role: UserRole.DONO };
  });

  // Salva informações do motorista e histórico de viagens
  useEffect(() => {
    localStorage.setItem('drb_driver_info', JSON.stringify(driverInfo));
  }, [driverInfo]);

  useEffect(() => {
    localStorage.setItem('drb_past_jobs', JSON.stringify(pastJobs));
  }, [pastJobs]);

  // Atualização automática de GPS (simulada/real)
  useEffect(() => {
    const fetchLoc = async () => {
      try {
        const loc = await getCurrentLocation();
        setCurrentCoords(loc);
      } catch (err) {
        console.error("Erro GPS:", err);
      }
    };
    fetchLoc();
    const interval = setInterval(fetchLoc, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRequestJob = async () => {
    if (loading || activeJob) return;

    if (!driverInfo.name || !driverInfo.plate) {
      setError("Acesse Ajustes e complete seu perfil antes de solicitar serviço.");
      setCurrentStep(AppStep.AJUSTES);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const location = await getCurrentLocation();
      setTimeout(() => {
        const newJob: Job = {
          id: Math.random().toString(36).substr(2, 6).toUpperCase(),
          container: 'DRBU' + Math.floor(1000000 + Math.random() * 9000000),
          lacre: 'L-' + Math.floor(100000 + Math.random() * 900000),
          origem: 'Terminal Portuário Santos (BTP)',
          destino: 'CD Logística DRB - Cubatão',
          janela: '08:00 - 10:00',
          status: OperationStatus.PENDING,
          checkpoints: {},
          locations: { [OperationStatus.PENDING]: location },
          driver: { ...driverInfo }
        };
        setActiveJob(newJob);
        setCurrentStep(AppStep.OPERACAO);
        setLoading(false);
      }, 1500);
    } catch (err) {
      setError("Erro ao obter GPS. Verifique se a localização está ativada.");
      setLoading(false);
    }
  };

  const updateOperationStatus = async (nextStatus: OperationStatus) => {
    if (loading || !activeJob) return;
    
    setLoading(true);
    setError(null);
    try {
      const location = await getCurrentLocation();
      const now = Date.now();
      
      // Simulação de delay de rede para garantir que o usuário veja o estado de processamento
      await new Promise(resolve => setTimeout(resolve, 800));

      setActiveJob(prev => {
        if (!prev) return null;
        const updated = { ...prev, status: nextStatus };
        updated.locations[nextStatus] = location;
        if (nextStatus === OperationStatus.ARRIVED_ORIGIN) updated.checkpoints.arrivedOrigin = now;
        if (nextStatus === OperationStatus.LEFT_ORIGIN) updated.checkpoints.leftOrigin = now;
        if (nextStatus === OperationStatus.ARRIVED_DESTINATION) updated.checkpoints.arrivedDestination = now;
        if (nextStatus === OperationStatus.FINISHED) updated.checkpoints.finished = now;
        return updated;
      });
    } catch (err) {
      setError("Falha ao registrar posição GPS. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    if (activeJob) setPastJobs(prev => [activeJob, ...prev]);
    setActiveJob(null);
    setCurrentStep(AppStep.VIAGENS);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-slate-50 font-sans shadow-2xl relative overflow-hidden text-slate-900">
      {/* Header Fixo */}
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-30 shadow-lg flex items-center justify-between border-b border-blue-600/30">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="font-black text-xl tracking-tighter">DRB LOGÍSTICA</h1>
        </div>
        {currentCoords && (
          <div className="bg-green-500/10 border border-green-500/30 px-2 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold text-green-500 uppercase">GPS</span>
          </div>
        )}
      </header>

      {/* Área de Conteúdo Scrollable */}
      <main className="flex-1 p-4 pb-32 overflow-y-auto">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 text-red-700 text-xs font-bold rounded-r flex items-center gap-2 animate-bounce">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}

        {/* 1. TELA DE CHAMADA */}
        {currentStep === AppStep.CHAMADA && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            {activeJob ? (
              <div className="bg-white rounded-3xl p-8 border border-orange-200 text-center shadow-sm">
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-500">
                   <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h2 className="text-xl font-black text-slate-800 mb-4 uppercase">Viagem em Curso</h2>
                <button 
                  onClick={() => setCurrentStep(AppStep.OPERACAO)} 
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 active:scale-95 transition-transform"
                >
                  VER OPERAÇÃO
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center py-10">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 w-full mb-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Motorista Ativo</h3>
                      <p className="font-bold text-blue-600 text-sm">{driverInfo.name || "Perfil não configurado"}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-tighter">
                    <span>Placa: <span className="text-slate-800">{driverInfo.plate || "--"}</span></span>
                    <span className="bg-slate-100 px-2 py-1 rounded">{driverInfo.role}</span>
                  </div>
                </div>

                <div className="w-28 h-28 bg-blue-600/5 rounded-full flex items-center justify-center mb-6 relative">
                  <div className={`absolute inset-0 border-2 border-blue-600/20 rounded-full ${loading ? 'animate-ping' : ''}`}></div>
                  <svg className={`w-14 h-14 text-blue-600 ${loading ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase italic tracking-tighter text-center">Buscar Carga</h2>
                <p className="text-slate-400 text-center text-sm mb-10 px-8">Sua localização exata será verificada antes de iniciar.</p>
                <button 
                  onClick={handleRequestJob} 
                  disabled={loading} 
                  className={`w-full py-5 rounded-3xl font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 ${
                    loading ? 'bg-slate-300 text-slate-500 cursor-not-allowed border-b-0' : 'bg-blue-600 text-white shadow-blue-200 border-b-4 border-blue-800'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      PROCESSANDO...
                    </>
                  ) : "SOLICITAR CHAMADA"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. TELA DE OPERAÇÃO */}
        {currentStep === AppStep.OPERACAO && activeJob && (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <StatusTimeline currentStatus={activeJob.status} />
            <OperationCard job={activeJob} />
            
            <div className="pt-2">
              {activeJob.status === OperationStatus.PENDING && (
                <button 
                  disabled={loading}
                  onClick={() => updateOperationStatus(OperationStatus.ARRIVED_ORIGIN)} 
                  className={`w-full py-6 rounded-2xl font-black text-xl shadow-lg transition-all border-b-4 ${
                    loading ? 'bg-slate-200 text-slate-400 border-b-0 cursor-not-allowed' : 'bg-orange-500 text-white border-orange-700 active:translate-y-1 active:border-b-0'
                  }`}
                >
                  {loading ? 'SINCRONIZANDO GPS...' : 'CHEGUEI NA ORIGEM'}
                </button>
              )}
              {activeJob.status === OperationStatus.ARRIVED_ORIGIN && (
                <button 
                  disabled={loading}
                  onClick={() => updateOperationStatus(OperationStatus.LEFT_ORIGIN)} 
                  className={`w-full py-6 rounded-2xl font-black text-xl shadow-lg transition-all border-b-4 ${
                    loading ? 'bg-slate-200 text-slate-400 border-b-0 cursor-not-allowed' : 'bg-blue-600 text-white border-blue-800 active:translate-y-1 active:border-b-0'
                  }`}
                >
                  {loading ? 'SINCRONIZANDO GPS...' : 'SAINDO DA ORIGEM'}
                </button>
              )}
              {activeJob.status === OperationStatus.LEFT_ORIGIN && (
                <button 
                  disabled={loading}
                  onClick={() => updateOperationStatus(OperationStatus.ARRIVED_DESTINATION)} 
                  className={`w-full py-6 rounded-2xl font-black text-xl shadow-lg transition-all border-b-4 ${
                    loading ? 'bg-slate-200 text-slate-400 border-b-0 cursor-not-allowed' : 'bg-indigo-600 text-white border-indigo-800 active:translate-y-1 active:border-b-0'
                  }`}
                >
                  {loading ? 'SINCRONIZANDO GPS...' : 'CHEGUEI NO DESTINO'}
                </button>
              )}
              {activeJob.status === OperationStatus.ARRIVED_DESTINATION && (
                <button 
                  disabled={loading}
                  onClick={() => updateOperationStatus(OperationStatus.FINISHED)} 
                  className={`w-full py-6 rounded-2xl font-black text-xl shadow-lg transition-all border-b-4 ${
                    loading ? 'bg-slate-200 text-slate-400 border-b-0 cursor-not-allowed' : 'bg-green-600 text-white border-green-800 active:translate-y-1 active:border-b-0'
                  }`}
                >
                  {loading ? 'REGISTRANDO FINALIZAÇÃO...' : 'FINALIZAR ENTREGA'}
                </button>
              )}
              {activeJob.status === OperationStatus.FINISHED && (
                <div className="bg-white border-2 border-green-500/20 p-8 rounded-3xl text-center shadow-sm">
                  <h3 className="text-2xl font-black text-green-600 mb-6 uppercase italic">Operação Sucesso!</h3>
                  <button onClick={handleFinish} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-transform">SAIR E VER HISTÓRICO</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. TELA DE VIAGENS (HISTÓRICO) */}
        {currentStep === AppStep.VIAGENS && (
          <div className="space-y-6 animate-in fade-in duration-300 pb-10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Histórico DRB</h2>
              <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-full">{pastJobs.length} VIAGENS</span>
            </div>
            
            {pastJobs.length === 0 ? (
              <div className="py-20 text-center text-slate-300 font-bold uppercase text-sm border-2 border-dashed border-slate-200 rounded-3xl">Nenhuma viagem finalizada</div>
            ) : (
              <div className="space-y-5">
                {pastJobs.map(job => (
                  <div key={job.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 flex flex-col">
                    <div className="bg-slate-50 px-5 py-3 flex justify-between items-center border-b border-slate-100">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Container</span>
                        <span className="text-sm font-black text-slate-800 font-mono tracking-tighter">{job.container}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Finalizado em</span>
                        <span className="text-xs font-black text-slate-700 block">
                          {new Date(job.checkpoints.finished || 0).toLocaleDateString('pt-BR')} 
                          <span className="text-slate-400 font-normal ml-1">às {new Date(job.checkpoints.finished || 0).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center mt-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm"></div>
                          <div className="w-0.5 h-6 bg-slate-100"></div>
                        </div>
                        <div className="flex-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Origem</span>
                          <p className="text-[11px] font-bold text-slate-600 leading-tight">{job.origem}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm mt-1"></div>
                        <div className="flex-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Destino</span>
                          <p className="text-[11px] font-bold text-slate-600 leading-tight">{job.destino}</p>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-2.5 bg-blue-50/30 border-t border-slate-50 flex justify-between items-center">
                       <div className="flex items-center gap-1.5">
                         <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                         <span className="text-[8px] font-black text-blue-400 uppercase">Protocolo #{job.id}</span>
                       </div>
                       <div className="flex items-center gap-1 text-[9px] font-black text-green-600 uppercase">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l5-5z" clipRule="evenodd" /></svg>
                          Entregue
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. TELA DE AJUSTES */}
        {currentStep === AppStep.AJUSTES && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Configurações</h2>
            
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
              <section>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Tipo de Perfil</label>
                <div className="grid grid-cols-2 gap-3">
                   <button onClick={() => setDriverInfo(p => ({...p, role: UserRole.DONO}))} className={`py-3 rounded-xl border-2 font-black text-[10px] transition-all ${driverInfo.role === UserRole.DONO ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}>DONO DE CAMINHÃO</button>
                   <button onClick={() => setDriverInfo(p => ({...p, role: UserRole.TERCEIRIZADO}))} className={`py-3 rounded-xl border-2 font-black text-[10px] transition-all ${driverInfo.role === UserRole.TERCEIRIZADO ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}>TERCEIRIZADO</button>
                </div>
              </section>

              <section>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Nome Completo</label>
                <input 
                  type="text" 
                  value={driverInfo.name} 
                  onChange={e => setDriverInfo(p => ({...p, name: e.target.value.toUpperCase()}))}
                  placeholder="EX: JOÃO DA SILVA"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-blue-600 transition-all placeholder:text-slate-200"
                />
              </section>

              <section>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Placa do Veículo</label>
                <input 
                  type="text" 
                  value={driverInfo.plate} 
                  onChange={e => setDriverInfo(p => ({...p, plate: e.target.value.toUpperCase()}))}
                  placeholder="EX: ABC1D23"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-mono font-black focus:outline-none focus:border-blue-600 transition-all placeholder:text-slate-200"
                />
              </section>

              <div className="pt-4 border-t border-slate-100">
                <button 
                  disabled={loading}
                  onClick={() => {
                    setError(null);
                    setCurrentStep(AppStep.CHAMADA);
                  }}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-sm shadow-xl active:scale-95 transition-transform disabled:opacity-50"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>

            <div className="p-4 text-center">
               <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em]">DRB Logística © 2025</p>
               <p className="text-[8px] text-slate-200 mt-1 uppercase">Monitoramento em tempo real</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer Nav Fixo */}
      <footer className="bg-white border-t border-slate-200 p-4 fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center max-w-md mx-auto shadow-[0_-10px_30px_rgba(0,0,0,0.05)] rounded-t-[32px]">
        <button disabled={loading} onClick={() => setCurrentStep(AppStep.CHAMADA)} className={`flex-1 flex flex-col items-center gap-1 transition-all ${currentStep === AppStep.CHAMADA ? 'text-blue-600 scale-110 font-black' : 'text-slate-300'}`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
          <span className="text-[9px] uppercase tracking-tighter">Início</span>
        </button>
        
        <button disabled={loading || !activeJob} onClick={() => activeJob && setCurrentStep(AppStep.OPERACAO)} className={`flex-1 flex flex-col items-center gap-1 transition-all ${!activeJob ? 'opacity-20' : ''} ${currentStep === AppStep.OPERACAO ? 'text-blue-600 scale-110 font-black' : 'text-slate-300'}`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
          <span className="text-[9px] uppercase tracking-tighter">Serviço</span>
        </button>

        {driverInfo.role === UserRole.DONO && (
          <button disabled={loading} onClick={() => setCurrentStep(AppStep.VIAGENS)} className={`flex-1 flex flex-col items-center gap-1 transition-all ${currentStep === AppStep.VIAGENS ? 'text-blue-600 scale-110 font-black' : 'text-slate-300'}`}>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3 1h10v2H5V6zm0 4h10v2H5v-2zm0 4h5v2H5v-2z" clipRule="evenodd" /></svg>
            <span className="text-[9px] uppercase tracking-tighter">Viagens</span>
          </button>
        )}

        <button disabled={loading} onClick={() => setCurrentStep(AppStep.AJUSTES)} className={`flex-1 flex flex-col items-center gap-1 transition-all ${currentStep === AppStep.AJUSTES ? 'text-blue-600 scale-110 font-black' : 'text-slate-300'}`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
          <span className="text-[9px] uppercase tracking-tighter">Perfil</span>
        </button>
      </footer>
    </div>
  );
};

export default App;
