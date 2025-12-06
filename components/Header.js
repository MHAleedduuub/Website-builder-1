'use client'
import { useState, useEffect } from 'react'
import { FaRobot, FaUser, FaSignOutAlt, FaHome, FaMagic } from 'react-icons/fa'
import Link from 'next/link'

export default function Header() {
  const [user, setUser] = useState(null)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    // تحقق من وجود token
    const token = localStorage.getItem('token')
    if (token) {
      // هنا يمكنك فك تشفير token والحصول على بيانات المستخدم
      setUser({ name: 'المستخدم' })
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    window.location.href = '/'
  }

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FaRobot className="text-3xl text-primary" />
            <span className="text-2xl font-bold text-gray-800">AI Website Builder</span>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-primary">
              <FaHome />
              <span>الرئيسية</span>
            </Link>
            <Link href="/ai-builder" className="flex items-center space-x-2 text-gray-600 hover:text-primary">
              <FaMagic />
              <span>المنشئ الذكي</span>
            </Link>
            
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary"
                >
                  <FaUser />
                  <span>{user.name}</span>
                </button>
                {showMenu && (
                  <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2">
                    <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-100">
                      لوحة التحكم
                    </Link>
                    <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">
                      الملف الشخصي
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-right px-4 py-2 hover:bg-gray-100 text-red-600 flex items-center space-x-2"
                    >
                      <FaSignOutAlt />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link href="/login" className="btn-secondary">
                  تسجيل الدخول
                </Link>
                <Link href="/register" className="btn-primary">
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
