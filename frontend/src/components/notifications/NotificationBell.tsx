import { useState, useEffect } from 'react';
import { Badge, Dropdown, List, Button, Empty, Typography, Space } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../../utils/axios';
import { websocketService } from '../../services/websocket';

const { Text } = Typography;

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

const NotificationBell = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    connectWebSocket();
    return () => {
      websocketService.disconnect();
    };
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notifications');
      const data = response.data.data || response.data || [];
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    try {
      websocketService.connect();
      websocketService.on('notification', (data: Notification) => {
        setNotifications((prev) => [data, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
    } catch (error) {
      // WebSocket connection failed, but don't show error to user
      // This is expected if user is not logged in yet
      console.debug('WebSocket connection failed:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error: any) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#52c41a';
      case 'warning':
        return '#faad14';
      case 'error':
        return '#ff4d4f';
      default:
        return '#1890ff';
    }
  };

  const notificationDropdown = (
    <div style={{ width: 350, maxHeight: 400, overflowY: 'auto' }}>
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text strong>{t('notifications.title')}</Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={markAllAsRead}>
            {t('notifications.markAllRead')}
          </Button>
        )}
      </div>
      {notifications.length === 0 ? (
        <Empty
          description={t('notifications.noNotifications')}
          style={{ padding: '40px 20px' }}
        />
      ) : (
        <List
          dataSource={notifications}
          loading={loading}
          renderItem={(item: Notification) => (
            <List.Item
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                backgroundColor: item.isRead ? '#fff' : '#f0f7ff',
                borderBottom: '1px solid #f0f0f0',
              }}
              onClick={() => !item.isRead && markAsRead(item.id)}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: getNotificationColor(item.type),
                      }}
                    />
                    <Text strong={!item.isRead}>{item.title}</Text>
                  </Space>
                }
                description={
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.message}
                    </Text>
                    <div style={{ marginTop: 4 }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {new Date(item.createdAt).toLocaleString('tr-TR')}
                      </Text>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Dropdown
      popupRender={() => notificationDropdown}
      placement="bottomRight"
      trigger={['click']}
    >
      <Badge count={unreadCount} size="small">
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 18 }} />}
          style={{ marginRight: 8 }}
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;

