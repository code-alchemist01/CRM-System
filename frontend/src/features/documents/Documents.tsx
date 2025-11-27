import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Upload,
  message,
  Space,
  Popconfirm,
  Typography,
  Tag,
  Modal,
  Image,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { UploadFile, UploadProps } from 'antd';
import api from '../../utils/axios';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface DocumentItem {
  id: string;
  fileName: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  category?: string;
  customer?: {
    id: string;
    name: string;
  };
  opportunity?: {
    id: string;
    title: string;
  };
  uploadedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

const Documents = () => {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/documents');
      setDocuments(response.data.data || response.data || []);
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('file', file as File);

    try {
      const response = await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success(t('documents.uploadSuccess'));
      fetchDocuments();
      setFileList([]);
      onSuccess?.(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
      onError?.(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/documents/${id}`);
      message.success(t('documents.deleteSuccess'));
      fetchDocuments();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handlePreview = (doc: DocumentItem) => {
    if (doc.mimeType.startsWith('image/')) {
      setPreviewUrl(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/documents/${doc.id}`);
      setPreviewVisible(true);
    } else {
      message.info(t('documents.previewNotAvailable'));
    }
  };

  const handleDownload = async (doc: DocumentItem) => {
    try {
      const response = await api.get(`/documents/${doc.id}`, {
        responseType: 'blob',
      });
      
      // Create blob with correct MIME type
      const blob = new Blob([response.data], { type: doc.mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.originalFileName);
      window.document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      link.remove();
      
      message.success(t('documents.downloadSuccess'));
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common.error'));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <FileOutlined style={{ color: '#1890ff' }} />;
    }
    if (mimeType.includes('pdf')) {
      return <FileOutlined style={{ color: '#ff4d4f' }} />;
    }
    if (mimeType.includes('word') || mimeType.includes('document')) {
      return <FileOutlined style={{ color: '#1890ff' }} />;
    }
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
      return <FileOutlined style={{ color: '#52c41a' }} />;
    }
    return <FileOutlined />;
  };

  const columns: ColumnsType<DocumentItem> = [
    {
      title: t('documents.fileName'),
      key: 'fileName',
      render: (_, record) => (
        <Space>
          {getFileIcon(record.mimeType)}
          <span>{record.originalFileName}</span>
        </Space>
      ),
    },
    {
      title: t('documents.category'),
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => category ? <Tag>{category}</Tag> : '-',
    },
    {
      title: t('documents.customer'),
      key: 'customer',
      render: (_, record) => (
        record.customer ? (
          <Tag color="blue">{record.customer.name}</Tag>
        ) : '-'
      ),
    },
    {
      title: t('documents.size'),
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (size: number) => formatFileSize(size),
    },
    {
      title: t('documents.uploadedBy'),
      key: 'uploadedBy',
      render: (_, record) => (
        record.uploadedBy
          ? `${record.uploadedBy.firstName} ${record.uploadedBy.lastName}`
          : '-'
      ),
    },
    {
      title: t('documents.uploadDate'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('tr-TR'),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.mimeType.startsWith('image/') && (
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
            >
              {t('documents.preview')}
            </Button>
          )}
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
          >
            {t('documents.download')}
          </Button>
          <Popconfirm
            title={t('documents.deleteConfirm')}
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
        <Title level={2}>{t('documents.title')}</Title>
        <Upload
          customRequest={handleUpload}
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
          maxCount={1}
        >
          <Button type="primary" icon={<PlusOutlined />}>
            {t('documents.upload')}
          </Button>
        </Upload>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={documents}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        open={previewVisible}
        title={t('documents.preview')}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
      >
        <Image src={previewUrl} alt="Preview" style={{ width: '100%' }} />
      </Modal>
    </div>
  );
};

export default Documents;

