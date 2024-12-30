// src/utils/permissionFunction.js
import { useState, useEffect } from 'react';
import { useMockedUser } from 'src/hooks/use-mocked-user';
import { ROLE_PERMISSION_ENDPOINT } from "./apiEndPoints";
import { fetchDataFromApi, setItemLocalStorage, getItemLocalStorage } from './commonFunction';

// Module IDs
export const MODULE_IDS = {
    CATEGORY_MODULE: 3,
};

export const getModuleNameById = (moduleName) => MODULE_IDS[moduleName] || 0; // Get Module ID by Name

// Manage Permission
export const managePermission = async (moduleName, accessType) => {
    const { user } = useMockedUser();
    const access_role_id = user ? user.role_id : 0;
    const getRoleID = access_role_id;
    const convertModuleName = getModuleNameById(moduleName);
    try {
        let response;
        const storedPermissionData = getItemLocalStorage('managePermissionALU');
        if (!storedPermissionData) {
            const apiUrl = `${ROLE_PERMISSION_ENDPOINT}/${access_role_id}`;
            response = await fetchDataFromApi(apiUrl, 'GET');
            setItemLocalStorage('managePermissionALU', response); // Set item in localStorage
        } else {
            if (storedPermissionData) {
                response = getItemLocalStorage('managePermissionALU');
            }
        }

        const roleOneData = response?.filter(item => item.role_id === getRoleID && item.module_id === convertModuleName);
        if (roleOneData?.length > 0) {
            const specificAccessTypeValue = roleOneData[0][accessType];
            // console.log(`${accessType} Value:`, specificAccessTypeValue);
            return specificAccessTypeValue !== undefined ? specificAccessTypeValue : 0;
        }

    } catch (error) {
        console.error('Error in managePermission:', error);
    }
    return 0;
};

// Manage Permission
export const usePermissions = (moduleName) => {
    const [permissions, setPermissions] = useState({
        addAccessPermission: 0,
        updateAccessPermission: 0,
        readAccessPermission: 0,
        deleteAccessPermission: 0,
    });

    const [permissionsFetched, setPermissionsFetched] = useState(false);

    useEffect(() => {
        const fetchUserPermissions = async () => {
            try {
                const addAccessPermission = await managePermission(moduleName, 'add_access');
                const updateAccessPermission = await managePermission(moduleName, 'update_access');
                const readAccessPermission = await managePermission(moduleName, 'read_access');
                const deleteAccessPermission = await managePermission(moduleName, 'delete_access');

                setPermissions({
                    addAccessPermission,
                    updateAccessPermission,
                    readAccessPermission,
                    deleteAccessPermission,
                });
                setPermissionsFetched(true);
            } catch (error) {
                // Handle errors appropriately
                console.error(`Error fetching permissions: ${error}`);
            }
        };

        fetchUserPermissions(); // Call the async function immediately
    }, [moduleName]);


    return { permissions, permissionsFetched };
};