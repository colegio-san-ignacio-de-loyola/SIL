// Menú para pantallas pequeñas.
const botonMenu = document.querySelector("#boton-menu");
const enlacesMenu = document.querySelector("#enlaces-menu");

botonMenu.addEventListener("click", function () {
  enlacesMenu.classList.toggle("mostrar");
});

// Al elegir una opción, el menú se cierra en celulares.
const enlaces = document.querySelectorAll(".enlaces-menu a");

enlaces.forEach(function (enlace) {
  enlace.addEventListener("click", function () {
    enlacesMenu.classList.remove("mostrar");
  });
});

// Galería: muestra la foto elegida en una ventana más grande.
const fotos = document.querySelectorAll(".foto img");
const modal = document.querySelector("#modal");
const imagenModal = document.querySelector("#imagen-modal");
const textoModal = document.querySelector("#texto-modal");
const cerrarModal = document.querySelector("#cerrar-modal");
const controlesAlbum = document.querySelector("#controles-album");
const contadorFotos = document.querySelector("#contador-fotos");
const fotoAnterior = document.querySelector("#foto-anterior");
const fotoSiguiente = document.querySelector("#foto-siguiente");

// Agregá aquí los nombres de nuevas fotos para incluirlas en cada álbum.
const albumes = {
  sanjuan: ["nuevas/foto-04.jpeg", "nuevas/foto-01.jpeg", "nuevas/foto-02.jpeg", "nuevas/foto-03.jpeg", "nuevas/foto-05.jpeg", "WhatsApp Image 2026-08-20 at 9.13.14 PM (3).jpeg"],
  intersil: ["nuevas/foto-09.jpeg", "nuevas/foto-10.jpeg", "nuevas/foto-11.jpeg"],
  bandaliza: ["nuevas/foto-06.jpeg", "nuevas/foto-07.jpeg", "nuevas/foto-08.jpeg", "nuevas/foto-12.jpeg"],
  bici: ["bici/IMG_8730.jpg", "bici/IMG_8550.jpg", "bici/DSC08708.jpg",
    "bici/DSC08704.jpg", "bici/DJI_0234.jpg", "bici/DJI_0235.jpg", "bici/DJI_0224.jpg"],
  juventud: ["semtalento.jpeg", "semjuventud.jpeg", "semjuventud3.jpeg"],
  dinami: ["dinami.jpeg", "dinami2.jpeg", "dinamidocentes.jpeg",
    "dinamijuegos.jpeg", "dinamijuegos2.jpeg", "dinamijuegos3.jpeg"]
};
let fotosActuales = [];
let indiceFoto = 0;
let tituloAlbum = "";
let botonOrigen = null;
let overflowAnterior = "";

function mostrarFoto() {
  imagenModal.src = fotosActuales[indiceFoto];
  imagenModal.alt = tituloAlbum + (fotosActuales.length > 1 ? " — Foto " + (indiceFoto + 1) : "");
  textoModal.textContent = tituloAlbum;
  contadorFotos.textContent = (indiceFoto + 1) + " / " + fotosActuales.length;
  controlesAlbum.hidden = fotosActuales.length < 2;
}

function cambiarFoto(paso) {
  indiceFoto = (indiceFoto + paso + fotosActuales.length) % fotosActuales.length;
  mostrarFoto();
}

fotoAnterior.addEventListener("click", function () { cambiarFoto(-1); });
fotoSiguiente.addEventListener("click", function () { cambiarFoto(1); });

fotos.forEach(function (foto) {
  const boton = foto.parentElement;
  boton.addEventListener("click", function () {
    botonOrigen = boton;
    const album = albumes[botonOrigen.dataset.album];
    fotosActuales = album ? album.map(function (archivo) { return "img/" + archivo; }) : [foto.src];
    indiceFoto = Number(boton.dataset.indice || 0);
    tituloAlbum = foto.alt;
    mostrarFoto();
    overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modal.classList.add("abierto");
    modal.setAttribute("aria-hidden", "false");
    cerrarModal.focus();
  });
});

// Las portadas recorren su álbum y abren la foto que se está mostrando.
const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)");
document.querySelectorAll(".foto[data-album]").forEach(function (boton) {
  const album = albumes[boton.dataset.album];
  const portada = boton.querySelector("img");
  const pista = document.createElement("span");
  pista.className = "pista-album";
  pista.appendChild(portada);
  album.slice(1).concat(album[0]).forEach(function (archivo) {
    const imagen = document.createElement("img");
    imagen.src = "img/" + archivo;
    imagen.alt = "";
    imagen.loading = "lazy";
    pista.appendChild(imagen);
  });
  boton.appendChild(pista);
  const indicador = document.createElement("span");
  indicador.className = "indicador-album";
  indicador.setAttribute("aria-hidden", "true");
  boton.appendChild(indicador);
  const pausa = document.createElement("button");
  pausa.type = "button";
  pausa.className = "pausa-album";
  boton.parentElement.appendChild(pausa);
  let pausado = movimientoReducido.matches;
  let posicion = 0;
  function actualizarIndicador() {
    boton.dataset.indice = String(posicion % album.length);
    indicador.textContent = (posicion % album.length + 1) + " / " + album.length + " fotos";
  }
  function actualizarPausa() {
    pausa.textContent = pausado ? "Reproducir fotos" : "Pausar fotos";
    pausa.setAttribute("aria-label", pausa.textContent + " de " + portada.alt);
  }
  pausa.addEventListener("click", function () {
    pausado = !pausado;
    actualizarPausa();
  });
  movimientoReducido.addEventListener("change", function (evento) {
    pausado = evento.matches;
    actualizarPausa();
  });
  pista.addEventListener("transitionend", function (evento) {
    if (evento.target !== pista || posicion !== album.length) return;
    pista.style.transition = "none";
    posicion = 0;
    pista.style.transform = "translateX(0)";
  });
  actualizarIndicador();
  actualizarPausa();
  window.setInterval(function () {
    const limites = boton.getBoundingClientRect();
    if (pausado || document.hidden || modal.classList.contains("abierto") ||
        boton.matches(":hover, :focus-within") || limites.bottom <= 0 || limites.top >= window.innerHeight) return;
    posicion = (posicion + 1) % (album.length + 1);
    pista.style.transition = "";
    pista.style.transform = "translateX(-" + posicion * 100 + "%)";
    actualizarIndicador();
  }, 3500);
});

cerrarModal.addEventListener("click", cerrarImagen);

modal.addEventListener("click", function (evento) {
  if (evento.target === modal) {
    cerrarImagen();
  }
});

// Cierra la imagen al presionar la tecla Escape.
document.addEventListener("keydown", function (evento) {
  if (!modal.classList.contains("abierto")) return;
  if (evento.key === "Escape") {
    cerrarImagen();
  }
  if (evento.key === "ArrowLeft" || evento.key === "ArrowRight") {
    evento.preventDefault();
    cambiarFoto(evento.key === "ArrowLeft" ? -1 : 1);
  }
  if (evento.key === "Tab") {
    const ultimo = controlesAlbum.hidden ? cerrarModal : fotoSiguiente;
    if (evento.shiftKey && document.activeElement === cerrarModal) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      cerrarModal.focus();
    }
  }
});

function cerrarImagen() {
  modal.classList.remove("abierto");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = overflowAnterior;
  if (botonOrigen) botonOrigen.focus();
}

// Muestra un botón para regresar al principio de la página.
const botonArriba = document.querySelector("#volver-arriba");

window.addEventListener("scroll", function () {
  if (window.scrollY > 350) {
    botonArriba.classList.add("mostrar");
  } else {
    botonArriba.classList.remove("mostrar");
  }
});

botonArriba.addEventListener("click", function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Coloca el año actual en el pie de página.
document.querySelector("#anio").textContent = new Date().getFullYear();
