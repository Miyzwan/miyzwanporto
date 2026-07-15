import React from 'react'
import type { Metadata } from 'next'
import AdminLogin from '@/components/admin/AdminLogin'

export const metadata: Metadata = {
  title: 'Admin Login — Portfolio',
}

export default function AdminPage() {
  return <AdminLogin />
}
