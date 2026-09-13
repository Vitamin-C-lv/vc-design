import { DiagramArrow, DiagramFrame, DiagramKicker, DiagramNode, DiagramReveal, DiagramRule } from './shared';

function ValueBar({ label, value, detail, delay }: { label: string; value: string; detail: string; delay: number }) {
  return (
    <DiagramReveal delay={delay} className="border border-[var(--tone-line)] bg-[var(--tone-surface)] p-4 md:p-5">
      <div className="flex items-baseline justify-between gap-4">
        <span className="type-label tone-fg">{label}</span>
        <span className="type-label-sm tone-accent-text">{value}</span>
      </div>
      <div className="mt-4 h-1 bg-[var(--tone-line-soft)]">
        <div className="h-full bg-[var(--tone-accent)]" style={{ width: value }} />
      </div>
      <p className="type-label-sm tone-mute mt-3">{detail}</p>
    </DiagramReveal>
  );
}

export function EmotionStateDiagram() {
  return (
    <DiagramFrame label="情绪状态机：开心与精力持续衰减和恢复，状态在 sleep、relaxed、finding 之间转移">
      <DiagramKicker>STATE MACHINE / DECAY + RECOVERY</DiagramKicker>
      <div className="grid gap-3 md:grid-cols-2">
        <ValueBar label="开心" value="68%" detail="DECAY ↘ / RECOVER ↗" delay={0} />
        <ValueBar label="精力" value="42%" detail="DECAY ↘ / RECOVER ↗" delay={80} />
      </div>
      <div className="mt-8 flex flex-col items-stretch gap-3 md:flex-row md:items-stretch md:gap-3">
        <DiagramNode delay={160} label="SLEEP">sleep</DiagramNode>
        <DiagramArrow />
        <DiagramNode delay={240} label="RESTORE">relaxed</DiagramNode>
        <DiagramArrow />
        <DiagramNode delay={320} label="INPUT">finding</DiagramNode>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <DiagramRule>数值驱动表情、动画与对话语气</DiagramRule>
        <DiagramRule>行为输入让状态恢复或继续衰减</DiagramRule>
      </div>
    </DiagramFrame>
  );
}
