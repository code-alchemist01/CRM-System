import { useMemo, useState } from 'react';
import { Spin, Empty, Typography, Tag } from 'antd';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import OpportunityCard from './OpportunityCard';

const { Text } = Typography;

interface Opportunity {
  id: string;
  title: string;
  value?: number;
  stageId: string;
  customer?: { name: string };
  probability?: number;
}

interface Stage {
  id: string;
  name: string;
  order: number;
}

interface KanbanBoardProps {
  stages: Stage[];
  opportunities: Opportunity[];
  onMoveOpportunity: (opportunityId: string, newStageId: string) => void;
  loading: boolean;
}

const KanbanColumn = ({
  stage,
  opportunities,
}: {
  stage: Stage;
  opportunities: Opportunity[];
}) => {
  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: stage.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const totalValue = opportunities.reduce(
    (sum, opp) => sum + Number(opp.value || 0),
    0,
  );

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        minWidth: 320,
        maxWidth: 320,
        margin: '0 8px',
        background: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        height: 'fit-content',
      }}
    >
      <div
        style={{
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: '2px solid #e8e8e8',
        }}
      >
        <Text strong style={{ fontSize: 16 }}>
          {stage.name}
        </Text>
        <div style={{ marginTop: 4 }}>
          <Tag color="blue">{opportunities.length}</Tag>
          {totalValue > 0 && (
            <Tag color="green" style={{ marginLeft: 4 }}>
              ${totalValue.toLocaleString()}
            </Tag>
          )}
        </div>
      </div>
      <SortableContext
        items={opportunities.map((o) => o.id)}
        strategy={verticalListSortingStrategy}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {opportunities.length === 0 ? (
            <div
              style={{
                padding: 20,
                textAlign: 'center',
                color: '#999',
                border: '2px dashed #d9d9d9',
                borderRadius: 8,
              }}
            >
              Boş
            </div>
          ) : (
            opportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
};

const KanbanBoard = ({
  stages,
  opportunities,
  onMoveOpportunity,
  loading,
}: KanbanBoardProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const opportunitiesByStage = useMemo(() => {
    const sortedStages = [...stages].sort((a, b) => a.order - b.order);
    return sortedStages.map((stage) => ({
      stage,
      opportunities: opportunities.filter((opp) => opp.stageId === stage.id),
    }));
  }, [stages, opportunities]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const opportunityId = active.id as string;
    const newStageId = over.id as string;

    // Check if dropped on a stage column
    const isStage = stages.some((s) => s.id === newStageId);
    if (isStage && opportunityId) {
      onMoveOpportunity(opportunityId, newStageId);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (stages.length === 0) {
    return <Empty description="Aşama bulunamadı" />;
  }

  const activeOpportunity = opportunities.find((o) => o.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          padding: '16px 0',
          minHeight: '600px',
        }}
      >
        {opportunitiesByStage.map(({ stage, opportunities: stageOpps }) => (
          <SortableContext
            key={stage.id}
            items={[stage.id]}
            strategy={verticalListSortingStrategy}
          >
            <KanbanColumn stage={stage} opportunities={stageOpps} />
          </SortableContext>
        ))}
      </div>
      <DragOverlay>
        {activeOpportunity ? (
          <div style={{ transform: 'rotate(5deg)' }}>
            <OpportunityCard opportunity={activeOpportunity} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
