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
  menu.innerHTML = ""; // limpiar

  modulos.forEach((modulo, index) => {
    const moduloId = `modulo${modulo.id}_${containerId}`;
    const collapseId = `collapse${modulo.id}_${containerId}`;

    const moduloItem = document.createElement("div");
    moduloItem.classList.add("accordion-item");

    // Condición especial para "Inicio"
    const isInicio = modulo.id === 0;

    // Render de subtemas solo si existen
    let subtemasHTML = "";
    if (modulo.subtemas && modulo.subtemas.length > 0 && !isInicio) {
      subtemasHTML = `
        <div class="accordion-body">
          <ul class="list-unstyled subtema-lista">
            ${modulo.subtemas.map(st => `<li class="subtema" data-id="${st.id}">${st.titulo}</li>`).join("")}
          </ul>
        </div>
      `;
    }

    moduloItem.innerHTML = `
      <h2 class="accordion-header" id="${moduloId}">
        <button class="accordion-button ${index > 0 ? 'collapsed' : ''}" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#${collapseId}">
          <div class="d-flex flex-column flex-lg-row w-100 text-start gap-2">
            ${
              isInicio 
                ? `<div class="fw-bold flex-grow-1" style="font-family: 'Montserrat', sans-serif; font-weight:700;">
                    ${modulo.titulo}
                  </div>`
                : `<div class="fw-bold me-md-2 flex-shrink-0" style="font-family: 'Montserrat', sans-serif; font-weight:700;">
                    Módulo ${modulo.id}:
                  </div>
                  <div class="fw-light flex-grow-1" style="font-family: 'Montserrat', sans-serif; font-weight:300;">
                    ${modulo.titulo}
                  </div>`
            }
          </div>
        </button>
      </h2>
      <div id="${collapseId}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}">
        ${subtemasHTML}
      </div>
    `;

    menu.appendChild(moduloItem);

    // ------------------- Evento del botón del módulo -------------------
    const btnModulo = moduloItem.querySelector(".accordion-button");
    const collapse = new bootstrap.Collapse(document.getElementById(collapseId), { toggle: false });

    btnModulo.addEventListener("click", () => {
      // Cerrar todos los demás collapse
      modulos.forEach(m => {
        if (m.id !== modulo.id) {
          const otherCollapseEl = document.getElementById(`collapse${m.id}_${containerId}`);
          const otherCollapse = bootstrap.Collapse.getInstance(otherCollapseEl);
          if (otherCollapse) otherCollapse.hide();
        }
      });

      // Abrir el collapse del módulo actual
      collapse.show();

      // Quitar estado "active" de todos los subtemas
      menu.querySelectorAll(".subtema").forEach(st => st.classList.remove("active"));

      // Portada
      const portada = {
        id: `${modulo.id}.0`,
        titulo: modulo.titulo,
        contenido: `
          <div class="row m-0 p-3 encabezado">
            <div class="d-flex flex-row-reverse">
              <img src="src/img/logoKWORKS.svg" alt="Modulo${modulo.id}" style="height:30px; width:auto; display:block; padding-right: 19px; margin-top: 12px;" class="img-fluid">
            </div>
            <h2>
              <span class="fw-bold display-2">${isInicio ? "" : "Módulo " + modulo.id}</span><br>
              <span class="fw-bold title-body-secondary">${modulo.titulo}</span>
            </h2>
          </div>
          ${modulo.img ? `<img src="${modulo.img}" alt="Modulo ${modulo.id}" class="img-fluid">` : ""}
        `,
        imagen: ""
      };

      // Llamada correcta a cargarContenido con portada temporal
      const moduloTemp = { ...modulo, subtemas: [portada, ...(modulo.subtemas || [])] };
      cargarContenido(portada.id, modulosData);
    });

    // ------------------- Eventos de subtemas -------------------
    const menuList = moduloItem.querySelectorAll(".subtema");
    menuList.forEach(item => {
      item.addEventListener("click", () => {
        // limpiar estados anteriores
        menu.querySelectorAll(".subtema").forEach(st => st.classList.remove("active"));
        item.classList.add("active");

        const id = item.dataset.id;
        cargarContenido(id, modulosData);

        // cerrar offcanvas en móvil
        const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById("offcanvasMenu"));
        if (offcanvas) offcanvas.hide();
      });
    });
  });
}

  

  function cargarContenido(subtemaId, modulos) {
    const content = document.getElementById("content");
  
    // Mostrar spinner
    content.innerHTML = `<div class="text-center p-5"><div class="spinner-border" role="status"></div><p>Cargando...</p></div>`;
  
    setTimeout(() => {
      // ---------------- Caso especial: Inicio ----------------
      if (subtemaId === "0.0") {
        const inicioModulo = modulos.find(m => m.id === 0);
        if (!inicioModulo) return;
      
        const listaModulosHTML = modulos
          .filter(m => m.id !== 0 && m.subtemas?.length > 0)
          .map(m => `
            <li>
              <h5 class="fw-bold mb-3" style="color: var(--color-secundario-3);">
                Módulo ${m.id}: <span class="fw-light">${m.titulo}</span>
              </h5>
            </li>
          `)
          .join("");
      
        content.innerHTML = `
          <div class="row m-0 p-3">
            <div class="col-12 mb-3">
              <img src="${inicioModulo.img}" alt="Inicio" class="img-fluid">
            </div>
            <div class="col-12 mb-3">
              ${inicioModulo.contenido}
            </div>
            <div class="col-12 mb-3">
              <ul class="list-unstyled">
                ${listaModulosHTML}
              </ul>
              <img src="src/img/vineta.png" alt="Inicio" class="img-fluid">
            </div>
          </div>
        `;
      
        content.querySelectorAll(".inicio-modulo-link").forEach(link => {
          link.addEventListener("click", e => {
            e.preventDefault();
            const id = link.dataset.id;
            cargarContenido(id, modulos);
          });
        });
      
        mostrarToast("Inicio cargado");
        return;
      }
  
      // ---------------- Caso portada/portadilla ----------------
      if (subtemaId.endsWith(".0")) {
        const numModulo = subtemaId.split(".")[0];
        const modulo = modulos.find(m => m.id == numModulo);
        if (!modulo) return;
  
        content.innerHTML = `
          <div class="row m-0 p-3 encabezado">
            <div class="d-flex flex-row-reverse">
              <img src="src/img/logoKWORKS.svg" alt="Modulo${modulo.id}" 
                  style="height:30px; width:auto; display:block; padding-right: 19px; margin-top: 12px;" 
                  class="img-fluid">
            </div>
            <h2>
              <span class="fw-bold display-2">Módulo ${modulo.id}</span><br>
              <span class="fw-bold title-body-secondary">${modulo.titulo}</span>
            </h2>
          </div>
          <div class="img-container">
            <img src="${modulo.img}" alt="Modulo ${modulo.id}" class="p-0">
          </div>
        `;
  
        mostrarToast("Portada cargada");
        return;
      }
  
      // ---------------- Buscar subtema normal ----------------
      const result = findSubtemaById(modulos, subtemaId);
      if (!result) return;
  
      const { subtema, path } = result;
      const numModulo = subtemaId.split('.')[0];
      const breadcrumbPath = [`Módulo ${numModulo}`, ...path];

      // ---------------- Detectar subtema slides ----------------
      if (subtema.slides && Array.isArray(subtema.slides)) {
        content.innerHTML = renderSlides(subtema, path);
        return;
      }
  
      // ---------------- Render contenido principal ----------------
      let contenidoHTML = "";
  
      if (typeof subtema.contenido === "string") {
        contenidoHTML = subtema.contenido;
      }
  
      if (Array.isArray(subtema.contenido)) {
        contenidoHTML = subtema.contenido.map((bloque, idx) => {
          if (bloque.tipo === "texto") return `<p>${bloque.texto}</p>`;
          if (bloque.tipo === "lista") {
            return renderLista(
              bloque.items,
              bloque.estilo || "dot",
              0,
              `unidad${subtema.id}-lista${idx}`
            );
          }
          return "";
        }).join("");
      }
  
      if (subtema.lista) {
        contenidoHTML += renderLista(
          subtema.lista,
          subtema.tipoLista || "dot",
          0,
          `unidad${subtema.id}-lista0`
        );
      }

  
      content.innerHTML = `
        <div class="row m-0 p-3 encabezado">
          <h3>
            <span class="fw-bold">Módulo ${numModulo}:</span>
            <span class="fw-light">${path[0]}</span>
          </h3>
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              ${breadcrumbPath.map((p, i) => 
                `<li class="breadcrumb-item ${i === breadcrumbPath.length-1 ? 'active' : ''}">
                  <small class="fw-bold">${p}</small>
                </li>`
              ).join("")}
            </ol>
          </nav>
        </div>
        <div class="row m-0 p-3">
          <div>${contenidoHTML}</div>
        </div>
        ${subtema.imagen || ""}
      `;
  

// ---------------- Actividades ----------------
if (subtema) {
  console.log("Subtema recibido:", subtema);

  // 1️⃣ Actividad directa en el subtema
  if (subtema.actividad) {
    let actividadHTML = "";
    let skillContainerId = `skillQuiz_${subtema.id}_${Date.now()}`;

    if (subtema.actividad.tipo === "skillquiz") {
      actividadHTML += renderSkillQuiz(subtema.actividad, skillContainerId);
    } else {
      actividadHTML += renderActividad(subtema.actividad);
    }

    // Insertamos directamente en content
    content.insertAdjacentHTML("beforeend", actividadHTML);

    // 🔹 Inicializadores según el tipo
    if (subtema.actividad.tipo === "skillquiz") {
      const skillContainer = document.getElementById(skillContainerId);
      if (skillContainer) handleSkillQuizAuto(subtema.actividad, skillContainer);
    }

    if (subtema.actividad.tipo === "tablaVF") {
      const tabla = content.querySelector("table.table");
      if (tabla) handleTablaVF(subtema.actividad, tabla);
    }
  }

  // 2️⃣ Actividades dentro de slides.items
  if (subtema.slides) {
    subtema.slides.forEach((slide, i) => {
      if (slide.items) {
        slide.items.forEach((item, j) => {
          if (item.actividad) {
            let actividadHTML = "";
            const skillContainerId = `skillQuiz_${subtema.id}_${i}_${j}_${Date.now()}`;

            if (item.actividad.tipo === "skillquiz") {
              actividadHTML += renderSkillQuiz(item.actividad, skillContainerId);
            } else {
              actividadHTML += renderActividad(item.actividad);
            }

            // Insertamos directamente en content
            content.insertAdjacentHTML("beforeend", actividadHTML);

            // 🔹 Inicializadores según el tipo
            if (item.actividad.tipo === "skillquiz") {
              const skillContainer = document.getElementById(skillContainerId);
              if (skillContainer) handleSkillQuizAuto(item.actividad, skillContainer);
            }

            if (item.actividad.tipo === "tablaVF") {
              const tabla = content.querySelector("table.table:last-child");
              if (tabla) handleTablaVF(item.actividad, tabla);
            }
          }
        });
      }
    });
  }
}




  
      mostrarToast("Contenido actualizado");
    }, 800);
  }
  
  
  // ---------------- Función auxiliar para listas ----------------
  function renderLista(items, estilo = "dot", nivel = 0, listaId = null) {
    if (!items || !Array.isArray(items)) return "";
  
    const ulAttrs = nivel === 0 && listaId ? ` id="${listaId}"` : "";
    const ulClass = estilo === "dot" ? "list-unstyled ms-3" : "list-unstyled";
  
    return `
      <ul class="${ulClass}"${ulAttrs}>
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
  toast.show();
}

function marcarCompletado(subtemaId) {
  let progreso = JSON.parse(localStorage.getItem("progreso")) || {};
  progreso[subtemaId] = true;
  localStorage.setItem("progreso", JSON.stringify(progreso));
  mostrarToast(`Subtema ${subtemaId} completado ✅`);
}
function renderActividad(actividad) {
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
      return renderOpenQuestion(actividad);

    case "steps":
      return renderSteps(actividad.pasos, actividad.instruccion);

    case "collapse": 
      return renderCollapseActivity(actividad);
    
    case "tablaVF":
      return renderTablaVF(actividad);

    case "skillquiz":
      return renderSkillQuiz(actividad);

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
      <div class="d-flex align-items-center justify-content-between flex-wrap">${botones}</div>
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
    <div class="tab-wrapper mb-3 pt-3">
      <div class="tab-buttons d-flex align-items-start justify-content-between mb-2">${botonesHTML}</div>
      ${contenidoHTML}
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

  const flatSlides = subtema.slides?.flatMap(grupo =>
    grupo.items.map(item => ({ ...item, grupo: grupo.grupo }))
  ) || [];

  function getCurrentBreadcrumb(index) {
    const numModulo = subtema.id.split(".")[0];
    const base = [`Módulo ${numModulo}`, ...path];
    const currentGrupo = flatSlides[index]?.grupo || "";
    return [...base, currentGrupo];
  }

  const navButtons = `
    <div class="d-flex justify-content-between mt-3">
      <button id="btnSlidePrev" class="btn btn-outline-secondary">◂ Volver</button>
      <button id="btnSlideNext" class="btn btn-outline-secondary">Siguiente ▸</button>
    </div>
  `;

  const container = `
    <div id="${slideId}">
      <div id="slideEncabezado"></div>
      <div class="row m-0 p-3 actividad">
        <div id="slideContent" class="mt-3 p-3"></div>
        ${navButtons}
      </div>
    </div>
  `;

  setTimeout(() => {
    const slideContent = document.getElementById("slideContent");
    const slideEncabezado = document.getElementById("slideEncabezado");

    async function renderCurrentSlide() {
      const current = flatSlides[activeSlideIndex];
      if (!current) {
        slideContent.innerHTML = "<p>No hay slides disponibles.</p>";
        return;
      }

      const numModulo = subtema.id.split(".")[0];
      const breadcrumbPath = getCurrentBreadcrumb(activeSlideIndex);

      slideEncabezado.innerHTML = `
        <div class="row m-0 p-3 encabezado">
          <h3>
            <span class="fw-bold">Módulo ${numModulo}:</span>
            <span class="fw-light">${path[0] || ""}</span>
          </h3>
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              ${breadcrumbPath.map((p, i) => 
                `<li class="breadcrumb-item ${i === breadcrumbPath.length-1 ? 'active' : ''}">
                  <small class="${i === breadcrumbPath.length-1 ? 'fw-bold' : ''}">${p}</small>
                </li>`
              ).join("")}
            </ol>
          </nav>
        </div>
        <div class="row m-0 p-3">
          <div><h2 class="pb-4 fw-bold">${subtema.titulo || ""}</h2></div>
        </div>
      `;

      let html = "";
      if (current.titulo) html += `<h3 class="fw-bold mb-3 title-body-secondary">${current.titulo}</h3>`;

      if (typeof current.contenido === "string") {
        html += current.contenido;
      } else if (current.contenido?.tipo === "lista") {
        html += renderLista(
          current.contenido.items,
          current.contenido.estilo || "dot",
          0,
          `slideLista${activeSlideIndex}`,
          `subtema${subtema.id}`
        );
      }

      // 🔹 Actividad
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

      slideContent.innerHTML = html;

      // Inicializar skillquiz
      if (containerId && current.actividad.tipo === "skillquiz") {
        const skillContainer = document.getElementById(containerId);
        if (skillContainer) handleSkillQuizAuto(current.actividad, skillContainer);
      }

      // Inicializar openquiz
      if (containerId && current.actividad.tipo === "openquiz") {
        const openContainer = document.getElementById(containerId);
        if (openContainer) handleOpenQuiz(current.actividad, openContainer);
      }

      // Otros tipos
      if (current.actividad?.tipo === "quiz") handleQuiz(current.actividad.preguntas);
      if (current.actividad?.tipo === "truefalse") handleTrueFalse(current.actividad.preguntas);
      if (current.actividad?.tipo === "tablaVF") {
        const tabla = slideContent.querySelector("table:last-child");
        if (tabla) handleTablaVF(current.actividad, tabla);
      }
    }

    renderCurrentSlide();

    document.getElementById("btnSlidePrev").addEventListener("click", () => {
      if (activeSlideIndex > 0) {
        activeSlideIndex--;
        renderCurrentSlide();
      }
    });

    document.getElementById("btnSlideNext").addEventListener("click", () => {
      if (activeSlideIndex < flatSlides.length - 1) {
        activeSlideIndex++;
        renderCurrentSlide();
      }
    });

  }, 0);

  return container;
}






/* ---------------------- QUIZ ---------------------- */
function renderQuiz(preguntas) {
  return `
    <div class="actividad my-4">
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
    <div class="actividad my-4">
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
        <td><input type="checkbox" class="vf-checkbox" data-value="V"></td>
        <td><input type="checkbox" class="vf-checkbox" data-value="F"></td>
        <td class="retro"></td>
      </tr>
    `;
  });

  tablaHTML += "</tbody></table></div></div>";
  return tablaHTML;
}


function handleTablaVF(actividad, container) {
  const rows = container.querySelectorAll("tbody tr");

  rows.forEach(row => {
    const checkboxes = row.querySelectorAll(".vf-checkbox");
    const retro = row.querySelector(".retro");
    const idx = parseInt(row.dataset.index);

    checkboxes.forEach(chk => {
      chk.addEventListener("change", () => {
        // Desmarcar el otro checkbox en la misma fila
        checkboxes.forEach(c => { if (c !== chk) c.checked = false; });

        const valor = chk.dataset.value;
        const pregunta = actividad.preguntas[idx];

        if (valor === pregunta.respuestaCorrecta) {
          retro.innerHTML = `<span class="fw-bold">${pregunta.retroCorrecta}</span>`;
        } else {
          retro.innerHTML = `<span class="fw-bold">${pregunta.retroIncorrecta}</span>`;
        }
      });
    });
  });
}


/* ---------------------- STEPS ---------------------- */
function renderSteps(pasos, instruccion) {
  return `
    <div class="actividad my-4">
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
  const listaId = (nivel === 0) ? `lista_${unidad}_${parentId}` : "";

  let claseLista = "";
  switch (tipo) {
    case "nodot": claseLista = "list-unstyled"; break;
    case "dot": claseLista = "list-disc ps-3"; break;
    case "numeric": claseLista = "list-decimal ps-3"; break;
    default: claseLista = "list-disc ps-3"; break;
  }

  return `
    <ul ${listaId ? `id="${listaId}"` : ""} class="${claseLista}">
      ${lista.map((item) => {
        let childrenHTML = "";
        if (item.hijos && item.hijos.length > 0) {
          childrenHTML = renderLista(item.hijos, tipo, nivel + 1, parentId, unidad);
        }
        return `<li>${item.texto || item}${childrenHTML}</li>`;
      }).join("")}
    </ul>
  `;
}

// ---------------- Render Skill Quiz ----------------
function renderSkillQuiz(actividad, containerId) {
  const modalId = `modal_${containerId}`;

  return `
    <div class="actividad my-4" id="${containerId}">
      <div class="mb-3">
        <button class="btn btn-info" data-bs-toggle="modal" data-bs-target="#${modalId}">
          Instrucciones
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

      <div class="mb-3">
        <p class="fw-bold">${actividad.planteamiento || "Responde la siguiente pregunta:"}</p>
      </div>

      <div class="quiz-skill border p-3 rounded row g-3">
        <div class="col-12 d-flex align-items-center">
          <p class="mb-0"><strong>${actividad.pregunta}</strong></p>
        </div>

        <div class="col-12">
          <form class="d-flex flex-column gap-2">
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

      // Actualizamos contenido
      const textDiv = feedbackDiv.querySelector(".feedback-text");
      textDiv.innerHTML = `
        <p class="${opcion.correcta ? 'text-success' : 'text-danger'} fw-bold">
          ${opcion.correcta ? '✔ Correcto' : '✘ Incorrecto'}
        </p>
        <p>${opcion.feedback}</p>
      `;
      feedbackDiv.style.display = "flex";
    });
  });
}

// ---------------- Render Open Quiz ----------------

function renderOpenQuiz(actividad, containerId) {
  const modalId = `modal_${containerId}`;

  return `
    <div class="actividad my-4" id="${containerId}">
      <div class="mb-3">
        <button class="btn btn-info" data-bs-toggle="modal" data-bs-target="#${modalId}">
          Instrucciones
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
              ${actividad.instrucciones || "<p>Lee atentamente y escribe tu respuesta.</p>"}
            </div>
          </div>
        </div>
      </div>

      <div class="mb-3">
        <p class="fw-bold">${actividad.pregunta || "Responde la siguiente pregunta:"}</p>
      </div>

      <div class="quiz-open border p-3 rounded position-relative">
        <form class="openquiz-form d-flex flex-column gap-2">
          <label>
            Respuesta:
            <textarea class="openquiz-textarea" rows="4" placeholder="Escribe tu respuesta aquí" required></textarea>
          </label>
          <button type="submit" class="btn btn-primary mt-2">Enviar</button>
        </form>

        <div class="openquiz-feedback mt-3 p-3 border rounded bg-light" style="display:none; position: relative;"></div>
      </div>
    </div>
  `;
}


function handleOpenQuiz(actividad, container) {
  if (!actividad || !container) return;

  const form = container.querySelector(".openquiz-form");
  const textarea = container.querySelector(".openquiz-textarea");
  const feedbackDiv = container.querySelector(".openquiz-feedback");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const respuesta = textarea.value.trim();
    if (!respuesta) return;

    feedbackDiv.style.display = "block";
    feedbackDiv.textContent = "Enviando...";

    try {
      // Adaptar URL a tu servicio
      const res = await fetch("https://cuestionario-proxy.vercel.app/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pregunta: actividad.pregunta,
          respuesta
        })
      });

      if (!res.ok) throw new Error("Error en la respuesta del servidor");

      const data = await res.json();
      feedbackDiv.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
          <div class="feedback-text flex-grow-1 me-2">${data.feedback || "No se recibió retroalimentación."}</div>
          <button type="button" class="btn-close feedback-close"></button>
        </div>
      `;

      const closeBtn = feedbackDiv.querySelector(".feedback-close");
      closeBtn.addEventListener("click", () => {
        feedbackDiv.style.display = "none";
      });
    } catch (err) {
      feedbackDiv.textContent = "Ocurrió un error: " + err.message;
    }
  });
}





          // {
          //   "id": "1.4",
          //   "titulo": "Actividades para asegurar el aprendizaje en la organización",
          //   "contenido": "<h2 class='pb-4 fw-bold'>Actividades para asegurar el aprendizaje en la organización</h2><ul id='lista_u_unidad1_4-lista1' class='list-unstyled'><li><p><strong class='title-body-secondary'>Comunicar la intención de cerrar</strong> a todos los miembros de la CoP, agradeciendo los logros obtenidos y reconociendo las contribuciones de los miembros.</p></li><li><p><strong class='title-body-secondary'>Realizar Taller de cierre</strong>, para lo cual se propone la utilización de la metodología de Retrospectiva (descrita en el documento de metodología de CoPs).</p></li><li><p><strong class='title-body-secondary'>Recopilación/archivo de los documentos y artefactos de conocimiento</strong> generados por la CoP para ponerlos a disposición de la organización en el formato o canales que permitan su localización y uso.</p></li><li><p><strong class='title-body-secondary'>Transferencia/difusión de productos de la COP</strong>, hacia el resto de la organización. Esto puede incluir actividades de difusión de los aprendizajes generados (como talleres, sesiones de presentación de resultados), o también actividades concretas de formación u otras.</li></ul>",
          //   "imagen": "<img src='src/img/m1_s6_f1.jpg' alt='Modulo1' class='img-fluid'>"
          // },