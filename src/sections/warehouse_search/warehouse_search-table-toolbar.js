// manage_design_table_toolbar.js
import PropTypes from 'prop-types';
import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Iconify from 'src/components/iconify';
import { usePopover } from 'src/components/custom-popover';

export default function InvoiceTableToolbar({
    filters,
    onFilters,
    //
    dateError,
    serviceOptions,
}) {
    const popover = usePopover();

    const handleFilterName = useCallback(
        (event) => {
            onFilters('name', event.target.value);
        },
        [onFilters]
    );

    const handleFilterStartDate = useCallback(
        (newValue) => {
            onFilters('startDate', newValue);
        },
        [onFilters]
    );

    const handleFilterEndDate = useCallback(
        (newValue) => {
            onFilters('endDate', newValue);
        },
        [onFilters]
    );

    return (
        <>


            <Stack
                style={{ paddingTop: '0px' }}
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
                
                <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1, mt: 2 }}>
                    <TextField
                        fullWidth
                        value={filters.name}
                        onChange={handleFilterName}
                        placeholder="Search ..."
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                                </InputAdornment>
                            ),
                        }}
                    />


                </Stack>
                <IconButton onClick={popover.onOpen}>
                    <Iconify icon="eva:more-vertical-fill" />
                </IconButton>

            </Stack >

        </>
    );
}

InvoiceTableToolbar.propTypes = {
    dateError: PropTypes.bool,
    filters: PropTypes.object,
    onFilters: PropTypes.func,
    serviceOptions: PropTypes.array,
};
