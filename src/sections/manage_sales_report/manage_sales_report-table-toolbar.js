import PropTypes from 'prop-types';
import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Iconify from 'src/components/iconify';
import { formHelperTextClasses } from '@mui/material/FormHelperText';

// ----------------------------------------------------------------------

export default function InvoiceTableToolbar({ filters, onFilters, dateError }) {
  const handleFilterChange = useCallback(
    (key, value) => {
      onFilters(key, value);
    },
    [onFilters]
  );

  const orderStatusOptions = [
    { value: 1, label: 'Pending' },
    { value: 2, label: 'Packed' },
    { value: 3, label: 'Placed' },
    { value: 4, label: 'Shipped' },
  ];

  const paymentTypeOptions = [
    { value: 1, label: 'Cash' },
    { value: 2, label: 'UPI' },
    { value: 3, label: 'Credit/Debit' },
    { value: 4, label: 'Gift Card' },
  ];

  const paymentStatusOptions = [
    { value: 1, label: 'Pending' },
    { value: 2, label: 'Success' },
    { value: 3, label: 'Failed' },
  ];

  const ChannelMode = [
    { value: 1, label: 'Online' },
    { value: 2, label: 'Offline' },
  ];

  const reportTypeOptions = ['Monthly', 'Quarterly', 'Half Yearly', 'Yearly'];

  return (
    <Stack
      spacing={2}
      direction="column"
      sx={{
        p: 2.5,
      }}
    >
      {/* First Row of Filters */}
      <Stack direction="row" spacing={2} sx={{ width: 1 }}>
        <FormControl sx={{ width: { xs: '100%', md: 180 } }}>
          <TextField
            value={filters.orderId || ''}
            onChange={(e) => handleFilterChange('orderId', e.target.value)}
            label="Order ID"
            variant="outlined"
          />
        </FormControl>

        <FormControl sx={{ width: { xs: '100%', md: 180 } }}>
          <InputLabel>Order Status</InputLabel>
          <Select
            value={filters.orderStatus || ''}
            onChange={(e) => handleFilterChange('orderStatus', e.target.value)}
            input={<OutlinedInput label="Order Status" />}
          >
            {orderStatusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ width: { xs: '100%', md: 180 } }}>
          <InputLabel>Payment Type</InputLabel>
          <Select
            value={filters.paymentType || ''}
            onChange={(e) => handleFilterChange('paymentType', e.target.value)}
            input={<OutlinedInput label="Payment Type" />}
          >
            {paymentTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ width: { xs: '100%', md: 180 } }}>
          <InputLabel>Payment Status</InputLabel>
          <Select
            value={filters.paymentStatus || ''}
            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
            input={<OutlinedInput label="Payment Status" />}
          >
            {paymentStatusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Stack direction="row" spacing={2} sx={{ width: 1 }}>
        <FormControl sx={{ width: { md: 300 } }}>
          <InputLabel>Channel Mode</InputLabel>
          <Select
            value={filters.channelMode || ''}
            onChange={(e) => handleFilterChange('channelMode', e.target.value)}
            input={<OutlinedInput label="Order Status" />}
          >
            {ChannelMode.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <DatePicker
          label="Start Date"
          value={filters.startDate || null}
          onChange={(date) => handleFilterChange('startDate', date)}
          slotProps={{ textField: { fullWidth: true } }}
          sx={{ maxWidth: { md: 180 } }}
        />

        <DatePicker
          label="End Date"
          value={filters.endDate || null}
          onChange={(date) => handleFilterChange('endDate', date)}
          slotProps={{
            textField: {
              fullWidth: true,
              error: dateError,
              helperText: dateError && 'End date must be later than start date',
            },
          }}
          sx={{
            maxWidth: { md: 180 },
            [`& .${formHelperTextClasses.root}`]: {
              position: 'absolute',
              bottom: -40,
            },
          }}
        />

        <TextField
          fullWidth
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          placeholder="Search..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
    </Stack>
  );
}

InvoiceTableToolbar.propTypes = {
  dateError: PropTypes.bool,
  filters: PropTypes.object.isRequired,
  onFilters: PropTypes.func.isRequired,
};
