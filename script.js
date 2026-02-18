document.addEventListener('DOMContentLoaded', () => {
    // Header Scroll Effect
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Scroll Reveal Animation
    const reveals = document.querySelectorAll('.scroll-reveal');
    const revealOnScroll = () => {
        reveals.forEach(el => {
            const windowHeight = window.innerHeight;
            const elementTop = el.getBoundingClientRect().top;
            const elementVisible = 150;
            if (elementTop < windowHeight - elementVisible) {
                el.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check

    // Smooth Scroll for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Media Management Logic ---
    const adminToggle = document.getElementById('admin-toggle');
    const galleryGrid = document.querySelector('.gallery-grid');
    const heroSection = document.getElementById('hero'); // Hero section added
    const addItemBtn = document.getElementById('add-item-btn');
    const hiddenFileInput = document.getElementById('hidden-file-input');

    // Adjustment Panel Elements
    const adjPanel = document.getElementById('adj-panel');
    const adjClose = document.getElementById('adj-close');
    const adjScale = document.getElementById('adj-scale');
    const adjPos = document.getElementById('adj-pos');

    let targetGalleryItem = null;
    let adjustingMedia = null;

    // Toggle Edit Mode
    adminToggle.addEventListener('click', () => {
        document.body.classList.toggle('edit-mode');
        adminToggle.classList.toggle('active');
        if (document.body.classList.contains('edit-mode')) {
            adminToggle.innerHTML = '<span>🛠️</span> 편집 모드 종료';
            alert('편집 모드입니다.\n1. 사진을 클릭하여 정밀 조정(크기/위치) 하세요.\n2. 히어로 배경이나 갤러리 사진 모두 조절 가능합니다.');
        } else {
            adminToggle.innerHTML = '<span>⚙️</span> 편집 모드 시작';
            adjPanel.style.display = 'none';
        }
    });

    // Handle Gallery & Hero Clicks
    const handleMediaClick = (e) => {
        if (!document.body.classList.contains('edit-mode')) return;

        const galleryItem = e.target.closest('.gallery-item');
        const heroWrapper = e.target.closest('.hero-image-wrapper');

        if (!galleryItem && !heroWrapper) return;

        // Delete Logic (only for gallery)
        if (galleryItem && e.target.classList.contains('delete-btn')) {
            if (confirm('해당 항목을 삭제하시겠습니까?')) {
                galleryItem.remove();
                adjPanel.style.display = 'none';
            }
            return;
        }

        // Show Adjustment Panel & Track Element
        targetGalleryItem = galleryItem || heroWrapper;
        adjustingMedia = targetGalleryItem.querySelector('img, video');

        // Accurate value extraction
        let currentScale = 1;
        let currentPosY = 0;

        if (adjustingMedia.style.transform) {
            const scaleMatch = adjustingMedia.style.transform.match(/scale\((.*?)\)/);
            if (scaleMatch) currentScale = scaleMatch[1];
        }

        if (adjustingMedia.style.objectPosition) {
            // Check for both 'top' name or pure percentage
            const posMatch = adjustingMedia.style.objectPosition.match(/(\d+)%/g);
            if (posMatch && posMatch.length >= 2) {
                currentPosY = posMatch[1].replace('%', '');
            } else if (posMatch && posMatch.length === 1) {
                currentPosY = posMatch[0].replace('%', '');
            }
        }

        adjScale.value = currentScale;
        adjPos.value = currentPosY;
        adjPanel.style.display = 'block';
    };

    galleryGrid.addEventListener('click', handleMediaClick);
    heroSection.addEventListener('click', handleMediaClick); // Hero support

    // Handle Sliders
    adjScale.addEventListener('input', () => {
        if (adjustingMedia) {
            adjustingMedia.style.transform = `scale(${adjScale.value})`;
        }
    });

    adjPos.addEventListener('input', () => {
        if (adjustingMedia) {
            // Use 50% for X, adjusted value for Y
            adjustingMedia.style.objectPosition = `50% ${adjPos.value}%`;
        }
    });

    adjClose.addEventListener('click', () => {
        adjPanel.style.display = 'none';
        adjustingMedia = null;
    });

    // Optional: Add File Change button to Panel
    const changeBtn = document.createElement('button');
    changeBtn.innerHTML = '📂 파일 교체하기';
    changeBtn.style.cssText = 'width: 100%; margin-top: 10px; padding: 0.8rem; background: #f0f0f0; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 0.85rem;';
    changeBtn.addEventListener('click', () => hiddenFileInput.click());

    // Clean up existing buttons if any (to prevent duplicates)
    const existingBtn = adjPanel.querySelector('.file-change-btn');
    if (existingBtn) existingBtn.remove();
    changeBtn.classList.add('file-change-btn');
    adjPanel.querySelector('.adj-body').appendChild(changeBtn);

    // Handle Add New Item
    addItemBtn.addEventListener('click', () => {
        targetGalleryItem = 'new';
        hiddenFileInput.click();
    });

    // Process Uploaded File
    hiddenFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            const isVideo = file.type.startsWith('video/');

            if (targetGalleryItem === 'new') {
                createGalleryItem(dataUrl, isVideo);
            } else if (targetGalleryItem) {
                const mediaElement = targetGalleryItem.querySelector('img, video');
                if ((isVideo && mediaElement.tagName === 'IMG') || (!isVideo && mediaElement.tagName === 'VIDEO')) {
                    // Replace element if type changes
                    const newMedia = isVideo ? document.createElement('video') : document.createElement('img');
                    if (isVideo) {
                        newMedia.src = dataUrl;
                        newMedia.controls = true;
                        newMedia.autoplay = true;
                        newMedia.muted = true;
                        newMedia.loop = true;
                    } else {
                        newMedia.src = dataUrl;
                    }
                    mediaElement.replaceWith(newMedia);
                } else {
                    mediaElement.src = dataUrl;
                }
            }
            hiddenFileInput.value = ''; // Reset input
        };
        reader.readAsDataURL(file);
    });

    function createGalleryItem(src, isVideo) {
        const newItem = document.createElement('div');
        newItem.className = 'gallery-item';

        let mediaHtml = isVideo
            ? `<video src="${src}" controls autoplay muted loop></video>`
            : `<img src="${src}" alt="새로운 콘텐츠">`;

        newItem.innerHTML = `
            ${mediaHtml}
            <button class="delete-btn">×</button>
        `;

        galleryGrid.appendChild(newItem);
    }
});
