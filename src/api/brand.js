import useSWR from 'swr';
import axios from 'axios';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function UsegetBrands() {
  const URL = endpoints.brand.list;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);
  const memoizedValue = useMemo(
    () => ({
      products: data?.data || [],
      productsLoading: isLoading,
      productsError: error,
      productsValidating: isValidating,
      productsEmpty: !isLoading && !data?.data.length,
    }),
    [data?.data, error, isLoading, isValidating]
  );
  return memoizedValue;
}

// ----------------------------------------------------------------------

export function UsegetBrand(productId) {
  const URL = productId ? endpoints.brand.details(productId) : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);
  const memoizedValue = useMemo(
    () => ({
      product: data?.data,
      productLoading: isLoading,
      productError: error,
      productValidating: isValidating,
    }),
    [(data?.data, error, isLoading, isValidating)]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function UseSearchBrand(query) {
  const URL = query ? [endpoints.brand.search, { params: { query } }] : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.data || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !data?.data.length,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export const CreateBrand = async (data) => {
  const response = await axios.post(endpoints.brand.create, data);
  return response.data;
};

// Update user
export const UpdateBrand = async (id, data) => {
  const response = await axios.put(endpoints.brand.details(id), data);
  return response.data;
};

// Import CSV FILE
export const BrandUploadCSV = async (data) => {
  const response = await axios.post(endpoints.brand.csv, data);
  return response.data;
};

//  delete user
export const DeleteBrand = async (id) => {
  const response = await axios.delete(endpoints.brand.details(id));
  return response.data;
};

export const DeleteMultipleBrand = async (id) => {
  const response = await axios.delete(endpoints.brand.deletes(id));
  return response?.data;
};

export const FetchCity = async () => {
  const payload = {
    state_id: 12,
  };
  const response = await axios.post(endpoints.Others.city.list, payload);
  return response?.data;
};
