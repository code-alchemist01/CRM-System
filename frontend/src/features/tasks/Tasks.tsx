import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  message,
  Card,
  Tag,
  Row,
  Col,
  Select,
  Typography,
  DatePicker,
  Popconfirm,
  Tooltip,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import api from '../../utils/axios';
import type { ColumnsType } from 'antd/es/table';
import type { RootState } from '../../store/store';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  assignedToId?: string;
  assignedTo?: { firstName: string; lastName: string };
  customerId?: string;
  customer?: { name: string };
}

const Tasks = () => {
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.auth.user);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [searchText, statusFilter, tasks]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tasks');
      const data = response.data.data || response.data;
      setTasks(Array.isArray(data) ? data : []);
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    if (searchText) {
      filtered = filtered.filter(
        (task) =>
          task.title?.toLowerCase().includes(searchText.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchText.toLowerCase()),
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    setFilteredTasks(filtered);
  };

  const handleSubmit = async (values: any) => {
    try {
      const assignedToId = values.assignedToId || user?.id;
      if (!assignedToId) {
        message.error(t('tasks.assignedToRequired') || 'Kullanıcı seçilmedi veya oturum açılmamış');
        return;
      }
      const payload = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
        assignedToId: assignedToId,
      };
      if (editingTask) {
        await api.patch(`/tasks/${editingTask.id}`, payload);
        message.success(t('tasks.updateSuccess'));
      } else {
        await api.post('/tasks', payload);
        message.success(t('tasks.createSuccess'));
      }
      setModalVisible(false);
      form.resetFields();
      setEditingTask(null);
      fetchTasks();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      message.success(t('tasks.deleteSuccess'));
      fetchTasks();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'processing';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined />;
      case 'in_progress':
        return <ClockCircleOutlined />;
      case 'cancelled':
        return <CloseCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'blue';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<Task> = [
    {
      title: t('tasks.title'),
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Task) => (
        <Space orientation="vertical" size={0}>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.description && (
            <div style={{ fontSize: 12, color: '#999' }}>
              {record.description.substring(0, 50)}
              {record.description.length > 50 ? '...' : ''}
            </div>
          )}
        </Space>
      ),
      sorter: (a, b) => (a.title || '').localeCompare(b.title || ''),
    },
    {
      title: t('tasks.statusLabel'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, string> = {
          todo: 'TODO',
          in_progress: 'IN_PROGRESS',
          completed: 'COMPLETED',
          cancelled: 'CANCELLED',
        };
        const statusKey = statusMap[status] || status.toUpperCase();
        return (
          <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
            {t(`tasks.status.${statusKey}`)}
          </Tag>
        );
      },
      filters: [
        { text: t('tasks.status.TODO'), value: 'todo' },
        { text: t('tasks.status.IN_PROGRESS'), value: 'in_progress' },
        { text: t('tasks.status.COMPLETED'), value: 'completed' },
        { text: t('tasks.status.CANCELLED'), value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: t('tasks.priorityLabel'),
      dataIndex: 'priority',
      key: 'priority',
      render: (priority?: string) =>
        priority ? (
          <Tag color={getPriorityColor(priority)}>
            {t(`tasks.priority.${priority.toUpperCase()}`)}
          </Tag>
        ) : (
          '-'
        ),
    },
    {
      title: t('tasks.dueDate'),
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) =>
        date ? (
          <Badge
            status={
              dayjs(date).isBefore(dayjs()) && statusFilter !== 'COMPLETED'
                ? 'error'
                : 'default'
            }
            text={dayjs(date).format('DD/MM/YYYY')}
          />
        ) : (
          '-'
        ),
      sorter: (a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return dayjs(a.dueDate).unix() - dayjs(b.dueDate).unix();
      },
    },
    {
      title: t('tasks.assignedTo'),
      key: 'assignedTo',
      render: (_, record) =>
        record.assignedTo
          ? `${record.assignedTo.firstName} ${record.assignedTo.lastName}`
          : '-',
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      render: (_: any, record: Task) => (
        <Space>
          <Tooltip title={t('common.edit')}>
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                setEditingTask(record);
                form.setFieldsValue({
                  ...record,
                  dueDate: record.dueDate ? dayjs(record.dueDate) : undefined,
                  assignedToId: record.assignedToId || user?.id,
                });
                setModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title={t('tasks.deleteConfirm')}
            onConfirm={() => handleDelete(record.id)}
            okText={t('common.yes')}
            cancelText={t('common.no')}
          >
            <Tooltip title={t('common.delete')}>
              <Button danger icon={<DeleteOutlined />} size="small" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            {t('tasks.title')}
          </Title>
        </Col>
        <Col>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTask(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            {t('tasks.create')}
          </Button>
        </Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16, width: '100%' }} orientation="vertical" size="large">
          <Row gutter={16}>
            <Col span={12}>
              <Input
                placeholder={t('tasks.searchPlaceholder')}
                prefix={<SearchOutlined />}
                size="large"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col span={12}>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                size="large"
                style={{ width: '100%' }}
              >
                <Option value="all">{t('tasks.allStatuses')}</Option>
                <Option value="PENDING">{t('tasks.status.PENDING')}</Option>
                <Option value="IN_PROGRESS">{t('tasks.status.IN_PROGRESS')}</Option>
                <Option value="COMPLETED">{t('tasks.status.COMPLETED')}</Option>
                <Option value="CANCELLED">{t('tasks.status.CANCELLED')}</Option>
              </Select>
            </Col>
          </Row>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredTasks}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${total} ${t('tasks.total')}`,
          }}
        />
      </Card>

      <Modal
        title={editingTask ? t('tasks.editTask') : t('tasks.newTask')}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingTask(null);
        }}
        onOk={() => form.submit()}
        width={600}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
        afterOpenChange={(open) => {
          if (open && !editingTask && user?.id) {
            form.setFieldsValue({ assignedToId: user.id });
          }
        }}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="title"
            label={t('tasks.title')}
            rules={[{ required: true, message: t('tasks.titleRequired') }]}
          >
            <Input placeholder={t('tasks.titlePlaceholder')} />
          </Form.Item>
          <Form.Item name="description" label={t('tasks.description')}>
            <TextArea rows={4} placeholder={t('tasks.descriptionPlaceholder')} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label={t('tasks.statusLabel')}
                rules={[{ required: true }]}
              >
                <Select placeholder={t('tasks.statusPlaceholder')}>
                  <Option value="todo">{t('tasks.status.TODO')}</Option>
                  <Option value="in_progress">{t('tasks.status.IN_PROGRESS')}</Option>
                  <Option value="completed">{t('tasks.status.COMPLETED')}</Option>
                  <Option value="cancelled">{t('tasks.status.CANCELLED')}</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label={t('tasks.priorityLabel')}>
                <Select placeholder={t('tasks.priorityPlaceholder')}>
                  <Option value="low">{t('tasks.priority.LOW')}</Option>
                  <Option value="medium">{t('tasks.priority.MEDIUM')}</Option>
                  <Option value="high">{t('tasks.priority.HIGH')}</Option>
                  <Option value="urgent">{t('tasks.priority.URGENT')}</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="dueDate" label={t('tasks.dueDate')}>
            <DatePicker style={{ width: '100%' }} showTime />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Tasks;

