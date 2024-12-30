'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import InvoiceNewEditForm from '../manage_sales_report-new-edit-form';

// ----------------------------------------------------------------------

export default function InvoiceCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create Manage Sales"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Manage Sales',
            href: paths.dashboard.manage_sales_report.root,
          },
          {
            name: 'Manage Sales',
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <InvoiceNewEditForm />
    </Container>
  );
}
