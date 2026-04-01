// app.js - Core functionality for PakSec Nation

document.addEventListener('DOMContentLoaded', () => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            if (navLinks.classList.contains('active')) {
                mobileBtn.innerHTML = '&times;';
            } else {
                mobileBtn.innerHTML = '&#9776;';
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') &&
                !navLinks.contains(e.target) &&
                !mobileBtn.contains(e.target)) {
                navLinks.classList.remove('active');
                mobileBtn.innerHTML = '&#9776;';
            }
        });

        // Close menu when a nav link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileBtn.innerHTML = '&#9776;';
            });
        });
    }

    // Set Active State on Nav Links based on current URL
    const currentLocation = location.pathname;
    const links = document.querySelectorAll('.nav-links a');

    links.forEach(link => {
        if (link.getAttribute('href') !== '#' && currentLocation.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        } else if (currentLocation.endsWith('/') && link.getAttribute('href') === 'index.html') {
            link.classList.add('active');
        }
    });

    // Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');

            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    if (mobileBtn) mobileBtn.innerHTML = '&#9776;';
                }

                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar Scroll Effect - passive listener, no layout thrashing
    const navbar = document.querySelector('.navbar');
    let lastScrollY = -1;
    if (navbar) {
        const updateNavbar = () => {
            const scrollY = window.scrollY;
            if (scrollY !== lastScrollY) {
                lastScrollY = scrollY;
                if (scrollY > 50) {
                    navbar.style.background = 'rgba(11, 15, 25, 0.95)';
                    navbar.style.borderBottom = '1px solid var(--color-border)';
                } else {
                    navbar.style.background = 'transparent';
                    navbar.style.borderBottom = 'none';
                }
            }
        };
        window.addEventListener('scroll', updateNavbar, { passive: true });
    }

    // Page Transition Animation
    document.body.classList.add('page-enter');

    const internalLinks = document.querySelectorAll('a[href]:not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"]):not([target="_blank"])');
    internalLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href) {
                document.body.style.animation = 'pageFadeOut 0.4s ease forwards';
                setTimeout(() => {
                    window.location.href = href;
                }, 400);
            }
        });
    });

    // Intersection Observer for Scroll Animations
    // On mobile use lower threshold so animations trigger earlier/faster on scroll
    const observerOptions = {
        root: null,
        rootMargin: isMobile ? '50px 0px' : '0px',
        threshold: isMobile ? 0.05 : 0.15
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
        scrollObserver.observe(el);
    });

    // Glass Card Tilt Effect - desktop only (mouse events don't work on mobile)
    if (!isMobile) {
        document.querySelectorAll('.glass-card, .diff-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -5;
                const rotateY = ((x - centerX) / centerX) * 5;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // Stat counter animation (WhatsApp section)
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length > 0) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'countUp 0.6s ease-out forwards';
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: isMobile ? 0.1 : 0.5 });

        statNumbers.forEach(stat => counterObserver.observe(stat));
    }

    // Animated number counters for Why section (.why-card-number)
    const whyCounters = document.querySelectorAll('.why-card-number[data-target]');
    if (whyCounters.length > 0) {
        const whyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseFloat(el.getAttribute('data-target'));
                    const isDecimal = target % 1 !== 0;
                    const duration = isMobile ? 1500 : 2000;
                    const startTime = performance.now();

                    function animate(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = target * eased;

                        el.textContent = isDecimal ? current.toFixed(1) : Math.round(current);

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        }
                    }

                    requestAnimationFrame(animate);
                    whyObserver.unobserve(el);
                }
            });
        }, { threshold: isMobile ? 0.1 : 0.3 });

        whyCounters.forEach(counter => whyObserver.observe(counter));
    }

    // Animate Why card progress bars
    const whyBars = document.querySelectorAll('.why-card-bar-fill[data-width]');
    if (whyBars.length > 0) {
        const barObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    bar.style.setProperty('--bar-width', bar.getAttribute('data-width') + '%');
                    bar.classList.add('animate');
                    barObserver.unobserve(bar);
                }
            });
        }, { threshold: isMobile ? 0.1 : 0.3 });

        whyBars.forEach(bar => barObserver.observe(bar));
    }

    // Animate Mission target number (100,000+)
    const missionTarget = document.querySelector('.mission-target-value[data-target]');
    if (missionTarget) {
        const missionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.getAttribute('data-target'));
                    const duration = isMobile ? 1500 : 2500;
                    const startTime = performance.now();

                    function animate(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = Math.round(target * eased);

                        el.textContent = current.toLocaleString();

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        }
                    }

                    requestAnimationFrame(animate);
                    missionObserver.unobserve(el);
                }
            });
        }, { threshold: 0.3 });

        missionObserver.observe(missionTarget);
    }

    // Parallax effect on hero - desktop only (causes jank on mobile)
    // Disabled - hero stays static during scroll

    // --- Inline Form Status Messages ---
    function showFormStatus(form, message, type) {
        // Remove any existing status in this form
        const existing = form.querySelector('.form-status');
        if (existing) existing.remove();

        const status = document.createElement('div');
        status.className = `form-status form-status-${type}`;
        status.setAttribute('role', 'alert');
        status.setAttribute('aria-live', 'polite');

        const iconSvg = type === 'success'
            ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
            : '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

        status.innerHTML = `
            <div class="form-status-icon">${iconSvg}</div>
            <span class="form-status-text">${message}</span>
        `;

        // Insert at the end of the form
        form.appendChild(status);

        // Trigger animation on next frame
        requestAnimationFrame(() => {
            status.classList.add('visible');
            // Smooth scroll to the message so it's visible
            status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });

        // Auto-hide after 8 seconds
        setTimeout(() => {
            if (status.parentNode) {
                status.classList.remove('visible');
                setTimeout(() => status.remove(), 500);
            }
        }, 8000);
    }

    // --- AJAX Form Submission Handler ---
    // Google Apps Script returns a 302 redirect on POST which breaks fetch() due to CORS.
    // XMLHttpRequest handles the redirect transparently, so we use that instead.
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzPBdgek4qdgWCAtEM0yFV9cBwjVjkazVR7Mw0euCyhHWqUcjwPBW228nZWadwjThZj/exec";

    const successMessages = {
        volunteer: 'Application received! We\'ll review and reach out via email.',
        newsletter: 'You\'re in! Check your inbox for our weekly cyber intel.',
        consultation: 'Your consultation slot has been saved! Our team will contact you on WhatsApp with payment details.',
        contact: 'Message sent! We\'ll get back to you within 24-48 hours.'
    };

    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.innerText : 'Submit';

            // Remove any existing status message
            const oldStatus = form.querySelector('.form-status');
            if (oldStatus) oldStatus.remove();

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = 'Submitting...';
            }

            // Collect all form fields into a plain object
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            // Determine formType from hidden field or infer from context
            if (!data.formType) {
                const formId = form.id || '';
                if (formId.includes('volunteer')) {
                    data.formType = 'volunteer';
                } else if (form.closest('#consultation')) {
                    data.formType = 'consultation';
                } else if (form.closest('.contact-form') || form.classList.contains('contact-form')) {
                    data.formType = 'contact';
                } else {
                    data.formType = 'newsletter';
                }
            }

            // Use XMLHttpRequest — it follows the 302 redirect from Google Apps Script
            // without CORS errors, unlike fetch()
            const xhr = new XMLHttpRequest();
            xhr.open('POST', GOOGLE_SCRIPT_URL, true);
            xhr.setRequestHeader('Content-Type', 'text/plain;charset=utf-8');

            xhr.onload = function () {
                setTimeout(() => {
                    showFormStatus(form, successMessages[data.formType] || 'Submitted successfully!', 'success');
                    form.reset();
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerText = originalBtnText;
                    }
                }, 2000);
            };

            xhr.onerror = function () {
                showFormStatus(form, 'Something went wrong. Please check your connection and try again.', 'error');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalBtnText;
                }
            };

            xhr.send(JSON.stringify(data));
        });
    });
});

