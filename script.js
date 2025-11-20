// 🔑 مفتاح API الخاص بك
const API_KEY = "AIzaSyCrF1miRs7BjnJBo7Zg_uEaU1dPaWa9Tp8"; 

const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-query');
const resultsContainer = document.getElementById('results-container');

// --- دالة تحويل مدة الفيديو من ISO 8601 ---
function convertDuration(isoDuration) {
    if (!isoDuration || isoDuration === 'P0D') return 'غير متوفر / بث مباشر';

    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 'غير متوفر';

    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);

    const parts = [];
    if (hours > 0) parts.push(hours + ' ساعة');
    if (minutes > 0 || (hours > 0 && seconds > 0)) parts.push(minutes + ' دقيقة');
    if (seconds > 0) parts.push(seconds + ' ثانية');

    // إذا كانت المدة أقل من دقيقة (مثلاً 30 ثانية)، نعرضها
    if (parts.length === 0 && (hours + minutes + seconds) > 0) {
        return seconds + ' ثانية';
    }
    // للحالات التي تكون فيها المدة صفرية أو ضئيلة جداً
    if (hours === 0 && minutes === 0 && seconds === 0) {
        return 'أقل من ثانية واحدة / بث مباشر';
    }

    return parts.join(' و ');
}

// --- دالة عرض رسائل الحالة ---
function displayMessage(message, className = 'initial-message') {
    resultsContainer.innerHTML = `<p class="${className}">${message}</p>`;
}

// --- دالة البحث الرئيسية ---
async function searchYoutube() {
    const query = searchInput.value.trim();
    if (query === "") {
        displayMessage("الرجاء إدخال كلمة للبحث 🧐.", 'initial-message');
        return;
    }

    displayMessage('<i class="fas fa-spinner fa-spin"></i> جاري البحث عن الفيديو، لحظة من فضلك...', 'loading-message');

    try {
        // 1. طلب البحث (نطلب نتيجة واحدة فقط)
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}&maxResults=1`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (searchData.items.length === 0) {
            displayMessage(`لم يتم العثور على أي فيديو لـ "${query}" 😔.`, 'initial-message');
            return;
        }

        const videoId = searchData.items[0].id.videoId; // الحصول على ID أول فيديو

        // 2. طلب التفاصيل (Videos Request)
        const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${API_KEY}`;
        const videosResponse = await fetch(videosUrl);
        const videosData = await videosResponse.json();

        const video = videosData.items[0]; // بيانات أول فيديو مفصلة

        // --- بناء وعرض النتيجة الوحيدة ---
        const title = video.snippet.title;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        // الحصول على أعلى جودة للصورة المصغرة المتاحة
        const thumbnailUrl = video.snippet.thumbnails.high ? video.snippet.thumbnails.high.url : 
                             video.snippet.thumbnails.medium ? video.snippet.thumbnails.medium.url :
                             video.snippet.thumbnails.default.url;

        const durationISO = video.contentDetails.duration;
        const durationText = convertDuration(durationISO);

        const html = `
            <div class="result-card">
                <div class="thumbnail-container">
                    <img src="${thumbnailUrl}" alt="صورة مصغرة للفيديو: ${title}">
                </div>
                <div class="card-content">
                    <h3>${title}</h3>
                    <a href="${videoUrl}" target="_blank">
                        <i class="fas fa-play-circle"></i> شاهد الفيديو على يوتيوب
                    </a>
                    <span class="duration">
                        <i class="far fa-clock"></i> المدة: ${durationText}
                    </span>
                </div>
            </div>
        `;

        resultsContainer.innerHTML = html;

    } catch (error) {
        console.error('Error fetching data from YouTube API:', error);
        displayMessage('❌ حدث خطأ! قد يكون مفتاح API غير صالح أو هناك مشكلة في الشبكة.', 'loading-message');
    }
}

// --- ربط الأحداث ---
searchButton.addEventListener('click', searchYoutube);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchYoutube();
    }
});