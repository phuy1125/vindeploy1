// src/context/AdminAuthContext.tsx

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import jwt from 'jsonwebtoken'

interface AdminAuthContextType {
  isAdminLoggedIn: boolean
  adminId: string | null
  login: (token: string) => void
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [adminId, setAdminId] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      try {
        const decoded = jwt.decode(token) as { adminId: string }
        if (decoded?.adminId) {
          setIsAdminLoggedIn(true)
          setAdminId(decoded.adminId)
        }
      } catch {
        logout()
      }
    }
  }, [])

  const login = (token: string) => {
    localStorage.setItem('adminToken', token)
    const decoded = jwt.decode(token) as { adminId: string }
    if (decoded?.adminId) {
      setIsAdminLoggedIn(true)
      setAdminId(decoded.adminId)
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    setIsAdminLoggedIn(false)
    setAdminId(null)
  }

  return (
    <AdminAuthContext.Provider value={{ isAdminLoggedIn, adminId, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (!context) throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  return context
}