'use client';

import { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { _userAbout, _userPlans, _userPayment, _userInvoices, _userAddressBook } from 'src/_mock';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import AccountGeneral from '../account-general';
import AccountBilling from '../account-billing';
import AccountSocialLinks from '../account-social-links';
import AccountNotifications from '../account-notifications';
import AccountChangePassword from '../account-change-password';
import AccountActivityLog from '../account-activity-log';
import AccountOrderList from '../../order/view/order-list-view';
import AccountOrderDetail from '../../order/view/order-details-view';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'general',
    label: 'General',
    icon: <Iconify icon="solar:user-id-bold" width={24} />,
  },
  {
    value: 'orders',
    label: 'Orders',
    icon: <Iconify icon="solar:list-bold" width={24} />,
  },
  {
    value: 'activitylog',
    label: 'Activity Log',
    icon: <Iconify icon="solar:list-bold" width={24} />,
  },
];

// ----------------------------------------------------------------------

export default function UsersAccountView({ id }) {

  const settings = useSettingsContext();
  const [currentTab, setCurrentTab] = useState('general');

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Account"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Manage Customer', href: paths.dashboard.user.root },
          { name: 'Customer List', href: paths.dashboard.user.root },
          { name: 'View Customer' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
        ))}
      </Tabs>

      {currentTab === 'general' && <AccountGeneral id={id} />}

      {currentTab === 'billing' && (
        <AccountBilling
          plans={_userPlans}
          cards={_userPayment}
          invoices={_userInvoices}
          addressBook={_userAddressBook}
        />
      )}

      {currentTab === 'notifications' && <AccountNotifications id={id} />}

      {currentTab === 'social' && <AccountSocialLinks id={id} socialLinks={_userAbout.socialLinks} />}

      {currentTab === 'security' && <AccountChangePassword id={id} />}

      {currentTab === 'activitylog' && (
        <AccountActivityLog
          id={id}
          invoices={_userInvoices}
        />
      )}

      {currentTab === 'orders' && <AccountOrderList /> || currentTab === 'orders' && <AccountOrderDetail id={id} />}

    </Container>
  );
}
