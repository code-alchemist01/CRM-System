import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Typography,
  Tag,
  DatePicker,
  Select,
  message,
  Modal,
  Form,
} from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import api from '../../utils/axios';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface Activity {
  id: string;
  type: string;
  title: string;
  description?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  customer?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
}

interface Opportunity {
  id: string;
  title: string;
}

const Activities = () => {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchActivities();
    fetchCustomers();
    fetchOpportunities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await api.get('/activities');
      setActivities(response.data.data || response.data || []);
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data.data || response.data || []);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchOpportunities = async () => {
    try {
      const response = await api.get('/opportunities');
      setOpportunities(response.data.data || response.data || []);
    } catch (error: any) {
      console.error('Error fetching opportunities:', error);
    }
  };

  const handleSearch = () => {
    fetchActivities();
  };

  const handleReset = () => {
    setSearchText('');
    setTypeFilter(undefined);
    setDateRange([null, null]);
    fetchActivities();
  };

  const handleSubmit = async (values: any) => {
    try {
      const activityData = {
        ...values,
        activityDate: values.activityDate ? values.activityDate.format('YYYY-MM-DD') : undefined,
      };

      if (editingActivity) {
        await api.patch(`/activities/${editingActivity.id}`, activityData);
        message.success(t('activities.updateSuccess'));
      } else {
        await api.post('/activities', activityData);
        message.success(t('activities.createSuccess'));
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingActivity(null);
      fetchActivities();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    form.setFieldsValue({
      type: activity.type,
      title: activity.title,
      description: activity.description,
      customerId: activity.customer?.id,
      activityDate: activity.createdAt ? dayjs(activity.createdAt) : undefined,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/activities/${id}`);
      message.success(t('activities.deleteSuccess'));
      fetchActivities();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingActivity(null);
  };

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'call':
        return 'blue';
      case 'meeting':
        return 'green';
      case 'email':
        return 'orange';
      case 'note':
        return 'purple';
      case 'task':
        return 'cyan';
      default:
        return 'default';
    }
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      !searchText ||
      activity.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      activity.customer?.name?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesType = !typeFilter || activity.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const uniqueTypes = Array.from(new Set(activities.map((a) => a.type))).filter(Boolean);

  const columns: ColumnsType<Activity> = [
    {
      title: t('activities.typeLabel'),
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>
          {t(`activities.type.${type}`) || type || '-'}
        </Tag>
      ),
    },
    {
      title: t('activities.titleLabel'),
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: t('activities.description'),
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => description || '-',
      ellipsis: true,
    },
    {
      title: t('activities.user'),
      key: 'user',
      render: (_, record) =>
        record.user
          ? `${record.user.firstName} ${record.user.lastName}`
          : '-',
    },
    {
      title: t('activities.customer'),
      key: 'customer',
      render: (_, record) => (
        record.customer ? (
          <Tag color="blue">{record.customer.name}</Tag>
        ) : '-'
      ),
    },
    {
      title: t('activities.date'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('tr-TR'),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          {t('activities.title')}
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          {t('activities.create')}
        </Button>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Space size="middle" wrap>
          <Input
            placeholder={t('activities.searchPlaceholder')}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            onPressEnter={handleSearch}
          />
          <Select
            placeholder={t('activities.typeFilter')}
            value={typeFilter}
            onChange={setTypeFilter}
            allowClear
            style={{ width: 150 }}
          >
            {uniqueTypes.map((type) => (
              <Select.Option key={type} value={type}>
                {type}
              </Select.Option>
            ))}
          </Select>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null])}
            format="DD/MM/YYYY"
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            {t('common.search')}
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            {t('activities.reset')}
          </Button>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredActivities}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 20 }}
        />
      </Card>

      <Modal
        title={editingActivity ? t('activities.editActivity') : t('activities.newActivity')}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label={t('activities.typeLabel')}
            name="type"
            rules={[{ required: true, message: t('activities.typeRequired') }]}
          >
            <Select placeholder={t('activities.typePlaceholder')}>
              <Select.Option value="call">{t('activities.type.call')}</Select.Option>
              <Select.Option value="email">{t('activities.type.email')}</Select.Option>
              <Select.Option value="meeting">{t('activities.type.meeting')}</Select.Option>
              <Select.Option value="note">{t('activities.type.note')}</Select.Option>
              <Select.Option value="task">{t('activities.type.task')}</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={t('activities.titleLabel')}
            name="title"
            rules={[{ required: true, message: t('activities.titleRequired') }]}
          >
            <Input placeholder={t('activities.titlePlaceholder')} />
          </Form.Item>

          <Form.Item
            label={t('activities.description')}
            name="description"
          >
            <TextArea rows={4} placeholder={t('activities.descriptionPlaceholder')} />
          </Form.Item>

          <Form.Item
            label={t('activities.customer')}
            name="customerId"
          >
            <Select
              placeholder={t('activities.customerPlaceholder')}
              showSearch
              optionFilterProp="children"
              allowClear
            >
              {customers.map((customer) => (
                <Select.Option key={customer.id} value={customer.id}>
                  {customer.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label={t('activities.date')}
            name="activityDate"
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {t('common.save')}
              </Button>
              <Button onClick={handleCancel}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Activities;

