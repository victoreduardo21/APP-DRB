
import React from 'react';
import { OperationStatus } from '../types';

interface StatusTimelineProps {
  currentStatus: OperationStatus;
}

const steps = [
  { status: OperationStatus.PENDING, label: 'Início' },
  { status: OperationStatus.ARRIVED_ORIGIN, label: 'Origem' },
  { status: OperationStatus.LEFT_ORIGIN, label: 'Trânsito' },
  { status: OperationStatus.ARRIVED_DESTINATION, label: 'Destino' },
  { status: OperationStatus.FINISHED, label: 'Fim' },
];

const StatusTimeline: React.FC<StatusTimelineProps> = ({ currentStatus }) => {
  const currentIndex = steps.findIndex(s => s.status === currentStatus);

  return (
    <div className="flex items-center justify-between px-2 py-6 mb-4">
      {steps.map((step, index) => (
        <React.Fragment key={step.status}>
          <div className="flex flex-col items-center relative group">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500 z-10 ${
              index < currentIndex 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                : index === currentIndex 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-125 border-4 border-white' 
                  : 'bg-white text-slate-300 border border-slate-200'
            }`}>
              {index < currentIndex ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              ) : (index + 1)}
            </div>
            <span className={`absolute -bottom-6 whitespace-nowrap text-[8px] font-black uppercase tracking-tighter transition-colors duration-500 ${
              index <= currentIndex ? 'text-blue-600' : 'text-slate-300'
            }`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 px-1 z-0">
               <div className={`h-1 rounded-full transition-all duration-700 ${
                index < currentIndex ? 'bg-blue-600' : 'bg-slate-200'
              }`} />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StatusTimeline;
