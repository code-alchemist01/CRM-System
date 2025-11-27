import { useState, useMemo } from 'react';
import { Input, AutoComplete, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../utils/axios';

const GlobalSearch = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [options, setOptions] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');

  // Memoize placeholder to ensure it updates when language changes
  const searchPlaceholder = useMemo(() => {
    const translation = t('common.searchPlaceholder');
    // If translation returns the key itself, use fallback
    if (translation === 'common.searchPlaceholder') {
      return 'Ara... (Müşteri, Fırsat, Görev, Fatura)';
    }
    return translation || 'Ara... (Müşteri, Fırsat, Görev, Fatura)';
  }, [t, i18n.language]);

  const handleSearch = async (value: string) => {
    setSearchText(value);
    const trimmedValue = value.trim();
    
    if (!trimmedValue || trimmedValue.length < 2) {
      setOptions([]);
      return;
    }

    try {
      // Search across multiple resources with trimmed search term
      const [customersRes, opportunitiesRes, tasksRes, invoicesRes] = await Promise.allSettled([
        api.get('/customers', { params: { search: trimmedValue } }),
        api.get('/opportunities', { params: { search: trimmedValue } }),
        api.get('/tasks', { params: { search: trimmedValue } }),
        api.get('/invoices', { params: { search: trimmedValue } }),
      ]);

      const results: any[] = [];
      const searchLower = trimmedValue.toLowerCase();

      // Filter customers - only include if name contains search term
      if (customersRes.status === 'fulfilled') {
        const customers = customersRes.value.data.data || customersRes.value.data || [];
        customers
          .filter((customer: any) => 
            customer.name && customer.name.toLowerCase().includes(searchLower)
          )
          .slice(0, 3)
          .forEach((customer: any, index: number) => {
            results.push({
              key: `customer-${customer.id}-${index}`,
              value: `customer-${customer.id}-${index}`,
              label: (
                <Space>
                  <span>{customer.name}</span>
                  <span style={{ color: '#999', fontSize: '12px' }}>({t('customers.title')})</span>
                </Space>
              ),
              type: 'customer',
              id: customer.id,
              displayValue: customer.name,
            });
          });
      }

      // Filter opportunities - only include if title contains search term
      if (opportunitiesRes.status === 'fulfilled') {
        const opportunities = opportunitiesRes.value.data.data || opportunitiesRes.value.data || [];
        opportunities
          .filter((opp: any) => 
            opp.title && opp.title.toLowerCase().includes(searchLower)
          )
          .slice(0, 3)
          .forEach((opp: any, index: number) => {
            results.push({
              key: `opportunity-${opp.id}-${index}`,
              value: `opportunity-${opp.id}-${index}`,
              label: (
                <Space>
                  <span>{opp.title}</span>
                  <span style={{ color: '#999', fontSize: '12px' }}>({t('opportunities.title')})</span>
                </Space>
              ),
              type: 'opportunity',
              id: opp.id,
              displayValue: opp.title,
            });
          });
      }

      // Filter tasks - only include if title contains search term
      if (tasksRes.status === 'fulfilled') {
        const tasks = tasksRes.value.data.data || tasksRes.value.data || [];
        tasks
          .filter((task: any) => 
            task.title && task.title.toLowerCase().includes(searchLower)
          )
          .slice(0, 3)
          .forEach((task: any, index: number) => {
            results.push({
              key: `task-${task.id}-${index}`,
              value: `task-${task.id}-${index}`,
              label: (
                <Space>
                  <span>{task.title}</span>
                  <span style={{ color: '#999', fontSize: '12px' }}>({t('tasks.title')})</span>
                </Space>
              ),
              type: 'task',
              id: task.id,
              displayValue: task.title,
            });
          });
      }

      // Filter invoices - only include if invoiceNumber contains search term
      if (invoicesRes.status === 'fulfilled') {
        const invoices = invoicesRes.value.data.data || invoicesRes.value.data || [];
        invoices
          .filter((invoice: any) => 
            invoice.invoiceNumber && invoice.invoiceNumber.toLowerCase().includes(searchLower)
          )
          .slice(0, 3)
          .forEach((invoice: any, index: number) => {
            results.push({
              key: `invoice-${invoice.id}-${index}`,
              value: `invoice-${invoice.id}-${index}`,
              label: (
                <Space>
                  <span>{invoice.invoiceNumber}</span>
                  <span style={{ color: '#999', fontSize: '12px' }}>({t('invoices.title')})</span>
                </Space>
              ),
              type: 'invoice',
              id: invoice.id,
              displayValue: invoice.invoiceNumber,
            });
          });
      }

      setOptions(results);
    } catch (error) {
      console.error('Search error:', error);
      setOptions([]);
    }
  };

  const handleSelect = (value: string, option: any) => {
    const routeMap: Record<string, string> = {
      customer: '/customers',
      opportunity: '/opportunities',
      task: '/tasks',
      invoice: '/invoices',
    };

    if (option.type && routeMap[option.type]) {
      navigate(routeMap[option.type]);
    }
  };

  return (
    <AutoComplete
      style={{ width: 300 }}
      options={options}
      onSearch={handleSearch}
      onSelect={(value: string, option: any) => {
        handleSelect(value, option);
        setSearchText(option.displayValue || '');
      }}
      placeholder={searchPlaceholder}
      filterOption={false}
      notFoundContent={searchText.length >= 2 ? (t('common.noResults') || 'Sonuç bulunamadı') : null}
      value={searchText}
      onClear={() => {
        setSearchText('');
        setOptions([]);
      }}
    >
      <Input
        prefix={<SearchOutlined />}
        size="large"
        allowClear
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
          if (!e.target.value) {
            setOptions([]);
          }
        }}
        placeholder={searchPlaceholder}
      />
    </AutoComplete>
  );
};

export default GlobalSearch;

