import { useTranslation } from 'react-i18next';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Typography,
  Spin,
  Empty,
} from 'antd';
import {
  UserOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useGetDetailedStatsQuery } from '../../store/api/dashboardApi';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useGetDetailedStatsQuery();

  const activityColumns: ColumnsType<any> = [
    {
      title: t('activities.type'),
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: t('activities.title'),
      dataIndex: 'title',
      key: 'title',
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
      render: (_, record) => record.customer?.name || '-',
    },
    {
      title: t('activities.date'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Empty description={t('common.error')} />;
  }

  const stats = data?.summary || {};
  const tasksByStatus = data?.tasksByStatus || [];
  const opportunitiesByStage = data?.opportunitiesByStage || [];
  const recentActivities = data?.recentActivities || [];

  const taskChartData = tasksByStatus.map((item: any) => ({
    name: item.status,
    value: item.count,
  }));

  const opportunityChartData = opportunitiesByStage.map((item: any) => ({
    name: item.stage,
    count: item.count,
    value: item.value,
  }));

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        {t('dashboard.title')}
      </Title>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('dashboard.customers')}
              value={stats.customers || 0}
              prefix={<UserOutlined />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('dashboard.opportunities')}
              value={stats.opportunities || 0}
              prefix={<DollarOutlined />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('dashboard.tasks')}
              value={stats.tasks || 0}
              prefix={<CheckCircleOutlined />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('dashboard.invoices')}
              value={stats.invoices || 0}
              prefix={<FileTextOutlined />}
              styles={{ content: { color: '#f5222d' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Revenue Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title={t('dashboard.totalRevenue')}
              value={stats.totalRevenue || 0}
              prefix={<ArrowUpOutlined />}
              precision={2}
              styles={{ content: { color: '#3f8600' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title={t('dashboard.monthlyRevenue')}
              value={stats.monthlyRevenue || 0}
              prefix={<ArrowDownOutlined />}
              precision={2}
              styles={{ content: { color: '#cf1322' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title={t('dashboard.tasksByStatus')}>
            {taskChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taskChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => {
                      const { name, percent } = props;
                      return `${name || ''}: ${((percent || 0) * 100).toFixed(0)}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {taskChartData.map((_entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description={t('dashboard.noData')} />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={t('dashboard.opportunitiesByStage')}>
            {opportunityChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={opportunityChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description={t('dashboard.noData')} />
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Activities */}
      <Card title={t('dashboard.recentActivities')}>
        <Table
          columns={activityColumns}
          dataSource={recentActivities}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default Dashboard;
