'use client';

import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

// import { useGetProduct } from 'src/api/product';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { ManageAPIsData } from '../../../utils/commonFunction';
import ProductNewEditForm from '../replicate-new-edit-form';
import { DESIGNER_ENDPOINT } from '../../../utils/apiEndPoints';

// ----------------------------------------------------------------------

export default function ProductEditView({ id }) {
  const settings = useSettingsContext();
  const [fetchedData, setFetchedData] = useState(null);

  // Use useParams to get the id from the URL
  // const { id } = useParams();


  useEffect(() => {
    const fetchData = async () => {
      try {

        const apiUrl = `${DESIGNER_ENDPOINT}?id=${id}`;
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

  // const { product: currentProduct } = useGetProduct(id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Replicate',
            href: paths.dashboard.manage_design.root,
          },
          { name: `Edit` },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {/* Pass the fetchedData to ProductNewEditForm */}
      <ProductNewEditForm currentProduct={fetchedData} fetchedData={fetchedData} />
    </Container>
  );
}

ProductEditView.propTypes = {
  id: PropTypes.string,
};
