'use client';

import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';

import { paths } from 'src/routes/paths';

import { _orders, ORDER_STATUS_OPTIONS } from 'src/_mock';

import { useSettingsContext } from 'src/components/settings';

import OrderDetailsInfo from '../manage_sell-details-info';
import OrderDetailsItems from '../manage_sell-details-item';
import OrderDetailsToolbar from '../manage_sell-details-toolbar';
import OrderDetailsHistory from '../manage_sell-details-history';
import InvoiceDetails from '../manage_sell-details-page';

// ----------------------------------------------------------------------

export default function OrderDetailsView({ id }) {
  const settings = useSettingsContext();

  // const currentOrder = _orders.filter((order) => order.id === id)[0];

  // const [status, setStatus] = useState(currentOrder?.status);

  // const handleChangeStatus = useCallback((newValue) => {
  //   setStatus(newValue);
  // }, []);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <InvoiceDetails id={id} />
    </Container>
  );
}

OrderDetailsView.propTypes = {
  id: PropTypes.string,
};
