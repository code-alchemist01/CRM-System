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
import { PlusOutlined, EditOutlined, DeleteOutlined, SendOutlined, MailOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/axios';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { TextArea } = Input;

interface Email {
  id: string;
  subject: string;
  body: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  status: 'draft' | 'sent' | 'received' | 'failed';
  customer?: {
    id: string;
    name: string;
  };
  opportunity?: {
    id: string;
    title: string;
  };
  sentBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  sentAt?: string;
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

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

const Emails = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [emails, setEmails] = useState<Email[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmail, setEditingEmail] = useState<Email | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchEmails();
    fetchCustomers();
    fetchOpportunities();
    fetchEmailTemplates();
  }, []);

  useEffect(() => {
    // Check if template ID is in URL
    const templateId = searchParams.get('template');
    if (templateId) {
      loadTemplate(templateId);
      // Clear the URL parameter
      setSearchParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const response = await api.get('/emails');
      setEmails(response.data.data || response.data || []);
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

  const fetchEmailTemplates = async () => {
    try {
      const response = await api.get('/email-templates');
      const data = response.data.data || response.data;
      setEmailTemplates(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching email templates:', error);
    }
  };

  const loadTemplate = async (templateId: string) => {
    try {
      const response = await api.get(`/email-templates/${templateId}`);
      const template = response.data.data || response.data;
      form.setFieldsValue({
        subject: template.subject,
        body: template.body,
      });
      setIsModalOpen(true);
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      // Validate and process email addresses
      const processEmails = (emailString: string | undefined): string[] => {
        if (!emailString || !emailString.trim()) return [];
        return emailString
          .split(',')
          .map((email: string) => email.trim())
          .filter((email: string) => email.length > 0);
      };

      const toEmails = processEmails(values.to);
      if (toEmails.length === 0) {
        message.error(t('emails.toRequired'));
        return;
      }

      const emailData = {
        ...values,
        to: toEmails,
        cc: processEmails(values.cc),
        bcc: processEmails(values.bcc),
      };

      if (editingEmail) {
        await api.patch(`/emails/${editingEmail.id}`, emailData);
        message.success(t('emails.updateSuccess'));
      } else {
        await api.post('/emails', emailData);
        message.success(t('emails.createSuccess'));
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingEmail(null);
      fetchEmails();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleSend = async (id: string) => {
    try {
      await api.patch(`/emails/${id}/send`);
      message.success(t('emails.sendSuccess'));
      fetchEmails();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleEdit = (email: Email) => {
    setEditingEmail(email);
    form.setFieldsValue({
      subject: email.subject,
      body: email.body,
      to: email.to?.join(', '),
      cc: email.cc?.join(', '),
      bcc: email.bcc?.join(', '),
      customerId: email.customer?.id,
      opportunityId: email.opportunity?.id,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/emails/${id}`);
      message.success(t('emails.deleteSuccess'));
      fetchEmails();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingEmail(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'green';
      case 'draft':
        return 'default';
      case 'received':
        return 'blue';
      case 'failed':
        return 'red';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<Email> = [
    {
      title: t('emails.subject'),
      dataIndex: 'subject',
      key: 'subject',
      render: (text: string, record: Email) => (
        <Space>
          {record.status === 'received' && <MailOutlined style={{ color: '#1890ff' }} />}
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: t('emails.to'),
      dataIndex: 'to',
      key: 'to',
      render: (to: string[]) => to?.join(', ') || '-',
    },
    {
      title: t('emails.statusLabel'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {t(`emails.status.${status}`) || status}
        </Tag>
      ),
    },
    {
      title: t('emails.customer'),
      key: 'customer',
      render: (_, record) => (
        record.customer ? (
          <Tag color="blue">{record.customer.name}</Tag>
        ) : '-'
      ),
    },
    {
      title: t('emails.sentAt'),
      dataIndex: 'sentAt',
      key: 'sentAt',
      render: (sentAt: string) => sentAt ? new Date(sentAt).toLocaleString('tr-TR') : '-',
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'draft' && (
            <Button
              type="link"
              icon={<SendOutlined />}
              onClick={() => handleSend(record.id)}
            >
              {t('emails.send')}
            </Button>
          )}
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {t('common.edit')}
          </Button>
          <Popconfirm
            title={t('emails.deleteConfirm')}
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
        <Title level={2}>{t('emails.title')}</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingEmail(null);
            form.resetFields();
            setIsModalOpen(true);
          }}
        >
          {t('emails.create')}
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={emails}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingEmail ? t('emails.editEmail') : t('emails.newEmail')}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label={t('emails.template')}
            name="templateId"
          >
            <Select
              placeholder={t('emails.templatePlaceholder')}
              allowClear
              onChange={(templateId) => {
                if (templateId) {
                  loadTemplate(templateId);
                }
              }}
            >
              {emailTemplates.map((template) => (
                <Select.Option key={template.id} value={template.id}>
                  {template.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={t('emails.subject')}
            name="subject"
            rules={[{ required: true, message: t('emails.subjectRequired') }]}
          >
            <Input placeholder={t('emails.subjectPlaceholder')} />
          </Form.Item>
          <Form.Item
            label={t('emails.to')}
            name="to"
            rules={[
              { required: true, message: t('emails.toRequired') },
              { 
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const emails = value.split(',').map((e: string) => e.trim());
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  const invalidEmails = emails.filter((e: string) => !emailRegex.test(e));
                  if (invalidEmails.length > 0) {
                    return Promise.reject(new Error(t('emails.emailInvalid')));
                  }
                  return Promise.resolve();
                }
              },
            ]}
            help={t('emails.toHint')}
          >
            <Input placeholder={t('emails.toPlaceholder')} />
          </Form.Item>
          <Form.Item
            label={t('emails.cc')}
            name="cc"
            help={t('emails.ccHint')}
          >
            <Input placeholder={t('emails.ccPlaceholder')} />
          </Form.Item>
          <Form.Item
            label={t('emails.bcc')}
            name="bcc"
            help={t('emails.bccHint')}
          >
            <Input placeholder={t('emails.bccPlaceholder')} />
          </Form.Item>
          <Form.Item
            label={t('emails.body')}
            name="body"
            rules={[{ required: true, message: t('emails.bodyRequired') }]}
          >
            <TextArea rows={6} placeholder={t('emails.bodyPlaceholder')} />
          </Form.Item>
          <Form.Item
            label={t('emails.customer')}
            name="customerId"
          >
            <Select
              placeholder={t('emails.customerPlaceholder')}
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
            label={t('emails.opportunity')}
            name="opportunityId"
          >
            <Select
              placeholder={t('emails.opportunityPlaceholder')}
              showSearch
              optionFilterProp="children"
              allowClear
            >
              {opportunities.map((opportunity) => (
                <Select.Option key={opportunity.id} value={opportunity.id}>
                  {opportunity.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingEmail ? t('common.save') : t('emails.saveDraft')}
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

export default Emails;

