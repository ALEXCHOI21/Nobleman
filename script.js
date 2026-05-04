// Supabase Configuration
const SUPABASE_URL = 'https://bxtrfsjcxknmbopctvaw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dHJmc2pjeGtubWJvcGN0dmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMjAzNTAsImV4cCI6MjA4Njc5NjM1MH0.T95GvNYbpVU7um3WW2eyqikgWDn-dwsQ3zPxTM4rfhM';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Initial Page Load Animations
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
    
    checkSession();
});

// Section Entrance Animations
function initScrollAnimations() {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        if (section.id === 'hero') return;
        gsap.set(section, { opacity: 0, y: 50 });
        gsap.to(section, {
            scrollTrigger: {
                trigger: section,
                start: 'top 90%',
                toggleActions: 'play none none none'
            },
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: 'power3.out'
        });
    });
}
initScrollAnimations();

// --- Auth Logic ---
function openLogin() { document.getElementById('loginModal').style.display = 'block'; }
function closeLogin() { document.getElementById('loginModal').style.display = 'none'; }

async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        fetchSecureData();
    }
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const msg = document.getElementById('loginMessage');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        msg.textContent = '인증 실패: ' + error.message;
    } else {
        msg.style.color = '#64FFDA';
        msg.textContent = '인증 성공! 데이터를 불러옵니다...';
        setTimeout(() => {
            closeLogin();
            fetchSecureData();
        }, 1000);
    }
});

// --- Secure Data Fetching ---
async function fetchSecureData() {
    // 1. Fetch Profile
    const { data: profiles, error: pError } = await supabase.from('nobleman_profile').select('*').limit(1);
    if (profiles && profiles.length > 0) renderProfile(profiles[0]);

    // 2. Fetch Gallery
    const { data: gallery, error: gError } = await supabase.from('nobleman_gallery').select('*');
    if (gallery) renderGallery(gallery);
}

function renderProfile(profile) {
    const container = document.getElementById('profile');
    const careerHtml = profile.career_list.map(item => `<li><i class="fas fa-check-circle"></i> ${item}</li>`).join('');
    
    container.innerHTML = `
        <div class="container profile-flex">
            <div class="profile-image">
                <img src="assets/슬라이드3.PNG" alt="박지혜 원장">
                <div class="cert-badge">International Master</div>
            </div>
            <div class="profile-text">
                <div class="section-title" style="text-align: left;">
                    <h2>${profile.name} 원장</h2>
                    <span style="margin: 0;"></span>
                </div>
                <h3>${profile.title}</h3>
                <p>${profile.bio}</p>
                <ul class="career-list">${careerHtml}</ul>
            </div>
        </div>
    `;
    gsap.from('#profile .container', { opacity: 0, y: 20, duration: 1 });
}

function renderGallery(items) {
    const content = document.getElementById('gallery-content');
    content.classList.remove('secure-content');
    content.innerHTML = `
        <div class="comparison-container">
            ${items.map((item, idx) => `
                <div class="comparison-item glass-card">
                    <h3>${item.category} 시술</h3>
                    <div class="ba-slider" id="slider-${idx}">
                        <div class="after-image" style="background-image: url('${item.after_url}');"></div>
                        <div class="before-image" style="background-image: url('${item.before_url}'); filter: brightness(0.7) contrast(1.2);"></div>
                        <input type="range" min="0" max="100" value="50" class="slider" oninput="moveSlider(this)">
                        <div class="slider-button"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    gsap.from('.comparison-item', { opacity: 0, scale: 0.9, stagger: 0.2, duration: 1 });
}

// Comparison Slider Logic
function moveSlider(e) {
    const sliderValue = e.value;
    const sliderContainer = e.parentElement;
    const beforeImage = sliderContainer.querySelector('.before-image');
    const sliderButton = sliderContainer.querySelector('.slider-button');
    beforeImage.style.width = sliderValue + '%';
    sliderButton.style.left = sliderValue + '%';
}

// --- Common UI ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    });
});

window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.background = 'rgba(2, 12, 27, 0.95)';
        header.style.padding = '15px 0';
    } else {
        header.style.background = 'rgba(2, 12, 27, 0.85)';
        header.style.padding = '20px 0';
    }
});
