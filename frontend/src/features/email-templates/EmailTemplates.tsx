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
  Popconfirm,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { TextArea } = Input;

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  createdAt?: string;
}

const EmailTemplates = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [searchText, templates]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await api.get('/email-templates');
      const data = response.data.data || response.data;
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    if (!searchText) {
      setFilteredTemplates(templates);
      return;
    }

    const filtered = templates.filter(
      (template) =>
        template.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        template.subject?.toLowerCase().includes(searchText.toLowerCase()),
    );
    setFilteredTemplates(filtered);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingTemplate) {
        await api.patch(`/email-templates/${editingTemplate.id}`, values);
        message.success(t('emailTemplates.updateSuccess'));
      } else {
        await api.post('/email-templates', values);
        message.success(t('emailTemplates.createSuccess'));
      }
      setModalVisible(false);
      form.resetFields();
      setEditingTemplate(null);
      fetchTemplates();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/email-templates/${id}`);
      message.success(t('emailTemplates.deleteSuccess'));
      fetchTemplates();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleUseTemplate = (template: EmailTemplate) => {
    // Navigate to emails page with template data
    navigate(`/emails?template=${template.id}`);
  };

  const columns: ColumnsType<EmailTemplate> = [
    {
      title: t('emailTemplates.name'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <MailOutlined />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: t('emailTemplates.subject'),
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
    },
    {
      title: t('emailTemplates.body'),
      dataIndex: 'body',
      key: 'body',
      render: (body: string) => (
        <span style={{ maxWidth: 300, display: 'inline-block' }}>
          {body?.substring(0, 100)}...
        </span>
      ),
      ellipsis: true,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 200,
      render: (_: any, record: EmailTemplate) => (
        <Space>
          <Tooltip title={t('emailTemplates.use')}>
            <Button
              type="primary"
              size="small"
              onClick={() => handleUseTemplate(record)}
            >
              {t('emailTemplates.use')}
            </Button>
          </Tooltip>
          <Tooltip title={t('common.edit')}>
            <Button
              type="default"
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                setEditingTemplate(record);
                form.setFieldsValue(record);
                setModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title={t('emailTemplates.deleteConfirm')}
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
            {t('emailTemplates.title')}
          </Title>
        </Col>
        <Col>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTemplate(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            {t('emailTemplates.create')}
          </Button>
        </Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16, width: '100%' }} orientation="vertical" size="large">
          <Input
            placeholder={t('emailTemplates.searchPlaceholder')}
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
          dataSource={filteredTemplates}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
        />
      </Card>

      <Modal
        title={
          editingTemplate ? t('emailTemplates.editTemplate') : t('emailTemplates.newTemplate')
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingTemplate(null);
        }}
        onOk={() => form.submit()}
        width={700}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="name"
            label={t('emailTemplates.name')}
            rules={[{ required: true, message: t('emailTemplates.nameRequired') }]}
          >
            <Input placeholder={t('emailTemplates.namePlaceholder')} />
          </Form.Item>
          <Form.Item
            name="subject"
            label={t('emailTemplates.subject')}
            rules={[{ required: true, message: t('emailTemplates.subjectRequired') }]}
          >
            <Input placeholder={t('emailTemplates.subjectPlaceholder')} />
          </Form.Item>
          <Form.Item
            name="body"
            label={t('emailTemplates.body')}
            rules={[{ required: true, message: t('emailTemplates.bodyRequired') }]}
          >
            <TextArea rows={8} placeholder={t('emailTemplates.bodyPlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmailTemplates;

