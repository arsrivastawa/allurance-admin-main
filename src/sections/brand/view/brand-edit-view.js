'use client';

import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

// import { UsegetLead } from 'src/api/leads';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import UserNewEditForm from '../brand-new-edit-form';
import { UsegetSubCategory } from 'src/api/subcategory';
import { UsegetBrand } from 'src/api/brand';

// ----------------------------------------------------------------------

export default function UserEditView({ id }) {
  const settings = useSettingsContext();
  const { product: currentBrand } = UsegetBrand(id);
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
            name: 'Brand',
            href: paths.dashboard.brand.list,
          },
          { name: `Edit` },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <UserNewEditForm currentBrand={currentBrand} />
    </Container>
  );
}

UserEditView.propTypes = {
  id: PropTypes.string,
};
