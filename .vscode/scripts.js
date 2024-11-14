//Função para buscar dados da API e exibir dados da Busca
async function fetchMediaFromNASA(searchQuery) {
    try {
        //constroi a URL da API da nNasa com base na consulta de pesquisa
        const apiUrl = `https://images-api.nasa.gov/search?q=${encodeURIComponent(searchQuery)}`;
        //Faz uma requisição GET a API da Nasa para obter os dados da busca
        const response = await fetch(apiUrl);
        const data = await response.json();

        console.log(data); // Log para verificar a resposta da API

        const imagesBox = document.getElementById("img-box");
        imagesBox.innerHTML = ""; // Limpa resultados anteriores

        //Verifica se os dados recebidos da API são valido
        if (!isValidData(data)) {
            console.error("No results found for search.");
            return;
        }

        const processedMediaUrls = new Set(); // Rastreamos URLs únicas
        //itera sobre cada item da coleção da API
        data.collection.items.forEach(item => {
            const mediaType = item.data[0].media_type;
            //faz uma nova requisão GET ao link
            const title = item.data[0].title;
            const description = item.data[0].description;

            fetch(item.href)
                .then(response => response.json())
                .then(mediaData => {
                    //obtem o URL correto da midia com base no tipo de midia
                    const mediaUrl = getMediaUrl(mediaData, mediaType);
                    
                    // Verifica duplicação e processa apenas URLs únicas
                    if (mediaUrl && !processedMediaUrls.has(mediaUrl)) {
                        processedMediaUrls.add(mediaUrl);
                        const albumContainer = createAlbumContainer(mediaType, mediaUrl, description, title);
                        imagesBox.appendChild(albumContainer);
                    }
                })
                .catch(err => console.error("Error fetching media:", err));
        });
    } catch (error) {
        console.error("Error fetching data from API:", error);
    }
}
//função para verificar se os dados da API são válidos
function isValidData(data) {
    return data && data.collection && data.collection.items && data.collection.items.length > 0;
}
//função para encontrar a URL correta da midia
function getMediaUrl(mediaData, mediaType) {
    if (mediaType === "image") {
        return findImageMediaUrl(mediaData);// encontra a URL correta da imagem descartando o resto
    } else if (mediaType === "video") {
        return findVideoMediaUrl(mediaData);// encontra a URL correta do video
    }
}
//função para encontrar a URL da imagem apropriada
function findImageMediaUrl(mediaData) {
    for (const mediaUrl of mediaData) {
        if (mediaUrl.endsWith(".jpg") || mediaUrl.endsWith(".png")) {
            return mediaUrl;
        }
    }
    return null;
}
//função para encontrar a URL do video
function findVideoMediaUrl(mediaData) {
    for (const mediaUrl of mediaData) {
        if (mediaUrl.endsWith(".mp4")) {
            return mediaUrl;
        }
    }
    return null;
}
//função para criar o elemento de album (imagens ou video)
function createAlbumContainer(mediaType, mediaUrl, description, title) {
    const albumContainer = document.createElement("div");
    albumContainer.classList.add("album");

    if (mediaType === "image") {
        const imageElement = createImageElement(mediaUrl, description);
        albumContainer.appendChild(imageElement);
    } else if (mediaType === "video") {
        const videoElement = createVideoElement(mediaUrl);
        albumContainer.appendChild(videoElement);
    }

    const titleElement = document.createElement("h3");
    titleElement.textContent = title;
    albumContainer.appendChild(titleElement);

    return albumContainer;
}
//função para criar o elemnto de imagem e adicionar evente de click
function createImageElement(mediaUrl, description) {
    const imageElement = document.createElement("img");
    imageElement.src = mediaUrl;
    imageElement.alt = description;
    imageElement.addEventListener("click", () => openModal(mediaUrl, description));
    return imageElement;
}
//função para criar o elemnto de video
function createVideoElement(mediaUrl) {
    const videoElement = document.createElement("video");
    videoElement.controls = true;
    const sourceElement = document.createElement("source");
    sourceElement.src = mediaUrl;
    sourceElement.type = "video/mp4";
    videoElement.appendChild(sourceElement);
    return videoElement;
}

//função para abrir  o Modal com a imagem completa e a descrição
function openModal(mediaUrl, description) {
    const modalContainer = document.getElementById("modal-box");
    const overlay = document.getElementById("overlay"); // Seleciona o overlay
    const modalImage = document.getElementById("img-modal");
    const modalDescription = document.getElementById("description-modal");

    // Define a imagem do modal apenas quando uma nova imagem for carregada
    modalImage.src = mediaUrl;
    modalDescription.textContent = description || 'No description available';
    modalContainer.style.display = "flex";
    overlay.style.display = "block"; // Mostra o overlay
}

function closeModal() {
    const modalContainer = document.getElementById("modal-box");
    const overlay = document.getElementById("overlay"); // Seleciona o overlay
    modalContainer.style.display = "none";
    overlay.style.display = "none"; // Esconde o overlay
}

document.getElementById("researcher-button").addEventListener("click", () => {
    const searchInput = document.getElementById("researcher-input");
    const searchQuery = searchInput.value.trim();
    
    if (searchQuery) {
        fetchMediaFromNASA(searchQuery);
        
        // Esconder a mensagem de introdução quando a pesquisa for feita
        const introMessage = document.getElementById("intro-message");
        if (introMessage) {
            introMessage.classList.add('hidden');
        }
    }
});
