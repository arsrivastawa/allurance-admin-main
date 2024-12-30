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
import { Table, TableBody, Typography, TableContainer, TableHead } from '@mui/material';
import React from 'react';

export default function OrderTableRow({ row, selected, onViewRow, onSelectRow, onDeleteRow }) {
  const { items, status, orderNumber, createdAt, totalQuantity, subTotal, module_id, prev_data, module_name, new_data, operation, created_at, operation_by_email } = row;

  const confirm = useBoolean();
  const collapse = useBoolean();
  const popover = usePopover();

  const renderPrimary = (
    <TableRow hover selected={selected}>
      <TableCell >
        {module_name || '--'}
      </TableCell>
      {/* <TableCell align="center">{prev_data ? prev_data.slice(0, 50) : 'N/A'}</TableCell> */}
      {/* <TableCell align="center">{new_data ? new_data.slice(0, 50) : 'N/A'}</TableCell> */}
      <TableCell >{fDate(created_at)}</TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={
            (operation === "1" && 'success') ||
            (operation === "2" && 'warning') ||
            (operation === "3" && 'error') ||
            'default'
          }
        >
          {operation === "1" && 'Insert' ||
            operation === "2" && 'Update' ||
            operation === "3" && 'Delete' || "N/A"}
        </Label>
      </TableCell>
      <TableCell >{operation_by_email || 'N/A'}</TableCell>
      <TableCell sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <IconButton
          color={collapse.value ? 'inherit' : 'default'}
          onClick={collapse.onToggle}
          sx={{
            ...(collapse.value && {
              bgcolor: 'action.hover',
            }),
          }}
        >
          <Iconify icon="eva:arrow-ios-downward-fill" />
        </IconButton>

        {/* <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton> */}
      </TableCell>
    </TableRow>
  );

  const renderDataTable = (data, title) => {
    if (!data) return null;

    let parsedData = null;
    try {
      parsedData = JSON.parse(data);
    } catch (error) {
      console.error("Error parsing JSON data:", error);
      return null;
    }

    const dataArray = Array.isArray(parsedData) ? parsedData : [parsedData];

    // Extracting keys from the first item in the array
    const keys = Object.keys(dataArray[0]);

    return (
      <Stack sx={{ mt: 2 }}>
        <Typography variant="subtitle1" sx={{ m: 1 }}>{title}</Typography>
        <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {keys.map((key, index) => (
                  <TableCell key={index}>{key}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {dataArray.map((item, index) => (
                <TableRow key={index}>
                  {keys.map((key, index) => (
                    <TableCell key={index}>{item[key]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
  };



  const renderSecondary = (
    <TableRow>
      <TableCell sx={{ p: 0, border: 'none' }} colSpan={8}>
        <Collapse
          in={collapse.value}
          timeout="auto"
          unmountOnExit
          sx={{ bgcolor: 'background.neutral' }}
        >
          <Stack component={Paper} sx={{ m: 1.5 }}>
            {renderDataTable(prev_data, 'Previous Data')}
            {renderDataTable(new_data, 'New Data')}
          </Stack>
        </Collapse>
      </TableCell>
    </TableRow>
  );


  // const renderSecondary = (
  //   <TableRow>
  //     <TableCell sx={{ p: 0, border: 'none' }} colSpan={8}>
  //       <Collapse
  //         in={collapse.value}
  //         timeout="auto"
  //         unmountOnExit
  //         sx={{ bgcolor: 'background.neutral' }}
  //       >
  //         <Stack component={Paper} sx={{ m: 1.5 }}>
  //           {prev_data && (
  //             <Stack>
  //               <Typography variant="subtitle1" sx={{ m: 1.5 }}>Previous Data</Typography>
  //               <Table size="small">
  //                 <TableBody>
  //                   {prev_data && JSON.parse(prev_data) && Object.entries(JSON.parse(prev_data)).map(([key, value]) => (
  //                     <TableRow key={key}>
  //                       <TableCell>{key}</TableCell>
  //                       <TableCell>{value}</TableCell>
  //                     </TableRow>
  //                   ))}
  //                 </TableBody>
  //               </Table>
  //             </Stack>
  //           )}
  //           {new_data && (
  //             <Stack>
  //               <Typography variant="subtitle1" sx={{ m: 1.5 }}>Previous Data</Typography>
  //               <Table size="small">
  //                 <TableBody>
  //                   {new_data && JSON.parse(new_data) && Object.entries(JSON.parse(new_data)).map(([key, value]) => (
  //                     <TableRow key={key}>
  //                       <TableCell>{key}</TableCell>
  //                       <TableCell>{value}</TableCell>
  //                     </TableRow>
  //                   ))}
  //                 </TableBody>
  //               </Table>
  //             </Stack>
  //           )}
  //         </Stack>
  //       </Collapse>
  //     </TableCell>
  //   </TableRow>
  // );

  return (
    <>
      {renderPrimary}
      {renderSecondary}
      {/* <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
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
        <MenuItem
          onClick={() => {
            onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem>
      </CustomPopover> */}
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
  onViewRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
  onSelectRow: PropTypes.func,
};
