'use client';
import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { _invoices } from 'src/_mock';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import InvoiceDetails from '../invoice-details';
import { useEffect, useState } from 'react';
import { ManageAPIsData } from 'src/utils/commonFunction';
import { INE_ORDERS_ENDPOINT } from 'src/utils/apiEndPoints';

// ----------------------------------------------------------------------

export default function InvoiceDetailsView({ id }) {
  const settings = useSettingsContext();

  const currentInvoice = _invoices.filter((invoice) => invoice.id === id)[0];

  const [fetchedData, setFetchedData] = useState(null);

  // Use useParams to get the id from the URL
  // const { id } = useParams();


  useEffect(() => {
    const fetchData = async () => {
      try {

        const apiUrl = `${INE_ORDERS_ENDPOINT}?id=${id}`;
        const response = await ManageAPIsData(apiUrl, 'GET');

        if (!response.ok) {
          console.error("Error fetching data:", response.statusText);
          return;
        }
        const responseData = await response.json();

        if (Object.keys(responseData).length) {
          setFetchedData(responseData.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]); // Empty dependency array to fetch data only once when the component mounts


  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={`View`}
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Customer Bills',
            href: paths.dashboard.customerbilling.root,
          },
          { name: 'View' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <InvoiceDetails invoice={fetchedData} />
    </Container>
  );
}

InvoiceDetailsView.propTypes = {
  id: PropTypes.string,
};
