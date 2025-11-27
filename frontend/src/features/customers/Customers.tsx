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
  Row,
  Col,
  Typography,
  Avatar,
  Popconfirm,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../../utils/axios';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface Customer {
  id: string;
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
}

const Customers = () => {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchText, customers]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/customers');
      const data = response.data.data || response.data;
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    if (!searchText) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.companyName?.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.phone?.includes(searchText),
    );
    setFilteredCustomers(filtered);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingCustomer) {
        await api.patch(`/customers/${editingCustomer.id}`, values);
        message.success(t('customers.updateSuccess'));
      } else {
        await api.post('/customers', values);
        message.success(t('customers.createSuccess'));
      }
      setModalVisible(false);
      form.resetFields();
      setEditingCustomer(null);
      fetchCustomers();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/customers/${id}`);
      message.success(t('customers.deleteSuccess'));
      fetchCustomers();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning(t('customers.noSelection'));
      return;
    }

    try {
      await Promise.all(
        selectedRowKeys.map((id) => api.delete(`/customers/${id}`)),
      );
      message.success(
        t('customers.bulkDeleteSuccess', { count: selectedRowKeys.length }),
      );
      setSelectedRowKeys([]);
      fetchCustomers();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const columns: ColumnsType<Customer> = [
    {
      title: t('customers.name'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Customer) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            {record.companyName && (
              <div style={{ fontSize: 12, color: '#999' }}>
                {record.companyName}
              </div>
            )}
          </div>
        </Space>
      ),
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
    },
    {
      title: t('customers.email'),
      dataIndex: 'email',
      key: 'email',
      render: (email: string) =>
        email ? (
          <Space>
            <MailOutlined />
            <a href={`mailto:${email}`}>{email}</a>
          </Space>
        ) : (
          '-'
        ),
    },
    {
      title: t('customers.phone'),
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) =>
        phone ? (
          <Space>
            <PhoneOutlined />
            <a href={`tel:${phone}`}>{phone}</a>
          </Space>
        ) : (
          '-'
        ),
    },
    {
      title: t('customers.address'),
      dataIndex: 'address',
      key: 'address',
      render: (address: string) =>
        address ? (
          <Space>
            <EnvironmentOutlined />
            <span style={{ maxWidth: 200, display: 'inline-block' }}>
              {address}
            </span>
          </Space>
        ) : (
          '-'
        ),
      ellipsis: true,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      render: (_: any, record: Customer) => (
        <Space>
          <Tooltip title={t('common.edit')}>
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                setEditingCustomer(record);
                form.setFieldsValue(record);
                setModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title={t('customers.deleteConfirm')}
            onConfirm={() => handleDelete(record.id)}
            okText={t('common.yes')}
            cancelText={t('common.no')}
          >
            <Tooltip title={t('common.delete')}>
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
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
            {t('customers.title')}
          </Title>
        </Col>
        <Col>
          <Space>
            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title={t('customers.bulkDeleteConfirm', { count: selectedRowKeys.length })}
                onConfirm={handleBulkDelete}
                okText={t('common.yes')}
                cancelText={t('common.no')}
              >
                <Button
                  danger
                  size="large"
                  icon={<DeleteOutlined />}
                >
                  {t('customers.bulkDelete', { count: selectedRowKeys.length })}
                </Button>
              </Popconfirm>
            )}
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingCustomer(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              {t('customers.create')}
            </Button>
          </Space>
        </Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16, width: '100%' }} orientation="vertical" size="large">
          <Input
            placeholder={t('customers.searchPlaceholder')}
            prefix={<SearchOutlined />}
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ maxWidth: 400 }}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={filteredCustomers}
          loading={loading}
          rowKey="id"
          rowSelection={rowSelection}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${total} ${t('customers.total')}`,
          }}
        />
      </Card>

      <Modal
        title={
          editingCustomer ? t('customers.editCustomer') : t('customers.newCustomer')
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingCustomer(null);
        }}
        onOk={() => form.submit()}
        width={600}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="name"
            label={t('customers.name')}
            rules={[{ required: true, message: t('customers.nameRequired') }]}
          >
            <Input prefix={<UserOutlined />} placeholder={t('customers.namePlaceholder')} />
          </Form.Item>
          <Form.Item name="companyName" label={t('customers.company')}>
            <Input placeholder={t('customers.companyPlaceholder')} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label={t('customers.email')}
                rules={[
                  { type: 'email', message: t('customers.emailInvalid') },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  type="email"
                  placeholder={t('customers.emailPlaceholder')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label={t('customers.phone')}>
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder={t('customers.phonePlaceholder')}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="address" label={t('customers.address')}>
            <Input.TextArea
              rows={3}
              placeholder={t('customers.addressPlaceholder')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Customers;
