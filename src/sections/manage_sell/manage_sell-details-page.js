'use client';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import Scrollbar from 'src/components/scrollbar';
import { Button, Divider, Grid } from '@mui/material';
import {  MANAGE_SELL } from 'src/utils/apiEndPoints';
import { ManageAPIsData } from 'src/utils/commonFunction';
import { paths } from 'src/routes/paths';
import { useRouter } from 'next/navigation';

// ----------------------------------------------------------------------

export default function InvoiceDetails({ id }) {
  const [invoice, Setinvoice] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `${MANAGE_SELL}/detail?order_id=${id}`;
        const response = await ManageAPIsData(apiUrl, 'POST');

        if (!response.ok) {
          console.error('Error fetching data:', response.statusText);
          return;
        }
        const responseData = await response.json();

        if (Object.keys(responseData)?.length) {
          Setinvoice(responseData?.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [id]);

  const renderList = (
    <Box>
      {invoice?.order_data?.channel_mode === 2 ? (
        <TableContainer sx={{ overflow: 'unset', mt: 3 }}>
          <Scrollbar>
            <Table sx={{ minWidth: 960 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ typography: 'subtitle2' }}>S.No</TableCell>
                  <TableCell sx={{ typography: 'subtitle2' }}>Image</TableCell>
                  <TableCell sx={{ typography: 'subtitle2' }}>Product Name</TableCell>
                  <TableCell sx={{ typography: 'subtitle2' }}>Category</TableCell>
                  <TableCell sx={{ typography: 'subtitle2' }}>Model Number</TableCell>
                  <TableCell sx={{ typography: 'subtitle2' }}>Serial Number</TableCell>
                  <TableCell sx={{ typography: 'subtitle2' }}>Price</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {invoice?.product_data?.length > 0 ? (
                  invoice.product_data.map((product, index) => (
                    <TableRow key={product.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <img
                          src={product.images?.[0]?.url || 'https://placehold.co/500x500'}
                          alt={product.product_name}
                          style={{ width: '30%' }}
                        />
                      </TableCell>
                      <TableCell>{product.product_name || '--'}</TableCell>
                      <TableCell>{product.category_name || '--'}</TableCell>
                      <TableCell>{product.model_number || '--'}</TableCell>
                      <TableCell>{product.serial_number || '--'}</TableCell>
                      <TableCell>{product.product_price || '--'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7}>
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
      ) : (
        <>
          {/* Table for Product Details */}
          <TableContainer sx={{ overflow: 'unset', mt: 3 }}>
            <Scrollbar>
              <Table sx={{ minWidth: 960 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ typography: 'subtitle2' }}>S.No</TableCell>
                    <TableCell sx={{ typography: 'subtitle2' }}>Image</TableCell>
                    <TableCell sx={{ typography: 'subtitle2' }}>Product Name</TableCell>
                    <TableCell sx={{ typography: 'subtitle2' }}>Weight</TableCell>
                    <TableCell sx={{ typography: 'subtitle2' }}>Status</TableCell>
                    <TableCell sx={{ typography: 'subtitle2' }}>Price</TableCell>
                    <TableCell sx={{ typography: 'subtitle2' }}>Quantity</TableCell>
                    <TableCell sx={{ typography: 'subtitle2' }}>Amount</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {invoice?.product_data?.length > 0 ? (
                    invoice.product_data.map((product, index) => {
                      const amount = (product.discount_price || 0) * (product.quantity || 0);
                      return (
                        <TableRow key={product.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <img
                              src={product.images?.url || 'https://placehold.co/500x500'}
                              alt={product.product_name}
                              style={{ width: '30%' }}
                            />
                          </TableCell>
                          <TableCell>{product.name || '--'}</TableCell>
                          <TableCell>{product.weight || '--'}</TableCell>
                          <TableCell>{product.status === 1 ? 'Active' : 'Inactive'}</TableCell>
                          <TableCell>{product.discount_price || '--'}</TableCell>
                          <TableCell>{product.quantity || '--'}</TableCell>
                          <TableCell>{amount.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8}>
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

          {/* Total amount details displayed below table */}
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Typography variant="h6">
              Subtotal: ₹{invoice?.product_data[0]?.subtotal || '--'}
            </Typography>
            <Typography variant="h6">CGST: ₹{invoice?.product_data[0]?.CGST || '--'}</Typography>
            <Typography variant="h6">IGST: ₹{invoice?.product_data[0]?.IGST || '--'}</Typography>
            <Typography variant="h6">SGST: ₹{invoice?.product_data[0]?.SGST || '--'}</Typography>
            <Typography variant="h6">
              Total Amount: ₹{invoice?.product_data[0]?.totalamount || '--'}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );

  const handleBack = () => {
    router.push(paths.dashboard.manage_sell.root);
  };

  return (
    <>
      <Box
        sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Typography variant="h4">Invoice Details</Typography>
        <Button variant="contained" onClick={handleBack}>
          Back
        </Button>
      </Box>

      <Card sx={{ pt: 5, px: 5 }}>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* User Info */}
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6">User Info</Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Full Name:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">
                      {`${invoice?.user_data?.first_name || '--'} ${invoice?.user_data?.last_name || '--'}`}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Email:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">{invoice?.user_data?.email || '--'}</Typography>
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Phone:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">{invoice?.user_data?.phone || '--'}</Typography>
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="subtitle2">Address:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body1">
                      {invoice?.address_data?.address_1 || '--'},{' '}
                      {invoice?.address_data?.landmark || '--'},{' '}
                      {invoice?.address_data?.district || '--'},{' '}
                      {invoice?.address_data?.pincode || '--'}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Order Details */}
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6">Order Details</Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Order Id:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">{invoice?.order_data?.order_id || '--'}</Typography>
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Order Date:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">
                      {invoice?.order_data?.invoice_date
                        ? new Date(invoice?.order_data.invoice_date).toLocaleDateString()
                        : '--'}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Order Amount:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">
                      {invoice?.order_data?.total_amount || '--'}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Total Items:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">
                      {invoice?.order_data?.total_items || '--'}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Order Status:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">
                      {invoice?.order_data?.order_status === 2 ? 'Completed' : 'Pending'}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Payment Details */}
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6">Payment Details</Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Invoice Id:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">
                      {invoice?.order_data?.invoice_id || '--'}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Payment ID:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">
                      {invoice?.order_data?.payment_id || '--'}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Payment Status:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">
                      {invoice?.order_data?.payment_status === 2 ? 'Paid' : 'Pending'}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Pay Amount:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">
                      {invoice?.order_data?.payment_by_customer || '--'}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Product Details */}
            <Grid item xs={12}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6">PRODUCT DETAILS:</Typography>
                <Divider sx={{ my: 2 }} />
                {renderList}
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Card>
    </>
  );
}

InvoiceDetails.propTypes = {
  invoice: PropTypes.object,
};
