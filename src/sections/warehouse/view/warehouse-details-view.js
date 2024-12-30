'use client';

import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { _invoices } from 'src/_mock';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import InvoiceDetails from '../warehouse-details';
import { DESIGNER_ENDPOINT } from 'src/utils/apiEndPoints';
import { ManageAPIsData } from 'src/utils/commonFunction';
import { useEffect, useState } from 'react';

// ----------------------------------------------------------------------

export default function InvoiceDetailsView({ id }) {
    const settings = useSettingsContext();
    const [FetchedData, setFetchedData] = useState();

    const currentInvoice = _invoices.filter((invoice) => invoice.id === id)[0];

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
    }, [id]);


    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Product"
                links={[
                    {
                        name: 'Dashboard',
                        href: paths.dashboard.root,
                    },
                    {
                        name: 'Manage Product',
                        href: paths.dashboard.marketing.root,
                    },
                    { name: "View Product" },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <InvoiceDetails invoice={FetchedData} />
        </Container>
    );
}

InvoiceDetailsView.propTypes = {
    id: PropTypes.string,
};
