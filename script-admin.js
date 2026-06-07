import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzakWqr9BV14O2MooLmd6Y4JZGnd8_Uus",
  authDomain: "brechomr-b3541.firebaseapp.com",
  projectId: "brechomr-b3541",
  storageBucket: "brechomr-b3541.firebasestorage.app",
  messagingSenderId: "365921344786",
  appId: "1:365921344786:web:cb38a8419fff440c96a7cb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('Página admin carregada');
console.log('Versão atual:', new Date().toISOString());
console.log('auth.currentUser inicial:', auth.currentUser);

// ==============================================
// AUTHENTICATION VERIFICATION
// ==============================================
onAuthStateChanged(auth, (user) => {
  console.log('Auth state changed admin:', user);
  console.log('CurrentUser (admin):', auth.currentUser);
  const adminPanel = document.getElementById('adminPanel');

  if (user) {
    console.log('Usuário autenticado:', user);
    // User is logged in
    adminPanel.style.display = 'block';
    document.getElementById('userEmail').textContent = user.email;
    const initial = user.email[0].toUpperCase();
    document.getElementById('userAvatar').textContent = initial;

    // Load products
    carregarProdutos();
  } else {
    console.log('Nenhum usuário autenticado no momento. Aguardando antes de redirecionar...');
    // Pequena espera para permitir que o estado de persistência se estabilize
    setTimeout(() => {
      if (!auth.currentUser) {
        console.log('Redirecionando para login.html');
        window.location.href = 'login.html';
      } else {
        console.log('Usuário tornou-se disponível após espera, não haverá redirecionamento.');
      }
    }, 500);
  }
});

// ==============================================
// LOGOUT FUNCTION
// ==============================================
window.logout = async function() {
  if (confirm('Deseja fazer logout?')) {
    try {
      await signOut(auth);
      window.location.href = 'login.html';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      showMessage('Erro ao fazer logout', 'error');
    }
  }
};

// ==============================================
// IMAGE UPLOAD TO IMGBB
// ==============================================
async function uploadImagem(file) {
  if (!file) return '';

  console.log('Arquivo:', file);
  console.log('Iniciando upload');

  const base64Image = await fileToBase64(file);
  const imageData = base64Image.split(',')[1] || base64Image;

  const formData = new FormData();
  formData.append('image', imageData);
  formData.append('name', file.name);

  try {
    console.log('Upload ImgBB iniciado para arquivo:', file.name, file.type, file.size);
    const response = await fetch(
      'https://api.imgbb.com/1/upload?key=e4b3fc73837d99b25fd1a7c343149c2b',
      { method: 'POST', body: formData }
    );
    const data = await response.json();

    console.log('Resposta:', data);

    if (!response.ok) {
      console.error('ImgBB response error:', response.status, response.statusText, data);
      throw new Error(`Erro no upload da imagem: ${response.status} ${response.statusText}`);
    }

    if (data && data.success && data.data && data.data.url) {
      const imageUrl = data.data.url;
      console.log('URL final:', imageUrl);
      return imageUrl;
    } else {
      console.error('ImgBB returned invalid response:', data);
      throw new Error('Erro ao fazer upload da imagem');
    }
  } catch (error) {
    console.error('Erro no upload:', error);
    throw error;
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// ==============================================
// PRODUCTS LOADING
// ==============================================
async function carregarProdutos() {
  const tabelaProdutos = document.getElementById('tabelaProdutos');

  try {
    const querySnapshot = await getDocs(collection(db, 'produtos'));
    const produtos = [];
    
    querySnapshot.forEach((doc) => {
      produtos.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Update stats
    document.getElementById('totalProducts').textContent = produtos.length;
    
    if (produtos.length > 0) {
      document.getElementById('lastProduct').textContent = produtos[produtos.length - 1].nome;
    }

    // Render table
    if (produtos.length === 0) {
      tabelaProdutos.innerHTML = `
        <div class="empty-state">
          <p>📦 Nenhum produto cadastrado ainda</p>
          <p style="font-size: 0.875rem; margin-top: 0.5rem;">Use o formulário ao lado para adicionar o primeiro produto</p>
        </div>
      `;
    } else {
      let html = `
        <table class="table">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nome</th>
              <th>Preço</th>
              <th>Data</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
      `;

      produtos.forEach((produto) => {
        const dataCriacao = produto.dataCriacao ? new Date(produto.dataCriacao.toDate()).toLocaleDateString('pt-BR') : 'N/A';
        
        html += `
          <tr>
            <td>
              <img src="${produto.foto}" alt="${produto.nome}" class="product-image">
            </td>
            <td>${produto.nome}</td>
            <td>R$ ${parseFloat(produto.preco).toFixed(2)}</td>
            <td>${dataCriacao}</td>
            <td>
              <button class="btn-delete" onclick="deletarProduto('${produto.id}', '${produto.nome}')">
                Deletar
              </button>
            </td>
          </tr>
        `;
      });

      html += `
          </tbody>
        </table>
      `;

      tabelaProdutos.innerHTML = html;
    }
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    tabelaProdutos.innerHTML = `
      <div class="empty-state">
        <p>⚠️ Erro ao carregar produtos</p>
        <p style="font-size: 0.875rem; margin-top: 0.5rem;">Tente recarregar a página</p>
      </div>
    `;
  }
}

// ==============================================
// FORM SUBMISSION
// ==============================================
window.handleCadastro = async function(event) {
  event.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const preco = document.getElementById('preco').value;
  const fotoInput = document.getElementById('foto');
  const btnCadastrar = document.getElementById('btnCadastrar');

  // Validation
  if (!nome || !preco || !fotoInput.files[0]) {
    showMessage('Preencha todos os campos e selecione uma imagem', 'error');
    return;
  }

  if (parseFloat(preco) <= 0) {
    showMessage('O preço deve ser maior que zero', 'error');
    return;
  }

  if (!fotoInput.files[0].type.startsWith('image/')) {
    showMessage('Por favor, selecione um arquivo de imagem válido', 'error');
    return;
  }

  // Disable button and show loading
  btnCadastrar.disabled = true;
  btnCadastrar.innerHTML = '<span class="loading-spinner" style="display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: white; animation: spin 0.8s linear infinite; margin-right: 0.5rem;"></span>Enviando...';

  try {
    const nomeColecao = 'produtos';
    const produto = {
      nome: nome,
      preco: parseFloat(preco),
      foto: '',
      dataCriacao: new Date()
    };

    console.log('Produto:', produto);
    console.log('Coleção:', nomeColecao);
    console.log('Usuário:', auth.currentUser);
    console.log('Projeto Firebase:', db.app.options.projectId);

    // Upload image
    showMessage('Enviando imagem...', 'success');
    produto.foto = await uploadImagem(fotoInput.files[0]);

    // Add product to Firestore
    showMessage('Salvando produto...', 'success');
    console.log('Produto final:', produto);
    await addDoc(collection(db, nomeColecao), produto);

    // Success
    showMessage(`✓ Produto "${nome}" cadastrado com sucesso!`, 'success');

    // Clear form
    document.getElementById('cadastroForm').reset();

    // Reload products
    setTimeout(() => {
      carregarProdutos();
    }, 500);

  } catch (error) {
    console.error('Erro ao cadastrar produto:', error);
    console.error('Código:', error.code);
    console.error('Mensagem:', error.message);
    showMessage(`Erro ao cadastrar produto. ${error.message}`, 'error');
  } finally {
    // Re-enable button
    btnCadastrar.disabled = false;
    btnCadastrar.innerHTML = 'Cadastrar Produto';
  }
};

// ==============================================
// DELETE PRODUCT
// ==============================================
window.deletarProduto = async function(produtoId, nomeProduto) {
  if (confirm(`Deseja deletar o produto "${nomeProduto}"? Esta ação não pode ser desfeita.`)) {
    try {
      await deleteDoc(doc(db, 'produtos', produtoId));
      showMessage(`✓ Produto "${nomeProduto}" deletado com sucesso!`, 'success');
      carregarProdutos();
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      showMessage('Erro ao deletar produto. Tente novamente.', 'error');
    }
  }
};

// ==============================================
// UTILITY FUNCTIONS
// ==============================================
function showMessage(message, type) {
  const messageEl = document.getElementById('formMessage');
  messageEl.className = `message ${type}`;
  messageEl.textContent = message;

  // Auto-hide success messages
  if (type === 'success') {
    setTimeout(() => {
      messageEl.textContent = '';
      messageEl.className = 'message';
    }, 4000);
  }
}
