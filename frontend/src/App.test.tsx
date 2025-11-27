import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { store } from './store/store';
import App from './App';
import './locales/i18n';

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <ConfigProvider>
            <App />
          </ConfigProvider>
        </BrowserRouter>
      </Provider>
    );
    expect(container).toBeDefined();
  });
});

