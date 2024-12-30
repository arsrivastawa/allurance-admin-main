import PropTypes from 'prop-types';

import Grid from '@mui/material/Unstable_Grid2';

import AccountActivityLogList from './account-activity-log-list';

export default function AccountActivityLog({ cards, plans, invoices, addressBook }) {
    return (
        <Grid container spacing={5} disableEqualOverflow>

            <Grid xs={12} md={12}>
                <AccountActivityLogList invoices={invoices} />
            </Grid>
        </Grid>
    );
}

AccountActivityLog.propTypes = {
    addressBook: PropTypes.array,
    cards: PropTypes.array,
    invoices: PropTypes.array,
    plans: PropTypes.array,
};
