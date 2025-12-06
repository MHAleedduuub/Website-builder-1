import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { MongoClient } from 'mongodb'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'الطريقة غير مسموحة' })
  }

  const { email, password } = req.body

  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI)
    const db = client.db()
    
    // البحث عن المستخدم
    const user = await db.collection('users').findOne({ email })
    
    if (!user) {
      await client.close()
      return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' })
    }
    
    // التحقق من كلمة المرور
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      await client.close()
      return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' })
    }
    
    // إنشاء token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    await client.close()
    
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
    
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم', error: error.message })
  }
}
