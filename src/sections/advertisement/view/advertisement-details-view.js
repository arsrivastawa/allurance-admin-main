'use client';

import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import UserNewEditForm from '../advertisement-new-details-form';
import { UsegetAdvertisement } from 'src/api/advertisement';

// ----------------------------------------------------------------------

export default function UserDetailsView({ id }) {
  const settings = useSettingsContext();
  const { product: currentAdvertisement } = UsegetAdvertisement(id);
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="View"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.list,
          },
          {
            name: 'Advertisement',
            href: paths.dashboard.advertisement.list,
          },
          { name: `View` },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <UserNewEditForm currentAdvertisement={currentAdvertisement} />
    </Container>
  );
}

UserDetailsView.propTypes = {
  id: PropTypes.string,
};
