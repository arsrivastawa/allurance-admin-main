'use client';

import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

// import { UsegetLead } from 'src/api/leads';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import UserNewEditForm from '../socialmedia-new-edit-form';
import { UsegetSocialMedia } from 'src/api/socialmedia';

// ----------------------------------------------------------------------

export default function UserEditView({ id }) {
  const settings = useSettingsContext();
  const { product: currentSocialmedia } = UsegetSocialMedia(id);
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
            name: 'Social Media',
            href: paths.dashboard.socialmedia.list,
          },
          { name: `Edit` },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <UserNewEditForm currentSocialmedia={currentSocialmedia} />
    </Container>
  );
}

UserEditView.propTypes = {
  id: PropTypes.string,
};
