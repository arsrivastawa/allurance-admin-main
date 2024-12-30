// OrderTableToolbar.js
import React from 'react';
import PropTypes from 'prop-types';
import { useCallback } from 'react';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

export default function OrderTableToolbar({ filters, onFilters, dateError, tableData }) {
  const popover = usePopover();

  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleExportCSV = useCallback(() => {
    const operationNames = {
      1: 'Insert',
      2: 'Update',
      3: 'Delete',
    };

    const csvData = tableData.map((row) => [
      row.module_name,
      row.created_at,
      operationNames[row.operation] || '', // Map operation value to operation name
      row.operation_by_email,
    ]);

    const headers = ['Module Name', 'Created At', 'Operation', 'Operation By'];
    const csvDataWithHeaders = [headers, ...csvData];
    const csvFileName = 'orders.csv';

    const csvDataBlob = new Blob([csvDataWithHeaders.map((row) => row.join(',')).join('\n')], { type: 'text/csv' });
    const csvURL = window.URL.createObjectURL(csvDataBlob);
    const tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', csvFileName);
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
  }, [tableData]);


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
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.name}
            onChange={handleFilterName}
            placeholder="Search Here . . . "
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
        <MenuItem onClick={handleExportCSV}>
          <Iconify icon="solar:export-bold" />
          Export CSV
        </MenuItem>
      </CustomPopover>
    </>
  );
}

OrderTableToolbar.propTypes = {
  dateError: PropTypes.bool,
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  tableData: PropTypes.arrayOf(PropTypes.object),
};
