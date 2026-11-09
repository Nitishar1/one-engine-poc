import { Layout, Tag } from 'antd';
import { config } from '../config';

/** Bottom bar: copyright, and a reminder when the app is running on mock data. */
export function AppFooter() {
  return (
    <Layout.Footer className="app-footer">
      <span>Copyright {new Date().getFullYear()} OneEngine. All rights reserved.</span>
      {config.useMocks && <Tag color="orange">Mock data</Tag>}
    </Layout.Footer>
  );
}
