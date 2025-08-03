import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Đăng ký plugin ScrollTrigger của GSAP
gsap.registerPlugin(ScrollTrigger);


// ===================================================================================
// 🎨 CSS STYLES - GIỮ NGUYÊN CSS CỦA BẠN VÀ THÊM VÀO CANVAS
// ===================================================================================
const styles = `
/* CSS gốc của bạn ở đây... */
:root {
  --gold-color: #d4af37;
  --gold-light: #f4d03f;
  --dark-bg: #0a0a0a;
  --text-color: #ccc;
  --font-heading: 'Cinzel', serif;
  --font-body: 'Roboto', sans-serif;
  --border-radius: 8px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --shadow-subtle: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-elevated: 0 8px 32px rgba(0, 0, 0, 0.4);
  --backdrop-blur: blur(12px);
}

* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  background-color: var(--dark-bg);
  color: var(--text-color);
  font-family: var(--font-body);
  overflow-x: hidden;
  line-height: 1.6;
}
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Roboto:wght@300;400;500&display=swap');

/* 👇 THÊM STYLE CHO CANVAS VÀ HERO SECTION 👇 */
.hero-section-wrapper {
  height: 100vh;
  width: 100%;
  position: relative;
  background-color: #000;
}

#particle-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.hero-section {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 40px;
  position: relative;
  z-index: 2; /* Đảm bảo nội dung hero nổi lên trên canvas */
}

/* Ẩn các phần tử hero ban đầu để GSAP animation */
.hero-logo, .hero-subtitle, .hero-description, .hero-actions {
  opacity: 0;
  transform: translateY(20px);
}

/* ... Toàn bộ CSS còn lại của bạn giữ nguyên ... */
.app-container {
  background: #000;
  position: relative;
  z-index: 2;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 20px 0;
  z-index: 1000;
  transition: var(--transition);
}
.navbar.scrolled {
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: var(--backdrop-blur);
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}
.nav-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.nav-logo {
  font-family: var(--font-heading);
  font-size: 2rem;
  color: white;
  font-weight: 700;
  text-decoration: none;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
  transition: var(--transition);
}
.nav-logo:hover {
  color: var(--gold-color);
  text-shadow: 0 0 20px rgba(212, 175, 55, 0.4);
}
.nav-menu {
  display: flex;
  gap: 32px;
  align-items: center;
}
.nav-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-family: var(--font-heading);
  font-size: 0.9rem;
  font-weight: 500;
  position: relative;
  padding: 8px 0;
  transition: var(--transition);
}
.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 1px;
  background: var(--gold-color);
  transition: var(--transition);
}
.nav-link:hover,
.nav-link.active {
  color: white;
}
.nav-link:hover::after,
.nav-link.active::after {
  width: 100%;
}
.pre-register-btn {
  background: linear-gradient(135deg, var(--gold-color), var(--gold-light));
  color: #000;
  padding: 12px 24px;
  border: none;
  border-radius: var(--border-radius);
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}
.pre-register-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.6s ease;
}
.pre-register-btn:hover::before {
  left: 100%;
}
.pre-register-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-elevated);
}
.content-section {
  padding: 120px 0;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 1.2s ease, transform 1.2s ease;
}
.content-section.is-visible {
  opacity: 1;
  transform: translateY(0);
}
.section-video-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
.section-video-background video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.3) contrast(1.1);
}
.section-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center center;
  background-attachment: fixed;
  z-index: 1;
  filter: brightness(0.4);
}
.section-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.5));
  z-index: 2;
}
.section-content {
  position: relative;
  z-index: 3;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}
.section-content.reversed {
  grid-template-columns: 1fr 1fr;
}
.text-content h2 {
  font-family: var(--font-heading);
  font-size: 2.8rem;
  color: white;
  margin-bottom: 24px;
  line-height: 1.1;
  text-shadow: 2px 2px 8px rgba(0,0,0,0.8);
  font-weight: 400;
}
.text-content p {
  line-height: 1.8;
  max-width: 500px;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
  font-size: 1.1rem;
  font-weight: 300;
}
.media-content {
  width: 100%;
  height: 400px;
  background: linear-gradient(135deg, #1a1a1a, #0a0a0a);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-elevated);
}
.media-content video,
.media-content img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--border-radius);
  transition: var(--transition);
}
.media-content:hover video,
.media-content:hover img {
  transform: scale(1.02);
}
.hero-logo {
  font-family: var(--font-heading);
  font-size: 5.5rem;
  color: white;
  margin-bottom: 16px;
  text-shadow: 3px 3px 6px rgba(0,0,0,0.8);
  font-weight: 400;
  letter-spacing: 2px;
}
.hero-subtitle {
  font-family: var(--font-heading);
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-bottom: 32px;
  color: var(--gold-color);
  text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
  font-size: 1.1rem;
  font-weight: 400;
}
.hero-description {
  max-width: 650px;
  margin: 0 auto 48px auto;
  font-size: 1.2rem;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
  font-weight: 300;
  line-height: 1.7;
}
.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}
.hero-actions button {
  padding: 16px 32px;
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 500;
  border-radius: var(--border-radius);
  transition: var(--transition);
  cursor: pointer;
}
.wishlist-btn {
  background: transparent;
  border: 2px solid var(--gold-color);
  color: var(--gold-color);
  position: relative;
  overflow: hidden;
}
.wishlist-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: var(--gold-color);
  transition: var(--transition);
  z-index: -1;
}
.wishlist-btn:hover::before {
  left: 0;
}
.wishlist-btn:hover {
  color: #000;
  transform: translateY(-2px);
  box-shadow: var(--shadow-elevated);
}
.gallery-section {
  padding: 120px 0;
  background: linear-gradient(135deg, #050505, #0a0a0a);
  position: relative;
  min-height: 100vh;
}
.gallery-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 40%, rgba(212, 175, 55, 0.03) 0%, transparent 50%);
  z-index: 1;
}
.gallery-tabs {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 64px;
  position: relative;
  z-index: 2;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: var(--backdrop-blur);
  border-radius: 16px;
  padding: 8px;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
  border: 1px solid rgba(212, 175, 55, 0.1);
}
.tab-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-family: var(--font-heading);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  padding: 12px 24px;
  border-radius: 12px;
  transition: var(--transition);
  position: relative;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.tab-btn:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.05);
}
.tab-btn.active {
  color: white;
  background: rgba(212, 175, 55, 0.15);
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.2);
}
.tab-content {
  min-height: 70vh;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  position: relative;
  z-index: 2;
}
.tab-content-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: opacity 0.8s ease-in-out;
  filter: brightness(0.2) blur(1px);
}
.tab-content .media-container {
  width: 100%;
  max-width: 100vw;
  aspect-ratio: 16/9;
  background: #000;
  border-radius: 2px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0,0,0,0.8);
  border: 1px solid rgba(212, 175, 55, 0.2);
}
.tab-content .media-container video,
.tab-content .media-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 2px;
  transition: var(--transition);
}
.tab-content .media-container:hover video,
.tab-content .media-container:hover img {
  transform: scale(1.02);
}
.carousel-container {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.carousel-nav {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 10;
  padding: 16px 24px;
}
.carousel-nav-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.carousel-nav-btn svg { /* Thêm style cho icon SVG */
  width: 18px;
  height: 18px;
}
.carousel-nav-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: scale(0);
  transition: var(--transition);
}
.carousel-nav-btn:hover::before {
  transform: scale(1);
}
.carousel-nav-btn:hover {
  color: white;
  border-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.05);
}
.carousel-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none;
}
.carousel-nav-btn:disabled:hover {
  border-color: rgba(255, 255, 255, 0.2);
  transform: none;
}
.carousel-nav-btn:disabled::before {
  transform: scale(0);
}
.carousel-thumbnails {
  display: flex;
  gap: 12px;
  width: 390px;
  justify-content: center;
  overflow: hidden;
}
.carousel-thumbnail {
  width: 120px;   /* Chỉnh kích thước thumbnail */
  height: 70px;  /* Chỉnh kích thước thumbnail (tỷ lệ 16:9) */
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  cursor: pointer;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}
.carousel-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 5px;
  transition: var(--transition);
  opacity: 0.7;
}
.carousel-thumbnail:hover {
  border-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.05);
}
.carousel-thumbnail:hover img {
  opacity: 1;
  transform: scale(1.1);
}
.carousel-thumbnail.active {
  border-color: var(--gold-color);
  box-shadow: 0 0 16px rgba(212, 175, 55, 0.3);
  background: rgba(212, 175, 55, 0.1);
}
.carousel-thumbnail.active img {
  opacity: 1;
}
.footer {
    padding: 60px 0;
    background: #000;
    border-top: 1px solid rgba(212, 175, 55, 0.1);
    text-align: center;
}
.footer-logo {
    font-family: var(--font-heading);
    font-size: 2rem;
    color: white;
    margin-bottom: 16px;
}
.footer-links {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-bottom: 24px;
}
.footer-links a {
    color: var(--text-color);
    text-decoration: none;
    font-family: var(--font-body);
    font-size: 0.9rem;
    transition: var(--transition);
}
.footer-links a:hover {
    color: var(--gold-color);
}
.footer-copyright {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.4);
}
@media (max-width: 1024px) {
  .container { padding: 0 20px; }
  .nav-content { padding: 0 20px; }
  .section-content { gap: 48px; }
  .text-content h2 { font-size: 2.4rem; }
  .tab-content .media-container { width: 95%; }
}
@media (max-width: 768px) {
  .hero-logo { font-size: 3.8rem; }
  .text-content h2 { font-size: 2rem; }
  .section-content { grid-template-columns: 1fr; gap: 32px; text-align: center; }
  .nav-menu { gap: 20px; }
  .gallery-tabs { flex-wrap: wrap; gap: 8px; padding: 12px; }
  .tab-btn { padding: 10px 16px; font-size: 0.85rem; }
  .carousel-nav { padding: 12px 16px; gap: 16px; }
  .carousel-nav-btn { width: 36px; height: 36px; }
  .carousel-nav-btn svg { width: 16px; height: 16px; }
  .carousel-thumbnails { width: 164px; gap: 8px; }
  .carousel-thumbnail { width: 48px; height: 28px; }
  .hero-actions { flex-direction: column; align-items: center; }
  .hero-actions button { width: 200px; }
}
@media (max-width: 480px) {
  .hero-logo { font-size: 3rem; }
  .hero-description { font-size: 1rem; margin-bottom: 32px; }
  .section-content { gap: 24px; }
  .media-content { height: 250px; }
  .tab-content .media-container { width: 98%; aspect-ratio: 16/10; }
  .carousel-thumbnails { display: none; }
  .carousel-nav { gap: 24px; }
}
`;

// ===================================================================================
// ✨ COMPONENT MỚI: HIỆU ỨNG HẠT 3D BẰNG THREE.JS
// ===================================================================================
const ParticleSystem = () => {
  const pointsRef = useRef();

  // Tạo ra vị trí ngẫu nhiên cho 5000 hạt trong một hình cầu bán kính 1.2
  const particles = useMemo(() => {
    const p = new Float32Array(5000 * 3);
    const radius = 1.2;
    for (let i = 0; i < p.length; i += 3) {
      const theta = THREE.MathUtils.randFloatSpread(360); 
      const phi = THREE.MathUtils.randFloatSpread(360); 
      p[i]     = radius * Math.sin(theta) * Math.cos(phi);
      p[i + 1] = radius * Math.sin(theta) * Math.sin(phi);
      p[i + 2] = radius * Math.cos(theta);
    }
    return p;
  }, []);

  // Animation cho các hạt và tương tác với chuột
  useFrame((state) => {
    const { clock, pointer } = state;
    if (pointsRef.current) {
        // Xoay tròn nhẹ nhàng
        pointsRef.current.rotation.y = clock.getElapsedTime() * 0.05;
        pointsRef.current.rotation.x = clock.getElapsedTime() * 0.02;

        // Tương tác với chuột: các hạt sẽ "né" con trỏ chuột
        const target = new THREE.Vector3(pointer.x * 0.5, pointer.y * 0.5, 0);
        pointsRef.current.position.lerp(target, 0.02);
    }
  });

  return (
    <Points ref={pointsRef} positions={particles} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color="#d4af37" // Màu vàng gold
        size={0.005}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
};


// ===================================================================================
// 🔧 REUSABLE & HELPER COMPONENTS - Giữ nguyên
// ===================================================================================
const useOnScreen = (ref) => {
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      { threshold: 0.1 }
    );
    let currentRef = ref.current;
    if (currentRef) { observer.observe(currentRef); }
    return () => { if (currentRef) { observer.unobserve(currentRef); } };
  }, [ref]);
  return isIntersecting;
};

const ContentSection = ({ id, backgroundImage, children, reversed = false }) => {
  const ref = useRef();
  const isVisible = useOnScreen(ref);

  return (
    <section id={id} ref={ref} className={`content-section ${isVisible ? 'is-visible' : ''}`}>
      {backgroundImage && (
        <div className="section-background" style={{ backgroundImage: `url(${backgroundImage})` }}></div>
      )}
      <div className="section-overlay"></div>
      <div className='container'>
        <div className={`section-content ${reversed ? 'reversed' : ''}`}>
          {children}
        </div>
      </div>
    </section>
  );
};


// ===================================================================================
// 🧱 PAGE SECTION COMPONENTS - NÂNG CẤP HERO SECTION
// ===================================================================================

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
  
    useEffect(() => {
      const handleScroll = () => {
        setScrolled(window.scrollY > 50);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);
  
    return (
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-content">
          <a href="#home" className="nav-logo">The Last Ember</a>
          <div className="nav-menu">
            <a href="#story" className="nav-link">BACKGROUND</a>
            <a href="#features" className="nav-link">FEATURES</a>
            <a href="#gallery" className="nav-link">GALLERY</a>
            <a href="#community" className="nav-link">COMMUNITY</a>
          </div>
          <button className="pre-register-btn">PRE-REGISTER</button>
        </div>
      </nav>
    );
  };

const HeroSection = ({ audioRef }) => {
    const heroRef = useRef(null);

    // ✨ WOW ANIMATION VỚI GSAP
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Tạo một timeline để các animation chạy tuần tự
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            tl.to('.hero-logo', { opacity: 1, y: 0, duration: 1.2, delay: 0.5 })
              .to('.hero-subtitle', { opacity: 1, y: 0, duration: 1 }, "-=0.8")
              .to('.hero-description', { opacity: 1, y: 0, duration: 1 }, "-=0.8")
              .to('.hero-actions button', { opacity: 1, y: 0, duration: 0.8, stagger: 0.2 }, "-=0.6");
        }, heroRef);

        return () => ctx.revert(); // Cleanup
    }, []);
    
    // ✨ ĐIỀU KHIỂN ÂM THANH KHI CUỘN
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        
        // Bắt đầu phát khi component được mount
        // Trình duyệt có thể chặn tự động phát, cần tương tác của người dùng
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Audio autoplay was prevented. User interaction is needed.");
            // Có thể hiện một nút "Bật âm thanh" ở đây
          });
        }
        
        ScrollTrigger.create({
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top", // Khi đáy của hero chạm đỉnh viewport
            onEnter: () => gsap.to(audio, { volume: 1, duration: 1 }),
            onLeave: () => gsap.to(audio, { volume: 0, duration: 1 }),
            onEnterBack: () => gsap.to(audio, { volume: 1, duration: 1 }),
            onLeaveBack: () => gsap.to(audio, { volume: 0, duration: 1 }),
        });

    }, [audioRef]);

    return (
        <div ref={heroRef} className="hero-section-wrapper">
            <Canvas id="particle-canvas" camera={{ position: [0, 0, 2.5] }}>
                <Suspense fallback={null}>
                    <ParticleSystem />
                </Suspense>
            </Canvas>
            <section id="home" className="hero-section">
                <div className="hero-logo">The Last Ember</div>
                <div className="hero-subtitle">FORGE YOUR DESTINY IN A WORLD OF MYTH</div>
                <p className="hero-description">
                    A groundbreaking open-world RPG. When the ancient flame dwindles, darkness encroaches. Embark on an epic journey through mystical lands, confront forgotten gods, and decide the fate of a world born from legend.
                </p>
                <div className="hero-actions">
                    <button className="pre-register-btn">PRE-REGISTER</button>
                    <button className="wishlist-btn">WISHLIST NOW</button>
                </div>
            </section>
        </div>
    );
};

// ... Các section khác giữ nguyên ...

const StorySection = () => (
    <ContentSection id="story" backgroundImage="https://images.unsplash.com/photo-1534295399540-38883651362a?auto=format&fit=crop&w=2000&q=80" reversed>
      <div className="text-content">
        <h2>A FADING LIGHT, A RISING HERO</h2>
        <p>
          "The Last Ember" is an epic open-world action-adventure RPG set in a fantasy realm inspired by the rich legends of ancient Việt Nam. You are the chosen one, destined to seek the remnants of a divine fire before it is extinguished forever, plunging the world into eternal night.
        </p>
      </div>
      <div className="media-content">
        <video src="https://videos.pexels.com/video-files/7578277/7578277-uhd_2560_1440_24fps.mp4" autoPlay loop muted playsInline />
      </div>
    </ContentSection>
  );
  
  const FeatureSection1 = () => (
    <ContentSection id="features" backgroundImage="https://images.unsplash.com/photo-1605405332448-345a6d354b3c?auto=format&fit=crop&w=2000&q=80">
      <div className="media-content" style={{ order: 1 }}>
        <video src="https://videos.pexels.com/video-files/5985167/5985167-uhd_2560_1440_25fps.mp4" autoPlay loop muted playsInline />
      </div>
      <div className="text-content" style={{ order: 2, paddingLeft: '2rem' }}>
        <h2>A VAST, LIVING WORLD AWAITS</h2>
        <p>
          Explore sprawling jungles, mystical temples, and vibrant cities. The world of "The Last Ember" is a seamless tapestry of breathtaking landscapes and hidden secrets, where every path holds a new adventure and every NPC has a story to tell.
        </p>
      </div>
    </ContentSection>
  );
  
  const FeatureSection2 = () => (
    <ContentSection backgroundImage="https://images.unsplash.com/photo-1598154922578-1a5c46830686?auto=format&fit=crop&w=2000&q=80" reversed>
      <div className="text-content">
        <h2>MASTER THE ART OF SPIRIT COMBAT</h2>
        <p>
          Build your unique fighting style by mastering a variety of weapons and harnessing powerful elemental magic. The fluid, responsive combat system allows for creative combos, tactical dodges, and devastating finishing moves.
        </p>
      </div>
      <div className="media-content">
        <video src="https://videos.pexels.com/video-files/7578077/7578077-hd_1920_1080_25fps.mp4" autoPlay loop muted playsInline />
      </div>
    </ContentSection>
  );

  const galleryData = {
    world: {
      background: "https://c4.wallpaperflare.com/wallpaper/980/893/115/fantasy-art-artwork-digital-art-forest-long-hair-hd-wallpaper-preview.jpg",
      type: 'video',
      media: "https://videos.pexels.com/video-files/3129957/3129957-uhd_2560_1440_25fps.mp4",
    },
    combat: {
      background: "https://c4.wallpaperflare.com/wallpaper/491/798/436/digital-art-artwork-concept-art-fantasy-art-warrior-hd-wallpaper-preview.jpg",
      type: 'carousel',
      media: [
        "https://c4.wallpaperflare.com/wallpaper/865/492/937/fantasy-art-artwork-warrior-digital-art-wallpaper-preview.jpg",
        "https://c4.wallpaperflare.com/wallpaper/324/520/1000/fantasy-art-warrior-knight-artwork-wallpaper-preview.jpg",
        "https://c4.wallpaperflare.com/wallpaper/135/291/715/fantasy-art-warrior-magic-artwork-wallpaper-preview.jpg",
      ],
    },
    story: {
      background: "https://c4.wallpaperflare.com/wallpaper/246/494/395/fantasy-art-artwork-digital-art-man-woman-hd-wallpaper-preview.jpg",
      type: 'video',
      media: "https://videos.pexels.com/video-files/3129957/3129957-uhd_2560_1440_25fps.mp4",
    },
    creatures: {
      background: "https://c4.wallpaperflare.com/wallpaper/986/679/651/dragon-fantasy-art-artwork-digital-art-wallpaper-preview.jpg",
      type: 'carousel',
      media: [
          "https://c4.wallpaperflare.com/wallpaper/643/522/453/fantasy-art-artwork-dragon-digital-art-wallpaper-preview.jpg",
          "https://c4.wallpaperflare.com/wallpaper/896/689/229/fantasy-art-artwork-dragon-digital-art-wallpaper-preview.jpg",
          "https://c4.wallpaperflare.com/wallpaper/442/1012/990/fantasy-art-artwork-dragon-digital-art-wallpaper-preview.jpg",
      ],
    },
  };

  const Carousel = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
  
    const goToPrevious = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    const goToNext = () => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    const goToSlide = (index) => setCurrentIndex(index);
  
    return (
      <div className="carousel-container media-container">
        <img src={images[currentIndex]} alt={`Slide ${currentIndex + 1}`} />
        <div className="carousel-nav">
          <button onClick={goToPrevious} className="carousel-nav-btn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div className="carousel-thumbnails">
            {images.map((imgSrc, index) => (
              <div key={index} className={`carousel-thumbnail ${currentIndex === index ? 'active' : ''}`} onClick={() => goToSlide(index)}>
                <img src={imgSrc} alt={`Thumbnail ${index + 1}`} />
              </div>
            ))}
          </div>
          <button onClick={goToNext} className="carousel-nav-btn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    );
  };
  
  const GallerySection = () => {
    const [activeTab, setActiveTab] = useState('world');
    const [background, setBackground] = useState(galleryData[activeTab].background);
  
    const handleTabClick = (tab) => {
      setActiveTab(tab);
      setBackground(galleryData[tab].background);
    };
    
    const ref = useRef();
    const isVisible = useOnScreen(ref);
  
    const activeContent = galleryData[activeTab];
  
    return (
      <section id="gallery" ref={ref} className={`gallery-section ${isVisible ? 'is-visible' : ''}`}>
        <div className="tab-content-background" style={{ backgroundImage: `url(${background})`, opacity: 1 }}></div>
        <div className="section-overlay"></div>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        </div>
          <div className="gallery-tabs">
            {Object.keys(galleryData).map((tab) => (
              <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => handleTabClick(tab)}>
                {tab}
              </button>
            ))}
          </div>
          <div className="tab-content">
            {activeContent.type === 'video' ? (
              <div className="media-container">
                <video src={activeContent.media} autoPlay loop muted playsInline key={activeContent.media} />
              </div>
            ) : (
              <Carousel images={activeContent.media} />
            )}
          </div>
      </section>
    );
  };

  const Footer = () => (
    <footer id="community" className="footer">
        <div className="container">
            <div className="footer-logo">The Last Ember</div>
            <div className="footer-links">
                <a href="#">Support</a>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Social</a>
            </div>
            <p className="footer-copyright">
                © {new Date().getFullYear()} The Last Ember. All Rights Reserved. A Fictional Game Concept.
            </p>
        </div>
    </footer>
);


/** Component App Chính */
const App = () => {
  const audioRef = useRef(null);

  return (
    <>
      <style>{styles}</style>
      {/* 👇 THÊM THẺ AUDIO VÀO ĐÂY 👇 */}
      <audio ref={audioRef} src="/path/to/your/ambient-sound.mp3" loop />
      <div className="app-container">
        <Navbar />
        <main>
          <HeroSection audioRef={audioRef}/>
          <StorySection />
          <FeatureSection1 />
          <FeatureSection2 />
          <GallerySection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default App;