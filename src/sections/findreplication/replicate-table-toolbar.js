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

// ----------------------------------------------------------------------

export default function InvoiceTableToolbar({
    filters,
    onFilters,
    //
    dateError,
    serviceOptions,
}) {
    const popover = usePopover();

    const [stateCategoryOptions, setCategoryOptions] = useState(false);
    const [stateResinOptions, setResinOptions] = useState(false);
    const [stateShapeOptions, setShapeOptions] = useState(false);
    const [stateSizeOptions, setSizeOptions] = useState(false);
    const [stateBezelMaterialOptions, setBezelMaterialOptions] = useState(false);
    const [stateBezelColorOptions, setBezelColorOptions] = useState(false);
    const [stateInnerMaterialOptions, setInnerMaterialOptions] = useState(false);
    const [stateFlowerOptions, setFlowerOptions] = useState(false);
    const [stateColorOptions, setColorOptions] = useState(false);

    const handleFilterName = useCallback(
        (event) => {
            onFilters('name', event.target.value);
        },
        [onFilters]
    );

    const handleFilterService = useCallback(
        (event) => {

            onFilters(
                'service',
                typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
            );
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

    // Category List - Dropdown
    const dropdownCategory = async () => {
        const apiUrl = CATEGORY_ENDPOINT;
        const responseData = await fetchDataFromApi(apiUrl, 'GET');
        if (responseData) { setCategoryOptions(responseData);  }
    };

    // Resin List - Dropdown
    const dropdownResin = async () => {
        const apiUrl = RESINTYPE_ENDPOINT;
        const responseData = await fetchDataFromApi(apiUrl, 'GET');
        if (responseData) { setResinOptions(responseData);  }
    };

    // Shape List - Dropdown
    const dropdownShape = async () => {
        const apiUrl = SHAPE_ENDPOINT;
        const responseData = await fetchDataFromApi(apiUrl, 'GET');
        if (responseData) { setShapeOptions(responseData);  }
    };

    // Size For Shape List - Dropdown
    const dropdownSizeForShape = async () => {
        const apiUrl = SIZEFORSHAPE_ENDPOINT;
        const responseData = await fetchDataFromApi(apiUrl, 'GET');
        if (responseData) { setSizeOptions(responseData); }
    };

    // Bezel Material List - Dropdown
    const dropdownBezelMaterial = async () => {
        const apiUrl = BEZELMATERIAL_ENDPOINT;
        const responseData = await fetchDataFromApi(apiUrl, 'GET');
        if (responseData) { setBezelMaterialOptions(responseData);  }
    };

    // Bezel Color List - Dropdown
    const dropdownBezelColor = async () => {
        const apiUrl = BEZELCOLOR_ENDPOINT;
        const responseData = await fetchDataFromApi(apiUrl, 'GET');
        if (responseData) { setBezelColorOptions(responseData);  }
    };

    // Inner Material List - Dropdown
    const dropdownInnerMaterial = async () => {
        const apiUrl = INNERMATERIAL_ENDPOINT;
        const responseData = await fetchDataFromApi(apiUrl, 'GET');
        if (responseData) { setInnerMaterialOptions(responseData);  }
    };

    // Flower List - Dropdown
    const dropdownFlower = async () => {
        const apiUrl = FLOWER_ENDPOINT;
        const responseData = await fetchDataFromApi(apiUrl, 'GET');
        if (responseData) { setFlowerOptions(responseData);  }
    };

    // Base Color List - Dropdown
    const dropdownColor = async () => {
        const apiUrl = COLORSHADE_ENDPOINT;
        const responseData = await fetchDataFromApi(apiUrl, 'GET');
        if (responseData) { setColorOptions(responseData); }
    };

    useEffect(() => {
        // dropdownCategory();
        // dropdownResin();
        // dropdownShape();
        // dropdownSizeForShape();
        // dropdownBezelMaterial();
        // dropdownBezelColor();
        // dropdownInnerMaterial();
        // dropdownFlower();
        // dropdownColor();
    }, []);

    return (
        <>

            <div className='filterAccordion'>
                {/* <Accordion key="1">
                    <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
                        <Typography variant="subtitle1">Advance Filters</Typography>
                    </AccordionSummary>


                    <AccordionDetails>
                        <Stack
                            spacing={2}
                            alignItems={{ xs: 'flex-end', md: 'center' }}
                            direction={{
                                xs: 'column',
                                md: 'row',
                            }}
                            sx={{
                                pb: 2,
                                pr: { xs: 2.5, md: 1 },
                            }}
                        >
                            <FormControl
                                sx={{
                                    flexShrink: 0,
                                    width: { xs: 1, md: 200 },
                                }}
                            >
                                <InputLabel>Category</InputLabel>
                                <Select
                                    // multiple
                                    value={filters.service}
                                    // onChange={handleFilterService}
                                    input={<OutlinedInput label="Service" />}
                                    renderValue={(selected) => selected.map((value) => value).join(', ')}
                                    sx={{ textTransform: 'capitalize' }}
                                >
                                    {stateCategoryOptions && stateCategoryOptions.length > 0 && stateCategoryOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl
                                sx={{
                                    flexShrink: 0,
                                    width: { xs: 1, md: 200 },
                                }}
                            >
                                <InputLabel>Resin</InputLabel>
                                <Select
                                    // multiple
                                    value={filters.service}
                                    // onChange={handleFilterService}
                                    input={<OutlinedInput label="Service" />}
                                    renderValue={(selected) => selected.map((value) => value).join(', ')}
                                    sx={{ textTransform: 'capitalize' }}
                                >
                                    {stateResinOptions && stateResinOptions.length > 0 && stateResinOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl
                                sx={{
                                    flexShrink: 0,
                                    width: { xs: 1, md: 200 },
                                }}
                            >
                                <InputLabel>Shape</InputLabel>
                                <Select
                                    // multiple
                                    value={filters.service}
                                    // onChange={handleFilterService}
                                    input={<OutlinedInput label="Service" />}
                                    renderValue={(selected) => selected.map((value) => value).join(', ')}
                                    sx={{ textTransform: 'capitalize' }}
                                >
                                    {stateShapeOptions && stateShapeOptions.length > 0 && stateShapeOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.shape}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl
                                sx={{
                                    flexShrink: 0,
                                    width: { xs: 1, md: 200 },
                                }}
                            >
                                <InputLabel>Size For Shape</InputLabel>
                                <Select
                                    // multiple
                                    value={filters.service}
                                    // onChange={handleFilterService}
                                    input={<OutlinedInput label="Service" />}
                                    renderValue={(selected) => selected.map((value) => value).join(', ')}
                                    sx={{ textTransform: 'capitalize' }}
                                >
                                    {stateSizeOptions && stateSizeOptions.length > 0 && stateSizeOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.length} x {option.breadth}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl
                                sx={{
                                    flexShrink: 0,
                                    width: { xs: 1, md: 200 },
                                }}
                            >
                                <InputLabel>Bezel Material</InputLabel>
                                <Select
                                    // multiple
                                    value={filters.service}
                                    // onChange={handleFilterService}
                                    input={<OutlinedInput label="Service" />}
                                    renderValue={(selected) => selected.map((value) => value).join(', ')}
                                    sx={{ textTransform: 'capitalize' }}
                                >
                                    {stateBezelMaterialOptions && stateBezelMaterialOptions.length > 0 && stateBezelMaterialOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                        </Stack>

                        <Stack
                            spacing={2}
                            alignItems={{ xs: 'flex-end', md: 'center' }}
                            direction={{
                                xs: 'column',
                                md: 'row',
                            }}
                            sx={{
                                pr: { xs: 2.5, md: 1 },
                            }}
                        >
                            <FormControl
                                sx={{
                                    flexShrink: 0,
                                    width: { xs: 1, md: 200 },
                                }}
                            >
                                <InputLabel>Bezel Color</InputLabel>
                                <Select
                                    // multiple
                                    value={filters.service}
                                    // onChange={handleFilterService}
                                    input={<OutlinedInput label="Service" />}
                                    renderValue={(selected) => selected.map((value) => value).join(', ')}
                                    sx={{ textTransform: 'capitalize' }}
                                >
                                    {stateBezelColorOptions && stateBezelColorOptions.length > 0 && stateBezelColorOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl
                                sx={{
                                    flexShrink: 0,
                                    width: { xs: 1, md: 200 },
                                }}
                            >
                                <InputLabel>Inner Material</InputLabel>
                                <Select
                                    // multiple
                                    value={filters.service}
                                    // onChange={handleFilterService}
                                    input={<OutlinedInput label="Service" />}
                                    renderValue={(selected) => selected.map((value) => value).join(', ')}
                                    sx={{ textTransform: 'capitalize' }}
                                >
                                    {stateInnerMaterialOptions && stateInnerMaterialOptions.length > 0 && stateInnerMaterialOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl
                                sx={{
                                    flexShrink: 0,
                                    width: { xs: 1, md: 200 },
                                }}
                            >
                                <InputLabel>Flower</InputLabel>
                                <Select
                                    // multiple
                                    value={filters.service}
                                    // onChange={handleFilterService}
                                    input={<OutlinedInput label="Service" />}
                                    renderValue={(selected) => selected.map((value) => value).join(', ')}
                                    sx={{ textTransform: 'capitalize' }}
                                >
                                    {stateFlowerOptions && stateFlowerOptions.length > 0 && stateFlowerOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl
                                sx={{
                                    flexShrink: 0,
                                    width: { xs: 1, md: 200 },
                                }}
                            >
                                <InputLabel>Base Color</InputLabel>
                                <Select
                                    // multiple
                                    value={filters.service}
                                    // onChange={handleFilterService}
                                    input={<OutlinedInput label="Service" />}
                                    renderValue={(selected) => selected.map((value) => value).join(', ')}
                                    sx={{ textTransform: 'capitalize' }}
                                >
                                    {stateColorOptions && stateColorOptions.length > 0 && stateColorOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                        </Stack>


                    </AccordionDetails>
                </Accordion> */}
            </div>

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
                <DatePicker
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
                />
                <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
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
