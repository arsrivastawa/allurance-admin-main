import { InvoiceDetailsView } from 'src/sections/gift_cards/gift_card-single/view';

export const metadata = {
    title: 'Dashboard: Multiple Cards for Business List',
};

export default function ProductListPage({ params }) {
    const { id } = params;
    return <InvoiceDetailsView id={id} />;
}
