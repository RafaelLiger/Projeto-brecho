import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// Mantém a mesma configuração Firebase usada no projeto.
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

// Carrega os produtos do Firebase Firestore e renderiza o grid.
async function carregarProdutos() {
  const lista = document.getElementById("lista");
  if (!lista) return;

  lista.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "produtos"));
  querySnapshot.forEach((doc) => {
    const p = doc.data();
    const mensagem = `Olá! Tenho interesse neste produto do Brechó.\n\nProduto: ${p.nome}\nPreço: R$ ${p.preco}\nFoto: ${p.foto}`;
    const whatsappLink = "https://wa.me/5521969400559?text=" + encodeURIComponent(mensagem);

    lista.innerHTML += `
      <article class="produto" role="article" aria-label="Produto ${p.nome}">
        <img src="${p.foto}" alt="Foto do produto ${p.nome}">
        <div class="produto-body">
          <h3>${p.nome}</h3>
          <p>R$ ${p.preco}</p>
          <div class="produto-actions">
            <a class="btn-whatsapp" href="${whatsappLink}" target="_blank" rel="noopener noreferrer">Comprar</a>
          </div>
        </div>
      </article>
    `;
  });
}

carregarProdutos();

// Controle do menu hamburger em mobile.
const hamburger = document.getElementById('hamburger');
const menu = document.querySelector('.menu');

if (hamburger && menu) {
  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    hamburger.classList.toggle('active');
    menu.classList.toggle('active');
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('nav') && menu.classList.contains('active')) {
      menu.classList.remove('active');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}

// Funções de colaboração permanecem as mesmas para enviar produto via WhatsApp.
window.mostrarFormularioColaborador = function () {
  const formulario = document.getElementById("formularioColaborador");
  if (formulario) {
    formulario.style.display = "block";
    formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

window.fecharFormulario = function () {
  const formulario = document.getElementById("formularioColaborador");
  if (formulario) formulario.style.display = "none";
};

async function uploadImagem(file) {
  if (!file) return "";

  const formData = new FormData();
  formData.append("image", file);

  const resposta = await fetch(
    "https://api.imgbb.com/1/upload?key=e4b3fc73837d99b25fd1a7c343149c2b",
    { method: "POST", body: formData }
  );

  const dados = await resposta.json();
  return dados.data.url;
}

window.enviarColaboracao = async function () {
  const nome = document.getElementById("nomeProduto").value;
  const tamanho = document.getElementById("tamanhoProduto").value;
  const file = document.getElementById("fotoProduto").files[0];

  if (!nome || !tamanho || !file) {
    alert("Preencha todos os campos");
    return;
  }

  const linkFoto = await uploadImagem(file);
  const mensagem = `Olá! Gostaria de colaborar com o Brechó Vavá.\n\nProduto: ${nome}\nTamanho: ${tamanho}\nFoto: ${linkFoto}`;
  const urlWhatsApp = `https://wa.me/5521969400559?text=${encodeURIComponent(mensagem)}`;
  window.open(urlWhatsApp, "_blank");

  document.getElementById("nomeProduto").value = "";
  document.getElementById("tamanhoProduto").value = "";
  document.getElementById("fotoProduto").value = "";
  window.fecharFormulario();
};

window.enviarSugestao = function () {
  const nome = document.getElementById("nomeSugestao").value;
  const comentario = document.getElementById("comentarioSugestao").value;

  if (!nome || !comentario) {
    alert("Preencha todos os campos");
    return;
  }

  const assunto = "Sugestão enviada pelo site Brechó Vavá";
  const corpo = `Nome: ${nome}\n\nSugestão:\n${comentario}`;
  const mailtoLink = `mailto:rafael-liger@outlook.com?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
  window.location.href = mailtoLink;

  document.getElementById("nomeSugestao").value = "";
  document.getElementById("comentarioSugestao").value = "";
};
