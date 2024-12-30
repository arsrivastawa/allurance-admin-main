import PropTypes from 'prop-types';

import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import { fCurrency } from 'src/utils/format-number';
import { fDate, fTime } from 'src/utils/format-time';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function InvoiceTableRow({
  row,
  selected,
  // onCreate,
  onSelectRow,
  onViewRow,
  onEditRow,
  // onDeleteRow,
}) {
  const { batch_number, quantity, created_at, record_status, designer_id } = row;

  const confirm = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        {/* <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell> */}

        <TableCell >
          {designer_id}
        </TableCell>

        <TableCell>
          {quantity}
        </TableCell>


        <TableCell>
          <ListItemText
            primary={fDate(created_at)}
            secondary={fTime(created_at)}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </TableCell>
        <TableCell align="center">
          {/* <Link
            noWrap
            variant="body2"
            onClick={onViewRow}
            sx={{ color: 'white', textDecoration: 'underline', cursor: 'pointer' }}
          > */}

          <Button
            variant=""
            color="info"
            onClick={onViewRow}
            style={{
              padding: "5px",
              background: "#58585863",
              fontSize: "13px",  // Note: Corrected the hyphen in "font-size"
              fontWeight: 600    // Note: Removed the space in "font-weight"
            }}
          >
            View
          </Button>

          {/* </Link> */}
        </TableCell>
        <TableCell>
          {record_status == 1 ? (
            <Label variant="soft" color="warning">Pending</Label>
          ) : record_status == 2 ? (
            <Label variant="soft" color="success">Approved</Label>
          ) : record_status == 3 ? (
            <Label variant="soft" color="error">Rejected</Label>
          ) : null}
        </TableCell>
        <TableCell align="right" sx={{ px: 1 }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow >

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        {/* <MenuItem
          onClick={() => {
            onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem> */}

        {/* <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem> */}
        <MenuItem
          onClick={() => {
            onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem>

        {/* <MenuItem
          onClick={() => {
            onCreate();
            popover.onClose();
          }}
        >
          <Iconify icon="carbon:replicate"></Iconify>
          Replicate
        </MenuItem> */}


        {/* <Divider sx={{ borderStyle: 'dashed' }} /> */}

        {/* <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem> */}
      </CustomPopover>


    </>
  );
}

InvoiceTableRow.propTypes = {
  // onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
