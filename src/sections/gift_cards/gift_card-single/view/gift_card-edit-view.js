'use client';

import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

// import { useGetProduct } from 'src/api/product';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ProductNewEditForm from '../gift_card-new-edit-form';
import { ManageAPIsData, ManageAPIsDataWithHeader } from '../../../../utils/commonFunction';
import { GIFT_CARD_ENDPOINT } from '../../../../utils/apiEndPoints';

// ----------------------------------------------------------------------

// export default function ProductEditView({ id }) {
//   const settings = useSettingsContext();


//   const { product: currentProduct } = useGetProduct(id);

//   return (
//     <Container maxWidth={settings.themeStretch ? false : 'lg'}>
//       <CustomBreadcrumbs
//         heading="Edit"
//         links={[
//           { name: 'Dashboard', href: paths.dashboard.root },
//           {
//             name: 'Product',
//             href: paths.dashboard.product.root,
//           },
//           { name: currentProduct?.name },
//         ]}
//         sx={{
//           mb: { xs: 3, md: 5 },
//         }}
//       />

//       <ProductNewEditForm currentProduct={currentProduct} />
//     </Container>
//   );
// }

export default function ProductEditView({ id }) {
  const settings = useSettingsContext();
  const [fetchedData, setFetchedData] = useState(null);

  // Use useParams to get the id from the URL
  // const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `${GIFT_CARD_ENDPOINT}?type=3&id=${id}`;
        // const response = await ManageAPIsData(apiUrl, 'GET');
        const token = await sessionStorage.getItem('accessToken');
        if (!token) {
          console.error("Token is undefined.");
          return;
        }
        let data = {};
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
            name: 'Single gift card',
            href: paths.dashboard.single_gift_card.root,
          },
          { name: 'Edit' },
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
