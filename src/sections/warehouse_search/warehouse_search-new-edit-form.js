import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import MenuItem from '@mui/material/MenuItem';
import { Checkbox, FormControl, InputLabel, Select, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { useSnackbar } from 'src/components/snackbar';

import { ManageAPIsData, fetchDataFromApi } from '../../utils/commonFunction';
import { PACKERS_CARTONS_LIST_IN_WAREHOUSE_ENDPOINT, WAREHOUSE_ENDPOINT } from '../../utils/apiEndPoints';

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }) {
  const [selectedValues, setSelectedValues] = useState([]);
  const [AllCartons, setAllCartons] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const NewProductSchema = Yup.object().shape({
    rack_title: Yup.string().required('Rack title is required'),
    rack_code: Yup.string().required('Rack code is required'),
  });

  const defaultValues = useMemo(
    () => ({
      rack_title: currentProduct?.rack_title || '',
      rack_code: currentProduct?.rack_code || '',
    }),
    [currentProduct]
  );

  const FetchCartons = async (id) => {
    try {
      const apiUrl = id ? `${PACKERS_CARTONS_LIST_IN_WAREHOUSE_ENDPOINT}?id=${id}` : PACKERS_CARTONS_LIST_IN_WAREHOUSE_ENDPOINT;
      const responseData = await fetchDataFromApi(apiUrl, 'GET');
      if (responseData) {
        setAllCartons(responseData);
      }
    } catch (error) {
      console.error("Error fetching carton data:", error);
    }
  };

  useEffect(() => {
    FetchCartons();
  }, []);

  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
    defaultValues
  });

  const { reset, handleSubmit, formState: { isSubmitting } } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      data.cartons = selectedValues;
      await new Promise((resolve) => setTimeout(resolve, 500));
      const apiUrl = currentProduct ? `${WAREHOUSE_ENDPOINT}/${currentProduct.id}` : WAREHOUSE_ENDPOINT;
      const fetchMethod = currentProduct ? "PUT" : "POST";
      const response = await ManageAPIsData(apiUrl, fetchMethod, data);

      if (response.ok) {
        enqueueSnackbar(currentProduct ? 'Update success!' : 'Create success!');
        router.push(paths.dashboard.warehouse.root);
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

  useEffect(() => {
    if (currentProduct) {
      FetchCartons(currentProduct.id);
      reset(defaultValues);
    }
  }, [currentProduct, defaultValues, reset]);

  useEffect(() => {
    if (AllCartons?.length && currentProduct) {
      setSelectedValues(currentProduct.cartons.map(cartonId => String(cartonId)) || []);
      setAllChecked(currentProduct.cartons?.length === AllCartons.length);
    }
  }, [AllCartons, currentProduct]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allCartonIds = AllCartons?.map(option => String(option.id));
      setSelectedValues(allCartonIds);
      setAllChecked(true);
    } else {
      setSelectedValues([]);
      setAllChecked(false);
    }
  };

  const handleSelectChange = (event) => {
    const { value } = event.target;
    if (value.includes("all")) {
      const allCartonIds = AllCartons?.map(option => String(option.id));
      setSelectedValues(allCartonIds);
      setAllChecked(true);
      return;
    }
    const updatedValues = value.filter(val => val !== "all");
    setSelectedValues(updatedValues);
    setAllChecked(updatedValues.length === AllCartons?.length);
  };

  const renderCartonsDropdown = () => (
    <FormControl fullWidth sx={{ marginTop: 2 }}>
      <InputLabel>Select Cartons</InputLabel>
      <Select
        label="Select Cartons"
        id="cartons"
        name="cartons"
        multiple
        value={selectedValues}
        onChange={handleSelectChange}
        renderValue={(selected) => {
          if (!Array.isArray(selected) || selected.length === 0) {
            return 'Cartons';
          }
          return selected
            .map((value) => {
              const selectedCarton = AllCartons?.find(
                (option) => String(option.id) === value
              );
              return selectedCarton ? selectedCarton.title : '';
            })
            .join(', ');
        }}
      >
        <MenuItem key="all" value="all">
          <Checkbox
            checked={allChecked}
            indeterminate={
              selectedValues.length > 0 &&
              selectedValues.length < AllCartons?.length
            }
            onChange={handleSelectAll}
          />
          <Typography variant="body1">All</Typography>
        </MenuItem>
        {AllCartons?.map((option) => (
          <MenuItem key={option.id} value={String(option.id)}>
            <Checkbox checked={selectedValues.includes(String(option.id))} />
            <Typography variant="body1">{option.title}</Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const renderNormalForm = (
    <>
      <Grid item xs={12} md={12}>
        <Card sx={{ p: 3 }}>
          <RHFTextField id="rack_title" sx={{ marginTop: 2 }} name="rack_title" label="Rack Name" fullWidth />
          <RHFTextField id="rack_code" sx={{ marginTop: 2 }} name="rack_code" label="Rack Code" fullWidth />
          {renderCartonsDropdown()}
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      <Grid xs={12} md={12} sx={{ display: 'flex', alignItems: 'center' }}>
        <LoadingButton type="submit" size="large" variant="contained" loading={isSubmitting}>
          {!currentProduct ? 'Submit' : 'Update'}
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderNormalForm}
        {renderActions}
      </Grid>
    </FormProvider>
  );
}

ProductNewEditForm.propTypes = {
  currentProduct: PropTypes.object,
};
