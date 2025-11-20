// app.js (جزء المسار GET /)

// ... (جميع عمليات الاستيراد والمكتبات) ...

// *******************************************************************
// 🚨 المسار المعدل: استقبال الرابط عبر GET مع بارامتر '?url=' وعرضه كـ HTML
app.get('/', async (req, res) => {
    const link = req.query.url; 

    // إذا لم يتم إرسال رابط
    if (!link) {
        // نعيد نموذج إدخال HTML بسيط أو رسالة ترحيب منسقة
        return res.send(`
            <!DOCTYPE html>
            <html lang="ar">
            <head>
                <meta charset="UTF-8">
                <title>معالج KOBY - API</title>
                <style>
                    body { font-family: Tahoma, sans-serif; text-align: center; margin: 50px; background-color: #f4f4f4; }
                    .container { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); max-width: 600px; margin: auto; }
                    input[type="text"] { width: 80%; padding: 10px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; }
                    button { padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>✨ معالج الروابط KOBY ✨</h1>
                    <p>الرجاء إدخال رابط الانستغرام للمعالجة:</p>
                    <form action="/" method="GET">
                        <input type="text" name="url" placeholder="ألصق رابط إنستغرام هنا..." required>
                        <button type="submit">معالجة الرابط</button>
                    </form>
                    <p>أو استخدم الرابط مباشرة: [رابط Vercel]/?url=...</p>
                </div>
            </body>
            </html>
        `);
    }

    // إذا تم إرسال رابط
    try {
        const result = await processInstagramLink(link); 
        
        // 🚨 هنا نقوم بتنسيق النتيجة JSON إلى HTML بدلاً من res.json(result)
        let htmlOutput = '<h1>✅ نتيجة المعالجة</h1>';
        htmlOutput += `<p><strong>الرابط المعالج:</strong> ${link}</p>`;
        htmlOutput += '<table border="1" style="width:100%; text-align: right; direction: rtl;">';
        
        // عرض البيانات بشكل منسق (مثال لبعض الحقول)
        if (result.medias && result.medias.length > 0) {
            htmlOutput += '<tr><th>العنصر</th><th>الرابط</th></tr>';
            result.medias.forEach((media, index) => {
                htmlOutput += `
                    <tr>
                        <td>محتوى #${index + 1} (${media.extension})</td>
                        <td><a href="${media.url}" target="_blank">رابط التنزيل</a></td>
                    </tr>
                `;
            });
        } else {
             htmlOutput += `<tr><td>الحالة</td><td>نجاح (لكن لم يتم العثور على وسائط محددة أو الخطأ التالي):</td></tr>`;
             htmlOutput += `<tr><td>البيانات الخام</td><td><pre>${JSON.stringify(result, null, 2)}</pre></td></tr>`;
        }

        htmlOutput += '</table>';
        
        // إرسال الرد المنسق
        res.send(
            `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>نتيجة KOBY</title><style>
            body { font-family: Tahoma, sans-serif; margin: 40px; background-color: #f4f4f4; }
            table { border-collapse: collapse; margin-top: 20px; } th, td { padding: 10px; }
            </style></head><body>${htmlOutput}</body></html>`
        );

    } catch (error) {
        // في حالة فشل الخادم
        res.status(500).send(`
            <h1>❌ خطأ في المعالجة</h1>
            <p>فشل الخادم في معالجة طلب المكتبة. تحقق من الرابط.</p>
            <p><strong>التفاصيل:</strong> ${error.message}</p>
        `);
    }
});
// ... (بقية الكود) ...
module.exports = app; 
