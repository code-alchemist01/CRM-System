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
  Select,
  DatePicker,
  InputNumber,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../../utils/axios';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title } = Typography;

interface Payment {
  id: string;
  invoiceId: string;
  invoice?: { invoiceNumber: string; total: number };
  amount: number;
  paymentMethod?: string;
  paymentDate?: string;
  notes?: string;
  createdAt?: string;
}

const Payments = () => {
  const { t } = useTranslation();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [searchText, setSearchText] = useState('');
  const [invoiceFilter, setInvoiceFilter] = useState<string | undefined>(undefined);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [searchText, invoiceFilter, payments]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [paymentsRes, invoicesRes] = await Promise.all([
        api.get('/payments'),
        api.get('/invoices'),
      ]);
      const paymentsData = paymentsRes.data.data || paymentsRes.data;
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setInvoices(invoicesRes.data.data || invoicesRes.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    if (searchText) {
      filtered = filtered.filter(
        (payment) =>
          payment.invoice?.invoiceNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
          payment.paymentMethod?.toLowerCase().includes(searchText.toLowerCase()),
      );
    }

    if (invoiceFilter) {
      filtered = filtered.filter((payment) => payment.invoiceId === invoiceFilter);
    }

    setFilteredPayments(filtered);
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        amount: Number(values.amount),
        paymentDate: values.paymentDate ? values.paymentDate.toISOString() : new Date().toISOString(),
      };
      if (editingPayment) {
        await api.patch(`/payments/${editingPayment.id}`, payload);
        message.success(t('payments.updateSuccess'));
      } else {
        await api.post('/payments', payload);
        message.success(t('payments.createSuccess'));
      }
      setModalVisible(false);
      form.resetFields();
      setEditingPayment(null);
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/payments/${id}`);
      message.success(t('payments.deleteSuccess'));
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  };

  const columns: ColumnsType<Payment> = [
    {
      title: t('payments.invoice'),
      key: 'invoice',
      render: (_, record) => record.invoice?.invoiceNumber || '-',
    },
    {
      title: t('payments.amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <Space>
          <DollarOutlined />
          <span style={{ fontWeight: 500 }}>{Number(amount).toLocaleString('tr-TR')} TL</span>
        </Space>
      ),
      sorter: (a, b) => Number(a.amount) - Number(b.amount),
    },
    {
      title: t('payments.paymentMethod'),
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method: string) => method || '-',
    },
    {
      title: t('payments.paymentDate'),
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (date: string) => (date ? dayjs(date).format('DD/MM/YYYY') : '-'),
      sorter: (a, b) => {
        if (!a.paymentDate) return 1;
        if (!b.paymentDate) return -1;
        return dayjs(a.paymentDate).unix() - dayjs(b.paymentDate).unix();
      },
    },
    {
      title: t('payments.notes'),
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 150,
      render: (_: any, record: Payment) => (
        <Space>
          <Tooltip title={t('common.edit')}>
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                setEditingPayment(record);
                form.setFieldsValue({
                  ...record,
                  paymentDate: record.paymentDate ? dayjs(record.paymentDate) : undefined,
                });
                setModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title={t('payments.deleteConfirm')}
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
            {t('payments.title')}
          </Title>
        </Col>
        <Col>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingPayment(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            {t('payments.create')}
          </Button>
        </Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16, width: '100%' }} orientation="vertical" size="large">
          <Row gutter={16}>
            <Col span={12}>
              <Input
                placeholder={t('payments.searchPlaceholder')}
                prefix={<SearchOutlined />}
                size="large"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col span={12}>
              <Select
                placeholder={t('payments.invoiceFilter')}
                size="large"
                style={{ width: '100%' }}
                value={invoiceFilter}
                onChange={setInvoiceFilter}
                allowClear
                showSearch
                optionFilterProp="children"
              >
                {invoices.map((invoice) => (
                  <Select.Option key={invoice.id} value={invoice.id}>
                    {invoice.invoiceNumber} - {invoice.customer?.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredPayments}
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
          editingPayment ? t('payments.editPayment') : t('payments.newPayment')
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingPayment(null);
        }}
        onOk={() => form.submit()}
        width={600}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="invoiceId"
            label={t('payments.invoice')}
            rules={[{ required: true, message: t('payments.invoiceRequired') }]}
          >
            <Select
              placeholder={t('payments.invoicePlaceholder')}
              showSearch
              optionFilterProp="children"
              disabled={!!editingPayment}
            >
              {invoices.map((invoice) => (
                <Select.Option key={invoice.id} value={invoice.id}>
                  {invoice.invoiceNumber} - {invoice.customer?.name} ({invoice.total} TL)
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="amount"
            label={t('payments.amount')}
            rules={[{ required: true, message: t('payments.amountRequired') }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder={t('payments.amountPlaceholder')}
              min={0}
              step={0.01}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
          <Form.Item name="paymentMethod" label={t('payments.paymentMethod')}>
            <Select placeholder={t('payments.paymentMethodPlaceholder')}>
              <Select.Option value="cash">{t('payments.methods.cash')}</Select.Option>
              <Select.Option value="bank_transfer">{t('payments.methods.bankTransfer')}</Select.Option>
              <Select.Option value="credit_card">{t('payments.methods.creditCard')}</Select.Option>
              <Select.Option value="check">{t('payments.methods.check')}</Select.Option>
              <Select.Option value="other">{t('payments.methods.other')}</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="paymentDate" label={t('payments.paymentDate')}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="notes" label={t('payments.notes')}>
            <Input.TextArea rows={3} placeholder={t('payments.notesPlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Payments;

