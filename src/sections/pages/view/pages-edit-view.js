'use client';

import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

// import { UsegetLead } from 'src/api/leads';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import UserNewEditForm from '../pages-new-edit-form';
import { UsegetPage } from 'src/api/pages';

// ----------------------------------------------------------------------

export default function UserEditView({ id }) {
  const settings = useSettingsContext();
  const { product: currentPages } = UsegetPage(id);
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
            name: 'Pages',
            href: paths.dashboard.pages.list,
          },
          { name: `Edit` },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <UserNewEditForm currentPages={currentPages} />
    </Container>
  );
}

UserEditView.propTypes = {
  id: PropTypes.string,
};
