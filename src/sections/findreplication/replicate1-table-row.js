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
import * as Yup from 'yup';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { RHFTextField } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ManageAPIsData } from 'src/utils/commonFunction';
import { REPLICATOR_ENDPOINT } from 'src/utils/apiEndPoints';
import { enqueueSnackbar } from 'notistack';

// ----------------------------------------------------------------------

export default function InvoiceTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow,
  onCreate,
  onView,
  // onEditRow,
  onDeleteRow,
}) {
  const { id, category_name, title, created_at, model_number, resin_name } = row;

  const confirm = useBoolean();

  const popover = usePopover();
  const NewProductSchema = Yup.object().shape({
    quantity: Yup.number().required('Quantity is required').positive('Quantity must be a positive number').integer('Quantity must be an integer'),
  });
  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;


  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        designer_id: id,
        quantity: data.quantity,
      };

      const response = await ManageAPIsData(REPLICATOR_ENDPOINT, 'POST', payload);

      if (response.ok) {
        enqueueSnackbar('Replication success!', { variant: 'success' });

        // Close the modal
        confirm.onFalse();
      } else {
        const responseData = await response.json();
        if (responseData && responseData.error) {
          enqueueSnackbar(responseData.error, { variant: 'error' });
        }
      }
    } catch (err) {
      console.error(err.message);
    }
  });

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>

          <Avatar sx={{ mr: 2 }}>
            P
          </Avatar>

          <ListItemText
            primary={title}
            secondary="Model: 0.0.0.0"
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />

          {/* <ListItemText
            disableTypography
            primary={
              <Typography variant="body2" noWrap>
                Handmade Earrings
              </Typography>
            }
            secondary={
              <Link
                noWrap
                variant="body2"

                sx={{ color: 'text.disabled' }}
              >
                
          SKU: ABCD | Model: PU02X00X
        </Link>
            }
          /> */}
        </TableCell>



        <TableCell>
          {/* <ListItemText
            primary={fDate(dueDate)}
            secondary={fTime(dueDate)}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />122 */}
          00
        </TableCell>

        {/* <TableCell>{fCurrency(totalAmount)}</TableCell>

        <TableCell align="center">{sent}</TableCell> */}



        <TableCell>
          {/* <ListItemText
            primary={fDate(dueDate)}
            secondary={fTime(dueDate)}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />122 */}
          00
        </TableCell>

        <TableCell>
          {/* <ListItemText
            primary={fDate(dueDate)}
            secondary={fTime(dueDate)}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />122 */}
          {category_name}
        </TableCell>

        <TableCell>
          {/* <ListItemText
            primary={fDate(dueDate)}
            secondary={fTime(dueDate)}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />122 */}
          {resin_name}
        </TableCell>

        <TableCell>
          {model_number}
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

        {/* <MenuItem
          onClick={() => {
            onCreate();
            popover.onClose();
          }}
        >
          <Iconify icon="carbon:replicate"></Iconify>
          Replicate
        </MenuItem> */}

        {/* <MenuItem
          onClick={() => {
            onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem> */}

        {/* <Divider sx={{ borderStyle: 'dashed' }} /> */}

        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="carbon:replicate" />
          Replicate
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Replicate"
        content={
          <>
            <FormProvider methods={methods} onSubmit={onSubmit}>
              <Typography variant="body1" component="div">
                Model ID: {model_number}
              </Typography>
              <br />
              <RHFTextField name="quantity" label="Quantity" type="number" />
            </FormProvider>
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={onSubmit} // Call onSubmit directly onClick
          >
            Replicate
          </Button>
        }
      />
    </>
  );
}

InvoiceTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  // onEditRow: PropTypes.func,
  onCreate: PropTypes.func,
  onSelectRow: PropTypes.func,
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
