import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";

import { 
getFirestore, 
collection, 
addDoc, 
getDocs, 
deleteDoc, 
doc 
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

import {
getAuth,
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";


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

const auth = getAuth(app)



//  VERIFICAR LOGIN
onAuthStateChanged(auth,(user)=>{

if(!user){

window.location.href = "login.html"

}

})



document.getElementById("btnCadastrar").addEventListener("click", cadastrar)


//  UPLOAD IMAGEM
async function uploadImagem(){

const file = document.getElementById("foto").files[0]

if(!file){

return ""

}

const formData = new FormData()

formData.append("image", file)

const resposta = await fetch(
"https://api.imgbb.com/1/upload?key=e4b3fc73837d99b25fd1a7c343149c2b",
{
method:"POST",
body:formData
})

const dados = await resposta.json()

return dados.data.url

}



//  CADASTRAR PRODUTO
async function cadastrar(){

let nome = document.getElementById("nome").value

let preco = document.getElementById("preco").value

let linkFoto = await uploadImagem()

await addDoc(collection(db,"produtos"),{

nome:nome,
preco:preco,
foto:linkFoto

})

alert("Produto cadastrado")

carregarProdutos()

}



//  REMOVER PRODUTO
async function removerProduto(id){

await deleteDoc(doc(db,"produtos",id))

alert("Produto removido")

carregarProdutos()

}



//  CARREGAR PRODUTOS
async function carregarProdutos(){

let lista = document.getElementById("lista")

lista.innerHTML=""

const querySnapshot = await getDocs(collection(db,"produtos"))

querySnapshot.forEach((docItem)=>{

let p = docItem.data()

let id = docItem.id

lista.innerHTML += `

<div class="produto">

<img src="${p.foto}" width="150">

<h3>${p.nome}</h3>

<p>R$ ${p.preco}</p>

<button onclick="removerProduto('${id}')">Remover</button>

</div>

`

})

}

carregarProdutos()



// tornar função global
window.removerProduto = removerProduto


window.logout = function(){

signOut(auth)

window.location.href = "login.html"

}