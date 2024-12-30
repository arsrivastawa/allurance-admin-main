'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ProfileNewEditForm from '../profile-new-edit-form';

// ----------------------------------------------------------------------

export default function UserCreateProfile() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Profile"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Profile',
            href: paths.dashboard.setting.profile,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ProfileNewEditForm />
    </Container>
  );
}
