import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { useSnackbar } from 'src/components/snackbar';
import { useRouter } from 'src/routes/hooks';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { FetchUserDetail, ManageAPIsData } from '../../utils/commonFunction';
import {
  MANAGE_TICKET_ASSIGN_TICKETS,
  MANAGE_TICKET_ASSIGN_USERS,
  MANAGE_TICKET_RESPONSE,
  MANAGE_TICKET_TICKETS_CLOSED,
} from '../../utils/apiEndPoints';
import { Button, Divider, IconButton, MenuItem } from '@mui/material';
import { paths } from 'src/routes/paths';
import { Box } from '@mui/system';
import { formatDate } from '@fullcalendar/core';
import { format } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';

export default function InvoiceDetails({ currentProduct }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [userData, setUserData] = useState([]);
  const [tableData, setTableData] = useState([]);

  const assignSchema = Yup.object().shape({
    assign_by: Yup.string().required('Assigned by is required'),
  });

  const assignDefaultValues = useMemo(
    () => ({
      assign_by: currentProduct?.assign_by || '',
    }),
    [currentProduct]
  );

  const assignMethods = useForm({
    resolver: yupResolver(assignSchema),
    defaultValues: assignDefaultValues,
  });

  const { reset: resetAssignForm, handleSubmit: handleAssignSubmit } = assignMethods;

  const responseSchema = Yup.object().shape({
    response_type: Yup.string().required('Response type is required'),
  });

  const responseDefaultValues = {
    response_type: currentProduct?.response_type,
  };

  const responseMethods = useForm({
    resolver: yupResolver(responseSchema),
    defaultValues: responseDefaultValues,
  });

  const { handleSubmit: handleResponseSubmit } = responseMethods;

  const responseType = [
    { value: 1, label: 'Message' },
    { value: 2, label: 'Notes' },
  ];

  const getAssignUserData = async () => {
    try {
      const response = await ManageAPIsData(MANAGE_TICKET_ASSIGN_USERS, 'POST');
      if (response.ok) {
        const responseData = await response.json();
        setUserData(responseData.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const getListingData = async () => {
    try {
      const response = await ManageAPIsData(
        `${MANAGE_TICKET_RESPONSE}?ticket_id=${currentProduct.id}`,
        'GET'
      );
      if (response.ok) {
        const responseData = await response.json();
        setTableData(responseData.data);
      }
    } catch (error) {
      console.error('Error fetching response data:', error);
    }
  };

  useEffect(() => {
    getAssignUserData();
    getListingData();
    if (currentProduct) {
      resetAssignForm(assignDefaultValues);
    }
  }, [currentProduct, assignDefaultValues, resetAssignForm]);

  const onAssignSubmit = handleAssignSubmit(async (data) => {
    try {
      const user = await FetchUserDetail();
      const payload = {
        operate_by: user?.id,
        assign_by: data.assign_by,
      };

      const response = await fetch(`${MANAGE_TICKET_ASSIGN_TICKETS}?id=${currentProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        enqueueSnackbar('Ticket assignment updated successfully!');
      } else {
        const errorData = await response.json();
        enqueueSnackbar(errorData.error || 'Failed to update ticket', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error submitting assign form:', error);
    }
  });

  const onResponseSubmit = handleResponseSubmit(async (data) => {
    try {
      const user = await FetchUserDetail();

      const payload = {
        ticket_id: currentProduct?.id,
        response_from: currentProduct?.operate_by,
        response_to: currentProduct?.user_id,
        response_type: data.response_type,
        message: data.message,
      };

      const response = await fetch(`${MANAGE_TICKET_RESPONSE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        enqueueSnackbar('Ticket assignment updated successfully!');
        getListingData();
      } else {
        const errorData = await response.json();
        enqueueSnackbar(errorData.error || 'Failed to update ticket', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error submitting response form:', error);
    }
  });

  const handleClose = async () => {
    try {
      const user = await FetchUserDetail();
      console.log(user, 'USER');
      const payload = {
        ticket_id: currentProduct?.id,
        user_id: user.id,
      };

      const response = await fetch(`${MANAGE_TICKET_TICKETS_CLOSED}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        enqueueSnackbar('Ticket Closed successfully!');
      } else {
        const errorData = await response.json();
        enqueueSnackbar(errorData.error || 'Failed to Close ticket', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error submitting response form:', error);
    }
  };

  const handleDelete = async (row_id) => {
    try {

      const response = await fetch(`${MANAGE_TICKET_RESPONSE}/?id=${row_id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        enqueueSnackbar('Ticket Closed successfully!');
        getListingData()
      } else {
        const errorData = await response.json();
        enqueueSnackbar(errorData.error || 'Failed to Close ticket', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error submitting response form:', error);
    }
  };

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6">Ticket Information:</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1">
              <strong>Ticket Id: </strong> {currentProduct?.ticket_id}
            </Typography>
            <Typography variant="body1">
              <strong>Title: </strong> {currentProduct?.title}
            </Typography>
            <Typography variant="body1">
              <strong>User Name: </strong> {currentProduct?.user_first_name}{' '}
              {currentProduct?.user_last_name}
            </Typography>
            <Typography variant="body1">
              <strong>Subject Name: </strong>
              {currentProduct?.subject_name}
            </Typography>
            <Typography variant="body1">
              <strong>Created At: </strong>{' '}
              {currentProduct?.created_at
                ? format(new Date(currentProduct.created_at), 'dd MMM yyyy')
                : '--'}
            </Typography>
            <FormProvider methods={assignMethods} onSubmit={onAssignSubmit}>
              <Grid container spacing={3} sx={{ mt: 3 }}>
                <Grid item xs={12} md={6}>
                  <RHFSelect fullWidth id="assign_by" name="assign_by" label="Assigned By">
                    <MenuItem value="">Select User</MenuItem>
                    {userData.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.first_name} {option.last_name}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                </Grid>

                <Grid item xs={12} md={6}>
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    size="large"
                    loading={assignMethods.formState.isSubmitting}
                  >
                    {!currentProduct ? 'Submit' : 'Update'}
                  </LoadingButton>
                </Grid>
              </Grid>
            </FormProvider>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" sx={{ mt: 3 }}>
              Responses:
            </Typography>
            {tableData.map((item) => (
              <Box
                key={item.id}
                sx={{
                  mt: 2,
                  backgroundColor: item.response_type === 2 ? '#4a4a4a45' : '',
                  padding: 2,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <IconButton
                  color="error"
                  sx={{ mr: 2 }}
                  onClick={() => handleDelete(item.id)}
                >
                  <DeleteIcon />
                </IconButton>
                <Box>
                  <Typography variant="body1">
                    <strong>From:</strong> {item.response_from_first_name}{' '}
                    {item.response_from_last_name}
                  </Typography>
                  <Typography variant="body1">
                    <strong>{item.response_type === 2 ? 'Notes' : 'Message'}:</strong>{' '}
                    {item.message}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Send:</strong> {format(new Date(item.created_at), 'dd MMM yyyy HH:mm')}
                  </Typography>
                </Box>
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />
            <FormProvider methods={responseMethods} onSubmit={onResponseSubmit}>
              <RHFSelect
                fullWidth
                id="response_type"
                name="response_type"
                label="Response Type"
                spacing={3}
                sx={{ mt: 3 }}
              >
                <MenuItem value="">Select Type</MenuItem>
                {responseType.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFTextField
                id="message"
                name="message"
                label="message"
                multiline
                rows={4}
                spacing={3}
                sx={{ mt: 3 }}
              />
              {currentProduct?.ticket_status === 1 ? (
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={responseMethods.formState.isSubmitting}
                  spacing={3}
                  sx={{ mt: 3 }}
                >
                  Send Message
                </LoadingButton>
              ) : (
                <Typography sx={{ mt: 3 }}>This Ticket has been Closed</Typography>
              )}
            </FormProvider>
            {currentProduct?.ticket_status === 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button variant="outlined" color="error" onClick={handleClose} type="submit">
                  Close Ticket
                </Button>
              </Box>
            )}
          </Card>
        </Grid>
      </Box>
    </>
  );
}
