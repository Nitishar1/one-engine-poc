import { CirclePlay, CircleStop, ListTree, Sparkles, Split } from 'lucide-react';

const PIPELINE = [
  { icon: CirclePlay, label: 'Start', tone: '#34d399' },
  { icon: ListTree, label: 'Agent', tone: '#60a5fa' },
  { icon: Split, label: 'Condition', tone: '#fbbf24' },
  { icon: CircleStop, label: 'End', tone: '#f87171' },
];

/**
 * Translucent panels floating over the sign-in diagram: a runbook pipeline built from the
 * builder's real step types, and the AI agent capabilities. Decorative only.
 */
export function LoginFloatingPanels() {
  return (
    <>
      <div
        aria-hidden
        className="oe-login-float absolute right-0 top-[66px] w-[250px] p-3.5"
        style={{ ['--oe-float-delay' as string]: '-3s' }}
      >
        <p className="m-0 mb-3 flex items-center justify-between text-[11px] font-medium text-[#bfdbfe]/80">
          Runbook pipeline
          <span className="font-mono text-[10px] text-[#67e8f9]/80">orchestrating</span>
        </p>
        <div className="relative flex items-center justify-between">
          <span className="oe-login-pipe" />
          {PIPELINE.map(({ icon: Icon, label, tone }) => (
            <span key={label} className="relative z-10 flex flex-col items-center gap-1.5">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-white/15 bg-[#0b1838]"
                style={{ color: tone, boxShadow: `0 0 14px -4px ${tone}` }}
              >
                <Icon size={14} strokeWidth={2} />
              </span>
              <span className="text-[10px] text-[#c7d6f5]/70">{label}</span>
            </span>
          ))}
        </div>
      </div>

      <div
        aria-hidden
        className="oe-login-float absolute right-2 top-[212px] w-[236px] p-3.5"
        style={{ ['--oe-float-delay' as string]: '-7s' }}
      >
        <p className="m-0 flex items-center gap-2 whitespace-nowrap text-[12px] font-medium text-white/90">
          <span className="oe-ai-orb is-active h-5 w-5">
            <Sparkles size={10} strokeWidth={2.4} />
          </span>
          AI agent
          <span className="ml-auto font-mono text-[10px] text-[#a5b4fc]/80">
            summarise · extract
          </span>
        </p>
        <div className="oe-ai-shimmer mt-3" />
        <div className="mt-2.5 flex flex-col gap-1.5">
          <span className="h-1.5 w-full rounded-full bg-white/10" />
          <span className="h-1.5 w-4/5 rounded-full bg-white/10" />
          <span className="h-1.5 w-3/5 rounded-full bg-white/[0.07]" />
        </div>
      </div>
    </>
  );
}
