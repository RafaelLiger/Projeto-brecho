import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

// Configuração Firebase permanece inalterada, mantendo a comunicação com o Firestore e Authentication.
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
const auth = getAuth(app);

// Verifica se o usuário está logado antes de mostrar o painel.
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    document.getElementById("adminPanel").style.display = "block";
    carregarProdutos();
  }
});

document.getElementById("btnCadastrar").addEventListener("click", cadastrar);

async function uploadImagem() {
  const file = document.getElementById("foto").files[0];
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

async function cadastrar() {
  const nome = document.getElementById("nome").value;
  const preco = document.getElementById("preco").value;
  const linkFoto = await uploadImagem();

  await addDoc(collection(db, "produtos"), {
    nome: nome,
    preco: preco,
    foto: linkFoto
  });

  alert("Produto cadastrado");
  carregarProdutos();
}

async function removerProduto(id) {
  await deleteDoc(doc(db, "produtos", id));
  alert("Produto removido");
  carregarProdutos();
}

async function carregarProdutos() {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "produtos"));
  querySnapshot.forEach((docItem) => {
    const p = docItem.data();
    const id = docItem.id;

    lista.innerHTML += `
      <article class="produto-admin" aria-label="Produto cadastrado: ${p.nome}">
        <img src="${p.foto}" alt="${p.nome}">
        <div class="produto-admin-info">
          <h3>${p.nome}</h3>
          <p>R$ ${p.preco}</p>
        </div>
        <button class="secondary-button remove-button" onclick="removerProduto('${id}')">Remover</button>
      </article>
    `;
  });
}

window.removerProduto = removerProduto;

window.logout = function () {
  signOut(auth);
  window.location.href = "login.html";
};
