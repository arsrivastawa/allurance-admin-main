import useSWR from 'swr';
import axios from 'axios';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/utils/axios';
import { ADVERTISEMENT_ADS_CHECK } from 'src/utils/apiendpoints';

// ----------------------------------------------------------------------

export function UsegetAdvertisements() {
  const URL = endpoints.advertisement.list;
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

export function UsegetAdvertisement(productId) {
  const URL = productId ? endpoints.advertisement.details(productId) : null;

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

export function UseSearchAdvertisement(query) {
  const URL = query ? [endpoints.advertisement.search, { params: { query } }] : '';

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

export const CreateAdvertisement = async (data) => {
  const response = await axios.post(endpoints.advertisement.create, data);
  return response?.data;
};

// Update user
export const UpdateAdvertisement = async (id, data) => {
  const response = await axios.put(endpoints.advertisement.edit(id), data);
  return response?.data;
};

//  delete user
export const DeleteAdvertisement = async (id) => {
  const response = await axios.delete(endpoints.advertisement.details(id));
  return response?.data;
};

export const DeleteMultipleAdvertisement = async (id) => {
  const response = await axios.delete(endpoints.advertisement.deletes(id));
  return response?.data;
};

export const AdvertisementType = [
  { label: 'Create ad', id: 1 },
  { label: 'Others', id: 2 },
];

export const ExclusiveType = [
  { label: 'On', id: 1 },
  { label: 'Off', id: 2 },
];

export const UpdateRecordStatus = async (id, data) => {
  const response = await axios.put(endpoints.advertisement.view(id), data);
  return response?.data;
};

export const CheckAds = async (data) => {
  const response = await axios.post(ADVERTISEMENT_ADS_CHECK, data);
  return response?.data;
};
