const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// تسجيل مستخدم جديد
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // التحقق من وجود المستخدم
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'المستخدم موجود مسبقاً' });
        }
        
        // تشفير كلمة المرور
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // إنشاء مستخدم جديد
        user = new User({
            name,
            email,
            password: hashedPassword
        });
        
        await user.save();
        
        // إنشاء جلسة
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email
        };
        
        res.status(201).json({ 
            message: 'تم إنشاء الحساب بنجاح',
            user: req.session.user 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
});

// تسجيل الدخول
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // التحقق من وجود المستخدم
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'بيانات الدخول غير صحيحة' });
        }
        
        // التحقق من كلمة المرور
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'بيانات الدخول غير صحيحة' });
        }
        
        // إنشاء جلسة
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email
        };
        
        res.json({ 
            message: 'تم تسجيل الدخول بنجاح',
            user: req.session.user 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
});

// تسجيل الخروج
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'تم تسجيل الخروج بنجاح' });
});

module.exports = router;
