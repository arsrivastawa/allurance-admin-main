'use client';
import { useRouter } from 'src/routes/hooks';
import React, { useEffect } from 'react';
const Page = () => {
    const router = useRouter();
    useEffect(() => {
        router.push('/auth/jwt/login/');
    }, [router]);

    return null;
}
export default Page;
