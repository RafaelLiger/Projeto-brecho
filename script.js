import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5iVkMUSZ-0FHF5sdNZB3wsm1qluLpDO8",
  authDomain: "brechovava.firebaseapp.com",
  projectId: "brechovava",
  storageBucket: "brechovava.firebasestorage.app",
  messagingSenderId: "285901923260",
  appId: "1:285901923260:web:0fef96eb59e5d6a6bdc1b9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==============================================
// PRODUCTS LOADING FROM FIREBASE
// ==============================================
async function carregarProdutos() {
  const lista = document.getElementById("lista");
  if (!lista) return;

  lista.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Carregando produtos...</p>';

  try {
    const querySnapshot = await getDocs(collection(db, "produtos"));
    lista.innerHTML = '';
    
    const formatarPrecoBRL = (valor) => {
      const numero = Number(String(valor).replace(/\./g, '').replace(',', '.')) || 0;
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(numero);
    };

    querySnapshot.forEach((doc) => {
      const p = doc.data();
      const precoFormatado = formatarPrecoBRL(p.preco);
      const mensagem = `Olá! Tenho interesse neste produto do Brechó.\n\nProduto: ${p.nome}\nPreço: ${precoFormatado}\nFoto: ${p.foto}`;
      const whatsappLink = "https://wa.me/5521969400559?text=" + encodeURIComponent(mensagem);

      const productCard = document.createElement('div');
      productCard.className = 'product-card';
      productCard.innerHTML = `
        <div class="product-image">
          <img src="${p.foto}" alt="Foto do produto ${p.nome}">
        </div>
        <div class="product-body">
          <h3>${p.nome}</h3>
          <div class="product-footer">
            <span class="price">${precoFormatado}</span>
            <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="btn btn-dark btn-small">
              Comprar
              <img src="icons8-whatsapp.svg" alt="WhatsApp" class="btn-icon">
            </a>
          </div>
        </div>
      `;
      lista.appendChild(productCard);
    });
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    lista.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #c97b63;">Erro ao carregar produtos. Tente novamente mais tarde.</p>';
  }
}

// Load products on page load
carregarProdutos();

// ==============================================
// SMOOTH SCROLL NAVIGATION
// ==============================================
window.scrollToSection = function(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    const headerHeight = document.querySelector('.header').offsetHeight;
    const targetPosition = element.offsetTop - headerHeight;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });

    // Close mobile menu if open
    const menuMobile = document.getElementById('menuMobile');
    if (menuMobile && menuMobile.classList.contains('active')) {
      menuMobile.classList.remove('active');
      const hamburger = document.getElementById('hamburger');
      if (hamburger) {
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    }
  }
};

// ==============================================
// MOBILE MENU TOGGLE
// ==============================================
const hamburger = document.getElementById('hamburger');
const menuMobile = document.getElementById('menuMobile');

if (hamburger && menuMobile) {
  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    hamburger.classList.toggle('active');
    menuMobile.classList.toggle('active');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (event) => {
    if (!event.target.closest('header') && menuMobile.classList.contains('active')) {
      menuMobile.classList.remove('active');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  // Close menu when clicking on a link
  const menuLinks = menuMobile.querySelectorAll('button');
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuMobile.classList.remove('active');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

// ==============================================
// CONTACT FORM HANDLING
// ==============================================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;
    const formMessage = document.getElementById('formMessage');

    if (!name || !email || !message) {
      formMessage.className = 'form-message error';
      formMessage.textContent = 'Por favor, preencha todos os campos.';
      return;
    }

    // Email pattern validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      formMessage.className = 'form-message error';
      formMessage.textContent = 'Por favor, insira um e-mail válido.';
      return;
    }

    // Prepare email message
    const assunto = "Mensagem do site Brechó Vavá";
    const corpo = `Nome: ${name}\nE-mail: ${email}\n\nMensagem:\n${message}`;
    const mailtoLink = `mailto:rafael-liger@outlook.com?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    
    // Open email client
    window.location.href = mailtoLink;

    // Show success message
    formMessage.className = 'form-message success';
    formMessage.textContent = 'Mensagem preparada! Seu cliente de e-mail será aberto.';

    // Clear form
    setTimeout(() => {
      contactForm.reset();
      formMessage.textContent = '';
    }, 2000);
  });
}

// ==============================================
// ANIMATIONS ON SCROLL
// ==============================================
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe product cards and value cards
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.product-card, .value-card, .info-item');
  cards.forEach(card => observer.observe(card));
});
