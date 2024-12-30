import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import { fCurrency } from 'src/utils/format-number';
import { fDate, fTime } from 'src/utils/format-time';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function OrderTableRow({
  row,
  selected,
  onViewRow,
  onEditRow,
  onEditRow1,
  onSelectRow,
  onDeleteRow,
}) {
  const {
    title,
    start_date,
    end_date,
    company_category_name,
    type,
    ad_counter,
    items,
    record_status_name,
    orderNumber,
    createdAt,
    customer,
    totalQuantity,
    subTotal,
  } = row;

  const confirm = useBoolean();

  const collapse = useBoolean();

  const popover = usePopover();

  const renderPrimary = (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} />
      </TableCell>
      {/* <TableCell>
        <Box
          onClick={onViewRow}
          sx={{
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {title}
        </Box>
      </TableCell> */}
      <TableCell>
        <Box
        // onClick={onEditRow}
        // sx={{
        //   cursor: 'pointer',
        //   '&:hover': {
        //     textDecoration: 'underline',
        //   },
        // }}
        >
          {title}
        </Box>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <ListItemText
          primary={fDate(start_date)}
          // secondary={fTime(start_date)}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{
            mt: 0.5,
            component: 'span',
            typography: 'caption',
          }}
        />
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <ListItemText
          primary={fDate(end_date)}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{
            mt: 0.5,
            component: 'span',
            typography: 'caption',
          }}
        />
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{`${company_category_name || '--'}`}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {type === 1 ? 'Default' : type === 2 ? 'Others' : '--'}
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap', alignItems: 'center' }}>
        {ad_counter ?? '--'}
      </TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={
            (record_status_name === 'Approved' && 'success') ||
            (record_status_name === 'Pending' && 'warning') ||
            (record_status_name === 'Rejected' && 'error') ||
            'default'
          }
        >
          {record_status_name}
        </Label>
      </TableCell>

      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {renderPrimary}

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {/* <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem> */}
        {/* <MenuItem
          onClick={() => {
            onEditRow1();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit 1
        </MenuItem> */}
        <MenuItem
          onClick={() => {
            if (type === 1) {
              onEditRow1();
            } else if (type === 2) {
              onEditRow();
            }
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem>

        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}

OrderTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  onEditRow: PropTypes.func,
  onEditRow1: PropTypes.func,
  onDeleteRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onViewRow: PropTypes.func,
};
