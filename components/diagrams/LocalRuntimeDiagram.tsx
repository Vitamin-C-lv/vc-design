import { DiagramFrame, DiagramKicker, DiagramNode, DiagramReveal, DiagramRule } from './shared';

const productLayer = ['人格', '情绪', '记忆', '对话', '业务逻辑'];
const runtimeLayer = ['模型加载', '推理调度', '资源管理'];

export function LocalRuntimeDiagram() {
  return (
    <DiagramFrame label="本地优先架构：上层产品层与下层运行时层解耦，数据不出设备">
      <DiagramKicker>LOCAL-FIRST ARCHITECTURE / TWO LAYERS</DiagramKicker>
      <div className="space-y-4">
        <div>
          <p className="type-label-sm tone-accent-text mb-3">PRODUCT LAYER</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {productLayer.map((item, index) => (
              <DiagramNode key={item} delay={index * 70}>{item}</DiagramNode>
            ))}
          </div>
        </div>
        <DiagramReveal delay={380}>
          <div className="border-y border-[var(--tone-accent)] py-3 text-center">
            <span className="type-label-sm tone-accent-text">边界清晰 / 数据留在设备内</span>
          </div>
        </DiagramReveal>
        <div>
          <p className="type-label-sm tone-accent-text mb-3">RUNTIME LAYER</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {runtimeLayer.map((item, index) => (
              <DiagramNode key={item} delay={430 + index * 70}>{item}</DiagramNode>
            ))}
          </div>
        </div>
        <DiagramRule>本地优先 / 数据不出设备</DiagramRule>
      </div>
    </DiagramFrame>
  );
}
