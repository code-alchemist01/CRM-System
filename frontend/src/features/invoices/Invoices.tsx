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
  InputNumber,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilePdfOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../../utils/axios';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer?: { name: string };
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  dueDate?: string;
  issueDate?: string;
}

const Invoices = () => {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [searchText, invoices]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invoicesRes, customersRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/customers'),
      ]);
      const invoicesData = invoicesRes.data.data || invoicesRes.data;
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      setCustomers(customersRes.data.data || customersRes.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    if (!searchText) {
      setFilteredInvoices(invoices);
      return;
    }

    const filtered = invoices.filter(
      (invoice) =>
        invoice.invoiceNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
        invoice.customer?.name?.toLowerCase().includes(searchText.toLowerCase()),
    );
    setFilteredInvoices(filtered);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingInvoice) {
        // Update: Only send changed fields
        const payload: any = {};
        if (values.invoiceNumber) payload.invoiceNumber = values.invoiceNumber;
        if (values.customerId) payload.customerId = values.customerId;
        if (values.status) payload.status = values.status;
        if (values.subtotal !== undefined) payload.subtotal = Number(values.subtotal);
        if (values.tax !== undefined) payload.tax = Number(values.tax);
        if (values.total !== undefined) payload.total = Number(values.total);
        if (values.items) payload.items = values.items;
        if (values.issueDate) payload.issueDate = values.issueDate.toISOString();
        if (values.dueDate) payload.dueDate = values.dueDate.toISOString();
        
        await api.patch(`/invoices/${editingInvoice.id}`, payload);
        message.success(t('invoices.updateSuccess'));
      } else {
        // Create: Generate invoice number if not provided
        const invoiceNumber = values.invoiceNumber || `INV-${Date.now()}`;
        // Calculate subtotal and tax if not provided
        const subtotal = values.subtotal || (values.total || 0) / 1.18; // Assuming 18% tax
        const tax = values.tax || (values.total || 0) - subtotal;
        const total = values.total || subtotal + tax;
        
        const payload = {
          ...values,
          invoiceNumber,
          subtotal: Number(subtotal),
          tax: Number(tax),
          total: Number(total),
          items: values.items || [
            {
              description: 'Service',
              quantity: 1,
              unitPrice: subtotal,
            },
          ],
          issueDate: values.issueDate ? values.issueDate.toISOString() : undefined,
          dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
        };
        await api.post('/invoices', payload);
        message.success(t('invoices.createSuccess'));
      }
      setModalVisible(false);
      form.resetFields();
      setEditingInvoice(null);
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/invoices/${id}`);
      message.success(t('invoices.deleteSuccess'));
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleExportPDF = async (id: string) => {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success(t('invoices.exportSuccess'));
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'sent':
        return 'processing';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<Invoice> = [
    {
      title: t('invoices.invoiceNumber'),
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      sorter: (a, b) => (a.invoiceNumber || '').localeCompare(b.invoiceNumber || ''),
    },
    {
      title: t('invoices.customer'),
      key: 'customer',
      render: (_, record) => record.customer?.name || '-',
    },
    {
      title: t('invoices.total'),
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => (
        <Space>
          <DollarOutlined />
          <span style={{ fontWeight: 500 }}>{total.toLocaleString()}</span>
        </Space>
      ),
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: t('invoices.statusLabel'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (!status) return '-';
        // Try lowercase first, then uppercase
        const statusKey = status.toLowerCase();
        const translation = t(`invoices.status.${statusKey}`) || t(`invoices.status.${status.toUpperCase()}`) || status;
        return (
          <Tag color={getStatusColor(status)}>
            {translation}
          </Tag>
        );
      },
    },
    {
      title: t('invoices.issueDate'),
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (date: string) => (date ? dayjs(date).format('DD/MM/YYYY') : '-'),
    },
    {
      title: t('invoices.dueDate'),
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => (date ? dayjs(date).format('DD/MM/YYYY') : '-'),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 150,
      render: (_: any, record: Invoice) => (
        <Space>
          <Tooltip title={t('invoices.exportPDF')}>
            <Button
              icon={<FilePdfOutlined />}
              size="small"
              onClick={() => handleExportPDF(record.id)}
            />
          </Tooltip>
          <Tooltip title={t('common.edit')}>
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                setEditingInvoice(record);
                form.setFieldsValue({
                  ...record,
                  issueDate: record.issueDate ? dayjs(record.issueDate) : undefined,
                  dueDate: record.dueDate ? dayjs(record.dueDate) : undefined,
                });
                setModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title={t('invoices.deleteConfirm')}
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

  const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            {t('invoices.title')}
          </Title>
          <div style={{ marginTop: 8 }}>
            <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
              {invoices.length} {t('invoices.total')}
            </Tag>
            <Tag
              color="green"
              style={{ fontSize: 14, padding: '4px 12px', marginLeft: 8 }}
            >
              <DollarOutlined /> {totalAmount.toLocaleString()} {t('invoices.totalAmount')}
            </Tag>
          </div>
        </Col>
        <Col>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingInvoice(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            {t('invoices.create')}
          </Button>
        </Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16, width: '100%' }} orientation="vertical" size="large">
          <Input
            placeholder={t('invoices.searchPlaceholder')}
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
          dataSource={filteredInvoices}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${total} ${t('invoices.total')}`,
          }}
        />
      </Card>

      <Modal
        title={editingInvoice ? t('invoices.editInvoice') : t('invoices.newInvoice')}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingInvoice(null);
        }}
        onOk={() => form.submit()}
        width={600}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="customerId"
            label={t('invoices.customer')}
            rules={[{ required: true, message: t('invoices.customerRequired') }]}
          >
            <Select placeholder={t('invoices.customerPlaceholder')} showSearch>
              {customers.map((customer) => (
                <Option key={customer.id} value={customer.id}>
                  {customer.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="invoiceNumber"
            label={t('invoices.invoiceNumber')}
            rules={[{ required: true, message: 'Fatura numarası gereklidir' }]}
          >
            <Input placeholder="INV-2025-001" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="issueDate" label={t('invoices.issueDate')}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dueDate" label={t('invoices.dueDate')}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="subtotal"
                label="Ara Toplam"
                rules={[{ required: true, message: 'Ara toplam gereklidir' }]}
              >
                <InputNumber
                  prefix={<DollarOutlined />}
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="tax"
                label="KDV"
                rules={[{ required: true, message: 'KDV gereklidir' }]}
              >
                <InputNumber
                  prefix={<DollarOutlined />}
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="total"
                label={t('invoices.total')}
                rules={[{ required: true, message: t('invoices.totalRequired') }]}
              >
                <InputNumber
                  prefix={<DollarOutlined />}
                  style={{ width: '100%' }}
                  min={0}
                  placeholder={t('invoices.totalPlaceholder')}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="status"
            label={t('invoices.statusLabel')}
            rules={[{ required: true }]}
          >
            <Select placeholder={t('invoices.statusPlaceholder')}>
              <Option value="draft">{t('invoices.status.DRAFT')}</Option>
              <Option value="sent">{t('invoices.status.SENT')}</Option>
              <Option value="paid">{t('invoices.status.PAID')}</Option>
              <Option value="cancelled">{t('invoices.status.CANCELLED')}</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Invoices;

