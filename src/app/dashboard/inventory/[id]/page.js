// manage_request-details-view.js
'use client';

import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { _invoices } from 'src/_mock';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { ProductDetailsView } from 'src/sections/inventory/view';

// ----------------------------------------------------------------------

export default function InvoiceDetailsView({ params }) {
    const { id } = params;
    const settings = useSettingsContext();

    // const currentInvoice = _invoices.filter((invoice) => invoice.id === id)[0];


    return (
        <ProductDetailsView id={id} />
    );
}

InvoiceDetailsView.propTypes = {
    rowID: PropTypes.string,
};
