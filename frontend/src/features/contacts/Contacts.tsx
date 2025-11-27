import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Popconfirm,
  Typography,
  Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../../utils/axios';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position?: string;
  customer?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  id: string;
  name: string;
}

const Contacts = () => {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchContacts();
    fetchCustomers();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/contacts');
      setContacts(response.data.data || response.data || []);
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

  const handleSubmit = async (values: any) => {
    try {
      if (editingContact) {
        await api.patch(`/contacts/${editingContact.id}`, values);
        message.success(t('contacts.updateSuccess'));
      } else {
        await api.post('/contacts', values);
        message.success(t('contacts.createSuccess'));
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingContact(null);
      fetchContacts();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    form.setFieldsValue({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      position: contact.position,
      customerId: contact.customer?.id,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/contacts/${id}`);
      message.success(t('contacts.deleteSuccess'));
      fetchContacts();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingContact(null);
  };

  const columns: ColumnsType<Contact> = [
    {
      title: t('contacts.firstName'),
      dataIndex: 'firstName',
      key: 'firstName',
    },
    {
      title: t('contacts.lastName'),
      dataIndex: 'lastName',
      key: 'lastName',
    },
    {
      title: t('contacts.email'),
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => email || '-',
    },
    {
      title: t('contacts.phone'),
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => phone || '-',
    },
    {
      title: t('contacts.position'),
      dataIndex: 'position',
      key: 'position',
      render: (position: string) => position || '-',
    },
    {
      title: t('contacts.customer'),
      key: 'customer',
      render: (_, record) => (
        record.customer ? (
          <Tag color="blue">{record.customer.name}</Tag>
        ) : '-'
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {t('common.edit')}
          </Button>
          <Popconfirm
            title={t('contacts.deleteConfirm')}
            onConfirm={() => handleDelete(record.id)}
            okText={t('common.yes')}
            cancelText={t('common.no')}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              {t('common.delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={2}>{t('contacts.title')}</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingContact(null);
            form.resetFields();
            setIsModalOpen(true);
          }}
        >
          {t('contacts.create')}
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={contacts}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingContact ? t('contacts.editContact') : t('contacts.newContact')}
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
            label={t('contacts.firstName')}
            name="firstName"
            rules={[{ required: true, message: t('contacts.firstNameRequired') }]}
          >
            <Input placeholder={t('contacts.firstNamePlaceholder')} />
          </Form.Item>
          <Form.Item
            label={t('contacts.lastName')}
            name="lastName"
            rules={[{ required: true, message: t('contacts.lastNameRequired') }]}
          >
            <Input placeholder={t('contacts.lastNamePlaceholder')} />
          </Form.Item>
          <Form.Item
            label={t('contacts.email')}
            name="email"
            rules={[
              { type: 'email', message: t('contacts.emailInvalid') },
            ]}
          >
            <Input placeholder={t('contacts.emailPlaceholder')} />
          </Form.Item>
          <Form.Item
            label={t('contacts.phone')}
            name="phone"
          >
            <Input placeholder={t('contacts.phonePlaceholder')} />
          </Form.Item>
          <Form.Item
            label={t('contacts.position')}
            name="position"
          >
            <Input placeholder={t('contacts.positionPlaceholder')} />
          </Form.Item>
          <Form.Item
            label={t('contacts.customer')}
            name="customerId"
          >
            <Select
              placeholder={t('contacts.customerPlaceholder')}
              showSearch
              optionFilterProp="children"
            >
              {customers.map((customer) => (
                <Select.Option key={customer.id} value={customer.id}>
                  {customer.name}
                </Select.Option>
              ))}
            </Select>
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

export default Contacts;

