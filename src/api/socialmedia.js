import useSWR from 'swr';
import axios from 'axios';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function UsegetSocialMedias() {
  const URL = endpoints.socialmedia.list;
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

export function UsegetSocialMedia(productId) {
  const URL = productId ? endpoints.socialmedia.details(productId) : null;

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

export function UseSearchSocialMedia(query) {
  const URL = query ? [endpoints.socialmedia.search, { params: { query } }] : '';

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

export const CreateSocialMedia = async (data) => {
  const response = await axios.post(endpoints.socialmedia.create, data);
  return response.data;
};

// Update user
export const UpdateSocialMedia = async (id, data) => {
  const response = await axios.put(endpoints.socialmedia.details(id), data);
  return response.data;
};

//  delete user
export const DeleteSocialMedia = async (id) => {
  const response = await axios.delete(endpoints.socialmedia.details(id));
  return response.data;
};

export const DeleteMultipleLinks = async (id) => {
  const response = await axios.delete(endpoints.socialmedia.deletes(id));
  return response?.data;
};
