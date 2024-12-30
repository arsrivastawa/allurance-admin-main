'use client';

import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { _invoices } from 'src/_mock';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import InvoiceDetails from '../offline_sales-details';
import { OFFLINE_SALES_ENDPOINT } from 'src/utils/apiEndPoints';
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
                const apiUrl = `${OFFLINE_SALES_ENDPOINT}?id=${id}`;
                const response = await ManageAPIsData(apiUrl, 'GET');
                if (!response.ok) {
                    console.error("Error fetching data:", response.statusText);
                    return;
                }
                const responseData = await response.json();
                if (Object.keys(responseData).length) {

                    setFetchedData(responseData);
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
                heading="View Stock"
                links={[
                    {
                        name: 'Dashboard',
                        href: paths.dashboard.root,
                    },
                    {
                        name: 'Manage Stock',
                        href: paths.dashboard.offlinesales.root,
                    },
                    { name: "View Stock" },
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
