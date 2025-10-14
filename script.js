let activeTabIndex = -1; // -1 = default (ningún tab activo)
// Guardar los módulos globalmente
let modulosData = [];

// Cargar menú desde JSON
fetch("curso.json")
  .then(res => res.json())
  .then(data => {
    modulosData = data.modulos;   // ✅ usamos la variable global
    cargarContenido("0.0", modulosData); // inicio
    renderMenu(modulosData, "menuModulos");        
    renderMenu(modulosData, "menuModulosMobile");
  });


function renderMenu(modulos, containerId) {
  const menu = document.getElementById(containerId);
  menu.innerHTML = ""; // limpiar contenedor

  function generarSubtemas(subtemas, parentId) {
    if (!subtemas || subtemas.length === 0) return "";
    return `
      <ul class="list-unstyled subtema-lista m-0">
        ${subtemas.map((st, i) => {
          const hasChildren = st.subtemas && st.subtemas.length > 0;
          const collapseId = `${parentId}_sub${i}`;
          return `
            <li class="subtema ${hasChildren ? "has-children" : ""}" data-id="${st.id}">
              <div class="d-flex align-items-center gap-2" ${hasChildren ? `data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false"` : ""}>
                ${st.titulo}
              </div>
              ${hasChildren
                ? `<div class="collapse p-3" id="${collapseId}">
                     ${generarSubtemas(st.subtemas, collapseId)}
                   </div>`
                : ""}
            </li>
          `;
        }).join("")}
      </ul>
    `;
  }

  modulos.forEach((modulo, index) => {
    const moduloId = `modulo${modulo.id}_${containerId}`;
    const collapseId = `collapse${modulo.id}_${containerId}`;
    const isPortada = modulo.id === 0 || modulo.id === 6; // casos especiales
    const hasSubtemas = modulo.subtemas && modulo.subtemas.length > 0;

    const moduloItem = document.createElement("div");
    moduloItem.classList.add("accordion-item");

    // Dibujar botón
    moduloItem.innerHTML = `
      <h2 class="accordion-header" id="${moduloId}">
        <button class="accordion-button ${index === 0 ? "active" : hasSubtemas ? "collapsed" : ""}" 
                type="button"
                ${hasSubtemas ? `data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="${index === 0 ? "true" : "false"}"` : ""}>
          <div class="d-flex flex-column flex-lg-row w-100 text-start gap-2">
            <div class="fw-bold me-md-2 flex-shrink-0">${!isPortada ? `Módulo ${modulo.id}:` : ""}</div>
            <div class="fw-light flex-grow-1">${modulo.titulo}</div>
          </div>
        </button>
      </h2>
      ${hasSubtemas
        ? `<div id="${collapseId}" class="accordion-collapse collapse ${index === 0 ? "show" : ""}">
             <div class="accordion-body">
               ${generarSubtemas(modulo.subtemas, collapseId)}
             </div>
           </div>`
        : ""}
    `;

    menu.appendChild(moduloItem);

    const btnModulo = moduloItem.querySelector(".accordion-button");
    const collapseInstance = hasSubtemas ? new bootstrap.Collapse(document.getElementById(collapseId), { toggle: false }) : null;

    // Evento click del módulo
    btnModulo.addEventListener("click", () => {
      menu.querySelectorAll(".accordion-button, .subtema").forEach(el => el.classList.remove("active"));
      btnModulo.classList.add("active");

      // Cerrar otros colapsables
      menu.querySelectorAll(".accordion-collapse").forEach(c => {
        if (c.id !== collapseId) {
          const inst = bootstrap.Collapse.getInstance(c);
          if (inst) inst.hide();
        }
      });

      // Mostrar collapse del módulo actual si tiene subtemas
      if (collapseInstance) collapseInstance.toggle();

      // Cargar contenido
      cargarContenido(`${modulo.id}.0`, modulosData);
    });

    // Subtemas
    if (hasSubtemas) {
      const menuList = moduloItem.querySelectorAll(".subtema");
      menuList.forEach(item => {
        const div = item.querySelector("div");
        const collapseDiv = item.querySelector(".collapse");
        const bsCollapse = collapseDiv ? new bootstrap.Collapse(collapseDiv, { toggle: false }) : null;

        div.addEventListener("click", e => {
          e.stopPropagation();
          menu.querySelectorAll(".subtema").forEach(st => st.classList.remove("active"));
          item.classList.add("active");

          cargarContenido(item.dataset.id, modulosData);

          menu.querySelectorAll(".collapse").forEach(c => {
            if (!c.contains(item) && c !== collapseDiv) {
              const inst = bootstrap.Collapse.getInstance(c);
              if (inst) inst.hide();
            }
          });

          if (bsCollapse) bsCollapse.toggle();

          const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById("offcanvasMenu"));
          if (offcanvas) offcanvas.hide();
        });
      });
    }
  });
}


function cargarContenido(subtemaId, modulos) {
  const content = document.getElementById("content");

  // --- 1. Eliminar navButtons antiguos ---
  const oldNav = document.getElementById("navButtonsWrapper");
  if (oldNav) oldNav.remove();

  // Limpiar contenido previo y mostrar loader
  content.innerHTML = `
    <div class="d-flex justify-content-center align-items-center h-100 w-100">
      <div class="text-center p-5">
        <div class="spinner-border" role="status"></div>
        <p>Cargando...</p>
      </div>
    </div>
  `;

  setTimeout(() => {
    // Crear contenedor interno scrollable
    content.innerHTML = `<div id="contentInner" class="p-0 h-100 overflow-auto d-flex flex-column"></div>`;
    const contentInner = document.getElementById("contentInner");

    // ---------- Caso especial: inicio ----------
const casosEspeciales = {
  "0.0": 0, 
  "6.0": 6    
};

if (casosEspeciales[subtemaId] !== undefined) {
  const moduloId = casosEspeciales[subtemaId];
  const inicioModulo = modulos.find(m => m.id === moduloId);
  if (!inicioModulo) return;

  let listaModulosHTML = "";
  // Solo mostramos la lista si NO es el módulo 6
  if (moduloId !== 6) {
    listaModulosHTML = `
    <div class="col-12 mb-3">
      <ul class="list-unstyled">
        ${modulos
          .filter(m => m.id !== moduloId && m.subtemas?.length)
          .map(m => `<li><h5 class="fw-bold mb-3" style="color: var(--color-secundario-3);">Módulo ${m.id}: <span class="fw-light">${m.titulo}</span></h5></li>`)
          .join("")}
      </ul>
      <img src="src/img/vineta.png" alt="Inicio" class="img-fluid">
    </div>
    `;
  }

  contentInner.innerHTML = `
  
      <div class="row m-0 p-3"><img src="${inicioModulo.img}" alt="Inicio" class="img-fluid"></div>
  <div class='row m-0 h-100 px-3'>
      ${inicioModulo.contenido}
        ${listaModulosHTML}
  </div>
  `;
  return;
}



    // ---------- Portada ----------
    if (subtemaId.endsWith(".0")) {
      const numModulo = subtemaId.split(".")[0];
      const modulo = modulos.find(m => m.id == numModulo);
      if (!modulo) return;

      contentInner.innerHTML = `
        <div class="d-flex flex-column h-100">
          <div class="row m-0 p-3 encabezado">
            <div class="d-flex flex-row-reverse">
              <img src="src/img/logoKWORKS.svg" alt="Modulo${modulo.id}" style="height:30px; width:auto; padding-right: 19px; margin-top: 12px;" class="img-fluid">
            </div>
            <h2><span class="fw-bold display-2">Módulo ${modulo.id}</span><br><span class="fw-bold title-body-secondary">${modulo.titulo}</span></h2>
          </div>
          <div class="img-container flex-grow-1"><img src="${modulo.img}" alt="Modulo ${modulo.id}" class="p-0"></div>
        </div>
      `;
      return;
    }

    // ---------- Subtema ----------
    const result = findSubtemaRecursivo(modulos, subtemaId);
    if (!result) return;

    const { subtema, path } = result;
    const numModulo = subtemaId.split(/[-_.]/)[0];

    // Contenido base
    let contenidoHTML = "";
    if (typeof subtema.contenido === "string") contenidoHTML = subtema.contenido;
    else if (Array.isArray(subtema.contenido)) {
      contenidoHTML = subtema.contenido.map((b, i) => {
        if (b.tipo === "texto") return `<p>${b.texto}</p>`;
        if (b.tipo === "lista") return renderLista(b.items, b.estilo || "dot", 0, `unidad${subtema.id}-lista${i}`);
        return "";
      }).join("");
    }
    if (subtema.lista) contenidoHTML += renderLista(subtema.lista, subtema.tipoLista || "dot", 0, `unidad${subtema.id}-lista0`);


// Render principal
let actividadHTML = "";
if (subtema.actividad) {
  actividadHTML = renderActividad(subtema.actividad);
}


contentInner.innerHTML = `
  <div class="row m-0 p-3 encabezado">
    <h3><span class="fw-bold">Módulo ${numModulo}:</span> <span class="fw-light">${path[0]}</span></h3>
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        ${path.map((p,i)=>`
          <li class="breadcrumb-item ${i===path.length-1?'active':''}">
            <small class="fw-bold">${p}</small>
          </li>`).join("")}
      </ol>
    </nav>
  </div>
  <div class="row m-0 p-3"><h2 class='fw-bold m-0'>${subtema.tituloContext}</h2></div>
  ${contenidoHTML.trim() !== "" 
    ? `<div class="row m-0 p-3 d-flex flex-column h-100">
         <div class="col-12 d-flex flex-column h-100">
           ${contenidoHTML}
         </div>
       </div>`
    : ""}
  ${actividadHTML}
  ${subtema.imagen || ""}

    <!-- Si hay modales los pintamos -->
  ${subtema.modal && Array.isArray(subtema.modal) && subtema.modal.length > 0
    ? subtema.modal.map(m => m.modalitem).join("")
    : ""}
`;

if (subtema.actividad && subtema.actividad.tipo === "tablaVF") {
  const tabla = contentInner.querySelector('.tabla-vf');
  console.log(tabla);
  if (tabla) {
    handleTablaVF(subtema.actividad, tabla);
  }
}

// ---------------- Procesar actividades y slides ----------------
function procesarActividades(obj) {
  if (!obj) return;

  const esSlideGroup = obj.slides?.length > 0;

if (obj === subtema && esSlideGroup) {
  const slidesHTML = renderSlides(subtema, path);
  contentInner.insertAdjacentHTML("beforeend", slidesHTML);
}

  // --- Caso 2: no hay slides (es actividad normal o contenido plano) ---
  else {
    // Eliminar botones si existen
    const navWrapper = document.getElementById("navButtonsWrapper");
    if (navWrapper) navWrapper.remove();
    // Aquí NO se rompe el flujo: las actividades normales siguen renderizando
    // porque ya las insertaste en contentInner antes de llamar a procesarActividades.
  }

  // --- Subtemas hijos ---
  if (obj.subtemas) obj.subtemas.forEach(st => procesarActividades(st));
}


    procesarActividades(subtema);

    // mostrarToast("Contenido y actividades cargados");

  }, 800);
}






// -------------------- Búsqueda recursiva --------------------
function findSubtemaRecursivo(modulos, subtemaId) {
  for (const modulo of modulos) {
    if (modulo.subtemas) {
      const result = findSubtemaEnLista(modulo.subtemas, subtemaId);
      if (result) {
        return result;
      }
    }
  }
  console.log("⚠️ No se encontró el subtema con id:", subtemaId);
  return null;
}

function findSubtemaEnLista(lista, subtemaId, path = []) {
  for (const sub of lista) {
    if (sub.id === subtemaId) {
      return { subtema: sub, path: [...path, sub.titulo] };
    }
    if (sub.subtemas) {
      const res = findSubtemaEnLista(sub.subtemas, subtemaId, [...path, sub.titulo]);
      if (res) return res;
    }
  }
  return null;
}  

  // ---------------- Función auxiliar para listas ----------------
  function renderLista(items, estilo = "dot", nivel = 0, listaId = null) {
    if (!items || !Array.isArray(items)) return "";
  
    const ulAttrs = nivel === 0 && listaId ? ` id="${listaId}"` : "";
    const ulClass = estilo === "dot" ? "list-unstyled ms-3" : "list-unstyled";
  
    return `
      <ul class="${ulClass} "${ulAttrs}>
        ${items.map(item => `
          <li>
            ${item.texto || ""}
            ${item.hijos ? renderLista(item.hijos, estilo, nivel + 1) : ""}
          </li>
        `).join("")}
      </ul>
    `;
  }
  
function findSubtemaById(modulos, id, path = []) {
  for (let modulo of modulos) {
    for (let st of modulo.subtemas) {
      if (String(st.id) === String(id)) {
        return { subtema: st, path: [modulo.titulo, st.titulo] };
      }
      if (st.children) {
        const result = findChild(st, id, [modulo.titulo, st.titulo]);
        if (result) return result;
      }
    }
  }
  return null;
}

function findChild(subtema, id, path) {
  if (String(subtema.id) === String(id)) {
    return { subtema, path };
  }
  if (subtema.children) {
    for (let child of subtema.children) {
      if (child.id === id) {
        return { subtema: child, path: [...path, child.titulo] };
      }
      const deeper = findChild(child, id, [...path, child.titulo]);
      if (deeper) return deeper;
    }
  }
  return null;
}


function mostrarToast(msg) {
  const toastEl = document.getElementById("toast");
  const toastBody = document.getElementById("toastMsg");
  toastBody.textContent = msg;
  const toast = new bootstrap.Toast(toastEl);
  // toast.show();
}

function marcarCompletado(subtemaId) {
  let progreso = JSON.parse(localStorage.getItem("progreso")) || {};
  progreso[subtemaId] = true;
  localStorage.setItem("progreso", JSON.stringify(progreso));
  mostrarToast(`Subtema ${subtemaId} completado ✅`);
}
function renderActividad(actividad, container, grupo) {
  if (!actividad || !actividad.tipo) return "";

  switch (actividad.tipo) {
    case "tabs":
      return renderTabs(actividad);

    case "tabsSimple":
      return renderTabsSimple(actividad);

    case "quiz":
      return renderQuiz(actividad.preguntas);

    case "truefalse":
      return renderTrueFalse(actividad.preguntas);

    case "openquestion":
      return renderOpenQuestion(actividad, grupo);

    case "steps":
      return renderSteps(actividad.pasos, actividad.instruccion);

    case "collapse": 
      return renderCollapseActivity(actividad);
    
    case "tablaVF":
      return renderTablaVF(actividad);

    case "skillquiz":
      return renderSkillQuiz(actividad);
    
    case "lista":
      return `
      <div class='row m-0 px-3 h-100 flex-column'>
        <div class="px-3 lista ${actividad.estilo || ""}">          
          ${actividad.items.map(item => `
            <div class="actividad-item mb-2">
              ${item.texto}
            </div>
          `).join("")}
        </div>
        ${actividad.img ? `
              <div class="flex-grow-1 d-flex align-items-end justify-content-center" style="padding: 0px 25%;">
                <img src="${actividad.img}" class="img-fluid" alt="actividad imagen">
              </div>
          ` : ""}
        </div>
      `;


    default:
      return `<p class="text-muted">[Actividad no soportada: ${actividad.tipo}]</p>`;
  }
}

/* ---------------------- TABS ---------------------- */

function renderTabs(config) {
  const { items, showArrows = true, default: defaultContent } = config;

  // Botones con flechas condicionales
  const botones = items.map((item, i) => `
    <div class="d-flex justify-content-center" style="flex: 0 0 auto; width: 16%;">
      <button class="btn btn-outline-primary actividad-btn" data-index="${i}">
        ${item.label}
      </button>
    </div>
    ${showArrows && i < items.length-1 ? '<span class="mx-1 text-danger" style="flex: 0 0 auto; width: 1%;">▶</span>' : ""}
  `).join("");

  const navButtons = `
  <div class="d-flex justify-content-between mt-3">
    <button id="btnVolver" class="btn btn-outline-secondary">◂ Volver</button>
    <button id="btnSiguiente" class="btn btn-outline-secondary">Siguiente ▸</button>
  </div>
`;

  // Contenido inicial → default del JSON o mensaje neutro
  const initialContent = defaultContent
    ? `<h5 class="fw-bold">${defaultContent.titulo}</h5><div>${defaultContent.contenido}</div>`
    : `<p class="text-muted">Selecciona una opción para comenzar.</p>`;

  const contenedor = `
    <div class="row m-0 p-3 actividad">
    <p class="fw-bold">Selecciona una opción para comenzar:</p>
      <div class="d-flex align-items-center justify-content-between flex-wrap pt-5">${botones}</div>
      <div id="actividadContenido" class="mt-3 p-3">
        ${initialContent}
      </div>
    </div>
  `;

  // Índice del tab activo
  activeTabIndex = defaultContent ? -1 : 0; // -1 = default

  // Eventos
  setTimeout(() => {
    const cont = document.getElementById("actividadContenido");

    // Selección de botones
    const btnVolver = document.getElementById("btnVolver");
    const btnSiguiente = document.getElementById("btnSiguiente");

    document.querySelectorAll(".actividad-btn").forEach((btn, i) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".actividad-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    
        const item = items[i];
    
        if (!item) return; // 🔹 evita error si item es undefined
    
        let html = "";
        if (typeof item.contenido === "string") {
          html = item.contenido;
        } else if (item.contenido && typeof item.contenido === "object") {
          // si es objeto (como lista), renderizar
          html = renderLista(item.contenido.items, item.contenido.estilo || "dot", 0, `lista${i}`, `unidad${i}`);
        }
    
        // si hay subactividad, renderizarla
        if (item.actividad) html += renderActividad(item.actividad);
    
        cont.innerHTML = html;
      });
    });
    
    

      // ----------------- Navegación Volver/Siguiente -----------------
  btnVolver.addEventListener("click", () => {
    navigateTabOrSubtema(-1);
  });
  btnSiguiente.addEventListener("click", () => {
    navigateTabOrSubtema(1);
  });
  }, 0);

  return contenedor;
}

      // ----------------- funcion Navegación Volver/Siguiente -----------------
      function navigateTabOrSubtema(direction) {
        const menuSubtemas = Array.from(document.querySelectorAll(".subtema"));
        const activeSubtema = document.querySelector(".subtema.active");
        if (!activeSubtema) return;
      
        if (activeTabIndex === -1 && direction === -1) {
          // Desde default, ir al subtema anterior
          const prevIndex = menuSubtemas.indexOf(activeSubtema) - 1;
          if (prevIndex >= 0) menuSubtemas[prevIndex].click();
          return;
        }
      
        const tabButtons = document.querySelectorAll(".actividad-btn");
        const nextTabIndex = activeTabIndex + direction;
      
        if (nextTabIndex >= 0 && nextTabIndex < tabButtons.length) {
          tabButtons[nextTabIndex].click();
        } else {
          // Saltar al subtema anterior o siguiente en el menú
          const currentSubtemaIndex = menuSubtemas.indexOf(activeSubtema);
          const targetIndex = currentSubtemaIndex + direction;
      
          if (targetIndex >= 0 && targetIndex < menuSubtemas.length) {
            menuSubtemas[targetIndex].click();
          }
        }
      }
      
/* ---------------------- TABS SIMPLE ---------------------- */
function renderTabsSimple(actividad) {
  // Botones
  const botonesHTML = actividad.items.map((item, idx) => `
    <div class="d-flex justify-content-center" style="flex: 0 0 auto; width: 16%;">
      <button type="button" class="tab-btn btn btn-outline-primary actividad-btn-tab ${idx === 0 ? 'active' : ''}" data-index="${idx}">
        ${item.label}
      </button>
    </div>
  `).join("");

  // Contenedor para contenido
  const contenidoHTML = `<div class="tab-content-container">
    ${actividad.default?.contenido || actividad.items[0]?.contenido || ""}
  </div>`;

  const containerHTML = `
  <div class="px-3">
    <div class="tab-wrapper mb-3 pt-3 px-3">
      <div class="tab-buttons d-flex align-items-start justify-content-between mb-2">${botonesHTML}</div>
      ${contenidoHTML}
    </div>
  </div>  
  `;

  // Eventos de los botones: se agregan después de insertarlo en DOM
  setTimeout(() => {
    const container = document.querySelector(".tab-wrapper:last-child"); // último tab agregado
    if (!container) return;

    const botones = container.querySelectorAll(".tab-btn");
    const contentContainer = container.querySelector(".tab-content-container");

    botones.forEach(btn => {
      btn.addEventListener("click", () => {
        botones.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const idx = parseInt(btn.dataset.index);
        const item = actividad.items[idx];
        if (!item) return;

        let html = "";
        if (typeof item.contenido === "string") html = item.contenido;
        else if (item.contenido?.tipo === "lista") {
          html = renderLista(item.contenido.items, item.contenido.estilo || "dot");
        }
        if (item.actividad) html += renderActividad(item.actividad);

        contentContainer.innerHTML = html;
      });
    });
  }, 0);

  return containerHTML;
}

/* ---------------------- RENDER SLIDES ---------------------- */
function renderSlides(subtema, path = []) {
  let activeSlideIndex = 0;
  const slideId = `slides_${subtema.id}`;

  const flatSlides = (subtema.slides || []).flatMap(grupo =>
    (grupo.items || []).map(item => ({ ...item, grupo: grupo.grupo }))
  );

  // Si no hay slides, retornamos un contenedor simple
  if (!flatSlides.length) {
    return `<div id="slideEncabezado" class="px-3 pb-3"></div>
            <div id="slideContentWrapper" class="flex-grow-1 overflow-auto px-3 py-0">
              <div id="slideContent" class="px-3 h-100">
                <p>No hay slides disponibles.</p>
              </div>
            </div>`;
  }

  const container = `
    <div id="slideEncabezado" class="px-3 pb-3"></div>
    <div id="slideContent" class="h-100"></div>`;

  // Render slide después de un pequeño timeout para asegurar que el DOM exista
  setTimeout(() => {
    const slideContent = document.getElementById("slideContent");
    const slideEncabezado = document.getElementById("slideEncabezado");

    // Crear navButtons **solo si no existe**
    if (!document.getElementById("navButtonsWrapper")) {
      const navWrapper = document.createElement("div");
      navWrapper.id = "navButtonsWrapper";
      navWrapper.className = "d-flex justify-content-between align-items-center w-100 px-3";
      navWrapper.innerHTML = `
        <button id="btnSlidePrev" class="btn btn-outline-secondary btn-volver">◂ Volver</button>
        <button id="btnSlideNext" class="btn btn-outline-secondary btn-siguiente">Siguiente ▸</button>
      `;
      document.getElementById("content").appendChild(navWrapper);
    }

    const btnPrev = document.getElementById("btnSlidePrev");
    const btnNext = document.getElementById("btnSlideNext");

    function updateNav() {
      btnPrev.style.visibility = activeSlideIndex === 0 ? "hidden" : "visible";
      btnNext.style.visibility = activeSlideIndex === flatSlides.length - 1 ? "hidden" : "visible";
    }

    async function renderCurrentSlide() {
      const current = flatSlides[activeSlideIndex];
      if (!current) {
        slideContent.innerHTML = "<p>No hay slides disponibles.</p>";
        slideEncabezado.innerHTML = "";
        updateNav();
        return;
      }

      slideEncabezado.innerHTML = current.grupo ? `<h2 class="fw-bold m-0 px-3 title-body-secondary">${current.grupo}</h2>` : "";

      let html = "";
      if (typeof current.contenido === "string") html += current.contenido;
      else if (current.contenido?.tipo === "lista") {
        html += renderLista(
          current.contenido.items,
          current.contenido.estilo || "dot",
          0,
          `slideLista${activeSlideIndex}`,
          `subtema${subtema.id}`
        );
      }

      let containerId = null;
      if (current.actividad) {
        if (current.actividad.tipo === "skillquiz") {
          containerId = `skillQuiz_slide${activeSlideIndex}_${Date.now()}`;
          html += renderSkillQuiz(current.actividad, containerId);
        } else if (current.actividad.tipo === "openquiz") {
          containerId = `openQuiz_slide${activeSlideIndex}_${Date.now()}`;
          html += renderOpenQuiz(current.actividad, containerId);
        } else {
          html += renderActividad(current.actividad);
        }
      }

      slideContent.innerHTML = html || "<p>No hay slides disponibles.</p>";

      if (containerId && current.actividad?.tipo === "skillquiz") {
        const skillContainer = document.getElementById(containerId);
        if (skillContainer) handleSkillQuizAuto(current.actividad, skillContainer);
      }
    if (containerId && current.actividad?.tipo === "openquiz") {
      const openContainer = document.getElementById(containerId);
      if (openContainer) {
        // Suponiendo que 'current' está dentro de un slide y tiene la propiedad grupo
        const grupo = current.grupo || "Sin grupo";
        handleOpenQuiz(current.actividad, openContainer, grupo);
      }
    }
      if (current.actividad?.tipo === "quiz") handleQuiz(current.actividad.preguntas);
      if (current.actividad?.tipo === "truefalse") handleTrueFalse(current.actividad.preguntas);
      if (current.actividad?.tipo === "tablaVF") {
        const tabla = slideContent.querySelector("table:last-child");
        if (tabla) handleTablaVF(current.actividad, tabla);
      }

      updateNav();
    }

    btnPrev.addEventListener("click", () => {
      if (activeSlideIndex > 0) {
        activeSlideIndex--;
        renderCurrentSlide();
      }
    });

    btnNext.addEventListener("click", () => {
      if (activeSlideIndex < flatSlides.length - 1) {
        activeSlideIndex++;
        renderCurrentSlide();
      }
    });

    renderCurrentSlide();
  }, 0);

  return container;
}








/* ---------------------- QUIZ ---------------------- */
function renderQuiz(preguntas) {
  return `
    <div class="actividad my-4 pb-3">
      ${preguntas.map((q, i) => `
        <div class="mb-3">
          <p><strong>${i+1}.</strong> ${q.enunciado}</p>
          ${q.opciones.map((op, j) => `
            <button class="btn btn-sm btn-outline-secondary quiz-btn" 
                    data-q="${i}" data-a="${j}">
              ${op}
            </button>
          `).join(" ")}
        </div>
      `).join("")}
      <div id="quizFeedback" class="mt-3"></div>
    </div>
  `;
}

function handleQuiz(preguntas) {
  const feedback = document.getElementById("quizFeedback");
  document.querySelectorAll(".quiz-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const qIndex = btn.dataset.q;
      const aIndex = btn.dataset.a;
      if (parseInt(aIndex) === preguntas[qIndex].respuestaCorrecta) {
        feedback.innerHTML = `<p class="text-success">✔ Correcto</p>`;
      } else {
        feedback.innerHTML = `<p class="text-danger">✘ Incorrecto</p>`;
      }
    });
  });
}

/* ---------------------- TRUE/FALSE ---------------------- */
function renderTrueFalse(preguntas) {
  return `
    <div class="actividad my-4 pb-3">
      ${preguntas.map((q, i) => `
        <div class="mb-3">
          <p><strong>${i+1}.</strong> ${q.enunciado}</p>
          <button class="btn btn-sm btn-outline-success tf-btn" data-q="${i}" data-a="true">Verdadero</button>
          <button class="btn btn-sm btn-outline-danger tf-btn" data-q="${i}" data-a="false">Falso</button>
        </div>
      `).join("")}
      <div id="tfFeedback" class="mt-3"></div>
    </div>
  `;
}

function handleTrueFalse(preguntas) {
  const feedback = document.getElementById("tfFeedback");
  document.querySelectorAll(".tf-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const qIndex = btn.dataset.q;
      const value = btn.dataset.a === "true";
      if (value === preguntas[qIndex].respuestaCorrecta) {
        feedback.innerHTML = `<p class="text-success">✔ Correcto</p>`;
      } else {
        feedback.innerHTML = `<p class="text-danger">✘ Incorrecto</p>`;
      }
    });
  });
}

/* ---------------------- OPEN QUESTION ---------------------- */
function renderOpenQuestion(actividad) {
  const preguntasHTML = actividad.preguntas.map((p, i) => {
    // Solo si existen ejemplos se genera el botón y el modal
    let ejemplosHTML = "";
    if (p.ejemplos && p.ejemplos.length > 0) {
      ejemplosHTML = `
        <div class="d-flex justify-content-end">
          <button type="button" class="btn btn-sm btn-outline-secondary btn-ejemplos" 
                  data-bs-toggle="modal" 
                  data-bs-target="#ModalEjemplos${i}">
            <img src="src/img/m1_s4_icono_deteccion_baul.svg">
            <strong>Ejemplos</strong>
          </button>
        </div>

        <!-- Modal de ejemplos -->
        <div class="modal fade" id="ModalEjemplos${i}" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content">
              <div class="modal-header border-0">
                <h5 class="modal-title fw-bold">Ejemplos</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
              </div>
              <div class="modal-body">
                <ul class="list-unstyled fw-bold">
                  ${p.ejemplos.map(e => `<li>• ${e}</li>`).join("")}
                </ul>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="mb-4">
        <h4 class="fw-bold title-body-secondary">${i+1}.- ${p.pregunta}</h4>
        <p>${p.enunciado}</p>
        <textarea class="form-control mb-2" 
                  placeholder="${p.placeholder || ''}" 
                  rows="3"></textarea>
        ${ejemplosHTML}
      </div>
    `;
  }).join("");

  return preguntasHTML;
}

/* ---------------------- TABLA EVALUACIÓN ---------------------- */
function renderTablaVF(actividad) {
  let tablaHTML = `
  <div class="row m-0 p-3">
    <div>
      <table class="table table-bordered align-middle text-center tabla-vf">
        <thead>
          <tr>
            <th>Pregunta</th>
            <th>V</th>
            <th>F</th>
            <th>Retroalimentación</th>
          </tr>
        </thead>
        <tbody>
  `;

  actividad.preguntas.forEach((p, idx) => {
    tablaHTML += `
      <tr data-index="${idx}">
        <td class="text-start">${p.pregunta}</td>
        <td><input type="radio" name="vf_${idx}" class="vf-input" data-value="V"></td>
        <td><input type="radio" name="vf_${idx}" class="vf-input" data-value="F"></td>
        <td class="retro"></td>
      </tr>
    `;
  });

  tablaHTML += "</tbody></table></div></div>";
  return tablaHTML;
}



function handleTablaVF(actividad, tabla) {
  // Selecciona todos los inputs V/F
  const inputs = tabla.querySelectorAll(".vf-input");

  inputs.forEach(input => {
    input.addEventListener("change", () => {
      const row = input.closest("tr");       // fila actual
      const idx = parseInt(row.dataset.index, 10); // índice de la pregunta
      const retro = row.querySelector(".retro");   // celda de retroalimentación
      const valor = input.dataset.value;     // "V" o "F"
      const pregunta = actividad.preguntas[idx];  // pregunta correspondiente

      // Mostrar retroalimentación
      if (valor === pregunta.respuestaCorrecta) {
        retro.innerHTML = `<span class="text-success fw-bold">✔ ${pregunta.retroCorrecta}</span>`;
      } else {
        retro.innerHTML = `<span class="text-danger fw-bold">✘ ${pregunta.retroIncorrecta}</span>`;
      }
    });
  });
}








/* ---------------------- STEPS ---------------------- */
function renderSteps(pasos, instruccion) {
  return `
    <div class="actividad my-4 pb-3">
      <p class="fw-bold">${instruccion || ""}</p>
      <ol class="list-group list-group-numbered">
        ${pasos.map(p => `
          <li class="list-group-item">
            <strong>${p.titulo}:</strong> ${p.descripcion}
          </li>
        `).join("")}
      </ol>
    </div>
  `;
}

/* ---------------------- Colollapse ---------------------- */
function renderCollapseActivity(actividad) {
  const bloquesHTML = actividad.bloques.map((b, i) => {
    // Cada bloque tiene su propio accordion para opciones
    const opcionesHTML = b.opciones.map((op, j) => `
      <div class="accordion-item">
        <h2 class="accordion-header" id="heading${i}-${j}">
          <button class="accordion-button collapsed" type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapse${i}-${j}"
                  aria-expanded="false"
                  aria-controls="collapse${i}-${j}">
            ${op.boton}
          </button>
        </h2>
        <div id="collapse${i}-${j}" class="accordion-collapse collapse" aria-labelledby="heading${i}-${j}">
          <div class="accordion-body">
            ${
              // Si contenido es string simple
              typeof op.contenido === "string" 
                ? op.contenido 
                // Si es objeto y tipo "lista", llamar a renderLista()
                : op.contenido?.tipo === "lista"
                  ? renderLista(
                      op.contenido.items,
                      op.contenido.estilo || "dot",
                      0,
                      `unidadLista${i}-${j}` // ID del UL principal
                    )
                  : ""
            }
          </div>
        </div>
      </div>
    `).join("");

    return `
      <div class="mb-4">
        ${b.titulo ? `<h4 class="fw-bold title-body-secondary">${b.titulo}</h4>` : ""}
        <div class="ps-5">
          ${b.parrafo ? `<p>${b.parrafo}</p>` : ""}
          <div class="accordion" id="accordionBloque${i}">
            ${opcionesHTML}
          </div>
        </div>
      </div>
    `;
  }).join("");

  return bloquesHTML;
}

/* ---------------------- Lista ---------------------- */
function renderLista(lista, tipo = "dot", nivel = 0, parentId = "lista", unidad = "u") {
  if (!Array.isArray(lista)) return "";

  // Solo asignar id si es la lista raíz
  const listaId = (nivel === 0) ? `lista_subtema` : "";

  let claseLista = "";
  switch (tipo) {
    case "nodot": claseLista = "list-unstyled"; break;
    case "dot": claseLista = "list-disc ps-3"; break;
    case "numeric": claseLista = "list-decimal ps-3"; break;
    default: claseLista = "list-disc ps-3"; break;
  }

  // Vamos a ir acumulando el HTML mezclando listas y párrafos
  let html = "";
  let listaActual = [];

  const flushLista = () => {
    if (listaActual.length > 0) {
      html += `
      <ul ${listaId && nivel === 0 ? `id="${listaId}"` : ""} class="${claseLista}">
        ${listaActual.join("")}
      </ul>
      `;
      listaActual = [];
    }
  };

  lista.forEach((item) => {
    // Detectar si es texto plano
    if ("textoplano" in item) {
      flushLista(); // Cierra la lista antes del texto plano
      html += `<p class="px-3">${item.textoplano}</p>`;
    } else {
      let childrenHTML = "";
      if (item.hijos && item.hijos.length > 0) {
        childrenHTML = renderLista(item.hijos, tipo, nivel + 1, parentId, unidad);
      }
      listaActual.push(`<li>${item.texto || item}${childrenHTML}</li>`);
    }
  });

  // Cierra la última lista si quedó abierta
  flushLista();

  return `<div class="px-3">${html}</div>`;
}


// ---------------- Render Skill Quiz ----------------
function renderSkillQuiz(actividad, containerId) {
  const modalId = `modal_${containerId}`;

  return `
  <div class="px-3">
    <div class="actividad mb-4 px-3 pb-3" id="${containerId}">
      <div class="m-0 d-flex justify-content-end">
        <button class="btn btn-sm btn-outline-secondary btn-instrucciones" data-bs-toggle="modal" data-bs-target="#${modalId}">
          <img  style="margin-left: 26px;" src="src/img/m4_icono_instrucciones.svg"><strong>Instrucciones</strong>
        </button>
      </div>

      <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header border-0">
              <h5 class="modal-title fw-bold">Instrucciones</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
              ${actividad.instrucciones || "<p>Lee atentamente y selecciona la respuesta correcta.</p>"}
            </div>
          </div>
        </div>
      </div>

      <div class="p-3 mb-3 skillQuizContainer">
        <p class="fw-bold m-0">${actividad.planteamiento || "Responde la siguiente pregunta:"}</p>
      </div>

      <div class="p-0 row g-3 m-0 quiz-skill">
        <div class="p-3 m-0 d-flex justify-content-center align-items-center quiz-skill-pregunta">
          <p class="fs-4 mb-0"><strong>${actividad.pregunta}</strong></p>
        </div>

        <div class="p-3 m-0">
          <form class="d-flex flex-column gap-3">
            ${actividad.opciones.map((op, idx) => `
              <label class="form-check-label">
                <input type="radio" name="skillquiz_${containerId}" class="form-check-input" data-index="${idx}"> ${op.texto}
              </label>
            `).join("")}
          </form>
          <div class="feedback mt-3 p-2 border rounded" style="display:none;"></div>
        </div>
      </div>
    </div>
  </div>  
  `;
}







// ---------------- Handle Skill Quiz ----------------
function handleSkillQuizAuto(actividad, container) {
  if (!actividad || !container) return;

  const radios = container.querySelectorAll("input[type='radio']");
  const formContainer = container.querySelector("form"); // Feedback estará dentro del form
  formContainer.style.position = "relative"; // necesario para que feedback se posicione relativo al form

  radios.forEach(radio => {
    radio.addEventListener("change", () => {
      const idx = parseInt(radio.dataset.index);
      const opcion = actividad.opciones[idx];
      if (!opcion) return;

      // Creamos feedback dinámico si no existe
      let feedbackDiv = formContainer.querySelector(".feedback-modal");
      if (!feedbackDiv) {
        feedbackDiv = document.createElement("div");
        feedbackDiv.className = "feedback-modal";

        // Contenedor de texto
        const textDiv = document.createElement("div");
        textDiv.className = "feedback-text";
        feedbackDiv.appendChild(textDiv);

        // Botón cerrar
        const closeBtn = document.createElement("button");
        closeBtn.innerHTML = "&times;";
        closeBtn.className = "feedback-close";
        closeBtn.type = "button";
        closeBtn.addEventListener("click", (e) => {
          e.stopPropagation(); // evita que afecte otros eventos
          feedbackDiv.style.display = "none";
        });
        feedbackDiv.appendChild(closeBtn);

        formContainer.appendChild(feedbackDiv);
      }

      // Actualizamos contenido y clases
      feedbackDiv.classList.remove("correcta", "incorrecta"); // limpiamos estado previo
      if (opcion.correcta) {
        feedbackDiv.classList.add("correcta");
      } else {
        feedbackDiv.classList.add("incorrecta");
      }

      // Actualizamos contenido
      const textDiv = feedbackDiv.querySelector(".feedback-text");
      textDiv.innerHTML = `
        <p class="m-0">${opcion.correcta ? '✔ Correcto' : '✘ No es la respuesta más adecuada. '}<br>${opcion.feedback}</p>
      `;
      feedbackDiv.style.display = "flex";
    });
  });
}

// ---------------- Render Open Quiz ----------------

function renderOpenQuiz(actividad, containerId) {
  const modalId = `modal_${containerId}`;

  return `
  <div class="px-3">
    <div class="actividad mb-4 px-3 pb-3" id="${containerId}">
      <div class="m-0 d-flex justify-content-end">
        <button class="btn btn-sm btn-outline-secondary btn-instrucciones" data-bs-toggle="modal" data-bs-target="#${modalId}">
          <img  style="margin-left: 26px;" src="src/img/m4_icono_instrucciones2.svg"><strong style="color: var(--color-secundario-1)">Instrucciones</strong>
        </button>
      </div>

      <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header border-0">
              <h5 class="modal-title fw-bold">Instrucciones</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
              <p>${actividad.instrucciones}</p>
              <p>Tenga presente que las evaluaciones de sus respuestas serán realizadas por un sistema de Inteligencia Artificial (IA). Por lo tanto, en lo posible, verifique y complemente esta valoración.</p>
              <p>El sistema tiene la tarea de analizar y calificar cada respuesta en base a tres aspectos fundamentales, asignando una nota en escala de 1 a 7 para cada uno, según:</p>
              <ul>
                <li><strong>Claridad.</strong> Se refiere a qué tan comprensible y bien expresada está la respuesta.</li>
                <li><strong>Aplicación.</strong> Analiza la relación entre la situación presentada y la respuesta entregada por el usuario.</li>
                <li><strong>Profundidad de análisis.</strong> Mide el nivel de desarrollo y detalle incluido en la explicación. Evalúa si la respuesta va más allá de lo superficial, mostrando comprensión y una revisión exhaustiva del tema.</li>
              </ul>
              <p>Adicionalmente, cada respuesta será retroalimentada con orientaciones sobre posibilidades de mejora y corrección de errores puntuales que pudieran haberse cometido.</p>
              <p>Esperamos que esta retroalimentación le sirva para mejorar continuamente.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="p-3 mb-3 skillQuizContainer">
        <p class="fw-bold m-0">${actividad.planteamiento || "Responde la siguiente pregunta:"}</p>
      </div>

      <div class="mb-3">
        <p class="fs-4 fw-bold">${actividad.pregunta || "Responde la siguiente pregunta:"}</p>
      </div>

      <div class="quiz-open position-relative">
        <form class="openquiz-form d-flex flex-column gap-2">
          
            <textarea class="form-control openquiz-textarea" rows="4" placeholder="Escribe tu respuesta aquí" required></textarea>
          <div>
          <button type="submit" class="btn btn-lista mt-2" style="max-width: 210px;float: right;">Evaluar mi respuesta</button>
          </div>
        </form>

        <div class="openquiz-feedback mt-3 p-3 form-control" style=" position: relative; min-height: 60px;"></div>
      </div>
    </div>
  </div>  
  `;
}


function handleOpenQuiz(actividad, container, grupo) {
  if (!actividad || !container) return;

  const form = container.querySelector(".openquiz-form");
  const textarea = container.querySelector(".openquiz-textarea");
  const feedbackDiv = container.querySelector(".openquiz-feedback");

  let isSubmitting = false;

  if (!form || !textarea || !feedbackDiv) {
    console.error("Faltan elementos HTML para el quiz (form, textarea o feedbackDiv).");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;

    const respuesta = textarea.value.trim();
    if (!respuesta) {
      feedbackDiv.style.display = "block";
      feedbackDiv.textContent = "⚠️ Debes escribir una respuesta.";
      isSubmitting = false;
      return;
    }

    feedbackDiv.style.display = "block";
    feedbackDiv.textContent = "Enviando...";
    feedbackDiv.classList.remove("error");

    try {
      const res = await fetch("https://cuestionario-proxy.vercel.app/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planteamiento: actividad.planteamiento,
          consigna: actividad.pregunta,
          respuesta,
          concepto: grupo
        })
      });

      if (!res.ok) {
        let errorContent = await res.text();
        try {
          const errorJson = JSON.parse(errorContent);
          errorContent = errorJson.error || errorContent;
        } catch {}
        throw new Error(`Servidor respondió ${res.status}: ${errorContent}`);
      }

      const data = await res.json();
      textarea.value = "";

      // ✅ Manejo seguro de feedback
      const feedbackHTML = typeof data.feedback === "string" && data.feedback.trim() !== ""
        ? data.feedback
        : "<p>No se recibió retroalimentación.</p>";

      feedbackDiv.innerHTML = `
        <div class="feedback-wrapper">
          ${feedbackHTML}
          <button type="button" class="btn-close feedback-close">Cerrar</button>
        </div>
      `;

      const closeBtn = feedbackDiv.querySelector(".feedback-close");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          feedbackDiv.style.display = "none";
        });
      }

    } catch (error) {
      console.error("Error en el servidor Gemini:", error?.message || error);
      feedbackDiv.textContent = `❌ Error: ${error?.message || "No se pudo contactar al servidor."}`;
      feedbackDiv.classList.add("error");
    } finally {
      isSubmitting = false;
    }
  });
}




const content = document.getElementById("content");

content.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-inter"); // busca si el clic fue en un botón
  if (!btn) return;

  const targetId = btn.getAttribute("data-target");
  const targetSubtema = document.querySelector(`.subtema[data-id="${targetId}"]`);
  if (targetSubtema) {
    // Desactivar todos
    document.querySelectorAll("#sidebar .subtema").forEach(st => st.classList.remove("active"));
    targetSubtema.classList.add("active");

    // Cargar contenido
    const id = targetSubtema.dataset.id;
    cargarContenido(id, modulosData);

    // 👉 Abrir colapsables padres
    let parentCollapse = targetSubtema.closest(".collapse");
    while (parentCollapse) {
      const inst = bootstrap.Collapse.getInstance(parentCollapse) 
        || new bootstrap.Collapse(parentCollapse, { toggle: false });
      inst.show();
      parentCollapse = parentCollapse.parentElement.closest(".collapse");
    }

    // 👉 También abrir el módulo padre si está cerrado
    const accordionBody = targetSubtema.closest(".accordion-collapse");
    if (accordionBody) {
      const inst = bootstrap.Collapse.getInstance(accordionBody) 
        || new bootstrap.Collapse(accordionBody, { toggle: false });
      inst.show();
    }

    // Hacer scroll
    targetSubtema.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});


// ---------------- abre y cierra la tabla ----------------
  // Delegación de eventos sobre el contenedor dinámico
  document.getElementById("content").addEventListener("click", (e) => {
    const row = e.target.closest(".collapse-row");
    if (!row) return; // no clickeaste una fila colapsable
    
    const contentRow = row.nextElementSibling;
    if (contentRow && contentRow.classList.contains("tabla-interactiva")) {
      contentRow.classList.toggle("open");
      row.classList.toggle("active");
    }
  });



          // {
          //   "id": "1.4",
          //   "titulo": "Actividades para asegurar el aprendizaje en la organización",
          //   "contenido": "<h2 class='pb-4 fw-bold'>Actividades para asegurar el aprendizaje en la organización</h2><ul id='lista_u_unidad1_4-lista1' class='list-unstyled'><li><p><strong class='title-body-secondary'>Comunicar la intención de cerrar</strong> a todos los miembros de la CoP, agradeciendo los logros obtenidos y reconociendo las contribuciones de los miembros.</p></li><li><p><strong class='title-body-secondary'>Realizar Taller de cierre</strong>, para lo cual se propone la utilización de la metodología de Retrospectiva (descrita en el documento de metodología de CoPs).</p></li><li><p><strong class='title-body-secondary'>Recopilación/archivo de los documentos y artefactos de conocimiento</strong> generados por la CoP para ponerlos a disposición de la organización en el formato o canales que permitan su localización y uso.</p></li><li><p><strong class='title-body-secondary'>Transferencia/difusión de productos de la COP</strong>, hacia el resto de la organización. Esto puede incluir actividades de difusión de los aprendizajes generados (como talleres, sesiones de presentación de resultados), o también actividades concretas de formación u otras.</li></ul>",
          //   "imagen": "<img src='src/img/m1_s6_f1.jpg' alt='Modulo1' class='img-fluid'>"
          // },

  