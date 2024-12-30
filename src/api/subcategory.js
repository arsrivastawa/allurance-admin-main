import useSWR from 'swr';
import axios from 'axios';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function UsegetSubCategories() {
  const URL = endpoints.subcategory.list;
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

export function UsegetSubCategory(productId) {
  const URL = productId ? endpoints.subcategory.details(productId) : null;

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

export function UseSearchSubCategory(query) {
  const URL = query ? [endpoints.subcategory.search, { params: { query } }] : '';

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

export const CreateSubCategory = async (data) => {
  const response = await axios.post(endpoints.subcategory.create, data);
  return response.data;
};

// Update user
export const UpdateSubCategory = async (id, data) => {
  const response = await axios.put(endpoints.subcategory.details(id), data);
  return response.data;
};

// CSV FILE UPLODAD
export const SubCategoryUploadCSV = async (data) => {
  const response = await axios.post(endpoints.subcategory.csv, data);
  return response.data;
};

//  delete user
export const DeleteSubCategory = async (id) => {
  const response = await axios.delete(endpoints.subcategory.details(id));
  return response.data;
};

export const DeleteMultipleSub = async (id) => {
  const response = await axios.delete(endpoints.subcategory.deletes(id));
  return response?.data;
};
