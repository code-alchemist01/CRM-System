import { useState, useEffect } from 'react';
import {
  Button,
  message,
  Card,
  Typography,
  Row,
  Col,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Spin,
  Empty,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../../utils/axios';
import KanbanBoard from './KanbanBoard';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Opportunity {
  id: string;
  title: string;
  value?: number;
  stageId: string;
  stage?: { id: string; name: string };
  customerId?: string;
  customer?: { name: string };
  expectedCloseDate?: string;
  description?: string;
}

interface Stage {
  id: string;
  name: string;
  order: number;
}

interface Customer {
  id: string;
  name: string;
}

const Opportunities = () => {
  const { t } = useTranslation();
  const [stages, setStages] = useState<Stage[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stagesRes, oppsRes, customersRes] = await Promise.all([
        api.get('/opportunity-stages'),
        api.get('/opportunities'),
        api.get('/customers'),
      ]);
      setStages(stagesRes.data.data || stagesRes.data);
      setOpportunities(oppsRes.data.data || oppsRes.data);
      setCustomers(customersRes.data.data || customersRes.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleMoveOpportunity = async (
    opportunityId: string,
    newStageId: string,
  ) => {
    try {
      await api.patch(`/opportunities/${opportunityId}/stage`, {
        stageId: newStageId,
      });
      await fetchData();
      message.success(t('opportunities.moveSuccess'));
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
      await fetchData(); // Revert on error
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      await api.post('/opportunities', values);
      message.success(t('opportunities.createSuccess'));
      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  };

  const totalValue = opportunities.reduce(
    (sum, opp) => sum + Number(opp.value || 0),
    0,
  );

  if (loading && opportunities.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            {t('opportunities.title')}
          </Title>
          <div style={{ marginTop: 8 }}>
            <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
              {opportunities.length} {t('opportunities.total')}
            </Tag>
            <Tag
              color="green"
              style={{ fontSize: 14, padding: '4px 12px', marginLeft: 8 }}
            >
              <DollarOutlined /> {totalValue.toLocaleString()} {t('opportunities.totalValue')}
            </Tag>
          </div>
        </Col>
        <Col>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setModalVisible(true);
            }}
          >
            {t('opportunities.create')}
          </Button>
        </Col>
      </Row>

      {stages.length === 0 ? (
        <Empty description={t('opportunities.noStages')} />
      ) : (
      <Card style={{ borderRadius: 8 }}>
        <KanbanBoard
            stages={stages}
            opportunities={opportunities}
            onMoveOpportunity={handleMoveOpportunity}
            loading={loading}
          />
        </Card>
      )}

      <Modal
        title={t('opportunities.newOpportunity')}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="title"
            label={t('opportunities.title')}
            rules={[{ required: true, message: t('opportunities.titleRequired') }]}
          >
            <Input placeholder={t('opportunities.titlePlaceholder')} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="value"
                label={t('opportunities.value')}
                rules={[{ required: true, message: t('opportunities.valueRequired') }]}
              >
                <InputNumber
                  prefix={<DollarOutlined />}
                  style={{ width: '100%' }}
                  min={0}
                  placeholder={t('opportunities.valuePlaceholder')}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="customerId"
            label={t('opportunities.customer')}
            rules={[{ required: true, message: t('opportunities.customerRequired') }]}
          >
            <Select
              placeholder={t('opportunities.customerPlaceholder')}
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {customers.map((customer) => (
                <Option key={customer.id} value={customer.id}>
                  {customer.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="stageId"
            label={t('opportunities.stage')}
            rules={[{ required: true, message: t('opportunities.stageRequired') }]}
          >
            <Select placeholder={t('opportunities.stagePlaceholder')}>
              {stages.map((stage) => (
                <Option key={stage.id} value={stage.id}>
                  {stage.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label={t('opportunities.description')}>
            <TextArea rows={4} placeholder={t('opportunities.descriptionPlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Opportunities;
