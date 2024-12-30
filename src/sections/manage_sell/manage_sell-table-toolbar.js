import PropTypes from 'prop-types';
import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { formHelperTextClasses } from '@mui/material/FormHelperText';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { FormControl, InputLabel, OutlinedInput, Select } from '@mui/material';

// ----------------------------------------------------------------------

export default function OrderTableToolbar({ filters, onFilters, dateError }) {
  const popover = usePopover();

  const handleFilterChange = useCallback(
    (field, value) => {
      onFilters(field, value);
    },
    [onFilters]
  );
  const orderStatusOptions = [
    { value: 1, label: 'Pending' },
    { value: 2, label: 'Packed' },
    { value: 3, label: 'Placed' },
    { value: 4, label: 'Shipped' },
  ];

  const ChannelMode = [
    { value: 1, label: 'Online' },
    { value: 2, label: 'Offline' },
  ];

  return (
    <>
     <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 },
        }}
      >
        <DatePicker
          label="Start date"
          value={filters.startDate}
          onChange={(newValue) => handleFilterChange('startDate', newValue)}
          slotProps={{
            textField: {
              fullWidth: true,
            },
          }}
          sx={{
            maxWidth: { md: 200 },
          }}
        />

        <DatePicker
          label="End date"
          value={filters.endDate}
          onChange={(newValue) => handleFilterChange('endDate', newValue)}
          slotProps={{
            textField: {
              fullWidth: true,
              error: dateError,
              helperText: dateError && 'End date must be later than start date',
            },
          }}
          sx={{
            maxWidth: { md: 200 },
            [`& .${formHelperTextClasses.root}`]: {
              position: { md: 'absolute' },
              bottom: { md: -40 },
            },
          }}
        />

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

        <FormControl sx={{ width: { md: 300 } }}>
          <InputLabel>Channel Mode</InputLabel>
          <Select
            value={filters.channelMode || ''}
            onChange={(e) => handleFilterChange('channelMode', e.target.value)}
            input={<OutlinedInput label="Channel Mode" />}
          >
            {ChannelMode.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1}>
          <TextField
            fullWidth
            value={filters.order_id || ''}
            onChange={(e) => handleFilterChange('order_id', e.target.value)}
            placeholder="Search Order ID..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:printer-minimalistic-bold" />
          Print
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:import-bold" />
          Import
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:export-bold" />
          Export
        </MenuItem>
      </CustomPopover>
    </>
  );
}

OrderTableToolbar.propTypes = {
  dateError: PropTypes.bool,
  filters: PropTypes.object,
  onFilters: PropTypes.func,
};
