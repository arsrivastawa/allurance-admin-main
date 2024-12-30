'use client';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
// import { useGetProduct } from 'src/api/product';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { ManageAPIsData } from '../../../utils/commonFunction';
import { DESIGNER_ENDPOINT } from '../../../utils/apiEndPoints';
import ProductReplicationForm from '../product-replication-form';

// ----------------------------------------------------------------------

export default function ProductReplicate({ id }) {
    const settings = useSettingsContext();
    const [fetchedData, setFetchedData] = useState(null);


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
                        href: paths.dashboard.findreplicationmodel.root,
                    },
                    { name: id },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            {/* Pass the fetchedData to ProductNewEditForm */}
            <ProductReplicationForm currentProduct={fetchedData} fetchedData={fetchedData} id={id} />
        </Container>
    );
}

ProductReplicate.propTypes = {
    id: PropTypes.string,
};
