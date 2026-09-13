import { DiagramArrow, DiagramFrame, DiagramKicker, DiagramNode, DiagramRule } from './shared';

export function DataFlowDiagram() {
  return (
    <DiagramFrame label="观潮每日自动化流水线：采集、整理、摘要生成、页面渲染、每日发布">
      <DiagramKicker>DAILY AUTOMATION / SHIP THE BRIEF</DiagramKicker>
      <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-stretch md:gap-3">
        <DiagramNode delay={0} label="01">采集</DiagramNode>
        <DiagramArrow />
        <DiagramNode delay={80} label="02">整理</DiagramNode>
        <DiagramArrow />
        <DiagramNode delay={160} label="03">摘要生成</DiagramNode>
        <DiagramArrow />
        <DiagramNode delay={240} label="04">页面渲染</DiagramNode>
        <DiagramArrow />
        <DiagramNode delay={320} label="05">每日发布</DiagramNode>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <DiagramRule>每天重新完成一次闭环</DiagramRule>
        <DiagramRule>人负责判断，系统负责搬运</DiagramRule>
      </div>
    </DiagramFrame>
  );
}
