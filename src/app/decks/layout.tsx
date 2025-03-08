"use client"

import React from 'react';
import { getCurrentUser } from '@/pages/api/auth/remote';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	// const router = useRouter();
	// const user = getCurrentUser();
	// if (!user) {
	// 	router.push('/login');
	// }

	return (
		<div>
			{children}
		</div>
	)
}