


// manage_request-details-view.js
'use client';

import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { _invoices } from 'src/_mock';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { ProductDetailsView } from 'src/sections/batches/view';

// ----------------------------------------------------------------------

export default function InvoiceDetailsView({ params }) {
    const { id } = params;
    const settings = useSettingsContext();

    // const currentInvoice = _invoices.filter((invoice) => invoice.id === id)[0];


    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="View"
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    {
                        name: 'Batches',
                        href: paths.dashboard.manage_batches.root,
                    },
                    { name: `View` },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />
            <ProductDetailsView id={id} />
        </Container>
    );
}

InvoiceDetailsView.propTypes = {
    rowID: PropTypes.string,
};
