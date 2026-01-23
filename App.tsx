
import React, { useState, useEffect } from 'react';
import { AppStep, OperationStatus, Job, LocationData, DriverInfo, UserRole, Issue } from './types';
import { getCurrentLocation } from './services/locationService';
import OperationCard from './components/OperationCard';
import StatusTimeline from './components/StatusTimeline';

const LOGO_URL = "https://media.licdn.com/dms/image/v2/C4D0BAQHFeZ2qK66-ow/company-logo_200_200/company-logo_200_200/0/1660330615044?e=2147483647&v=beta&t=b4ByKgKdb_l825tt68RwOTrv8tjFV-YLQj_OjcUvdTM";

const PLANILHA_DATABASE = [
  { cpf: '12345678900', name: 'CARLOS ALBERTO', plate: 'BRA2E19', role: UserRole.TERCEIRIZADO },
  { cpf: '98765432100', name: 'MARCOS OLIVEIRA', plate: 'KRM4I22', role: UserRole.DONO },
  { cpf: '11122233344', name: 'REINALDO SILVA', plate: 'DRB0L10', role: UserRole.TERCEIRIZADO },
  { cpf: '50667768858', name: 'VICTOR SOUZA', plate: 'VTR-2024', role: UserRole.TERCEIRIZADO },
];

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(() => {
    const saved = localStorage.getItem('drb_driver_info');
    return saved ? AppStep.CHAMADA : AppStep.LOGIN;
  });

  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [pastJobs, setPastJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('drb_past_jobs');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [driverInfo, setDriverInfo] = useState<DriverInfo>(() => {
    const saved = localStorage.getItem('drb_driver_info');
    return saved ? JSON.parse(saved) : { name: '', cpf: '', birthDate: '', plate: '', role: UserRole.TERCEIRIZADO };
  });

  const [formName, setFormName] = useState('');
  const [formCpf, setFormCpf] = useState('');
  const [formPlate, setFormPlate] = useState('');
  const [formBirth, setFormBirth] = useState('');
  const [formRole, setFormRole] = useState<UserRole>(UserRole.TERCEIRIZADO);

  useEffect(() => {
    if (driverInfo.cpf && driverInfo.name) {
      localStorage.setItem('drb_driver_info', JSON.stringify(driverInfo));
    }
  }, [driverInfo]);

  useEffect(() => {
    localStorage.setItem('drb_past_jobs', JSON.stringify(pastJobs));
  }, [pastJobs]);

  const handleLogin = async () => {
    const cleanCpf = formCpf.replace(/\D/g, '');
    const cleanPlate = formPlate.trim().toUpperCase();

    if (!cleanCpf || !cleanPlate) {
      setError("Informe CPF e Placa para entrar.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    
    setTimeout(() => {
      const dbUser = PLANILHA_DATABASE.find(u => u.cpf === cleanCpf && u.plate === cleanPlate);
      const localUsersStr = localStorage.getItem('drb_registered_users');
      const localUsers = localUsersStr ? JSON.parse(localUsersStr) : [];
      const registeredUser = localUsers.find((u: any) => u.cpf === cleanCpf && u.plate === cleanPlate);

      const foundUser = dbUser || registeredUser;

      if (foundUser) {
        setDriverInfo({
          name: foundUser.name,
          cpf: foundUser.cpf,
          plate: foundUser.plate,
          birthDate: foundUser.birthDate || '---',
          role: foundUser.role
        });
        setCurrentStep(AppStep.CHAMADA);
      } else {
        setError("Dados incorretos. Verifique e tente de novo.");
      }
      setLoading(false);
    }, 1200);
  };

  const handleCadastro = () => {
    if (!formName || !formCpf || !formBirth || !formPlate) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newUser = {
        name: formName.toUpperCase(),
        cpf: formCpf.replace(/\D/g, ''),
        birthDate: formBirth,
        plate: formPlate.toUpperCase(),
        role: formRole
      };
      
      const localUsersStr = localStorage.getItem('drb_registered_users');
      const localUsers = localUsersStr ? JSON.parse(localUsersStr) : [];
      localUsers.push(newUser);
      localStorage.setItem('drb_registered_users', JSON.stringify(localUsers));

      setLoading(false);
      setError(null);
      setSuccessMsg("Cadastro realizado! Entre agora.");
      setCurrentStep(AppStep.LOGIN);
      
      setFormName('');
      setFormCpf('');
      setFormPlate('');
      setFormBirth('');
    }, 1000);
  };

  const handleRequestJob = async () => {
    if (loading || activeJob) return;
    setLoading(true);
    try {
      const location = await getCurrentLocation();
      setTimeout(() => {
        setActiveJob({
          id: Math.random().toString(36).substr(2, 6).toUpperCase(),
          container: 'DRBU' + Math.floor(1000000 + Math.random() * 9000000),
          lacre: 'L-' + Math.floor(100000 + Math.random() * 900000),
          origem: 'Terminal Portuário Santos (BTP)',
          destino: 'CD Logística DRB - Cubatão',
          janela: '08:00 - 10:00',
          status: OperationStatus.PENDING,
          issues: [],
          checkpoints: {},
          locations: { [OperationStatus.PENDING]: location },
          driver: { ...driverInfo }
        });
        setCurrentStep(AppStep.OPERACAO);
        setLoading(false);
      }, 1500);
    } catch (err) {
      setError("GPS obrigatório.");
      setLoading(false);
    }
  };

  const handleAddIssue = (text: string) => {
    if (!activeJob) return;
    const newIssue: Issue = {
      id: Math.random().toString(36).substr(2, 9),
      text: text.toUpperCase(),
      timestamp: Date.now()
    };
    setActiveJob(prev => {
      if (!prev) return null;
      return {
        ...prev,
        issues: [newIssue, ...prev.issues]
      };
    });
  };

  const updateOperationStatus = async (nextStatus: OperationStatus) => {
    if (loading || !activeJob) return;
    setLoading(true);
    try {
      const location = await getCurrentLocation();
      const now = Date.now();
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
      setError("Erro no GPS.");
    } finally {
      setLoading(false);
    }
  };

  const finalizeJob = () => {
    if (activeJob) {
      setPastJobs(prev => [activeJob, ...prev]);
      setActiveJob(null);
      setCurrentStep(AppStep.CHAMADA);
      setSuccessMsg("Manifesto arquivado com sucesso!");
    }
  };

  const logout = () => {
    localStorage.removeItem('drb_driver_info');
    setDriverInfo({ name: '', cpf: '', birthDate: '', plate: '', role: UserRole.TERCEIRIZADO });
    setCurrentStep(AppStep.LOGIN);
    setFormCpf('');
    setFormPlate('');
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-white font-sans shadow-2xl relative overflow-hidden text-slate-900 select-none">
      
      {currentStep !== AppStep.LOGIN && currentStep !== AppStep.CADASTRO && (
        <header className="bg-white/95 px-6 py-4 sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="DRB" className="w-10 h-10 rounded-xl shadow-sm border border-slate-50" />
            <div className="flex flex-col">
               <h1 className="font-black text-[15px] tracking-tighter text-[#1D4ED8] italic leading-none">DRB LOGÍSTICA</h1>
               <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Gestão de Frotas</span>
            </div>
          </div>
          <button onClick={logout} className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 active:scale-95 transition-all">Sair</button>
        </header>
      )}

      <main className={`flex-1 ${currentStep === AppStep.LOGIN || currentStep === AppStep.CADASTRO ? '' : 'p-6 pb-36'} overflow-y-auto`}>
        
        {(error || successMsg) && (
          <div className="fixed top-24 left-0 right-0 z-[60] px-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className={`p-4 rounded-2xl flex items-center gap-4 border shadow-2xl bg-white ${error ? 'border-red-100 text-red-600' : 'border-emerald-100 text-emerald-600'}`}>
              <div className={`p-2 rounded-full ${error ? 'bg-red-500' : 'bg-emerald-500'} text-white`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  {error ? (
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  )}
                </svg>
              </div>
              <span className="text-[11px] font-black uppercase tracking-tight flex-1">{error || successMsg}</span>
              <button onClick={() => { setError(null); setSuccessMsg(null); }} className="text-slate-300 hover:text-slate-900 transition-colors">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* LOGIN */}
        {currentStep === AppStep.LOGIN && (
          <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#F0F7FF_0%,_transparent_50%)] -z-10"></div>
            <div className="w-full max-w-xs">
              <div className="text-center mb-12">
                <div className="bg-white p-1 rounded-full shadow-2xl shadow-blue-500/20 mb-10 mx-auto w-28 h-28 flex items-center justify-center border border-slate-50">
                   <img src={LOGO_URL} alt="Logo" className="w-full h-full rounded-full" />
                </div>
                <h2 className="text-[48px] font-black text-slate-900 italic tracking-tighter uppercase leading-none mb-2">ACESSO</h2>
                <p className="text-[#1D4ED8] font-black uppercase text-[10px] tracking-[0.4em] opacity-80">Portal do Transportador</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identificação (CPF)</label>
                  <input type="text" value={formCpf} onChange={e => setFormCpf(e.target.value)} placeholder="000.000.000-00" className="w-full bg-slate-50 border-2 border-slate-100 rounded-[22px] px-6 py-5 text-base text-slate-900 font-black focus:border-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-300" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Placa do Veículo</label>
                  <input type="text" value={formPlate} onChange={e => setFormPlate(e.target.value.toUpperCase())} placeholder="ABC1D23" className="w-full bg-slate-50 border-2 border-slate-100 rounded-[22px] px-6 py-5 text-base text-slate-900 font-black focus:border-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-300 uppercase tracking-widest" />
                </div>
                <button onClick={handleLogin} disabled={loading} className="w-full bg-[#1D4ED8] text-white py-6 rounded-[22px] font-black text-[15px] tracking-widest shadow-2xl shadow-blue-400/30 mt-8 active:scale-[0.96] transition-all flex items-center justify-center border-b-[6px] border-[#1E3A8A]">
                  {loading ? 'VALIDANDO...' : 'ENTRAR NO SISTEMA'}
                </button>
                <div className="text-center pt-8">
                   <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Não tem cadastro? <button onClick={() => { setError(null); setSuccessMsg(null); setCurrentStep(AppStep.CADASTRO); }} className="text-[#1D4ED8] underline underline-offset-4 ml-2">Registrar Agora</button></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CADASTRO */}
        {currentStep === AppStep.CADASTRO && (
          <div className="min-h-screen bg-white p-8 flex flex-col justify-center animate-in fade-in duration-700 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_#F0F7FF_0%,_transparent_40%)] -z-10"></div>
            <div className="max-w-xs mx-auto w-full">
              <div className="mb-12">
                <button onClick={() => setCurrentStep(AppStep.LOGIN)} className="text-blue-600 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 mb-8 bg-blue-50 px-4 py-3 rounded-[18px] w-fit shadow-sm border border-blue-100 active:scale-95 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" d="M15 19l-7-7 7-7" /></svg>
                  VOLTAR
                </button>
                <h2 className="text-[38px] font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-2">REGISTRO</h2>
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] ml-1">Novos Motoristas</p>
              </div>
              <div className="space-y-6">
                <section className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                  <div className="bg-slate-100/60 p-1.5 rounded-[22px] flex gap-2 border border-slate-200/50 shadow-inner">
                     <button onClick={() => setFormRole(UserRole.DONO)} className={`flex-1 py-4 rounded-[18px] font-black text-[10px] uppercase transition-all ${formRole === UserRole.DONO ? 'bg-white text-blue-700 shadow-md ring-1 ring-slate-100' : 'text-slate-400'}`}>Dono</button>
                     <button onClick={() => setFormRole(UserRole.TERCEIRIZADO)} className={`flex-1 py-4 rounded-[18px] font-black text-[10px] uppercase transition-all ${formRole === UserRole.TERCEIRIZADO ? 'bg-white text-blue-700 shadow-md ring-1 ring-slate-100' : 'text-slate-400'}`}>Terceiro</button>
                  </div>
                </section>
                <div className="space-y-5">
                   <input type="text" placeholder="NOME COMPLETO" value={formName} onChange={e => setFormName(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-[22px] px-6 py-5 text-sm text-slate-900 font-black focus:border-blue-600 outline-none uppercase" />
                   <input type="text" placeholder="DOCUMENTO (CPF)" value={formCpf} onChange={e => setFormCpf(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-[22px] px-6 py-5 text-sm text-slate-900 font-black focus:border-blue-600 outline-none" />
                   <div className="grid grid-cols-2 gap-4">
                      <input type="date" value={formBirth} onChange={e => setFormBirth(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-[22px] px-4 py-5 text-xs text-slate-900 font-black outline-none focus:border-blue-600" />
                      <input type="text" placeholder="PLACA" value={formPlate} onChange={e => setFormPlate(e.target.value.toUpperCase())} className="w-full bg-blue-50/30 border-2 border-blue-100/50 rounded-[22px] px-4 py-5 text-sm text-blue-900 font-black focus:border-blue-600 uppercase tracking-wider" />
                   </div>
                </div>
                <button onClick={handleCadastro} disabled={loading} className="w-full bg-[#1D4ED8] text-white py-6 rounded-[22px] font-black text-[15px] shadow-2xl shadow-blue-500/20 mt-8 active:scale-[0.96] transition-all flex items-center justify-center border-b-[6px] border-[#1E3A8A] tracking-[0.2em]">
                  {loading ? 'PROCESSANDO...' : 'FINALIZAR REGISTRO'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HOME / DASHBOARD */}
        {currentStep === AppStep.CHAMADA && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 w-full shadow-2xl shadow-blue-900/5 relative overflow-hidden">
              <div className="flex items-center gap-6 mb-10 relative z-10">
                <div className="w-16 h-16 bg-blue-600 p-1.5 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200 ring-4 ring-blue-50 border-2 border-white">
                  <img src={LOGO_URL} alt="Logo" className="w-full h-full rounded-xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-400 uppercase text-[9px] tracking-[0.3em] mb-1.5 leading-none">Motorista Confirmado</h3>
                  <p className="font-black text-slate-900 text-2xl uppercase truncate leading-none tracking-tighter italic">{driverInfo.name}</p>
                  <div className="flex items-center gap-2 mt-2.5">
                    <span className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">CPF</span>
                    <p className="text-[11px] font-black text-blue-600 tracking-widest font-mono">{driverInfo.cpf}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col shadow-inner">
                  <span className="text-[9px] font-black text-slate-400 uppercase block tracking-widest mb-1.5">Veículo</span>
                  <span className="text-base font-black text-slate-900 font-mono tracking-widest italic">{driverInfo.plate}</span>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col items-end shadow-inner">
                  <span className="text-[9px] font-black text-slate-400 uppercase block tracking-widest mb-1.5">Regime</span>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${driverInfo.role === UserRole.DONO ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{driverInfo.role}</span>
                </div>
              </div>
            </div>

            {activeJob ? (
              <div className="bg-white rounded-[32px] p-10 border-2 border-blue-50 text-center shadow-2xl shadow-blue-900/5">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 shadow-inner">
                   <svg className="w-10 h-10 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h2 className="text-base font-black text-slate-800 mb-8 uppercase tracking-widest">Viagem Sincronizada</h2>
                <button onClick={() => setCurrentStep(AppStep.OPERACAO)} className="w-full bg-[#1D4ED8] text-white py-6 rounded-2xl font-black text-[12px] tracking-widest shadow-xl shadow-blue-200 border-b-[6px] border-[#1E3A8A] active:translate-y-1.5 transition-all">VISUALIZAR CARGA</button>
              </div>
            ) : (
              <div className="flex flex-col items-center py-12">
                <div className="w-44 h-44 bg-white border border-slate-50 rounded-full flex items-center justify-center mb-12 relative shadow-2xl shadow-blue-900/10">
                  <div className={`absolute inset-0 border-[8px] border-blue-50 rounded-full ${loading ? 'animate-ping' : ''}`}></div>
                  <img src={LOGO_URL} alt="Busca" className={`w-28 h-28 rounded-full ${loading ? 'animate-pulse grayscale opacity-40' : ''}`} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-3 uppercase italic tracking-tighter leading-none text-center">Localizar<br/>Manifesto</h2>
                <button onClick={handleRequestJob} disabled={loading} className={`w-full py-7 rounded-[28px] font-black text-[15px] tracking-[0.2em] shadow-2xl transition-all active:scale-[0.96] border-b-[8px] ${loading ? 'bg-slate-200 text-slate-400 border-slate-300' : 'bg-[#1D4ED8] text-white shadow-blue-400/30 border-[#1E3A8A]'}`}>
                  {loading ? 'BUSCANDO...' : 'SOLICITAR CHAMADA'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* LOGS / HISTÓRICO */}
        {currentStep === AppStep.VIAGENS && (
          <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
            <div className="mb-4">
              <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Histórico</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Viagens Concluídas</p>
            </div>
            
            {pastJobs.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] p-16 text-center">
                 <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Nenhum manifesto encontrado</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pastJobs.map(job => (
                  <div key={job.id} className="relative">
                    <div className="absolute -top-3 left-4 z-10 bg-slate-900 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-slate-800 shadow-lg">
                      {new Date(job.checkpoints.finished || Date.now()).toLocaleDateString('pt-BR')}
                    </div>
                    <OperationCard job={job} readOnly={true} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* OPERAÇÃO ATIVA */}
        {currentStep === AppStep.OPERACAO && activeJob && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
            <StatusTimeline currentStatus={activeJob.status} />
            <OperationCard job={activeJob} onSendMessage={handleAddIssue} />
            <div className="pt-4">
              {Object.values(OperationStatus).map((status, idx) => {
                if (status === activeJob.status && status !== OperationStatus.FINISHED) {
                  const nextStatus = Object.values(OperationStatus)[idx + 1] as OperationStatus;
                  const labels: any = {
                    [OperationStatus.PENDING]: 'REGISTRAR CHEGADA ORIGEM',
                    [OperationStatus.ARRIVED_ORIGIN]: 'CONFIRMAR SAÍDA ORIGEM',
                    [OperationStatus.LEFT_ORIGIN]: 'REGISTRAR CHEGADA DESTINO',
                    [OperationStatus.ARRIVED_DESTINATION]: 'ENCERRAR OPERAÇÃO',
                  };
                  return (
                    <button key={status} disabled={loading} onClick={() => updateOperationStatus(nextStatus)} className="w-full py-7 rounded-[32px] bg-[#1D4ED8] text-white font-black text-[14px] tracking-[0.2em] border-b-[8px] border-[#1E3A8A] active:translate-y-2 active:border-b-0 shadow-2xl shadow-blue-900/10 transition-all flex items-center justify-center gap-3">
                      {loading ? <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div> : labels[status]}
                    </button>
                  );
                }
                return null;
              })}
              {activeJob.status === OperationStatus.FINISHED && (
                <div className="bg-white border-2 border-emerald-50 p-12 rounded-[56px] text-center shadow-2xl shadow-emerald-900/5">
                  <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-10 text-emerald-500 shadow-inner ring-8 ring-emerald-50/50">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-3 uppercase italic tracking-tight leading-none">Carga Entregue</h3>
                  <p className="text-slate-400 text-[11px] font-black uppercase mb-12 tracking-[0.3em] opacity-60">Operação finalizada com sucesso</p>
                  <button onClick={finalizeJob} className="w-full bg-slate-900 text-white py-7 rounded-[32px] font-black text-[12px] tracking-[0.3em] uppercase hover:bg-black transition-all shadow-2xl active:scale-95 border-b-[8px] border-slate-700">FECHAR MANIFESTO</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AJUSTES */}
        {currentStep === AppStep.AJUSTES && (
           <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Minha Conta</h2>
              <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm">
                       <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Nome de Exibição</p>
                       <p className="font-black text-slate-900 uppercase text-lg italic tracking-tighter">{driverInfo.name}</p>
                    </div>
                 </div>
                 <button onClick={logout} className="w-full bg-red-50 text-red-600 py-6 rounded-[22px] font-black text-[10px] uppercase tracking-[0.3em] active:bg-red-100 transition-colors border border-red-100">Desconectar Aparelho</button>
              </div>
           </div>
        )}

      </main>

      {currentStep !== AppStep.LOGIN && currentStep !== AppStep.CADASTRO && (
        <footer className="bg-white/95 border-t border-slate-100 px-6 py-6 fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center max-w-md mx-auto rounded-t-[56px] shadow-[0_-20px_60px_rgba(0,0,0,0.12)] backdrop-blur-xl">
          <button onClick={() => setCurrentStep(AppStep.CHAMADA)} className={`flex flex-col items-center gap-2.5 transition-all ${currentStep === AppStep.CHAMADA ? 'text-blue-600 font-black scale-110' : 'text-slate-300'}`}>
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
            <span className="text-[10px] uppercase tracking-widest font-black">HOME</span>
          </button>
          <button disabled={!activeJob} onClick={() => activeJob && setCurrentStep(AppStep.OPERACAO)} className={`flex flex-col items-center gap-2.5 transition-all ${!activeJob ? 'opacity-10' : ''} ${currentStep === AppStep.OPERACAO ? 'text-blue-600 font-black scale-110' : 'text-slate-300'}`}>
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
            <span className="text-[10px] uppercase tracking-widest font-black">CARGA</span>
          </button>
          <button onClick={() => setCurrentStep(AppStep.VIAGENS)} className={`flex flex-col items-center gap-2.5 transition-all ${currentStep === AppStep.VIAGENS ? 'text-blue-600 font-black scale-110' : 'text-slate-300'}`}>
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3 1h10v2H5V6zm0 4h10v2H5v-2zm0 4h5v2H5v-2z" clipRule="evenodd" /></svg>
            <span className="text-[10px] uppercase tracking-widest font-black">LOGS</span>
          </button>
          <button onClick={() => setCurrentStep(AppStep.AJUSTES)} className={`flex flex-col items-center gap-2.5 transition-all ${currentStep === AppStep.AJUSTES ? 'text-blue-600 font-black scale-110' : 'text-slate-300'}`}>
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
            <span className="text-[10px] uppercase tracking-widest font-black">CONTA</span>
          </button>
        </footer>
      )}
    </div>
  );
};

export default App;
