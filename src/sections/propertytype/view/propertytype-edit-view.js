'use client';

import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { UsegetPropertyType } from 'src/api/propertytype';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ProductNewEditForm from '../propertytype-new-edit-form';


// ----------------------------------------------------------------------

export default function ProductEditView({ id }) {
  const settings = useSettingsContext();

  const { product: currentProduct } = UsegetPropertyType(id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Property type',
            href: paths.dashboard.roles.root,
          },
          { name: `Edit` },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ProductNewEditForm currentProduct={currentProduct} />
    </Container>
  );
}

ProductEditView.propTypes = {
  id: PropTypes.string,
};
