const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// إعدادات Multer لرفع الملفات
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const projectId = req.params.projectId || 'temp';
        const uploadPath = path.join(__dirname, '../uploads', projectId);
        fs.ensureDirSync(uploadPath);
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// الحصول على المشاريع
router.get('/', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'غير مصرح به' });
    }
    
    // في التطبيق الكامل، هنا نجلب المشاريع من قاعدة البيانات
    res.json({ projects: [] });
});

// إنشاء مشروع جديد
router.post('/', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'غير مصرح به' });
    }
    
    const { name, description, template } = req.body;
    const projectId = 'project_' + Date.now();
    
    // هنا يتم إنشاء مشروع في قاعدة البيانات
    res.json({ 
        message: 'تم إنشاء المشروع بنجاح',
        projectId 
    });
});

// رفع ملفات للمشروع
router.post('/:projectId/upload', upload.array('files', 10), (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'غير مصرح به' });
    }
    
    const files = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        path: file.path,
        size: file.size
    }));
    
    res.json({ 
        message: 'تم رفع الملفات بنجاح',
        files 
    });
});

// الحصول على ملفات المشروع
router.get('/:projectId/files', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'غير مصرح به' });
    }
    
    const projectId = req.params.projectId;
    const projectPath = path.join(__dirname, '../uploads', projectId);
    
    try {
        const files = fs.readdirSync(projectPath).map(filename => {
            const filePath = path.join(projectPath, filename);
            const stats = fs.statSync(filePath);
            
            return {
                name: filename,
                size: stats.size,
                modified: stats.mtime
            };
        });
        
        res.json({ files });
    } catch (error) {
        res.json({ files: [] });
    }
});

// حذف ملف
router.delete('/:projectId/files/:filename', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'غير مصرح به' });
    }
    
    const { projectId, filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', projectId, filename);
    
    try {
        fs.unlinkSync(filePath);
        res.json({ message: 'تم حذف الملف بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في حذف الملف' });
    }
});

module.exports = router;
