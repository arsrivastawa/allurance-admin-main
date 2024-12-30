import useSWR from 'swr';
import axios from 'axios';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function UsegetReviews() {
  const URL = endpoints.review.list;
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

export function UsegetReview(productId) {
  const URL = productId ? endpoints.review.details(productId) : null;

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

export function UseSearchReview(query) {
  const URL = query ? [endpoints.review.search, { params: { query } }] : '';

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

export const DeleteMultipleReview = async (id) => {
  const response = await axios.delete(endpoints.review.deletes(id));
  return response?.data;
};

//  delete user
export const DeleteReview = async (id) => {
  const response = await axios.delete(endpoints.review.details(id));
  return response.data;
};

// UPDATE RECORD STATUS
export const UpdateRecordStatusReview = async (id, data) => {
  const response = await axios.put(endpoints.review.view(id), data);
  return response?.data;
};

export const ImageFetchData = async (id) => {
  const response = await axios.get(endpoints.review.imgview(id));
  return response?.data;
};
