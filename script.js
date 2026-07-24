/* ========================================
   CASAVERDE — Landing Page Script (Supabase Connected)
   ======================================== */

// ========================================
// CONFIGURAZIONE BACKEND
// ========================================
const API_URL = 'https://cadgobdxuqioaghstcry.supabase.co/functions/v1/receive-lead';

// ========================================
// FORM MULTI-STEP
// ========================================
let currentStep = 1;

function nextStep(step) {
    if (!validateStep(currentStep)) return;
    document.querySelector(`[data-step="${currentStep}"]`).classList.add('hidden');
    document.querySelector(`[data-step="${step}"]`).classList.remove('hidden');
    currentStep = step;
    if (window.innerWidth < 768) {
        document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function prevStep(step) {
    document.querySelector(`[data-step="${currentStep}"]`).classList.add('hidden');
    document.querySelector(`[data-step="${step}"]`).classList.remove('hidden');
    currentStep = step;
}

function validateStep(step) {
    const stepEl = document.querySelector(`[data-step="${step}"]`);
    const required = stepEl.querySelectorAll('[required]');
    let valid = true;

    required.forEach(field => {
        field.style.borderColor = '';
        if (!field.value.trim()) {
            field.style.borderColor = '#ef4444';
            valid = false;
        }
    });

    const email = stepEl.querySelector('input[type="email"]');
    if (email && email.value && !isValidEmail(email.value)) {
        email.style.borderColor = '#ef4444';
        valid = false;
    }

    const phone = stepEl.querySelector('input[type="tel"]');
    if (phone && phone.value && !isValidPhone(phone.value)) {
        phone.style.borderColor = '#ef4444';
        valid = false;
    }

    // Validate checkbox group for step 2
    if (step === 2) {
        const checked = stepEl.querySelectorAll('input[name="interventi"]:checked');
        if (checked.length === 0) {
            stepEl.querySelectorAll('.checkbox-card').forEach(card => {
                card.style.borderColor = '#ef4444';
            });
            valid = false;
        } else {
            stepEl.querySelectorAll('.checkbox-card').forEach(card => {
                card.style.borderColor = '';
            });
        }
    }

    if (!valid) {
        stepEl.style.animation = 'none';
        stepEl.offsetHeight;
        stepEl.style.animation = 'shake 0.5s ease';
    }

    return valid;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^[\+]?[\d\s\-\(\)]{8,20}$/.test(phone.replace(/\s/g, ''));
}

// ========================================
// FORM SUBMISSION — BACKEND REALE
// ========================================
document.getElementById('leadForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!validateStep(currentStep)) return;

    const submitBtn = document.querySelector('.btn-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
    submitBtn.disabled = true;

    const formData = new FormData(this);

    // Collect checkbox values
    const interventi = [];
    document.querySelectorAll('input[name="interventi"]:checked').forEach(cb => {
        interventi.push(cb.value);
    });

    // Mappa i campi del form ai nomi esatti delle colonne del database
    const leadData = {
        servizio: 'efficienza_energetica',
        fonte: 'casaverde.it',
        nome: formData.get('nome'),
        cognome: formData.get('cognome'),
        email: formData.get('email'),
        telefono: formData.get('telefono'),
        condizione_abitativa: formData.get('condizione_abitativa') || null,
        urgenza: formData.get('urgenza') || null,
        indirizzo: formData.get('indirizzo') || null,
        tipologia_immobile: formData.get('tipologia_immobile') || null,
        anno_costruzione: formData.get('anno_costruzione') || null,
        mq: parseInt(formData.get('mq')) || null,
        zona_climatica: formData.get('zona_climatica') || null,
        isolamento_attuale: formData.get('isolamento_attuale') || null,
        interventi: interventi.length > 0 ? interventi : null,
        budget: formData.get('budget') || null,
        finanziamento: formData.get('finanziamento') || null,
        note: formData.get('note') || null,
        privacy: formData.get('privacy') === 'on',
        marketing: formData.get('marketing') === 'on',
        ip: null,
        user_agent: navigator.userAgent,
        referrer: document.referrer
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(leadData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Errore server: ' + response.status);
        }

        const result = await response.json();
        console.log('Lead salvato:', result);

        document.getElementById('leadForm').classList.add('hidden');
        document.getElementById('successMessage').classList.remove('hidden');

        if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', { event_category: 'lead', event_label: 'efficienza_energetica' });
        }

    } catch (error) {
        console.error('Errore:', error);
        document.getElementById('errorText').textContent = 
            'Errore di connessione. Riprova tra qualche istante o contattaci al +39 00 0000 0000';
        document.getElementById('leadForm').classList.add('hidden');
        document.getElementById('errorMessage').classList.remove('hidden');
    } finally {
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
        submitBtn.disabled = false;
    }
});

function resetForm() {
    document.getElementById('leadForm').reset();
    currentStep = 1;

    document.querySelectorAll('.form-step').forEach((step, index) => {
        step.classList.toggle('hidden', index !== 0);
    });

    document.getElementById('successMessage').classList.add('hidden');
    document.getElementById('errorMessage').classList.add('hidden');
    document.getElementById('leadForm').classList.remove('hidden');

    document.querySelectorAll('input, select, textarea').forEach(field => {
        field.style.borderColor = '';
    });
    document.querySelectorAll('.checkbox-card').forEach(card => {
        card.style.borderColor = '';
    });
}

// ========================================
// FAQ ACCORDION
// ========================================
function toggleFaq(button) {
    const item = button.parentElement;
    const isActive = item.classList.contains('active');

    document.querySelectorAll('.faq-item').forEach(faq => {
        faq.classList.remove('active');
    });

    if (!isActive) {
        item.classList.add('active');
    }
}

// ========================================
// MOBILE MENU
// ========================================
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-open');
    });
}

// ========================================
// SMOOTH SCROLL
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
    });
});

// ========================================
// NAVBAR SCROLL
// ========================================
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
    } else {
        navbar.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// ========================================
// SHAKE ANIMATION
// ========================================
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-8px); }
        40% { transform: translateX(8px); }
        60% { transform: translateX(-4px); }
        80% { transform: translateX(4px); }
    }
`;
document.head.appendChild(shakeStyle);

console.log('✅ CasaVerde — Backend collegato');
