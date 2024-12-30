'use client';

import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

// import { useGetProduct } from 'src/api/product';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { ManageAPIsData, ManageAPIsDataWithHeader } from '../../../utils/commonFunction';
import ProductNewEditForm from '../warehouse-new-edit-form';
import { WAREHOUSE_ENDPOINT, MARKETING_ENDPOINT } from '../../../utils/apiEndPoints';

// ----------------------------------------------------------------------

export default function ProductEditView({ id }) {
  const settings = useSettingsContext();
  const [fetchedData, setFetchedData] = useState(null);

  // Use useParams to get the id from the URL
  // const { id } = useParams();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `${WAREHOUSE_ENDPOINT}?id=${id}`;
        // const response = await ManageAPIsData(apiUrl, 'GET');
        const token = await sessionStorage.getItem('accessToken');
        if (!token) {
          console.error("Token is undefined.");
          return;
        }
        let data = {}
        data.headers = { Authorization: `Bearer ${token}` }
        const response = await ManageAPIsDataWithHeader(apiUrl, 'GET', data);

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

  // const { product: currentProduct } = useGetProduct(id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Warehouse',
            href: paths.dashboard.warehouse.root,
          },
          { name: `Edit` },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <ProductNewEditForm currentProduct={fetchedData} />
    </Container>
  );
}

ProductEditView.propTypes = {
  id: PropTypes.string,
};
