"use client";
import PropTypes from 'prop-types';
import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'src/auth/context/jwt/utils';
import { ROLE_PERMISSION_ENDPOINT } from 'src/utils/apiEndPoints';
import { ManageAPIsData } from 'src/utils/commonFunction';

export const PermissionContext = createContext([]);

export function PermissionProvider({ children, defaultSettings }) {
  const [permissions, setPermissions] = useState(defaultSettings.permissions || []);

  useEffect(() => {
    const STORAGE_KEY = 'accessToken';
    const accessToken = sessionStorage.getItem(STORAGE_KEY);

    if (!accessToken) {
      // console.error("accessToken is undefined. Cannot decode.");
      return;
    }

    try {
      const decoded = jwtDecode(accessToken);
      const roleid = decoded?.data?.role_id;
      if (roleid) {
        getPermissionListingData(roleid);
      } else {
        console.error("Role ID not found in decoded token.");
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }, []);

  const getPermissionListingData = async (selectedRoleID) => {
    try {
      const apiUrl = `${ROLE_PERMISSION_ENDPOINT}/${selectedRoleID}`;
      const response = await ManageAPIsData(apiUrl, 'GET');
      if (response.status !== 200) {
        console.error("CANNOT FIND THE PERMISSIONS");
        return;
      }
      const responseData = await response.json();
      if (responseData.data.length) {
        setPermissions(responseData?.data);
      } else {
        console.error("No permissions found in response data.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <PermissionContext.Provider value={{ permissions }}>
      {children}
    </PermissionContext.Provider>
  );
}

PermissionProvider.propTypes = {
  children: PropTypes.node,
  defaultSettings: PropTypes.object,
};