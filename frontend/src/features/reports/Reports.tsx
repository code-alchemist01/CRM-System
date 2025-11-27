import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Button,
  Space,
  Typography,
  Spin,
  Table,
  Tag,
  Select,
  Empty,
} from 'antd';
import {
  DollarOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  BarChartOutlined,
  DownloadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { message } from 'antd';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { type Dayjs } from 'dayjs';
import api from '../../utils/axios';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface SalesReport {
  totalRevenue: number;
  totalOpportunities: number;
  wonOpportunities: number;
  averageDealSize: number;
  conversionRate: number;
  opportunitiesByStage: Array<{ stage: string; count: number; value: number }>;
}

interface TaskReport {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  tasksByStatus: Array<{ status: string; count: number }>;
  tasksByPriority: Array<{ priority: string; count: number }>;
}

interface InvoiceReport {
  totalInvoices: number;
  totalRevenue: number;
  paidInvoices: number;
  pendingInvoices: number;
  invoicesByStatus: Array<{ status: string; count: number; amount: number }>;
}

const Reports = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<'sales' | 'tasks' | 'invoices'>('sales');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [taskReport, setTaskReport] = useState<TaskReport | null>(null);
  const [invoiceReport, setInvoiceReport] = useState<InvoiceReport | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (dateRange[0] && dateRange[1]) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }

      if (reportType === 'sales') {
        const response = await api.get('/reports/sales', { params });
        const data = response.data?.data || response.data || {};
        setSalesReport({
          totalRevenue: data.totalRevenue || 0,
          totalOpportunities: data.totalOpportunities || 0,
          wonOpportunities: data.wonOpportunities || 0,
          averageDealSize: data.averageDealSize || 0,
          conversionRate: data.conversionRate || 0,
          opportunitiesByStage: data.opportunitiesByStage || [],
        });
      } else if (reportType === 'tasks') {
        const response = await api.get('/reports/tasks', { params });
        const data = response.data?.data || response.data || {};
        setTaskReport({
          totalTasks: data.totalTasks || 0,
          completedTasks: data.completedTasks || 0,
          overdueTasks: data.overdueTasks || 0,
          tasksByStatus: data.tasksByStatus || [],
          tasksByPriority: data.tasksByPriority || [],
        });
      } else if (reportType === 'invoices') {
        const response = await api.get('/reports/invoices', { params });
        const data = response.data?.data || response.data || {};
        setInvoiceReport({
          totalInvoices: data.totalInvoices || 0,
          totalRevenue: data.totalRevenue || 0,
          paidInvoices: data.paidInvoices || 0,
          pendingInvoices: data.pendingInvoices || 0,
          invoicesByStatus: data.invoicesByStatus || [],
        });
      }
    } catch (error: any) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const handleExportExcel = async () => {
    try {
      const params: any = {};
      if (dateRange[0] && dateRange[1]) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }

      let url = '';
      let filename = '';
      if (reportType === 'sales') {
        url = '/reports/sales/export';
        filename = `sales-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      } else if (reportType === 'tasks') {
        url = '/reports/tasks/export';
        filename = `task-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      } else if (reportType === 'invoices') {
        url = '/reports/invoices/export';
        filename = `invoice-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      }

      const response = await api.get(url, {
        params,
        responseType: 'blob',
      });

      const url_blob = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url_blob;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url_blob);
      message.success(t('reports.exportSuccess'));
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  };

  const salesColumns: ColumnsType<any> = [
    {
      title: t('reports.stage'),
      dataIndex: 'stage',
      key: 'stage',
    },
    {
      title: t('reports.count'),
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: t('reports.value'),
      dataIndex: 'value',
      key: 'value',
      render: (value: number) => `${Number(value).toLocaleString('tr-TR')} TL`,
    },
  ];

  const taskStatusColumns: ColumnsType<any> = [
    {
      title: t('tasks.statusLabel'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color="blue">{status}</Tag>,
    },
    {
      title: t('reports.count'),
      dataIndex: 'count',
      key: 'count',
    },
  ];

  const invoiceStatusColumns: ColumnsType<any> = [
    {
      title: t('invoices.statusLabel'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color="green">{status}</Tag>,
    },
    {
      title: t('reports.count'),
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: t('reports.amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `${Number(amount).toLocaleString('tr-TR')} TL`,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        {t('reports.title')}
      </Title>

      <Card style={{ marginBottom: 24 }}>
        <Space size="large" wrap>
          <Select
            value={reportType}
            onChange={(value) => setReportType(value)}
            style={{ width: 200 }}
          >
            <Select.Option value="sales">{t('reports.salesReport')}</Select.Option>
            <Select.Option value="tasks">{t('reports.taskReport')}</Select.Option>
            <Select.Option value="invoices">{t('reports.invoiceReport')}</Select.Option>
          </Select>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null])}
            format="DD/MM/YYYY"
          />
          <Button type="primary" onClick={fetchReport} loading={loading}>
            {t('reports.generate')}
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportExcel}
            disabled={!salesReport && !taskReport && !invoiceReport}
          >
            {t('reports.exportExcel')}
          </Button>
        </Space>
      </Card>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {reportType === 'sales' && salesReport && (
            <>
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title={t('reports.totalRevenue')}
                      value={salesReport.totalRevenue}
                      prefix={<DollarOutlined />}
                      formatter={(value) => `${Number(value).toLocaleString('tr-TR')} TL`}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title={t('reports.totalOpportunities')}
                      value={salesReport.totalOpportunities}
                      prefix={<BarChartOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title={t('reports.wonOpportunities')}
                      value={salesReport.wonOpportunities}
                      prefix={<CheckCircleOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title={t('reports.conversionRate')}
                      value={salesReport.conversionRate}
                      suffix="%"
                      precision={2}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={12}>
                  <Card title={t('reports.opportunitiesByStage')}>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={salesReport.opportunitiesByStage || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="stage" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title={t('reports.opportunitiesByStage')}>
                    <Table
                      dataSource={salesReport.opportunitiesByStage || []}
                      columns={salesColumns}
                      pagination={false}
                      rowKey="stage"
                    />
                  </Card>
                </Col>
              </Row>
            </>
          )}

          {reportType === 'tasks' && taskReport && (
            <>
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title={t('reports.totalTasks')}
                      value={taskReport.totalTasks}
                      prefix={<CheckCircleOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title={t('reports.completedTasks')}
                      value={taskReport.completedTasks}
                      prefix={<CheckCircleOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title={t('reports.overdueTasks')}
                      value={taskReport.overdueTasks}
                      prefix={<CheckCircleOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title={t('reports.completionRate')}
                      value={
                        taskReport.totalTasks > 0
                          ? (taskReport.completedTasks / taskReport.totalTasks) * 100
                          : 0
                      }
                      suffix="%"
                      precision={2}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={12}>
                  <Card title={t('reports.tasksByStatus')}>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={taskReport.tasksByStatus || []}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {(taskReport.tasksByStatus || []).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title={t('reports.tasksByStatus')}>
                    <Table
                      dataSource={taskReport.tasksByStatus || []}
                      columns={taskStatusColumns}
                      pagination={false}
                      rowKey="status"
                    />
                  </Card>
                </Col>
              </Row>
            </>
          )}

          {reportType === 'invoices' && invoiceReport && (
            <>
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title={t('reports.totalInvoices')}
                      value={invoiceReport.totalInvoices}
                      prefix={<FileTextOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title={t('reports.totalRevenue')}
                      value={invoiceReport.totalRevenue}
                      prefix={<DollarOutlined />}
                      formatter={(value) => `${Number(value).toLocaleString('tr-TR')} TL`}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title={t('reports.paidInvoices')}
                      value={invoiceReport.paidInvoices}
                      prefix={<CheckCircleOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title={t('reports.pendingInvoices')}
                      value={invoiceReport.pendingInvoices}
                      prefix={<FileTextOutlined />}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={24}>
                  <Card title={t('reports.invoicesByStatus')}>
                    <Table
                      dataSource={invoiceReport.invoicesByStatus || []}
                      columns={invoiceStatusColumns}
                      pagination={false}
                      rowKey="status"
                    />
                  </Card>
                </Col>
              </Row>
            </>
          )}

          {!salesReport && !taskReport && !invoiceReport && (
            <Empty description={t('reports.noData')} />
          )}
        </>
      )}

      {/* Advanced Analytics Section */}
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title={t('reports.advancedAnalytics')}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title={t('reports.totalCustomers')}
                  value={salesReport?.totalOpportunities || 0}
                  prefix={<UserOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={t('reports.totalTasks')}
                  value={taskReport?.totalTasks || 0}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={t('reports.totalInvoices')}
                  value={invoiceReport?.totalInvoices || 0}
                  prefix={<FileTextOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Reports;

