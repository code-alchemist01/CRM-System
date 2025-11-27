import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Input,
  Space,
  Typography,
  Tag,
  DatePicker,
  Select,
  Button,
  message,
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { Dayjs } from 'dayjs';
import api from '../../utils/axios';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface AuditLog {
  id: string;
  resource: string;
  resourceId: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'login' | 'logout';
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  tenantId: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

const AuditLogs = () => {
  const { t } = useTranslation();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [resourceFilter, setResourceFilter] = useState<string | undefined>(undefined);
  const [actionFilter, setActionFilter] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (dateRange[0] && dateRange[1]) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      if (resourceFilter) {
        params.resource = resourceFilter;
      }
      if (actionFilter) {
        params.action = actionFilter;
      }
      const response = await api.get('/audit-logs', { params });
      setAuditLogs(response.data.data || response.data || []);
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchAuditLogs();
  };

  const handleReset = () => {
    setSearchText('');
    setResourceFilter(undefined);
    setActionFilter(undefined);
    setDateRange([null, null]);
    fetchAuditLogs();
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'green';
      case 'update':
        return 'blue';
      case 'delete':
        return 'red';
      default:
        return 'default';
    }
  };

  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesSearch =
      !searchText ||
      log.resource?.toLowerCase().includes(searchText.toLowerCase()) ||
      log.user?.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      log.user?.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
      log.user?.lastName?.toLowerCase().includes(searchText.toLowerCase());

    return matchesSearch;
  });

  const uniqueResources = Array.from(new Set(auditLogs.map((log) => log.resource))).filter(Boolean);

  const columns: ColumnsType<AuditLog> = [
    {
      title: t('auditLogs.actionLabel'),
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => (
        <Tag color={getActionColor(action)}>
          {t(`auditLogs.action.${action}`) || action}
        </Tag>
      ),
    },
    {
      title: t('auditLogs.resource'),
      dataIndex: 'resource',
      key: 'resource',
    },
    {
      title: t('auditLogs.resourceId'),
      dataIndex: 'resourceId',
      key: 'resourceId',
      render: (id: string) => id ? <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{id.substring(0, 8)}...</span> : '-',
    },
    {
      title: t('auditLogs.user'),
      key: 'user',
      render: (_, record) =>
        record.user
          ? `${record.user.firstName} ${record.user.lastName} (${record.user.email})`
          : '-',
    },
    {
      title: t('auditLogs.changes'),
      key: 'changes',
      render: (_, record) => {
        const oldKeys = record.oldValues ? Object.keys(record.oldValues).length : 0;
        const newKeys = record.newValues ? Object.keys(record.newValues).length : 0;
        const totalChanges = Math.max(oldKeys, newKeys);
        if (totalChanges === 0) {
          return '-';
        }
        return (
          <span style={{ fontSize: 12 }}>
            {totalChanges} {t('auditLogs.fieldChanged')}
          </span>
        );
      },
    },
    {
      title: t('auditLogs.date'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('tr-TR'),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        {t('auditLogs.title')}
      </Title>

      <Card style={{ marginBottom: 24 }}>
        <Space size="middle" wrap>
          <Input
            placeholder={t('auditLogs.searchPlaceholder')}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            onPressEnter={handleSearch}
          />
          <Select
            placeholder={t('auditLogs.resourceFilter')}
            value={resourceFilter}
            onChange={setResourceFilter}
            allowClear
            style={{ width: 150 }}
          >
            {uniqueResources.map((resource) => (
              <Select.Option key={resource} value={resource}>
                {resource}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder={t('auditLogs.actionFilter')}
            value={actionFilter}
            onChange={setActionFilter}
            allowClear
            style={{ width: 120 }}
          >
            <Select.Option value="create">{t('auditLogs.action.create')}</Select.Option>
            <Select.Option value="update">{t('auditLogs.action.update')}</Select.Option>
            <Select.Option value="delete">{t('auditLogs.action.delete')}</Select.Option>
            <Select.Option value="view">{t('auditLogs.action.view')}</Select.Option>
            <Select.Option value="login">{t('auditLogs.action.login')}</Select.Option>
            <Select.Option value="logout">{t('auditLogs.action.logout')}</Select.Option>
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
            {t('auditLogs.reset')}
          </Button>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredAuditLogs}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 20 }}
        />
      </Card>
    </div>
  );
};

export default AuditLogs;

