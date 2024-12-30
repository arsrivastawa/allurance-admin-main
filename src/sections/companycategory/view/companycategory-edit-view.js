'use client';

import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

// import { UsegetLead } from 'src/api/leads';
import { UsegetCategory } from 'src/api/category';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import UserNewEditForm from '../companycategory-new-edit-form';
import { UsegetCompanyCategory } from 'src/api/companycategory';

// ----------------------------------------------------------------------

export default function UserEditView({ id }) {
  const settings = useSettingsContext();
  const { product: currentCompanyCategory } = UsegetCompanyCategory(id);
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
            name: 'Company Category',
            href: paths.dashboard.companycategory.list,
          },
          { name: `Edit` },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <UserNewEditForm currentCompanyCategory={currentCompanyCategory} />
    </Container>
  );
}

UserEditView.propTypes = {
  id: PropTypes.string,
};
