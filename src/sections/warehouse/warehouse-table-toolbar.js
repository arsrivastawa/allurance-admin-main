// manage_design_table_toolbar.js
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';

import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { formHelperTextClasses } from '@mui/material/FormHelperText';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import FormProvider, {

    RHFSelect,

} from 'src/components/hook-form';

import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { fetchDataFromApi } from '../../utils/commonFunction';
import { CATEGORY_ENDPOINT, RESINTYPE_ENDPOINT, SHAPE_ENDPOINT, SIZEFORSHAPE_ENDPOINT, BEZELMATERIAL_ENDPOINT, BEZELCOLOR_ENDPOINT, INNERMATERIAL_ENDPOINT, FLOWER_ENDPOINT, COLORSHADE_ENDPOINT } from '../../utils/apiEndPoints';
import { RESPONSE_LIMIT_DEFAULT } from 'next/dist/server/api-utils';

// ----------------------------------------------------------------------

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


    // const handleFilterService = useCallback(
    //     (event) => {

    //         const selectedValue = event.target.value;

    //         // onFilters('service', selectedValue);
    //         // onFilters('service', typeof selectedValue === 'string' ? selectedValue.split(',') : selectedValue);
    //     },
    //     [onFilters]
    // )


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
                {/* <DatePicker
                    label="Start date"
                    value={filters.startDate}
                    onChange={handleFilterStartDate}
                    slotProps={{ textField: { fullWidth: true } }}
                    sx={{
                        maxWidth: { md: 180 },
                    }}
                />
                <DatePicker
                    label="End date"
                    value={filters.endDate}
                    onChange={handleFilterEndDate}
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
                            position: { md: 'absolute' },
                            bottom: { md: -40 },
                        },
                    }}
                /> */}
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
                    <Iconify icon="solar:export-bold" />
                    Export
                </MenuItem>
            </CustomPopover>
        </>
    );
}

InvoiceTableToolbar.propTypes = {
    dateError: PropTypes.bool,
    filters: PropTypes.object,
    onFilters: PropTypes.func,
    serviceOptions: PropTypes.array,
};
