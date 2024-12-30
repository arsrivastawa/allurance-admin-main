'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useRouter } from 'src/routes/hooks';
import ProductNewEditForm from '../manage_offline_sales-new-edit-form';

// ----------------------------------------------------------------------

export default function ProductCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      {/* <CustomBreadcrumbs
        heading="Create a new offline sales"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Offline sales',
            href: paths.dashboard.manage_offline_sales.root,
          },
          { name: 'New Offline Sales' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      /> */}

      <ProductNewEditForm />
    </Container>
  );
}
