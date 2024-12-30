'use client';
import Container from '@mui/material/Container';
import React, { useState, useEffect } from 'react';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import ProductNewEditForm from '../manage_design-new-edit-form';
import { DESIGNER_ENDPOINT } from '../../../utils/apiEndPoints';
import { ManageAPIsData, ManageAPIsDataWithHeader } from '../../../utils/commonFunction';

// ----------------------------------------------------------------------
export default function ProductCreateView({ id }) {
  const settings = useSettingsContext();
  const [fetchedData, setFetchedData] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchMethod = 'GET';
        const apiUrl = `${DESIGNER_ENDPOINT}/${id}`;
        const token = await sessionStorage.getItem('accessToken');
        if (!token) {
          console.error("Token is undefined.");
          return;
        }
        let data = {}
        data.headers = { Authorization: `Bearer ${token}` }
        const response = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, data);
        // const response = await ManageAPIsData(apiUrl, 'GET');

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
  }, [id]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new Branding"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Branding',
            href: paths.dashboard.marketing.root,
          },
          { name: 'New Branding' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ProductNewEditForm invoice={fetchedData} />
    </Container>
  );
}
