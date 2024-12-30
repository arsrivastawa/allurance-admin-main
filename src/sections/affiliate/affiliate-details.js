import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'notistack';
import { createImageOptions, fetchDataFromApi, FetchUserDetail, ManageAPIsData, ManageAPIsDataWithHeader } from '../../utils/commonFunction';
import { jwtDecode } from 'src/auth/context/jwt/utils';
import {
  Button,
  Divider,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Card,
  Stack,
  Box,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import Label from 'src/components/label';
import { fDateTime } from 'src/utils/format-time';
import FormProvider, { RHFTextField, RHFUpload } from 'src/components/hook-form';
import { DESIGNER_APPROVED_ENDPOINT, DESIGNER_REJECTED_ENDPOINT, AFFILIATE_ENDPOINT, AFFILIATE_REJECT_ENDPOINT } from '../../utils/apiEndPoints';
import { DatePicker } from '@mui/x-date-pickers';
import { useRouter } from 'next/navigation';
import { ConsoleLogger } from '@aws-amplify/core';

export default function InvoiceDetails({ rowID }) {
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();
  const [affiliateData, setAffiliateData] = useState({});
  const [generatedURL, setGeneratedURL] = useState('');
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [stateImage1Option, setImage1Option] = useState(false);
  const [stateImage2Option, setImage2Option] = useState(false);
  const [approveButtonLabel, setApproveButtonLabel] = useState('Approve');
  const [recordLabel, setRecordLabel] = useState(1);

  const NewProductSchema = Yup.object().shape({
    affiliate_name: Yup.string().required('Affiliate Name is required'),
    user_name: Yup.string().required('User Name is required'),
    // insta_username: Yup.string().required('Instagram Username is required'),
    // insta_followers: Yup.string().required('Instagram Followers are required'),
    // insta_profile_url: Yup.string().required('Instagram Profile URL is required'),
    aadhar_card_number: Yup.string().required('Aadhar Card Number is required'),
    pan_card_number: Yup.string().required('PAN Card Number is required'),
    commission: Yup.string().required('Commission is required'),
    affiliate_url: Yup.string().nullable(),
    affiliate_start_date: Yup.date().nullable().required('Affiliate Start Date is required'),
    affiliate_end_date: Yup.date().nullable().required('Affiliate End Date is required'),
  });

  const defaultValues = useMemo(
    () => ({
      affiliate_name: affiliateData?.affiliate_name || '',
      user_name: affiliateData?.user_name || '',
      insta_username: affiliateData?.insta_username || '',
      insta_followers: affiliateData?.insta_followers || '',
      insta_profile_url: affiliateData?.insta_profile_url || '',
      aadhar_card_number: affiliateData?.aadhar_card_number || '',
      pan_card_number: affiliateData?.pan_card_number || '',
      commission: affiliateData?.commission || '',
      affiliate_url: affiliateData?.affiliate_url || '',
      image1: affiliateData?.aadhar_card_image ? affiliateData.aadhar_card_image : '',
      image2: affiliateData?.pan_card_image ? affiliateData.pan_card_image : '',
      affiliate_start_date: affiliateData?.affiliate_start_date ? new Date(affiliateData?.affiliate_start_date) : null,
      affiliate_end_date: affiliateData?.affiliate_end_date ? new Date(affiliateData?.affiliate_end_date) : null,
    }),
    [affiliateData]
  );


  useEffect(() => {
    if (affiliateData.affiliate_url) {
      setGeneratedURL(affiliateData.affiliate_url);
    } else {
      // Otherwise, generate a random URL
      const generateAffiliateUrl = async () => {
        const urlStartPoint = process.env.NEXT_PUBLIC_BASE_URL;
        const randomString = await generateRandomAlphaNumeric(6);

        setValue("affiliate_url", `${urlStartPoint}/affiliatepage/${randomString}`)
      };

      const fetchGeneratedURL = async () => {
        const url = await generateAffiliateUrl();
        setGeneratedURL(url);
      };

      fetchGeneratedURL();
    }
  }, [affiliateData]);


  const generateRandomAlphaNumeric = async (length) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }

    return randomString;
  };

  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
    defaultValues,
  });

  const { reset, handleSubmit, setValue, formState: { isSubmitting } } = methods;

  useEffect(() => {
    if (rowID) {
      fetchAffiliateDetails();
    }
  }, [rowID]);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const fetchAffiliateDetails = async () => {
    try {
      const apiUrl = `${AFFILIATE_ENDPOINT}?id=${rowID}`;
      const responseData = await fetchDataFromApi(apiUrl, 'GET');
      if (responseData) {
        setAffiliateData(responseData);
        setRecordLabel(responseData.record_status);
      }
    } catch (error) {
      console.error("Error fetching affiliate data:", error);
    }
  };

  const CommentSchema = Yup.object().shape({
    comments: Yup.string().required('Comment is required'),
  });

  const commentForm = useForm({
    resolver: yupResolver(CommentSchema),
  });


  // Image Handler
  const createImageHandler = (imageKey, setOption) => useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = file && Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      setValue(imageKey, newFile, { shouldValidate: true });
      setOption(true);
    },
    [setValue, setOption]
  );

  const createRemoveFileHandler = (imageKey) => useCallback(() => {
    setValue(imageKey, null);
  }, [setValue]);



  const { reset: resetCommentForm, handleSubmit: handleSubmitCommentForm, formState: { isSubmitting: isSubmittingCommentForm } } = commentForm;

  const onSubmitComment = handleSubmitCommentForm(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      resetCommentForm();
      const apiUrl = `${AFFILIATE_ENDPOINT}?id=${rowID}`;
      const fetchMethod = "PUT";
      const response = await ManageAPIsData(apiUrl, fetchMethod, data);
      if (response.ok) {
        enqueueSnackbar('Update success!');
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

  const handleRejectClick = () => {
    setOpenRejectDialog(true);
  };

  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
  };

  const RejectionSchema = Yup.object().shape({
    rejection_reason: Yup.string().required('Rejection Reason is required'),
  });

  const rejectionForm = useForm({
    resolver: yupResolver(RejectionSchema),
  });

  const { reset: resetRejectionForm, handleSubmit: handleSubmitRejectionForm, formState: { isSubmitting: isSubmittingRejectionForm } } = rejectionForm;

  useEffect(() => {
    if (affiliateData) {
      setRecordLabel(affiliateData?.record_status);
      rejectionForm.setValue('rejection_reason', affiliateData?.rejection_reason || '');
      if (affiliateData.record_status === 2) {
        setApproveButtonLabel('Approved');
      }
    }
  }, [affiliateData, rejectionForm]);

  const onSubmitRejection = handleSubmitRejectionForm(async (data) => {
    try {
      const payload = { ...data, rejection_reason: data.rejection_reason, record_status: 3 };
      const user = await FetchUserDetail();
      payload.apihitid = user.id
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const apiUrl = `${AFFILIATE_REJECT_ENDPOINT}/${rowID}`;
        const fetchMethod = "PUT";
        const response = await ManageAPIsData(apiUrl, fetchMethod, payload);
        if (response.ok) {
          enqueueSnackbar('Update success!');
          handleCloseRejectDialog();
          setApproveButtonLabel('Approve');
          setRecordLabel(3);
          router.push(paths.dashboard.manage_request.root);
        } else {
          const responseData = await response.json();
          if (responseData && responseData.error) {
            enqueueSnackbar(responseData.error, { variant: 'error' });
          }
        }
      } catch (err) {
        console.error(err.message);
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  });

  const handleDynamicImageProcessing = async (image) => {
    try {
      const processedBase64Image = await createImageOptions(image);
      return processedBase64Image;
    } catch (error) {
      console.error("Error in handleDynamicImageProcessing:", error);
      return '';
    }
  };

  const handleApproveClick = async (data) => {
    try {
      const token = await sessionStorage.getItem('accessToken');
      if (!token) {
        console.error("Token is undefined.");
        return;
      }
      const user = await FetchUserDetail();
      data.apihitid = user.id
      data.record_status = 2
      data.image1 = await handleDynamicImageProcessing(data?.image1);
      data.image2 = await handleDynamicImageProcessing(data?.image2);
      setApproveButtonLabel('Approved');
      const apiUrl = `${AFFILIATE_ENDPOINT}/${rowID}`;
      const fetchMethod = "PUT";
      data.headers = { Authorization: `Bearer ${token}` }
      const response = await ManageAPIsDataWithHeader(apiUrl, fetchMethod, data);
      // const response = await ManageAPIsData(apiUrl, fetchMethod, data);
      if (response.ok) {
        enqueueSnackbar('Update success!');
        rejectionForm.setValue('rejection_reason', '');
        setRecordLabel(2);
        fetchAffiliateDetails
        router.push(paths.dashboard.manage_request.root);
      } else {
        const responseData = await response;
        if (responseData && responseData.error) {
          enqueueSnackbar(responseData.error, { variant: 'error' });
        }
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box component="img" alt="logo" src="/logo/Allurance_Logo.svg" sx={{ height: 40 }} />
              <Stack spacing={1} alignItems="flex-end">
                {recordLabel === 1 && (
                  <Label
                    variant="soft"
                    color="warning"
                  >
                    Pending
                  </Label>
                )}
                {recordLabel === 2 && (
                  <Label
                    variant="soft"
                    color="success"
                  >
                    Approved
                  </Label>
                )}
                {recordLabel === 3 && (
                  <Label
                    variant="soft"
                    color="error"
                  >
                    Rejected
                  </Label>
                )}
              </Stack>
            </Box>
            <Divider sx={{ my: 2 }} />
            {affiliateData?.user_id && (<Typography variant="h6">User ID: {affiliateData?.user_id}</Typography>)}
            <Typography variant="h6">Instagram Profile URL: {affiliateData?.insta_profile_url}</Typography>
            <Typography variant="subtitle2">
              Created At: {fDateTime(affiliateData?.created_at)}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <FormProvider methods={methods} onSubmit={handleSubmit(handleApproveClick)}>
              <Box
                display="grid"
                gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
                gap={2}
              >
                <RHFTextField id="affiliate_name" name="affiliate_name" label="Affiliate Name" />
                <RHFTextField id="user_name" name="user_name" label="User Name" disabled />
                <RHFTextField id="insta_username" name="insta_username" label="Instagram Username" disabled />
                <RHFTextField id="insta_followers" name="insta_followers" label="Instagram Followers" disabled />
                <RHFTextField id="insta_profile_url" name="insta_profile_url" label="Instagram Profile URL" disabled />


                <RHFTextField id="commission" name="commission" label="Commission" />

                <DatePicker
                  label="Affiliate Start Date"
                  value={methods.watch('affiliate_start_date')}
                  onChange={(date) => methods.setValue('affiliate_start_date', date)}
                  renderInput={(params) => <RHFTextField {...params} name="affiliate_start_date" />}
                />
                <DatePicker
                  label="Affiliate End Date"
                  value={methods.watch('affiliate_end_date')}
                  onChange={(date) => methods.setValue('affiliate_end_date', date)}
                  renderInput={(params) => <RHFTextField {...params} name="affiliate_end_date" />}
                />
              </Box>
              <Box
                display="grid"
                sx={{ mt: 2 }}
              >
                <RHFTextField id="affiliate_url" name="affiliate_url" label="Affiliate URL" defaultValue={generatedURL} />
              </Box>
              <Box
                sx={{ mt: 2 }}
                display="grid"
                gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
                gap={2}
              >
                <div>
                  <RHFUpload
                    name="image1"
                    maxSize={3145728}
                    onDrop={createImageHandler('image1', setImage1Option)}
                    onDelete={createRemoveFileHandler('image1')}
                  />
                  <RHFTextField sx={{ mt: 2 }} id="aadhar_card_number" name="aadhar_card_number" label="Aadhar Card Number" />
                </div>
                <div>
                  <RHFUpload
                    name="image2"
                    maxSize={3145728}
                    onDrop={createImageHandler('image2', setImage2Option)}
                    onDelete={createRemoveFileHandler('image2')}
                  />
                  <RHFTextField sx={{ mt: 2 }} id="pan_card_number" name="pan_card_number" label="PAN Card Number" />
                </div>
              </Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
                <LoadingButton
                  type="submit"
                  color="success"
                  variant="outlined"
                  loading={isSubmitting}
                >
                  Approve
                </LoadingButton>
                <LoadingButton
                  color="error"
                  variant="outlined"
                  onClick={handleRejectClick}
                >
                  Reject
                </LoadingButton>
              </Stack>
            </FormProvider>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openRejectDialog} onClose={handleCloseRejectDialog} fullWidth maxWidth="sm">
        <Card sx={{ minWidth: 600, minHeight: 300, p: 2 }}>
          <DialogTitle>Rejection Reason</DialogTitle>
          <FormProvider methods={rejectionForm} onSubmit={onSubmitRejection}>
            <DialogContent>
              <RHFTextField name="rejection_reason" label="Rejection Reason" fullWidth />
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between', pr: 2 }}>
              <Button onClick={handleCloseRejectDialog}>Cancel</Button>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmittingRejectionForm}
              >
                Submit
              </LoadingButton>
            </DialogActions>
          </FormProvider>
        </Card>
      </Dialog>


    </>
  );
}

InvoiceDetails.propTypes = {
  rowID: PropTypes.string,
};
