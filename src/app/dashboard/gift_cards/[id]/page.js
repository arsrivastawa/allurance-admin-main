import PropTypes from 'prop-types';

import { _invoices } from 'src/_mock/_invoice';

// import { InvoiceDetailsView } from 'src/sections/gift_cards/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Gift Card Details',
};

export default function InvoiceDetailsPage({ params }) {
  const { id } = params;

  return <InvoiceDetailsView id={id} />;
}

export async function generateStaticParams() {
  return _invoices.map((invoice) => ({
    id: invoice.id,
  }));
}

InvoiceDetailsPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};
