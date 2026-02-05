import { Check } from 'lucide-react';
import { WORKFLOW_STEPS } from '../utils/constants';

export function Stepper({ currentStep, completedSteps }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {WORKFLOW_STEPS.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = currentStep === step.id;
        const isPast = step.id < currentStep;
        
        return (
          <div key={step.id} className="flex items-center">
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  text-sm font-medium transition-all duration-300
                  ${isCompleted 
                    ? 'bg-white/20 text-white ring-2 ring-white/40' 
                    : isCurrent 
                      ? 'bg-white text-black ring-2 ring-white/40' 
                      : 'bg-surface-100 text-zinc-500 ring-1 ring-border'
                  }
                `}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step.id}
              </div>
              <div className="mt-2 text-center">
                <div className={`text-xs font-medium transition-colors ${
                  isCurrent ? 'text-zinc-100' : 'text-zinc-500'
                }`}>
                  {step.title}
                </div>
                <div className="text-2xs text-zinc-600 mt-0.5 max-w-[100px]">
                  {step.description}
                </div>
              </div>
            </div>
            
            {/* Connector line */}
            {index < WORKFLOW_STEPS.length - 1 && (
              <div 
                className={`
                  w-16 h-0.5 mx-3 mt-[-28px] transition-colors duration-300
                  ${isPast || isCompleted ? 'bg-white/40' : 'bg-border'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
