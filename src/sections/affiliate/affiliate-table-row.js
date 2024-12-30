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
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
}) {
  const { sent, user_name, created_at, dueDate, record_status, insta_followers, invoiceTo, totalAmount, gift_card_type, affiliate_name } = row;

  const confirm = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>

          {/* <Avatar alt={invoiceTo.name} sx={{ mr: 2 }}>
            {invoiceTo.name.charAt(0).toUpperCase()}
          </Avatar>

          <ListItemText
            primary={invoiceTo.name}
            secondary="Role: Designer"
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          /> */}
          {/* Test - {row.first_name} {row.last_name} */}
          <ListItemText
            primary={`${row.affiliate_name} `}
            secondary={row.user_name}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />

        </TableCell>



        <TableCell>
          <ListItemText
            primary={row.user_name}
            secondary={row.gift_card_type && (
              <>
                {row.gift_card_type === 1 && "Multiple Business"}
                {row.gift_card_type === 2 && "Multiple People"}
                {row.gift_card_type === 3 && "Single Gift Card"}
              </>
            )}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
          {/* {row.request_name}
          {row.gift_card_type && (
            <>
              {row.gift_card_type === 1 && "Multiple Business"}
              {row.gift_card_type === 2 && "Multiple People"}
              {row.gift_card_type === 3 && "Single Gift Card"}
            </>
          )} */}
        </TableCell>

        {/* <TableCell>{fCurrency(totalAmount)}</TableCell> */}

        <TableCell align="center">{insta_followers}</TableCell>

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
          {record_status === 1 ? (
            <Label variant="soft" color="warning">Pending</Label>
          ) : record_status === 2 ? (
            <Label variant="soft" color="success">Approved</Label>
          ) : record_status === 3 ? (
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
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
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

InvoiceTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
