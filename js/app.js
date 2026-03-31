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

    // --- AJAX Form Submission Handler ---
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyEFU6wAKYI99POBDM-yDQyiyLcoJFn6E5zAz_q83og2a0ackZs2Dma_a5pnwoLQm4m/exec";

    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.innerText : 'Submit';

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

            try {
                const response = await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8',
                    }
                });

                const result = await response.json();

                if (result.result === 'success') {
                    alert('Form submitted successfully! Thank you for contacting PakSec Nation.');
                    form.reset();
                } else {
                    alert('Something went wrong. Please try again.');
                }

            } catch (error) {
                console.error('Submission error:', error);
                alert('There was a problem submitting your form. Please check your internet connection and try again.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalBtnText;
                }
            }
        });
    });
});

