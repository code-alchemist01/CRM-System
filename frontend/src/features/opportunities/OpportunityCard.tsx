import { Card, Typography, Tag, Space } from 'antd';
import { DollarOutlined, UserOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Text } = Typography;

interface Opportunity {
  id: string;
  title: string;
  value?: number;
  customer?: { name: string };
  probability?: number;
}

interface OpportunityCardProps {
  opportunity: Opportunity;
}

const OpportunityCard = ({ opportunity }: OpportunityCardProps) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: opportunity.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        size="small"
        hoverable
        style={{
          marginBottom: 0,
          borderRadius: 8,
          border: '1px solid #e8e8e8',
          boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)',
        }}
        styles={{ body: { padding: 12 } }}
      >
        <div>
          <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>
            {opportunity.title}
          </Text>
          {opportunity.customer && (
            <Space style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
              <UserOutlined />
              <Text type="secondary">{opportunity.customer.name}</Text>
            </Space>
          )}
          <Space>
            {opportunity.value && (
              <Tag color="green" icon={<DollarOutlined />}>
                {opportunity.value.toLocaleString()}
              </Tag>
            )}
            {opportunity.probability && (
              <Tag color="blue">{opportunity.probability}%</Tag>
            )}
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default OpportunityCard;
