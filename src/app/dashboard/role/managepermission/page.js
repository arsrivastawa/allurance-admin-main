"use client"
import { useEffect, useState } from 'react';
import { ProductCreateView } from 'src/sections/role/managepermission';
import { ine_users_role_Permission_ModuleID } from 'src/utils/apiEndPoints';
import { getModulePermissions } from 'src/utils/commonFunction';

export default function ProductCreatePage() {
    const [permissions, setPermissions] = useState(null);
    useEffect(() => {
        const moduleId = ine_users_role_Permission_ModuleID; // Assuming you have a module ID
        const fetchPermissions = async () => {
            const modulePermissions = await getModulePermissions(moduleId);
            setPermissions(modulePermissions);
        };
        fetchPermissions();
    }, []);

    if (!permissions) {
        return <div>Loading...</div>;
    }

    const { read_access } = permissions;

    return read_access === 1 ? (
        <ProductCreateView permissions={permissions} />
    ) : (
        'Sorry, You do not have permission to access the features. Please try again later or contact the administrator.'
    );
}