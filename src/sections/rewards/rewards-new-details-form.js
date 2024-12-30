import PropTypes from 'prop-types';
import * as Yup from 'yup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Typography,
  Divider,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { assetsPath } from 'src/utils/apiendpoints';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'src/routes/hooks';
import { Controller, useForm } from 'react-hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  AdvertisementType,
  UpdateRecordStatus,
  UsegetAdvertisement,
  UsegetAdvertisements,
} from 'src/api/advertisement';
import { enqueueSnackbar } from 'notistack';
import { paths } from 'src/routes/paths';
import { UsegetRewards } from 'src/api/rewards';
import InvoiceToolbar from './rewards.toolbar';
import Scrollbar from 'src/components/scrollbar';
import { formatDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export default function ClientNewEditForm({ currentRewards }) {
  const { products: propertyTypes, productsLoading: propertyTypesLoading } = UsegetRewards();
  const Rewards = Array.isArray(currentRewards) ? currentRewards[0] : currentRewards;

  const router = useRouter();

  const renderList = (
    <TableContainer sx={{ overflow: 'unset', mt: 5 }}>
      <Scrollbar>
        <Table sx={{ minWidth: 960 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ typography: 'subtitle2' }}>S.No</TableCell>
              <TableCell sx={{ typography: 'subtitle2' }}>First Name</TableCell>
              <TableCell sx={{ typography: 'subtitle2' }}>Last Name</TableCell>
              <TableCell sx={{ typography: 'subtitle2' }}>Coupon Name</TableCell>
              <TableCell>Apply At</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {Rewards?.rewards_coupon?.data?.length > 0 ? (
              Rewards.rewards_coupon.data.map((coupon, index) => (
                <TableRow key={coupon.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{coupon.first_name || '--'}</TableCell>
                  <TableCell>{coupon.last_name || '--'}</TableCell>
                  <TableCell>
                    <Box sx={{ maxWidth: 560 }}>
                      <Typography variant="subtitle2">{coupon.coupon_name || '--'}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(coupon.apply_at)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" align="center">
                    No data found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  );

  return (
    <>
      <Card>
        {renderList}

        <Divider sx={{ mt: 4, borderStyle: 'dashed' }} />
      </Card>
    </>
  );
}

ClientNewEditForm.propTypes = {
  Rewards: PropTypes.object,
};
