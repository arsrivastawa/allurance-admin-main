'use client';

import Container from '@mui/material/Container';
import React, { useState, useEffect } from 'react';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import ProductNewEditForm from '../warehouse_search-new-edit-form';
import { DESIGNER_ENDPOINT } from '../../../utils/apiEndPoints';
import { ManageAPIsData } from '../../../utils/commonFunction';

// ----------------------------------------------------------------------
export default function ProductCreateView({ id }) {
  const settings = useSettingsContext();
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new Rack"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Warehouse',
            href: paths.dashboard.warehouse.root,
          },
          { name: 'New Rack' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ProductNewEditForm />
    </Container>
  );
}
