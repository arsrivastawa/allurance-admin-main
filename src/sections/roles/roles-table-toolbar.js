import PropTypes from 'prop-types';

import MenuItem from '@mui/material/MenuItem';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';


// ----------------------------------------------------------------------

export default function ProductTableToolbar({
  filters,
  onFilters,
  //
  stockOptions,
  publishOptions,
}) {
  const popover = usePopover();

  return (
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
  );
}

ProductTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  publishOptions: PropTypes.array,
  stockOptions: PropTypes.array,
};
