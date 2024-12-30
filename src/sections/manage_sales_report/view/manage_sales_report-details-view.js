// manage_request-details-view.js
'use client';

import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { _invoices } from 'src/_mock';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import InvoiceDetails from '../manage_sales_report-details';

// ----------------------------------------------------------------------

export default function InvoiceDetailsView({ id }) {
  const settings = useSettingsContext();

  // const currentInvoice = _invoices.filter((invoice) => invoice.id === id)[0];


  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="View Sales"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Manage Sales',
            href: paths.dashboard.manage_sales_report.root,
          },
          { name: `View Sales` },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <InvoiceDetails rowID={id} />
    </Container>
  );
}

InvoiceDetailsView.propTypes = {
  rowID: PropTypes.string,
};
