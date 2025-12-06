'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaEnvelope, FaLock, FaSignInAlt, FaGoogle, FaGithub } from 'react-icons/fa'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        // حفظ token
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // توجيه إلى لوحة التحكم
        router.push('/dashboard')
      } else {
        setError(data.message || 'حدث خطأ في تسجيل الدخول')
      }
    } catch (error) {
      setError('حدث خطأ في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">تسجيل الدخول</h1>
          <p className="text-gray-600">سجل دخولك لبدء إنشاء مواقعك</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">البريد الإلكتروني</label>
            <div className="relative">
              <FaEnvelope className="absolute right-3 top-3 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="example@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">كلمة المرور</label>
            <div className="relative">
              <FaLock className="absolute right-3 top-3 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="********"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FaSignInAlt />
                <span>تسجيل الدخول</span>
              </>
            )}
          </button>

          <div className="text-center">
            <Link href="/forgot-password" className="text-primary hover:underline">
              نسيت كلمة المرور؟
            </Link>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">أو</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FaGoogle className="text-red-500" />
              <span>Google</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FaGithub className="text-gray-800" />
              <span>GitHub</span>
            </button>
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              ليس لديك حساب؟{' '}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                سجل الآن
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
