import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Row,
  Col,
  Typography,
} from 'antd';
import { UserOutlined, SaveOutlined, LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../store/slices/authSlice';
import api from '../../utils/axios';
import type { RootState } from '../../store/store';

const { Title } = Typography;

const Profile = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
  }, [user, profileForm]);

  const handleProfileUpdate = async (values: any) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await api.patch(`/users/${user.id}`, values);
      const updatedUser = response.data.data || response.data;
      dispatch(updateUser(updatedUser));
      message.success(t('profile.updateSuccess') || 'Profil başarıyla güncellendi');
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values: any) => {
    setPasswordLoading(true);
    try {
      await api.patch('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success(t('profile.passwordChangeSuccess') || 'Şifre başarıyla değiştirildi');
      passwordForm.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        {t('profile.title') || 'Profil'}
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title={t('profile.profileInfo') || 'Profil Bilgileri'}>
            <Form
              form={profileForm}
              onFinish={handleProfileUpdate}
              layout="vertical"
            >
              <Form.Item
                name="firstName"
                label={t('profile.firstName') || 'Ad'}
                rules={[{ required: true, message: t('profile.firstNameRequired') || 'Ad gereklidir' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item
                name="lastName"
                label={t('profile.lastName') || 'Soyad'}
                rules={[{ required: true, message: t('profile.lastNameRequired') || 'Soyad gereklidir' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item
                name="email"
                label={t('profile.email') || 'E-posta'}
                rules={[
                  { required: true, message: t('profile.emailRequired') || 'E-posta gereklidir' },
                  { type: 'email', message: t('profile.emailInvalid') || 'Geçerli bir e-posta adresi girin' },
                ]}
              >
                <Input disabled />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  {t('common.save')}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title={t('profile.changePassword') || 'Şifre Değiştir'}>
            <Form
              form={passwordForm}
              onFinish={handlePasswordChange}
              layout="vertical"
            >
              <Form.Item
                name="currentPassword"
                label={t('profile.currentPassword') || 'Mevcut Şifre'}
                rules={[
                  { required: true, message: t('profile.currentPasswordRequired') || 'Mevcut şifre gereklidir' },
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label={t('profile.newPassword') || 'Yeni Şifre'}
                rules={[
                  { required: true, message: t('profile.newPasswordRequired') || 'Yeni şifre gereklidir' },
                  { min: 6, message: t('profile.passwordMinLength') || 'Şifre en az 6 karakter olmalıdır' },
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label={t('profile.confirmPassword') || 'Yeni Şifre Tekrar'}
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: t('profile.confirmPasswordRequired') || 'Şifre tekrarı gereklidir' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error(t('profile.passwordsDoNotMatch') || 'Şifreler eşleşmiyor'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={passwordLoading}
                  icon={<LockOutlined />}
                >
                  {t('profile.changePassword') || 'Şifre Değiştir'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;

