'use client';

// import Button from '@mui/material/Button';
// import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';

// import { useMockedUser } from 'src/hooks/use-mocked-user';

// import { MotivationIllustration } from 'src/assets/illustrations';
import {
  // _ecommerceNewProducts,
  _ecommerceBestSalesman,
  // _ecommerceSalesOverview,
  _ecommerceLatestProducts,
} from 'src/_mock';

import { useSettingsContext } from 'src/components/settings';

// import EcommerceWelcome from '../ecommerce-welcome';
// import EcommerceNewProducts from '../ecommerce-new-products';
import EcommerceYearlySales from '../ecommerce-yearly-sales';
import EcommerceBestSalesman from '../ecommerce-best-salesman';
import EcommerceSaleByGender from '../ecommerce-sale-by-gender';
// import EcommerceSalesOverview from '../ecommerce-sales-overview';
// import EcommerceWidgetSummary from '../ecommerce-widget-summary';
import EcommerceLatestProducts from '../ecommerce-latest-products';
import EcommerceCurrentBalance from '../ecommerce-current-balance';
import AnalyticsWidgetSummary from '../../analytics/analytics-widget-summary';
import BankingBalanceStatistics from '../../banking/banking-balance-statistics';
import Admin from '../../app/admin-dashboard';
import DesignerDashboard from '../../app/admin-designer';
import PackerDashboard from '../../app/packerdashboardcomponent/admin-packer';
import { useMockedUser } from 'src/hooks/use-mocked-user';
import { useTheme } from '@emotion/react';
import ReplicatorDashboard from '../../app/replicatordashboardcomponents/admin-Replicators';
import WarehouseDashboard from '../../app/warehousedashboardcomponent/admin-warehouse';
import MarketingDashboard from '../../app/marketingdashboardcomponent/admin-marketing';
import SupportChannelDashboard from '../../app/supportchanneldashboardcomponent/admin-supportchannel';
import OfflineSalesDashboard from '../../app/offlinesalesdashboardcomponent/admin-offlinesales';
// ----------------------------------------------------------------------

export default function OverviewEcommerceView() {
  const { user } = useMockedUser();

  const theme = useTheme();

  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      {user?.role_id == 1 && (
        <Admin />
      )}
      {user?.role_id == 2 && (
        <DesignerDashboard />
      )}
      {user?.role_id == 3 && (
        <ReplicatorDashboard />
      )}
      {user?.role_id == 4 && (
        <PackerDashboard />
      )}
      {user?.role_id == 5 && (
        <WarehouseDashboard />
      )}
      {user?.role_id == 6 && (
        <MarketingDashboard />
      )}
      {user?.role_id == 7 && (
        <SupportChannelDashboard />
      )}
      {user?.role_id == 8 && (
        <OfflineSalesDashboard />
      )}
    </Container>
  );
}
