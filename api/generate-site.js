const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event, context) => {
    // التحقق من أن الطريقة POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'الطريقة غير مسموحة' })
        };
    }

    try {
        const body = JSON.parse(event.body);
        const { description, style, features, pages } = body;
        
        // التحقق من وجود مفتاح API
        if (!process.env.GEMINI_API_KEY) {
            return {
                statusCode: 500,
                body: JSON.stringify({ 
                    message: 'مفتاح Gemini API غير موجود',
                    note: 'يرجى إضافة مفتاح API في إعدادات Netlify'
                })
            };
        }
        
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `أنت مطور ويب محترف. قم بإنشاء كود HTML و CSS و JavaScript كامل لموقع ويب باللغة العربية مع التالي:
        
        وصف الموقع: ${description}
        النمط التصميمي: ${style}
        الميزات المطلوبة: ${features.join(', ')}
        الصفحات المطلوبة: ${pages.join(', ')}
        
        أرجو تقديم الكود الكامل فقط.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generatedCode = response.text();
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
                message: 'تم إنشاء الموقع بنجاح',
                code: generatedCode,
                projectId: 'netlify_' + Date.now()
            })
        };
        
    } catch (error) {
        console.error('Error:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'حدث خطأ في إنشاء الموقع',
                error: error.message 
            })
        };
    }
};
