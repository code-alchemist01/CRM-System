import type { ReactNode } from 'react';
import { Layout as AntLayout, Menu, Button, Space, Avatar, Dropdown } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import {
  DashboardOutlined,
  UserOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  LogoutOutlined,
  BarChartOutlined,
  PaperClipOutlined,
  MailOutlined,
  HistoryOutlined,
  SafetyOutlined,
  FileProtectOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import { logout } from '../../store/slices/authSlice';
import type { RootState } from '../../store/store';
import NotificationBell from '../notifications/NotificationBell';
import GlobalSearch from '../common/GlobalSearch';

const { Header, Sider, Content } = AntLayout;

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: t('dashboard.title'),
    },
    {
      key: '/customers',
      icon: <UserOutlined />,
      label: t('customers.title'),
    },
    {
      key: '/contacts',
      icon: <UserOutlined />,
      label: t('contacts.title'),
    },
    {
      key: '/documents',
      icon: <PaperClipOutlined />,
      label: t('documents.title'),
    },
    {
      key: '/emails',
      icon: <MailOutlined />,
      label: t('emails.title'),
    },
    {
      key: '/activities',
      icon: <HistoryOutlined />,
      label: t('activities.title'),
    },
    {
      key: '/audit-logs',
      icon: <SafetyOutlined />,
      label: t('auditLogs.title'),
    },
    {
      key: '/opportunities',
      icon: <DollarOutlined />,
      label: t('opportunities.title'),
    },
    {
      key: '/tasks',
      icon: <CheckCircleOutlined />,
      label: t('tasks.title'),
    },
    {
      key: '/invoices',
      icon: <FileTextOutlined />,
      label: t('invoices.title'),
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: t('reports.title'),
    },
    {
      key: '/email-templates',
      icon: <MailOutlined />,
      label: t('emailTemplates.title'),
    },
    {
      key: '/payments',
      icon: <CreditCardOutlined />,
      label: t('payments.title'),
    },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const changeLanguage = (lang: 'tr' | 'en') => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('profile.title') || 'Profil',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('common.logout'),
      onClick: handleLogout,
    },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        width={250}
        style={{
          background: '#001529',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          CRM
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <AntLayout>
        <Header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 24px',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 500 }}>
            {user?.firstName} {user?.lastName}
          </div>
          <Space size="middle">
            <GlobalSearch />
            <Space>
              <Button
                type={i18n.language === 'tr' ? 'primary' : 'default'}
                size="small"
                onClick={() => changeLanguage('tr')}
              >
                TR
              </Button>
              <Button
                type={i18n.language === 'en' ? 'primary' : 'default'}
                size="small"
                onClick={() => changeLanguage('en')}
              >
                EN
              </Button>
            </Space>
            <NotificationBell />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span>{user?.email}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: '24px',
            padding: 0,
            background: '#f0f2f5',
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
