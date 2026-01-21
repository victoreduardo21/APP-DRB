
import React from 'react';
import { OperationStatus } from '../types';

interface StatusTimelineProps {
  currentStatus: OperationStatus;
}

const steps = [
  { status: OperationStatus.PENDING, label: 'Início' },
  { status: OperationStatus.ARRIVED_ORIGIN, label: 'Chegou Origem' },
  { status: OperationStatus.LEFT_ORIGIN, label: 'Saiu Origem' },
  { status: OperationStatus.ARRIVED_DESTINATION, label: 'Chegou Destino' },
  { status: OperationStatus.FINISHED, label: 'Finalizado' },
];

const StatusTimeline: React.FC<StatusTimelineProps> = ({ currentStatus }) => {
  const currentIndex = steps.findIndex(s => s.status === currentStatus);

  return (
    <div className="flex items-center justify-between px-4 py-8 mb-6">
      {steps.map((step, index) => (
        <React.Fragment key={step.status}>
          <div className="flex flex-col items-center relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              index <= currentIndex ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
            }`}>
              {index + 1}
            </div>
            <span className={`absolute -bottom-6 whitespace-nowrap text-[10px] font-bold ${
              index <= currentIndex ? 'text-blue-600' : 'text-slate-400'
            }`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 transition-colors ${
              index < currentIndex ? 'bg-blue-600' : 'bg-slate-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StatusTimeline;
