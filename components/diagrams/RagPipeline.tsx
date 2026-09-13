import { DiagramArrow, DiagramFrame, DiagramKicker, DiagramNode, DiagramRule } from './shared';

export function RagPipeline() {
  return (
    <DiagramFrame label="RAG 流程：资料进入结构化知识库，经向量或关键词检索后生成可追溯回答，并推荐下一个探索点">
      <DiagramKicker>RETRIEVAL-AUGMENTED GENERATION / TRACEABLE ANSWERS</DiagramKicker>
      <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-stretch md:gap-3">
        <DiagramNode delay={0} label="01">资料</DiagramNode>
        <DiagramArrow />
        <DiagramNode delay={80} label="02">结构化知识库</DiagramNode>
        <DiagramArrow />
        <DiagramNode delay={160} label="03">向量 / 关键词检索</DiagramNode>
        <DiagramArrow />
        <DiagramNode delay={240} label="04">基于检索内容生成回答</DiagramNode>
        <DiagramArrow />
        <DiagramNode delay={320} label="05">推荐下一个探索点</DiagramNode>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <DiagramRule>回答有来源可追溯</DiagramRule>
        <DiagramRule>每次对话都能回到资料</DiagramRule>
      </div>
    </DiagramFrame>
  );
}
