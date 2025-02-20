import PropTypes from 'prop-types';

import { _orders } from 'src/_mock/_order';

import { OrderDetailsView } from 'src/sections/manage_sell/view';

export const metadata = {
  title: 'Dashboard: Manage Sell Details',
};

export default function OrderDetailsPage({ params }) {
  const { id } = params;

  return <OrderDetailsView id={id} />;
}

export async function generateStaticParams() {
  return _orders.map((order) => ({
    id: order.id,
  }));
}

OrderDetailsPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};
