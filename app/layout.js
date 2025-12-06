import './globals.css'

export const metadata = {
  title: 'بناء مواقع بالذكاء الاصطناعي',
  description: 'أنشئ موقعك الإلكتروني بالذكاء الاصطناعي في دقائق',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  )
}
