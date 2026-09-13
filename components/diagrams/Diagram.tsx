import type { DiagramId } from '@/content/types';
import { DataFlowDiagram } from './DataFlowDiagram';
import { EmotionStateDiagram } from './EmotionStateDiagram';
import { LocalRuntimeDiagram } from './LocalRuntimeDiagram';
import { MemoryDiagram } from './MemoryDiagram';
import { RagPipeline } from './RagPipeline';

export function Diagram({ id }: { id: DiagramId }) {
  switch (id) {
    case 'rag-pipeline':
      return <RagPipeline />;
    case 'memory':
      return <MemoryDiagram />;
    case 'emotion-state':
      return <EmotionStateDiagram />;
    case 'local-runtime':
      return <LocalRuntimeDiagram />;
    case 'data-flow':
      return <DataFlowDiagram />;
  }
}
