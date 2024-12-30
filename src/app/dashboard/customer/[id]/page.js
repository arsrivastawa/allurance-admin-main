import PropTypes from 'prop-types';

import axios, { endpoints } from 'src/utils/axios';

import UsersAccountView from 'src/sections/account/view/users-account-view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Customer Edit',
};

export default function ProductEditPage({ params }) {
  const { id } = params;

  return <UsersAccountView id={id} isCustomer />;
}

export async function generateStaticParams() {
  const res = await axios.get(endpoints.product.list);

  return res.data.products.map((product) => ({
    id: product.id,
  }));
}

ProductEditPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};
