const apiKey = "SUA CHAVE AQUI";

const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const moviesContainer = document.getElementById("moviesContainer");
const themeBtn = document.getElementById("themeBtn");
const typeSelect = document.getElementById("typeSelect");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageInfo = document.getElementById("pageInfo");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");
const historyContainer = document.getElementById("historyContainer");

let currentPage = 1;
let currentQuery = "";
let totalResults = 0;

// DARK MODE
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeBtn.textContent =
    document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// EVENTOS
searchBtn.addEventListener("click", () => {
  currentPage = 1;
  buscarFilmes();
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    currentPage = 1;
    buscarFilmes();
  }
});

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    buscarFilmes();
  }
});

nextBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(totalResults / 10);
  if (currentPage < totalPages) {
    currentPage++;
    buscarFilmes();
  }
});

closeModal.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// ============================
// BUSCAR FILMES
// ============================

async function buscarFilmes() {
  const query = searchInput.value.trim();
  const type = typeSelect.value;

  if (!query) {
    alert("Digite algo para buscar!");
    return;
  }

  currentQuery = query;
  salvarHistorico(query);

  moviesContainer.innerHTML = "<p style='color:white;'>Carregando...</p>";

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${apiKey}&s=${query}&type=${type}&page=${currentPage}`
    );

    const data = await response.json();

    if (data.Response === "False") {
      moviesContainer.innerHTML = "<p style='color:white;'>Nenhum resultado encontrado.</p>";
      pageInfo.textContent = "";
      return;
    }

    totalResults = parseInt(data.totalResults);
    pageInfo.textContent = `Página ${currentPage}`;

    renderCards(data.Search);

  } catch (error) {
    moviesContainer.innerHTML = "<p style='color:white;'>Erro ao buscar dados.</p>";
  }
}

// ============================
// RENDERIZAR CARDS
// ============================

async function renderCards(movies) {
  moviesContainer.innerHTML = "";

  for (let movie of movies) {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}&plot=short`
    );

    const details = await response.json();

    const poster = details.Poster !== "N/A"
      ? details.Poster
      : "https://via.placeholder.com/300x450?text=Sem+Imagem";

    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <img src="${poster}" alt="${details.Title}">
      <h2>${details.Title}</h2>
      <p>${details.Year}</p>
    `;

    card.addEventListener("click", () => abrirModal(details));

    moviesContainer.appendChild(card);
  }
}

// ============================
// MODAL
// ============================

function abrirModal(details) {
  modalBody.innerHTML = `
    <img src="${details.Poster}">
    <h2>${details.Title}</h2>
    <p><strong>Ano:</strong> ${details.Year}</p>
    <p><strong>Gênero:</strong> ${details.Genre}</p>
    <p><strong>Diretor:</strong> ${details.Director}</p>
    <p>${details.Plot}</p>
  `;
  modal.style.display = "flex";
}

// ============================
// HISTÓRICO
// ============================

function salvarHistorico(query) {
  let historico = JSON.parse(localStorage.getItem("historico")) || [];

  if (!historico.includes(query)) {
    historico.unshift(query);
    if (historico.length > 5) historico.pop();
    localStorage.setItem("historico", JSON.stringify(historico));
  }

  renderHistorico();
}

function renderHistorico() {
  const historico = JSON.parse(localStorage.getItem("historico")) || [];
  historyContainer.innerHTML = "";

  historico.forEach(item => {
    const btn = document.createElement("button");
    btn.textContent = item;
    btn.addEventListener("click", () => {
      searchInput.value = item;
      currentPage = 1;
      buscarFilmes();
    });
    historyContainer.appendChild(btn);
  });
}

renderHistorico();