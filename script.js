document.addEventListener('DOMContentLoaded', () => {

    /* ── PRELOADER ───────────────────────────────── */
    const preloader = document.getElementById('preloader');
    if (preloader) {
        const hide = () => preloader.classList.add('fade-out');
        window.addEventListener('load', () => setTimeout(hide, 100));
        setTimeout(hide, 500);
    }

    /* ── 0. BACKGROUND SCROLL ANIMATION ──────────── */
    const TOTAL_FRAMES = 238;
    const scrollCanvas = document.getElementById('scroll-canvas');
    if (scrollCanvas) {
        const sCtx = scrollCanvas.getContext('2d');
        scrollCanvas.width = 1280;
        scrollCanvas.height = 720;

        function getFramePath(index) {
            const padded = String(index).padStart(3, '0');
            return `photos/ezgif-frame-${padded}.jpg`;
        }

        const frameImages = [];
        for (let i = 1; i <= TOTAL_FRAMES; i++) {
            const img = new Image();
            img.src = getFramePath(i);
            img.onload = () => {
                if (i === 1) renderFrame();
            };
            frameImages.push(img);
        }

        function getAvailableFrame(index) {
            const img = frameImages[index - 1];
            if (img && img.complete && img.naturalWidth > 0) return img;
            for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
                const prev = index - 1 - offset;
                if (prev >= 0 && frameImages[prev]?.complete && frameImages[prev]?.naturalWidth > 0) return frameImages[prev];
                const next = index - 1 + offset;
                if (next < TOTAL_FRAMES && frameImages[next]?.complete && frameImages[next]?.naturalWidth > 0) return frameImages[next];
            }
            return null;
        }

        let targetFrame = 1;
        let currentFrame = 1;
        let lastRenderedFrame = -1;

        function renderFrame() {
            const frameToDraw = Math.round(currentFrame);
            if (frameToDraw === lastRenderedFrame) return;
            const img = getAvailableFrame(frameToDraw);
            if (img) {
                sCtx.drawImage(img, 0, 0, scrollCanvas.width, scrollCanvas.height);
                lastRenderedFrame = frameToDraw;
            }
        }

        function onScrollAnimation() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            const maxScroll = Math.max((document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight, 1);
            const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
            targetFrame = 1 + progress * (TOTAL_FRAMES - 1);
        }

        window.addEventListener('scroll', onScrollAnimation, { passive: true });
        window.addEventListener('resize', onScrollAnimation, { passive: true });

        function animateScroll() {
            const diff = targetFrame - currentFrame;
            if (Math.abs(diff) > 0.005) {
                currentFrame += diff * 0.12;
            } else {
                currentFrame = targetFrame;
            }
            renderFrame();
            requestAnimationFrame(animateScroll);
        }

        onScrollAnimation();
        currentFrame = targetFrame;
        animateScroll();

        if (frameImages[0] && frameImages[0].complete && frameImages[0].naturalWidth > 0) {
            renderFrame();
        }
    }

    /* ── 3. NAVBAR ───────────────────────────────── */
    const navbar    = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu   = document.getElementById('nav-menu');
    const navLinks  = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 30);
    });

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('active');
            hamburger.classList.toggle('open', isOpen);
            // Block page scroll while menu is open
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('open');
                navMenu.classList.remove('active');
                // Restore scroll when a link is tapped
                document.body.style.overflow = '';
            });
        });
    }

    /* Smooth scroll */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const id  = a.getAttribute('href');
            const el  = document.querySelector(id);
            if (!el) return;
            e.preventDefault();
            const offset = navbar ? navbar.offsetHeight + 8 : 70;
            window.scrollTo({ top: el.offsetTop - offset, behavior: 'smooth' });
        });
    });

    /* Active link highlight on scroll */
    const sections = document.querySelectorAll('section[id]');
    const onScroll = () => {
        const scrollY = window.scrollY + 120;
        sections.forEach(s => {
            const top    = s.offsetTop;
            const bottom = top + s.offsetHeight;
            const id     = s.getAttribute('id');
            const link   = document.querySelector(`.nav-link[href="#${id}"]`);
            if (link) link.classList.toggle('active', scrollY >= top && scrollY < bottom);
        });
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ── 4. SCROLL REVEAL — re-triggers every scroll ────────── */
    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

    if (revealEls.length) {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                } else {
                    // Remove so it re-animates next time it scrolls back in
                    e.target.classList.remove('visible');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(el => obs.observe(el));
    }

    /* Auto-add reveal to section headers and cards not already tagged */
    document.querySelectorAll('.section-header:not(.reveal)').forEach(el => {
        el.classList.add('reveal');
        const o = new IntersectionObserver(([e]) => {
            e.isIntersecting ? e.target.classList.add('visible')
                             : e.target.classList.remove('visible');
        }, { threshold: 0.1 });
        o.observe(el);
    });

    document.querySelectorAll(
        '.service-card:not(.reveal), .project-card:not(.reveal), .info-item:not(.reveal)'
    ).forEach((el, i) => {
        el.classList.add('reveal');
        el.style.transitionDelay = `${(i % 6) * 0.07}s`;
        const o = new IntersectionObserver(([e]) => {
            e.isIntersecting ? e.target.classList.add('visible')
                             : e.target.classList.remove('visible');
        }, { threshold: 0.08 });
        o.observe(el);
    });

    /* ── 5. SKILL BARS ───────────────────────────── */
    document.querySelectorAll('.skill-bar-fill').forEach(bar => {
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) {
                bar.style.width = bar.dataset.percentage || '80%';
                obs.disconnect();
            }
        }, { threshold: 0.4 });
        obs.observe(bar);
    });

    /* ── 6. STAT COUNTER ─────────────────────────── */
    document.querySelectorAll('.stat-num[data-val]').forEach(el => {
        const target = +el.dataset.val;
        const obs = new IntersectionObserver(([e]) => {
            if (!e.isIntersecting) return;
            let n = 0;
            const step = Math.ceil(target / 40);
            const t = setInterval(() => {
                n = Math.min(n + step, target);
                el.textContent = n;
                if (n >= target) clearInterval(t);
            }, 35);
            obs.disconnect();
        }, { threshold: 0.5 });
        obs.observe(el);
    });

    /* ── 7. TYPING EFFECT ────────────────────────── */
    const typingEl = document.querySelector('.typing-text');
    if (typingEl) {
        const words = ['Web Developer', 'Graphic Designer', 'Video Editor', 'Problem Solver'];
        let wi = 0, ci = 0, deleting = false;
        const type = () => {
            const word = words[wi];
            typingEl.textContent = deleting ? word.slice(0, ci--) : word.slice(0, ci++);
            let delay = deleting ? 60 : 100;
            if (!deleting && ci > word.length) { delay = 1600; deleting = true; }
            if (deleting && ci < 0)            { deleting = false; wi = (wi + 1) % words.length; delay = 400; }
            setTimeout(type, delay);
        };
        type();
    }

    /* ── 8. PROJECT FILTER ───────────────────────── */
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            document.querySelectorAll('.project-card').forEach(card => {
                const match = filter === 'all' || card.dataset.category === filter;
                card.classList.toggle('hidden', !match);
            });
        });
    });

    /* ── 9. CONTACT FORM ─────────────────────────── */
    const form = document.getElementById('contact-form');
    if (form) {
        const popup = document.getElementById('submit-popup');

        form.addEventListener('submit', e => {
            e.preventDefault();
            let ok = true;

            [
                { id: 'form-name',    min: 2 },
                { id: 'form-email',   type: 'email' },
                { id: 'form-subject', min: 1 },
                { id: 'form-message', min: 10 },
            ].forEach(({ id, min, type }) => {
                const g  = form.querySelector(`#${id}`)?.closest('.form-group');
                const el = form.querySelector(`#${id}`);
                if (!el || !g) return;
                let valid = true;
                if (type === 'email') valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
                else if (min)         valid = el.value.trim().length >= min;
                g.classList.toggle('error', !valid);
                if (!valid) ok = false;
            });

            if (ok) {
                const submitBtn = form.querySelector('#form-submit-btn');
                const originalBtnContent = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-circle-notch fa-spin"></i>';

                const formData = new FormData(form);
                // Add Web3Forms access key.
                formData.append('access_key', '1fb74d43-2733-4c8d-9fd5-e013a55b61c2');

                fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json'
                    },
                    body: formData
                })
                .then(async (response) => {
                    const json = await response.json();
                    if (response.status === 200) {
                        if (popup) {
                            popup.classList.add('visible');
                            setTimeout(() => popup.classList.remove('visible'), 4000);
                        }
                        form.reset();
                    } else {
                        alert(json.message || 'Something went wrong. Please try again.');
                    }
                })
                .catch(error => {
                    console.error(error);
                    alert('Could not submit form. Please check your internet connection and try again.');
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnContent;
                    form.querySelectorAll('.form-group').forEach(g => g.classList.remove('error'));
                });
            }
        });

        form.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('input', () => {
                input.closest('.form-group')?.classList.remove('error');
            });
        });
    }

    /* ── 10. BACK TO TOP ─────────────────────────── */
    const btt  = document.getElementById('back-to-top');
    const ring = document.querySelector('.scroll-progress-ring circle');
    if (btt) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            const max      = document.body.scrollHeight - window.innerHeight;
            btt.classList.toggle('visible', scrolled > 400);
            if (ring) {
                const pct = scrolled / max;
                ring.style.strokeDashoffset = 148 - (148 * pct);
            }
        }, { passive: true });
        btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    /* ── 11. POPUP AD ────────────────────────────────────────────
       Shows ONCE per session.
       sessionStorage is cleared automatically when the tab/browser
       is closed, so the popup reappears the next time the user visits.
       Refreshing the page does NOT reset it — popup stays hidden.
    ──────────────────────────────────────────────────────────── */
    const popupOverlay  = document.getElementById('popup-ad-overlay');
    const popupClose    = document.getElementById('popup-close-btn');
    const popupDismiss  = document.getElementById('popup-dismiss');
    const popupCta      = document.getElementById('popup-cta-btn');
    const POPUP_KEY     = 'popup_seen';

    const closePopup = () => {
        if (!popupOverlay) return;
        // Mark as seen for this session (survives refresh, resets on tab close)
        sessionStorage.setItem(POPUP_KEY, '1');
        popupOverlay.style.transition = 'opacity 0.3s ease';
        popupOverlay.style.opacity    = '0';
        setTimeout(() => popupOverlay.classList.add('hidden'), 310);
    };

    if (popupOverlay) {
        // Always start hidden
        popupOverlay.classList.add('hidden');

        // Only show if not already seen this session
        if (!sessionStorage.getItem(POPUP_KEY)) {
            setTimeout(() => {
                popupOverlay.classList.remove('hidden');
                popupOverlay.style.opacity    = '';
                popupOverlay.style.transition = '';
            }, 4000);
        }

        popupClose?.addEventListener('click', closePopup);
        popupDismiss?.addEventListener('click', closePopup);
        popupCta?.addEventListener('click', closePopup);
        popupOverlay.addEventListener('click', e => {
            if (e.target === popupOverlay) closePopup();
        });
    }


    /* ── 12. CUSTOM CURSOR ───────────────────────── */
    const dot     = document.getElementById('custom-cursor-dot');
    const outline = document.getElementById('custom-cursor-outline');
    
    if (dot && outline) {
        let ox = 0, oy = 0, tx = 0, ty = 0;
        let initialized = false;

        const lerp = (a, b, t) => a + (b - a) * t;
        const loop = () => {
            dot.style.left = tx + 'px'; dot.style.top = ty + 'px';
            ox = lerp(ox, tx, 0.12); oy = lerp(oy, ty, 0.12);
            outline.style.left = ox + 'px'; outline.style.top = oy + 'px';
            requestAnimationFrame(loop);
        };

        window.addEventListener('mousemove', e => {
            tx = e.clientX;
            ty = e.clientY;

            if (!initialized) {
                initialized = true;
                // Only activate custom cursor on fine pointers (desktops with mouse)
                if (window.matchMedia('(pointer:fine)').matches) {
                    document.body.classList.add('has-custom-cursor');
                    dot.classList.add('active');
                    outline.classList.add('active');
                    loop();
                }
            }
        });

        // Hover effect selectors
        document.querySelectorAll('a, button, .btn, .social-icon, .project-card, .service-card, .filter-btn, .back-to-top').forEach(el => {
            el.addEventListener('mouseenter', () => outline.classList.add('hover'));
            el.addEventListener('mouseleave', () => outline.classList.remove('hover'));
        });
    }

});
