import PropTypes from 'prop-types';

import axios, { endpoints } from 'src/utils/axios';

import { ProductReplicate } from 'src/sections/replicate/view';

export const metadata = {
    title: 'Dashboard: Replicate',
};

export default function ProductEditPage({ params }) {
    const { id } = params;

    return <ProductReplicate id={id} />;
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
