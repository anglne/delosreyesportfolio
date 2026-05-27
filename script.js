document.addEventListener('DOMContentLoaded', function () {

    // ======================
    // CURSOR — magnetic dot + trailing ring
    // ======================
    const cursor = document.getElementById('cursor');
    const ring = document.getElementById('cursor-ring');
    let mx = 0, my = 0, rx = 0, ry = 0;
    let cursorVisible = false;

    document.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
        if (cursor) {
            cursor.style.left = mx + 'px';
            cursor.style.top  = my + 'px';
        }
        if (!cursorVisible) {
            cursorVisible = true;
            if (cursor) cursor.style.opacity = '1';
            if (ring)   ring.style.opacity   = '1';
        }
    });

    (function animRing() {
        rx += (mx - rx) * 0.1;
        ry += (my - ry) * 0.1;
        if (ring) {
            ring.style.left = rx + 'px';
            ring.style.top  = ry + 'px';
        }
        requestAnimationFrame(animRing);
    })();

    // cursor state on interactive elements
    document.querySelectorAll('a, button, .project-card, .edu-card, .highlight-card, .social-link').forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (cursor) cursor.style.transform = 'translate(-50%,-50%) scale(2.5)';
            if (ring)   ring.style.transform   = 'translate(-50%,-50%) scale(1.4)';
        });
        el.addEventListener('mouseleave', () => {
            if (cursor) cursor.style.transform = 'translate(-50%,-50%) scale(1)';
            if (ring)   ring.style.transform   = 'translate(-50%,-50%) scale(1)';
        });
    });

    // ======================
    // NAVIGATION SCROLL + ACTIVE LINKS
    // ======================
    const nav = document.getElementById('nav');
    const allSections = document.querySelectorAll('section');
    const allNavLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
        let cur = '';
        allSections.forEach(s => {
            if (window.scrollY >= s.offsetTop - 160) cur = s.id;
        });
        allNavLinks.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
        });
    }, { passive: true });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (target) {
                e.preventDefault();
                window.scrollTo({ top: target.offsetTop - 72, behavior: 'smooth' });
            }
            const nl = document.getElementById('navLinks');
            if (nl) nl.classList.remove('open');
        });
    });

    // Mobile toggle
    const tog = document.getElementById('mobileToggle');
    const nl  = document.getElementById('navLinks');
    if (tog && nl) {
        tog.addEventListener('click', () => {
            nl.classList.toggle('open');
            const icon = tog.querySelector('i');
            if (icon) icon.className = nl.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
        });
    }

    // ======================
    // CERTIFICATE SLIDER
    // ======================
    const carousel = document.getElementById('carousel');
    const prevBtn  = document.getElementById('prevBtn');
    const nextBtn  = document.getElementById('nextBtn');
    if (carousel && prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => carousel.scrollBy({ left: -480, behavior: 'smooth' }));
        nextBtn.addEventListener('click', () => carousel.scrollBy({ left:  480, behavior: 'smooth' }));
    }

    // ======================
    // CERTIFICATE MODAL
    // ======================
    const modal  = document.getElementById('certModal');
    const mImg   = document.getElementById('modalImg');
    const mClose = document.getElementById('modalClose');

    document.querySelectorAll('.carousel-track a').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            if (modal && mImg) {
                mImg.src = a.dataset.img;
                modal.classList.add('open');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    const closeModal = () => {
        if (modal) modal.classList.remove('open');
        document.body.style.overflow = '';
    };
    if (mClose) mClose.addEventListener('click', closeModal);
    if (modal)  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    // ======================
    // SCROLL REVEAL (Intersection Observer)
    // ======================
    const revealEls = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(en => {
            if (en.isIntersecting) {
                en.target.classList.add('in-view');
                revealObserver.unobserve(en.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));

    // ======================
    // TEXT SCRAMBLE — hero name
    // ======================
    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}—=+*^?#@$%ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            this.update = this.update.bind(this);
        }
        setText(newText) {
            const old = this.el.innerText;
            const len = Math.max(old.length, newText.length);
            return new Promise(resolve => {
                this.queue = [];
                for (let i = 0; i < len; i++) {
                    const from  = old[i]    || '';
                    const to    = newText[i] || '';
                    const start = Math.floor(Math.random() * 20);
                    const end   = start + Math.floor(Math.random() * 20);
                    this.queue.push({ from, to, start, end });
                }
                cancelAnimationFrame(this.frameReq);
                this.frame   = 0;
                this.resolve = resolve;
                this.update();
            });
        }
        update() {
            let output = '', complete = 0;
            for (let i = 0; i < this.queue.length; i++) {
                const { from, to, start, end } = this.queue[i];
                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!this.queue[i].char || Math.random() < 0.28) {
                        this.queue[i].char = this.chars[Math.floor(Math.random() * this.chars.length)];
                    }
                    output += `<span style="color:var(--primary-pink);opacity:.7">${this.queue[i].char}</span>`;
                } else {
                    output += from;
                }
            }
            this.el.innerHTML = output;
            if (complete !== this.queue.length) {
                this.frameReq = requestAnimationFrame(this.update);
                this.frame++;
            } else {
                this.resolve();
            }
        }
    }

    // Apply scramble to the hero name span on load
    const heroNameEl = document.querySelector('.hero-main-content h1 span');
    if (heroNameEl) {
        const originalName = heroNameEl.innerText;
        const scrambler    = new TextScramble(heroNameEl);
        setTimeout(() => scrambler.setText(originalName), 600);

        // Re-scramble on hover
        heroNameEl.addEventListener('mouseenter', () => scrambler.setText(originalName));
    }

    // ======================
    // MAGNETIC BUTTONS — social links & CTA
    // ======================
    function addMagnet(selector, strength = 0.35) {
        document.querySelectorAll(selector).forEach(el => {
            el.addEventListener('mousemove', function (e) {
                const rect = this.getBoundingClientRect();
                const cx   = rect.left + rect.width  / 2;
                const cy   = rect.top  + rect.height / 2;
                const dx   = (e.clientX - cx) * strength;
                const dy   = (e.clientY - cy) * strength;
                this.style.transform = `translate(${dx}px, ${dy}px)`;
            });
            el.addEventListener('mouseleave', function () {
                this.style.transform = '';
                this.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
                setTimeout(() => this.style.transition = '', 500);
            });
        });
    }
    addMagnet('.social-link', 0.4);
    addMagnet('.slider-arrow', 0.3);

    // ======================
    // 3-D TILT on cards
    // ======================
    function addTilt(selector, intensity = 15) {
        document.querySelectorAll(selector).forEach(card => {
            card.addEventListener('mousemove', function (e) {
                const rect  = this.getBoundingClientRect();
                const px    = (e.clientX - rect.left) / rect.width  - 0.5;
                const py    = (e.clientY - rect.top)  / rect.height - 0.5;
                const rotX  =  py * -intensity;
                const rotY  =  px *  intensity;
                this.style.transform    = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
                this.style.transition   = 'transform 0.1s ease';
                // dynamic shine
                const shine = this.querySelector('.tilt-shine');
                if (shine) {
                    shine.style.background = `radial-gradient(circle at ${(px + 0.5) * 100}% ${(py + 0.5) * 100}%, rgba(255,255,255,0.08) 0%, transparent 60%)`;
                }
            });
            card.addEventListener('mouseleave', function () {
                this.style.transform  = '';
                this.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
            });
            // inject shine layer
            const shine = document.createElement('div');
            shine.className = 'tilt-shine';
            Object.assign(shine.style, {
                position: 'absolute', inset: '0', borderRadius: 'inherit',
                pointerEvents: 'none', zIndex: '1', transition: 'background 0.1s'
            });
            card.appendChild(shine);
        });
    }
    addTilt('.project-card', 12);
    addTilt('.edu-card', 10);
    addTilt('.highlight-card', 8);

    // ======================
    // PARALLAX — hero text layers on mouse move
    // ======================
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        document.addEventListener('mousemove', e => {
            const cx = window.innerWidth  / 2;
            const cy = window.innerHeight / 2;
            const dx = (e.clientX - cx) / cx;
            const dy = (e.clientY - cy) / cy;

            const heroContent = heroSection.querySelector('.hero-main-content');
            const heroBadge   = heroSection.querySelector('.hero-badge');
            if (heroContent) heroContent.style.transform = `translate(${dx * 6}px, ${dy * 4}px)`;
            if (heroBadge)   heroBadge.style.transform   = `translate(${dx * 10}px, ${dy * 7}px)`;
        });
    }

    // ======================
    // PARTICLE BURST on click
    // ======================
    document.addEventListener('click', e => {
        const count  = 12;
        const colors = ['#ff2d75', '#ff69b4', '#ff4081', '#ffffff'];
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            const angle = (i / count) * Math.PI * 2;
            const speed = 60 + Math.random() * 60;
            const size  = 3 + Math.random() * 4;
            Object.assign(p.style, {
                position:      'fixed',
                left:           e.clientX + 'px',
                top:            e.clientY + 'px',
                width:          size + 'px',
                height:         size + 'px',
                borderRadius:   '50%',
                background:     colors[Math.floor(Math.random() * colors.length)],
                pointerEvents:  'none',
                zIndex:         '99990',
                boxShadow:      `0 0 6px ${colors[0]}`,
                transform:      'translate(-50%,-50%)',
                transition:     'none'
            });
            document.body.appendChild(p);

            const tx = Math.cos(angle) * speed;
            const ty = Math.sin(angle) * speed;
            requestAnimationFrame(() => {
                p.style.transition = 'transform 0.6s cubic-bezier(0,0,0.2,1), opacity 0.6s ease';
                p.style.transform  = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`;
                p.style.opacity    = '0';
            });
            setTimeout(() => p.remove(), 700);
        }
    });

    // ======================
    // SKILL ICON STAGGER REVEAL
    // ======================
    const skillIcons = document.querySelectorAll('.skill-icon-wrap');
    skillIcons.forEach((icon, i) => {
        icon.style.opacity   = '0';
        icon.style.transform = 'translateY(20px)';
        icon.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`;
    });

    const skillObserver = new IntersectionObserver(entries => {
        entries.forEach(en => {
            if (en.isIntersecting) {
                skillIcons.forEach(icon => {
                    icon.style.opacity   = '1';
                    icon.style.transform = 'translateY(0)';
                });
                skillObserver.disconnect();
            }
        });
    }, { threshold: 0.3 });

    const heroLeft = document.querySelector('.hero-left');
    if (heroLeft) skillObserver.observe(heroLeft);

    // ======================
    // TYPEWRITER — hero description
    // ======================
    const descEl = document.querySelector('.hero-description');
    if (descEl) {
        const fullText = descEl.textContent.trim();
        descEl.textContent = '';
        descEl.style.borderRight = '2px solid var(--primary-pink)';
        descEl.style.display = 'inline-block';

        let charIdx  = 0;
        let started  = false;

        const typeNext = () => {
            if (charIdx < fullText.length) {
                descEl.textContent += fullText[charIdx++];
                setTimeout(typeNext, 22 + Math.random() * 15);
            } else {
                // blinking cursor fade-out
                setTimeout(() => {
                    descEl.style.transition = 'border-color 0.4s ease';
                    descEl.style.borderRightColor = 'transparent';
                }, 900);
            }
        };

        // Start typing after hero animations settle
        const descObserver = new IntersectionObserver(entries => {
            entries.forEach(en => {
                if (en.isIntersecting && !started) {
                    started = true;
                    setTimeout(typeNext, 1200);
                    descObserver.disconnect();
                }
            });
        }, { threshold: 0.5 });
        descObserver.observe(descEl);
    }

    // ======================
    // COUNTER ANIMATION — stat/highlight numbers
    // ======================
    function animateCounter(el, target, duration = 1600) {
        let start     = null;
        const isFloat = target % 1 !== 0;
        const step = ts => {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            const eased    = 1 - Math.pow(1 - progress, 3);
            const val      = isFloat
                ? (eased * target).toFixed(1)
                : Math.floor(eased * target);
            el.textContent = val + (el.dataset.suffix || '');
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    document.querySelectorAll('[data-count]').forEach(el => {
        const io = new IntersectionObserver(entries => {
            entries.forEach(en => {
                if (en.isIntersecting) {
                    animateCounter(el, parseFloat(el.dataset.count));
                    io.disconnect();
                }
            });
        }, { threshold: 0.6 });
        io.observe(el);
    });

    // ======================
    // SECTION AMBIENT GRADIENT — follows scroll
    // ======================
    const ambientBlob = document.createElement('div');
    Object.assign(ambientBlob.style, {
        position:      'fixed',
        width:         '500px',
        height:        '500px',
        borderRadius:  '50%',
        background:    'radial-gradient(circle, rgba(255,45,117,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex:        '0',
        transform:     'translate(-50%,-50%)',
        transition:    'left 1.2s cubic-bezier(0.23,1,0.32,1), top 1.2s cubic-bezier(0.23,1,0.32,1)',
        left:          '50%',
        top:           '50%'
    });
    document.body.appendChild(ambientBlob);

    document.addEventListener('mousemove', e => {
        ambientBlob.style.left = e.clientX + 'px';
        ambientBlob.style.top  = e.clientY + 'px';
    });

    // ======================
    // PROJECT CARD RIPPLE on click
    // ======================
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', function (e) {
            const rect   = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            Object.assign(ripple.style, {
                position:   'absolute',
                borderRadius:'50%',
                transform:  'scale(0)',
                background: 'rgba(255,45,117,0.25)',
                width:      '120px',
                height:     '120px',
                left:       (e.clientX - rect.left - 60) + 'px',
                top:        (e.clientY - rect.top  - 60) + 'px',
                pointerEvents: 'none',
                transition: 'transform 0.6s ease, opacity 0.6s ease',
                zIndex:     '2'
            });
            this.appendChild(ripple);
            requestAnimationFrame(() => {
                ripple.style.transform = 'scale(4)';
                ripple.style.opacity   = '0';
            });
            setTimeout(() => ripple.remove(), 700);
        });
    });

    // ======================
    // EXPERIENCE ITEM — line draw on scroll
    // ======================
    document.querySelectorAll('.experience-item').forEach((item, i) => {
        item.style.opacity   = '0';
        item.style.transform = 'translateX(-30px)';
        item.style.transition = `opacity 0.7s ease ${i * 0.15}s, transform 0.7s ease ${i * 0.15}s`;
        const expObserver = new IntersectionObserver(entries => {
            entries.forEach(en => {
                if (en.isIntersecting) {
                    item.style.opacity   = '1';
                    item.style.transform = 'translateX(0)';
                    expObserver.unobserve(item);
                }
            });
        }, { threshold: 0.2 });
        expObserver.observe(item);
    });

    // ======================
    // SKILL ITEMS — staggered slide-in
    // ======================
    document.querySelectorAll('.skill-item').forEach((item, i) => {
        item.style.opacity   = '0';
        item.style.transform = 'translateX(-16px)';
        item.style.transition = `opacity 0.5s ease ${i * 0.04}s, transform 0.5s ease ${i * 0.04}s, padding 0.3s ease, border-bottom-color 0.3s ease`;
        const io = new IntersectionObserver(entries => {
            entries.forEach(en => {
                if (en.isIntersecting) {
                    item.style.opacity   = '1';
                    item.style.transform = 'translateX(0)';
                    io.unobserve(item);
                }
            });
        }, { threshold: 0.3 });
        io.observe(item);
    });

    // ======================
    // CANVAS — Falling Orbs (upgrade: add sparkle trails)
    // ======================
    const canvas = document.getElementById('orbsCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        resize();
        window.addEventListener('resize', resize, { passive: true });

        class Orb {
            reset(fromTop = true) {
                this.x = Math.random() * canvas.width;
                this.y = fromTop ? -20 - Math.random() * 200 : Math.random() * canvas.height;
                this.size      = 2 + Math.random() * 6;
                this.speedY    = 0.25 + Math.random() * 0.7;
                this.speedX    = (Math.random() - 0.5) * 0.25;
                this.pulse     = Math.random() * Math.PI * 2;
                this.alpha     = 0.08 + Math.random() * 0.25;
                const palette  = [
                    [255, 45,  117],
                    [255, 105, 180],
                    [255, 64,  129],
                    [200, 30,  90]
                ];
                const c = palette[Math.floor(Math.random() * palette.length)];
                [this.r, this.g, this.b] = c;
            }
            constructor() { this.reset(false); }
            update() {
                this.y     += this.speedY;
                this.x     += this.speedX + Math.sin(this.pulse) * 0.12;
                this.pulse += 0.018;
                if (this.y > canvas.height + 30) this.reset(true);
            }
            draw() {
                const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 4);
                grd.addColorStop(0,   `rgba(${this.r},${this.g},${this.b},${this.alpha})`);
                grd.addColorStop(0.5, `rgba(${this.r},${this.g},${this.b},${this.alpha * 0.4})`);
                grd.addColorStop(1,   `rgba(${this.r},${this.g},${this.b},0)`);
                ctx.save();
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
                ctx.fill();
                // bright core
                ctx.shadowColor = `rgba(${this.r},${this.g},${this.b},0.9)`;
                ctx.shadowBlur  = this.size * 4;
                ctx.fillStyle   = `rgba(${this.r},${this.g},${this.b},${this.alpha * 2})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // Sparkle trail class (tiny star bursts)
        class Sparkle {
            constructor(x, y) {
                this.x     = x;
                this.y     = y;
                this.life  = 1;
                this.size  = 1 + Math.random() * 2;
                this.vx    = (Math.random() - 0.5) * 1.2;
                this.vy    = (Math.random() - 0.5) * 1.2;
                this.decay = 0.025 + Math.random() * 0.02;
            }
            update() { this.x += this.vx; this.y += this.vy; this.life -= this.decay; }
            draw() {
                ctx.save();
                ctx.globalAlpha = this.life * 0.5;
                ctx.fillStyle   = `rgba(255,105,180,1)`;
                ctx.shadowColor = 'rgba(255,45,117,0.8)';
                ctx.shadowBlur  = 4;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        const orbs     = Array.from({ length: 50 }, () => new Orb());
        const sparkles = [];

        // Mouse-reactive sparkle injection
        document.addEventListener('mousemove', e => {
            if (Math.random() < 0.2) sparkles.push(new Sparkle(e.clientX, e.clientY));
        });

        (function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            orbs.forEach(o => { o.update(); o.draw(); });
            for (let i = sparkles.length - 1; i >= 0; i--) {
                sparkles[i].update();
                sparkles[i].draw();
                if (sparkles[i].life <= 0) sparkles.splice(i, 1);
            }
            requestAnimationFrame(animate);
        })();
    }

});