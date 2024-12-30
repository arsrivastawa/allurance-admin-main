import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';
import { useMemo, useEffect } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'src/components/snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import FormProvider, {
  RHFTextField,
  RHFAutocomplete,
  RHFUpload,
} from 'src/components/hook-form';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { INVOICE_STATUS_OPTIONS } from 'src/_mock';

import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';

import InvoiceToolbar from './support-toolbar';
import { Button, Checkbox, FormControlLabel, Modal, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { INE_ORDER_RETURN_ENDPOINT } from 'src/utils/apiEndPoints';
import { FetchUserDetail, ManageAPIsData, createFileOptions } from 'src/utils/commonFunction';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { cognitoUserPoolsTokenProvider } from '@aws-amplify/auth/cognito';
// ----------------------------------------------------------------------
const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  minWidth: 800,
  position: 'relative',
}));

const ImagePreview = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const ImageItem = styled('div')(({ theme }) => ({
  position: 'relative',
  width: 100,
  height: 100,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  '& .remove-btn': {
    position: 'absolute',
    top: 2,
    right: 2,
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '50%',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '& td': {
    textAlign: 'right',
    borderBottom: 'none',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));

// ----------------------------------------------------------------------

export default function InvoiceDetails({ invoice, orderid }) {
  const NewProductSchema = Yup.object().shape({
    description: Yup.string().required('Description is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      description: "",
      images: [],
    },
  });
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const [comment, setComment] = useState(false);
  const [currentStatus, setcurrentStatus] = useState(invoice?.order_status);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showCheckboxes, setshowCheckboxes] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [images, setImages] = useState(watch('images') || []);

  const handleSelectProduct = (product) => {
    const productId = product?.id; // Access the id property of the product
    if (selectedProducts.some((p) => p.id === productId)) {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  useEffect(() => {
    setcurrentStatus(invoice?.order_status)
  }, [invoice?.order_status])

  const handleRemoveImage = (inputFile) => {
    const updatedImages = images.filter((file) => file !== inputFile);
    setImages(updatedImages);
    setValue('images', updatedImages, { shouldValidate: true });
  };

  const handleRemoveAllImages = () => {
    setImages([]);
    setValue('images', [], { shouldValidate: true });
  };

  const handleFormOpen = () => {
    setSelectedProducts([]); // Reset selected products
    setshowCheckboxes((prevShowCheckboxes) => !prevShowCheckboxes); // Toggle checkbox visibility
    setFormOpen(true);
  };

  const handleDropMultiFile = (acceptedFiles) => {
    const updatedImages = [...images, ...acceptedFiles];
    if (updatedImages.length > 5) {
      enqueueSnackbar('You can only upload a maximum of 5 images.', { variant: 'error' });
      return;
    }
    setImages(updatedImages);
    setValue('images', updatedImages, { shouldValidate: true });
  };

  const renderTotal = (
    <>
      <Grid item xs={12} justifyContent="flex-end" alignItems="center" sx={{ mb: 5 }}>
        <StyledTableRow>
          <TableCell colSpan={3} />
          <TableCell sx={{ color: 'text.secondary' }}>
            <Box sx={{ mt: 2 }} />
            Subtotal
          </TableCell>
          <TableCell width={120} sx={{ typography: 'subtitle2' }}>
            <Box sx={{ mt: 2 }} />
            {invoice?.base_amount || 0}/-
          </TableCell>
        </StyledTableRow>

        <StyledTableRow>
          <TableCell colSpan={3} />
          <TableCell sx={{ color: 'text.secondary' }}>Discount</TableCell>
          <TableCell width={120} sx={{ color: 'error.main', typography: 'body2' }}>
            {invoice?.payment_by_giftcard || 0}/- {/* Assuming discount is stored in payment_by_giftcard */}
          </TableCell>
        </StyledTableRow>

        <StyledTableRow>
          <TableCell colSpan={3} />
          <TableCell sx={{ color: 'text.secondary' }}>Tax (18%)</TableCell>
          <TableCell width={120}>
            {invoice?.tax_amount || 0}/- {/* Calculating 18% tax */}
          </TableCell>
        </StyledTableRow>

        <StyledTableRow>
          <TableCell colSpan={3} />
          <TableCell sx={{ typography: 'subtitle1' }}>Total</TableCell>
          <TableCell width={140} sx={{ typography: 'subtitle1' }}>
            {invoice?.total_amount || 0}
          </TableCell>
        </StyledTableRow>
      </Grid>
    </>
  );

  const handleProceed = () => {
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
  };

  const handleDynamicImageProcessing = async (image) => {
    try {
      const processedBase64Image = await createFileOptions(image);
      return processedBase64Image;
    } catch (error) {
      console.error("Error in handleDynamicImageProcessing:", error);
      return '';
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    data.id = orderid
    data.order_id = invoice.order_id
    data.invoice_id = invoice.invoice_id
    data.customer_id = invoice.customer_id
    data.description = comment
    data.returnproduct = selectedProducts

    if (data?.images && data?.images?.length) {
      for (let i = 0; i < data.images?.length; i++) {
        const processedImage = await handleDynamicImageProcessing(data?.images[i]);
        data.images[i] = processedImage;
      }
    }
    const user = await FetchUserDetail();
    data.apihitid = user.id
    const apiUrl = INE_ORDER_RETURN_ENDPOINT;
    const fetchMethod = "POST";
    const response = await ManageAPIsData(apiUrl, fetchMethod, data);

    if (response.status == true) {
      enqueueSnackbar('Return success!');
      router.push(paths.dashboard.supportchannel.root);

    } else {
      const responseData = await response.json();
      if (responseData && responseData.error) {
        enqueueSnackbar(responseData.error, { variant: 'error' });
      }
    }
    // Add your logic here to process the refund or return
  });

  const renderList = (
    <TableContainer sx={{ overflow: 'unset', mt: 5, mb: 5 }}>
      <Scrollbar>
        <Table sx={{ minWidth: 960 }}>
          <TableHead>
            <TableRow>
              <TableCell width={40}>#</TableCell>
              {showCheckboxes && (
                <TableCell sx={{ typography: 'subtitle2' }}>Select</TableCell>
              )}
              <TableCell sx={{ typography: 'subtitle2' }}>Product</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Return</TableCell>
              <TableCell align="right">Unit Price</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoice?.Products?.map((product, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                {showCheckboxes && (
                  <TableCell>
                    <FormControlLabel
                      control={<Checkbox
                        checked={selectedProducts?.some((p) => p.id === product?.id)}
                        onChange={() => handleSelectProduct(product)}
                      />}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <Box sx={{ maxWidth: 560 }}>
                    <Typography variant="subtitle2">{product.title}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                      Model: {product.model_number}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                      Weight: {product.weight}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>{product.is_returned == 1 ? "IN RETURN" : "NOT IN RETURN"}</TableCell>
                <TableCell align="right">{product.retail_price}</TableCell>
                <TableCell align="right">{product.retail_price}</TableCell> {/* Assuming total price equals retail price */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  );

  const fetchTemplate = async () => {
    const response = await fetch('/html/invoice.html');
    return response.text();
  };

  // Function to replace placeholders with actual data
  const populateTemplate = (template, data) => {
    return template.replace(/{{(\w+)}}/g, (_, key) => data[key] || '');
  };

  const handleGenerateBillClick = async () => {
    const template = await fetchTemplate();

    // Prepare dynamic data
    const data = {
      invoice_id: invoice.invoice_id,
      order_status: invoice.order_status === 1 ? 'Paid' : invoice.order_status === 2 ? 'Pending' : 'Overdue',
      assisted_by: `${invoice.assisted_by_first_name} ${invoice.assisted_by_last_name}`,
      from_phone: invoice.phone,
      to_name: `${invoice.first_name} ${invoice.last_name}`,
      to_address_line_1: invoice.address_line_1,
      to_address_line_2: invoice.address_line_2,
      to_landmark: invoice.landmark,
      to_district: invoice.district,
      to_state: invoice.state,
      to_country: invoice.country,
      to_pincode: invoice.pincode,
      created_at: new Date(invoice.created_at).toLocaleString(),
      products: invoice.Products.map(product => `
    <tr>
      <td>${product.title}</td>
      <td>${product.model_number}</td>
      <td>${product.quantity}</td>
      <td>${product.retail_price}</td>
      <td>${product.retail_price}</td>
    </tr>`).join(''),
      subtotal: invoice.base_amount || 0,
      discount: invoice.payment_by_giftcard || 0,
      tax: (invoice.tax_amount || 0),
      total: (invoice?.total_amount || 0)

    };
    // Populate the template with dynamic data
    const populatedTemplate = populateTemplate(template, data);
    // Convert HTML content to PDF and download it
    html2pdf().from(populatedTemplate).save();
  };


  return (
    <>
      <Card sx={{ pt: 5, px: 5 }}>
        <Box
          rowGap={5}
          display="grid"
          alignItems="center"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
          }}
        >
          <Box
            component="img"
            alt="logo"
            src="/logo/Allurance_logo.svg"
            sx={{ width: 148, height: 48 }}
          />
          <Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
            <Button variant="contained" onClick={handleGenerateBillClick}>Generate Bill</Button>
            <Label
              variant="soft"
              color={
                (currentStatus === 1 && 'error') ||
                (currentStatus === 2 && 'warning') ||
                (currentStatus === 3 && 'success') ||
                'default'
              }
            >
              {currentStatus === 1 ? 'Paid' : currentStatus === 2 ? 'Pending' : currentStatus === 3 ? 'Paid' : ''}
            </Label>
            <Typography variant="h6">{invoice?.invoice_id}</Typography>
          </Stack>
          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Invoice From
            </Typography>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Assistant ID:
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {invoice?.assisted_by || ""}
            </Typography>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Assistant name:
            </Typography>
            <Stack direction="row" sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                {invoice?.assisted_by_first_name || ""}
              </Typography>
              <Typography variant="body2">
                {invoice?.assisted_by_last_name || ""}
              </Typography>
            </Stack>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Phone:
            </Typography>
            <Typography variant="body2">
              {invoice?.phone || ""}
            </Typography>
          </Stack>

          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Invoice To
            </Typography>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Address:
            </Typography>

            <Stack sx={{ mb: 1 }}>
              <Typography variant="body2">
                {invoice?.address_line_1 || ""}
              </Typography>
            </Stack>

            <Stack sx={{ mb: 1 }}>
              <Typography variant="body2">
                {invoice?.address_line_2 || ""}
              </Typography>
            </Stack>

            <Stack sx={{ mb: 1 }}>
              <Typography variant="body2">
                {invoice?.landmark || ""}, {invoice?.district || ""}, {invoice?.state || ""}, {invoice?.country || ""} - {invoice?.pincode || ""}
              </Typography>
            </Stack>

            <Stack sx={{ mb: 1 }}>
              <Typography variant="body2">
                Phone: {invoice?.phone || ""}
              </Typography>
            </Stack>
          </Stack>

          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Date Created
            </Typography>
            {fDate(invoice?.created_at)}
          </Stack>

        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Grid>
            <Button
              variant="contained"
              onClick={handleFormOpen}
            >
              Return
            </Button>
          </Grid>
          {showCheckboxes && (
            <Grid>
              <Button variant="contained" onClick={handleProceed} sx={{ mb: 2, ml: 1 }}>
                Proceed
              </Button>
            </Grid>
          )}
        </Box>
        {renderList}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }} >
          {renderTotal}
        </Box>
      </Card>

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <StyledCard>
          <IconButton
            sx={{ position: 'absolute', top: 10, right: 10 }}
            onClick={() => setOpenModal(false)}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h4" gutterBottom>
            Refund/Return Products
          </Typography>
          <FormProvider methods={methods} onSubmit={onSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <RHFTextField
                  id="description"
                  name="description"
                  label="Description"
                  multiline
                  rows={4}
                  onChange={(e) => setComment(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Upload Images:</Typography>
                <RHFUpload
                  id="images"
                  name="images"
                  multiple
                  maxSize={3145728}
                  onDrop={handleDropMultiFile}
                  onRemove={handleRemoveImage}
                  onRemoveAll={handleRemoveAllImages}
                />
                {images.length > 0 && (
                  <ImagePreview>
                    {images.map((file, index) => (
                      <ImageItem key={index}>
                        <img src={URL.createObjectURL(file)} alt={`uploaded-${index}`} />
                        <IconButton
                          size="small"
                          className="remove-btn"
                          onClick={() => handleRemoveImage(file)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </ImageItem>
                    ))}
                  </ImagePreview>
                )}
              </Grid>
              <Grid item xs={12}>
                <LoadingButton
                  variant="contained"
                  type="submit"
                  fullWidth
                  loading={isSubmitting}
                  sx={{ mt: 2 }}
                >
                  Submit
                </LoadingButton>
              </Grid>
            </Grid>
          </FormProvider>
        </StyledCard>
      </Modal>
    </>
  );
}

InvoiceDetails.propTypes = {
  invoice: PropTypes.object,
};
