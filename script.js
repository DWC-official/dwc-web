// 1. APIのURLを貼り付けます（シングルクォーテーション '' の間に）
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbxUWlafN3CJrWzT12Pgv28TJebePl9SCg5a1eI_MmJPyP-lNH3gFaw8xZ3z9DMd9_g7/exec';

document.addEventListener('DOMContentLoaded', () => {
    // --- ヘッダー・フッターの読み込み ---
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            const headerContainer = document.getElementById('header-container');
            if (headerContainer) {
                headerContainer.innerHTML = data;
                initMobileMenu();
            }
        })
        .catch(error => console.error('ヘッダーの読み込みに失敗しました:', error));

    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            const footerContainer = document.getElementById('footer-container');
            if (footerContainer) footerContainer.innerHTML = data;
        })
        .catch(error => console.error('フッターの読み込みに失敗しました:', error));

    // --- アコーディオンの初期化 ---
    initAccordion();

    // --- スプレッドシート（GAS）からのデータ取得と表示 ---
    if (GAS_API_URL && GAS_API_URL !== 'あなたのウェブアプリのURLをここに貼り付けてください') {
        fetchGASData();
    }

    // --- スクロールアニメーションの初期化 ---
    initScrollAnimation();
});

// モバイルメニューの制御
function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('nav');
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('open');
            nav.classList.toggle('open');
        });
    }
}

// アコーディオンの制御
function initAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const isActive = header.classList.contains('active');
            
            // すべて閉じる
            document.querySelectorAll('.accordion-header').forEach(h => {
                h.classList.remove('active');
                h.setAttribute('aria-expanded', 'false');
                if(h.nextElementSibling) h.nextElementSibling.style.maxHeight = null;
            });
            
            // クリックされたものが閉じていた場合は開く
            if (!isActive) {
                header.classList.add('active');
                header.setAttribute('aria-expanded', 'true');
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
}

// GASデータ取得処理
function fetchGASData() {
    fetch(GAS_API_URL)
        .then(response => response.json())
        .then(data => {
            renderNews(data.news);
            renderSchedule(data.schedule);
        })
        .catch(error => {
            console.error('スプレッドシートデータの取得に失敗しました:', error);
        });
}

// 最新情報のレンダリング
function renderNews(newsData) {
    const newsList = document.getElementById('news-list');
    if (!newsList || !newsData) return;

    newsList.innerHTML = '';
    
    // データが空の場合
    if (newsData.length === 0) {
        newsList.innerHTML = '<li class="news-item">現在、新しいお知らせはありません。</li>';
        return;
    }

    // 重要アイテムと通常アイテムを分ける
    const importantItems = [];
    const normalItems = [];

    newsData.forEach(item => {
        if (item['タイトル'].includes('【重要】')) {
            importantItems.push(item);
        } else {
            normalItems.push(item);
        }
    });

    const sortedData = [...importantItems, ...normalItems];

    sortedData.forEach(item => {
        const li = document.createElement('li');
        li.className = 'news-item';
        
        const dateSpan = document.createElement('span');
        dateSpan.className = 'news-date';
        dateSpan.textContent = item['日付'];

        const titleSpan = document.createElement('span');
        titleSpan.className = 'news-title';
        
        let titleText = item['タイトル'];
        const isImportant = titleText.includes('【重要】');
        
        if (isImportant) {
            titleText = titleText.replace('【重要】', '').trim();
            const badge = document.createElement('span');
            badge.className = 'badge-important';
            badge.textContent = '重要';
            titleSpan.appendChild(badge);
        }
        
        if (item['リンクURL'] && item['リンクURL'].trim() !== '') {
            const a = document.createElement('a');
            a.href = item['リンクURL'];
            a.target = '_blank';
            a.textContent = titleText;
            titleSpan.appendChild(a);
        } else {
            titleSpan.appendChild(document.createTextNode(titleText));
        }

        li.appendChild(dateSpan);
        li.appendChild(titleSpan);
        newsList.appendChild(li);
    });
}

// 新歓スケジュールのレンダリング
function renderSchedule(scheduleData) {
    const scheduleList = document.getElementById('recruit-schedule-list');
    if (!scheduleList || !scheduleData) return;

    scheduleList.innerHTML = '';
    
    // データが空の場合
    if (scheduleData.length === 0) {
        scheduleList.innerHTML = '<li class="schedule-item">現在、予定されているイベントはありません。</li>';
        return;
    }

    scheduleData.forEach(item => {
        const li = document.createElement('li');
        li.className = 'schedule-item';
        
        const dateSpan = document.createElement('span');
        dateSpan.className = 'schedule-date';
        dateSpan.textContent = item['日付'];

        const titleSpan = document.createElement('span');
        titleSpan.className = 'schedule-title';
        titleSpan.textContent = item['イベント内容'];

        li.appendChild(dateSpan);
        li.appendChild(titleSpan);
        scheduleList.appendChild(li);
    });
}

// スクロール連動アニメーション（Intersection Observer）
function initScrollAnimation() {
    // '.fade-in-scroll' クラスを持つすべての要素を取得
    const scrollElements = document.querySelectorAll('.fade-in-scroll');
    if (scrollElements.length === 0) return;

    // 画面内に入ったときの処理
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            // 要素が画面の15%以上入ったら
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // 一度表示されたら監視を解除（何度もフワフワさせない）
                observer.unobserve(entry.target);
            }
        });
    };

    // Observerの設定（画面の下から15%入ったところで発火）
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -15% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // 各要素を監視対象に追加
    scrollElements.forEach(el => observer.observe(el));
}