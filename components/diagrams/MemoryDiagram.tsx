import { DiagramArrow, DiagramFrame, DiagramKicker, DiagramNode, DiagramRule } from './shared';

export function MemoryDiagram() {
  return (
    <DiagramFrame label="长期记忆结构：原始经历被提炼为结构化记忆条目，按相关度和时间检索，并随时间衰减">
      <DiagramKicker>LONG-TERM MEMORY / RELEVANCE × TIME</DiagramKicker>
      <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-stretch lg:gap-3">
        <DiagramNode delay={0} label="01">原始经历</DiagramNode>
        <DiagramArrow />
        <DiagramNode delay={90} label="02">结构化记忆条目</DiagramNode>
        <DiagramArrow />
        <DiagramNode delay={180} label="03">按相关度 + 时间检索</DiagramNode>
        <DiagramArrow />
        <DiagramNode delay={270} label="04">记忆随时间衰减</DiagramNode>
      </div>
      <div className="mt-6 grid gap-6 border-t border-[var(--tone-line)] pt-5 md:grid-cols-2">
        <DiagramRule>重要经历留下结构，不把聊天原文堆回上下文</DiagramRule>
        <DiagramRule>被检索到的记忆会影响当前状态</DiagramRule>
      </div>
    </DiagramFrame>
  );
}
