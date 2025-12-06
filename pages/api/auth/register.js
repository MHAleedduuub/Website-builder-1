import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { MongoClient } from 'mongodb'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'الطريقة غير مسموحة' })
  }

  const { name, email, password } = req.body

  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI)
    const db = client.db()
    
    // التحقق من وجود المستخدم
    const existingUser = await db.collection('users').findOne({ email })
    
    if (existingUser) {
      await client.close()
      return res.status(400).json({ message: 'البريد الإلكتروني مستخدم بالفعل' })
    }
    
    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // إنشاء مستخدم جديد
    const newUser = {
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      projects: []
    }
    
    const result = await db.collection('users').insertOne(newUser)
    
    // إنشاء token
    const token = jwt.sign(
      { userId: result.insertedId, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    await client.close()
    
    res.status(201).json({
      token,
      user: {
        id: result.insertedId,
        name,
        email
      }
    })
    
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم', error: error.message })
  }
}
