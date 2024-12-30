'use client';

import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import UserNewEditForm from '../rewards-new-edit-form';
import { UsegetReward } from 'src/api/rewards';

// ----------------------------------------------------------------------

export default function UserEditView({ id }) {
  const settings = useSettingsContext();
  const { product: currentRewards } = UsegetReward(id);
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.list,
          },
          {
            name: 'Rewards',
            href: paths.dashboard.rewards.list,
          },
          { name: `Edit` },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <UserNewEditForm currentRewards={currentRewards} />
    </Container>
  );
}

UserEditView.propTypes = {
  id: PropTypes.string,
};
