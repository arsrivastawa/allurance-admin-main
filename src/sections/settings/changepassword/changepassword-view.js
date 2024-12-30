'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ProductNewEditForm from '../changepassword-form';

// ----------------------------------------------------------------------

export default function ProductCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Change Password"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Settings',
            href: paths.dashboard.settings.changepassword,
          },
          { name: 'Update Password' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ProductNewEditForm />
    </Container>
  );
}
