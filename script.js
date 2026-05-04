// Supabase Configuration
const SUPABASE_URL = 'https://bxtrfsjcxknmbopctvaw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dHJmc2pjeGtubWJvcGN0dmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMjAzNTAsImV4cCI6MjA4Njc5NjM1MH0.T95GvNYbpVU7um3WW2eyqikgWDn-dwsQ3zPxTM4rfhM';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global State
let allPosts = [];

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Initial Page Load
window.addEventListener('load', () => {
    const tl = gsap.timeline();
    gsap.set('.nav-links li, .hero-text h1, .hero-text p, .hero-btns, .hero-image', { opacity: 0, y: 20 });
    tl.to('.logo', { opacity: 1, duration: 0.1 })
      .to('.logo', { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' })
      .to('.nav-links li', { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: 'power3.out' }, '-=0.5')
      .to('.hero-text h1', { x: 0, y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, '-=0.5')
      .to('.hero-text p', { x: 0, y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, '-=0.8')
      .to('.hero-btns', { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.8')
      .to('.hero-image', { scale: 1, y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }, '-=1');
    
    fetchPublicData();
});

// --- Data Fetching ---
async function fetchPublicData() {
    try {
        // 1. Fetch Profile
        const { data: profiles } = await supabaseClient.from('nobleman_profile').select('*').limit(1);
        if (profiles && profiles.length > 0) renderProfile(profiles[0]);

        // 2. Fetch Gallery
        const { data: gallery } = await supabaseClient.from('nobleman_gallery').select('*');
        if (gallery) renderGallery(gallery);

        // 3. Fetch Posts
        const { data: posts } = await supabaseClient.from('nobleman_posts').select('*').order('created_at', { ascending: false });
        if (posts) {
            allPosts = posts; // Store globally
            renderPosts(posts);
        }
        
        initScrollAnimations();
    } catch (err) {
        console.error('Error loading data:', err);
    }
}

function renderProfile(profile) {
    const container = document.getElementById('profile-content');
    const careerHtml = profile.career_list.map(item => `<li><i class="fas fa-check-circle"></i> ${item}</li>`).join('');
    container.innerHTML = `
        <div class="profile-flex">
            <div class="profile-image"><img src="assets/슬라이드3.PNG" alt="박지혜 원장"><div class="cert-badge">International Master</div></div>
            <div class="profile-text">
                <div class="section-title" style="text-align: left;"><h2>${profile.name} 원장</h2><span style="margin: 0;"></span></div>
                <h3 style="color: var(--secondary-color); margin-bottom: 15px;">${profile.title}</h3>
                <p>${profile.bio}</p>
                <ul class="career-list">${careerHtml}</ul>
            </div>
        </div>
    `;
}

function renderGallery(items) {
    const content = document.getElementById('gallery-content');
    content.innerHTML = `<div class="comparison-container">${items.map((item, idx) => `
        <div class="comparison-item glass-card">
            <h3>${item.category}</h3>
            <div class="ba-slider" id="slider-${idx}">
                <div class="after-image" style="background-image: url('${item.after_url}');"></div>
                <div class="before-image" style="background-image: url('${item.before_url}'); filter: brightness(0.7) contrast(1.2);"></div>
                <input type="range" min="0" max="100" value="50" class="slider" oninput="moveSlider(this)">
                <div class="slider-button"></div>
            </div>
        </div>`).join('')}</div>`;
}

function renderPosts(posts) {
    const content = document.getElementById('blog-content');
    content.innerHTML = posts.map((post, index) => `
        <div class="blog-card" onclick="openPostByIndex(${index})" style="cursor: pointer;">
            <div class="blog-img"><img src="${post.image_url}" alt="${post.title}"></div>
            <div class="blog-info">
                <span class="blog-tag">${post.category}</span>
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <span class="btn-read-more">자세히 보기 <i class="fas fa-arrow-right"></i></span>
            </div>
        </div>`).join('');
    gsap.from('.blog-card', { opacity: 0, y: 30, stagger: 0.2, duration: 1 });
}

// --- Modal Handlers ---
window.openPostByIndex = function(index) {
    const post = allPosts[index];
    if (!post) return;

    const modal = document.getElementById('postModal');
    const content = document.getElementById('postDetailContent');
    
    content.innerHTML = `
        <span class="blog-tag">${post.category}</span>
        <h2 style="font-size: 2rem; margin-bottom: 20px; color: var(--secondary-color);">${post.title}</h2>
        <div style="width: 100%; height: 350px; border-radius: 15px; overflow: hidden; margin-bottom: 30px; border: 1px solid rgba(212,175,55,0.2);">
            <img src="${post.image_url}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div class="post-body" style="line-height: 1.8; color: #ddd; font-size: 1.1rem; white-space: pre-wrap; padding: 0 10px;">
            ${post.content}
        </div>
        <div style="margin-top: 40px; border-top: 1px solid rgba(212,175,55,0.1); padding-top: 30px; text-align: center;">
            <a href="https://open.kakao.com/o/sXXXXXXXX" target="_blank" class="btn-premium" style="display: inline-block;">원장님께 카톡 상담하기</a>
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
};

window.closePost = function() {
    document.getElementById('postModal').style.display = 'none';
    document.body.style.overflow = 'auto';
};

// Admin UI Handlers
window.openLogin = () => document.getElementById('loginModal').style.display = 'block';
window.closeLogin = () => document.getElementById('loginModal').style.display = 'none';

// Comparison Slider
window.moveSlider = (e) => {
    const sliderValue = e.value;
    const sliderContainer = e.parentElement;
    sliderContainer.querySelector('.before-image').style.width = sliderValue + '%';
    sliderContainer.querySelector('.slider-button').style.left = sliderValue + '%';
};

// Scroll Animations
function initScrollAnimations() {
    document.querySelectorAll('section').forEach(section => {
        if (section.id === 'hero') return;
        gsap.to(section, {
            scrollTrigger: { trigger: section, start: 'top 90%' },
            y: 0, opacity: 1, duration: 1.2, ease: 'power3.out'
        });
    });
}

// Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    });
});
