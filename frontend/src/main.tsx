import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import trTR from 'antd/locale/tr_TR';
import enUS from 'antd/locale/en_US';
import { store } from './store/store';
import App from './App';
import './locales/i18n';
import './index.css';

const locale = localStorage.getItem('language') === 'en' ? enUS : trTR;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ConfigProvider locale={locale}>
          <App />
        </ConfigProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
