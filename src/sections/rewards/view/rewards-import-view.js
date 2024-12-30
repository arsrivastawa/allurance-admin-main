'use client';

import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import UserNewEditForm from '../rewards-quick-edit-form';
import { UsegetAdvertisement } from 'src/api/advertisement';
import { UsegetReward } from 'src/api/rewards';

// ----------------------------------------------------------------------

export default function UserDetailsView({ id }) {
  const settings = useSettingsContext();
  const { product: currentRewards } = UsegetReward(id);
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Import file"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.list,
          },
          {
            name: 'Rewards',
            href: paths.dashboard.rewards.list,
          },
          { name: `Import CSV` },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <UserNewEditForm currentRewards={currentRewards} />
    </Container>
  );
}

UserDetailsView.propTypes = {
  id: PropTypes.string,
};
