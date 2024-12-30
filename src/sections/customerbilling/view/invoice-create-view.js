'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import InvoiceNewEditForm from '../invoice-new-edit-form';
import InvoiceCreate from '../invoice-generate-bill';

// ----------------------------------------------------------------------

export default function InvoiceCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new Bill"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Customer Bills',
            href: paths.dashboard.customerbilling.root,
          },
          {
            name: 'New Bill',
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {/* <InvoiceNewEditForm /> */}
      <InvoiceCreate />
    </Container>
  );
}
