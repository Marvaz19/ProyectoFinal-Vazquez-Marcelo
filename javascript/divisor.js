// divisor.js

// ---------- UTILIDADES ----------
function guardarEnStorage(clave, valor) {
  try {
    sessionStorage.setItem(clave, JSON.stringify(valor));
  } catch (error) {
    console.error("Error guardando en storage:", error);
    mostrarMensaje("⚠️ No se pudo guardar la información.", "error");
  }
}

function obtenerDeStorage(clave) {
  try {
    const data = sessionStorage.getItem(clave);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error recuperando de storage:", error);
    mostrarMensaje("⚠️ No se pudo recuperar la información.", "error");
    return null;
  }
}

function mostrarMensaje(texto, tipo = "info") {
  const div = document.createElement("div");
  div.textContent = texto;
  div.className = tipo === "error" ? "msg-error" : "msg-info";
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

// ---------- CARGA ASÍNCRONA DE GASTOS ----------
async function cargarGastos() {
  try {
    const respuesta = await fetch("./data/gastos.json"); // ruta ajustada a /data/
    if (!respuesta.ok) throw new Error("Error al cargar gastos");
    const gastos = await respuesta.json();

    renderizarGastos(gastos);
    guardarEnStorage("gastosDisponibles", gastos);
  } catch (error) {
    console.error("Error cargando gastos:", error);
    mostrarMensaje("⚠️ No se pudieron cargar los tipos de gasto.", "error");

    const backup = obtenerDeStorage("gastosDisponibles");
    if (backup) renderizarGastos(backup);
  }
}

function renderizarGastos(gastos) {
  const contenedor = document.getElementById("gastoCards");
  contenedor.innerHTML = "";
  gastos.forEach(gasto => {
    const card = document.createElement("div");
    card.className = "gasto-card";
    card.innerHTML = `<img src="${gasto.icono}" alt="${gasto.nombre}" /><p>${gasto.nombre}</p>`;
    card.onclick = () => {
      document.querySelectorAll(".gasto-card").forEach(c => c.classList.remove("seleccionado"));
      card.classList.add("seleccionado");
      guardarEnStorage("gastoSeleccionado", gasto);
      mostrarMensaje(`✅ Seleccionaste: ${gasto.nombre}`);
    };
    contenedor.appendChild(card);
  });
}

// ---------- INTERFAZ DINÁMICA ----------
function generarFormulario() {
  const cantidad = document.getElementById("cantidadPersonas").value;
  const form = document.getElementById("personasForm");
  form.innerHTML = "";

  for (let i = 0; i < cantidad; i++) {
    const div = document.createElement("div");
    div.className = "persona-form";
    div.innerHTML = `
      <label>Persona ${i + 1}:</label>
      <input type="text" placeholder="Nombre" id="nombre${i}" />
      <input type="number" placeholder="Gasto" id="gasto${i}" />
      <button type="button" class="btn-cambiar" onclick="mostrarSelector(${i}, this)">Seleccionar Tipo de Gasto</button>
      <span id="gastoTipo${i}" class="tipo-seleccionado">Ninguno</span>
    `;
    form.appendChild(div);
  }

  const btn = document.createElement("button");
  btn.textContent = "Calcular";
  btn.onclick = calcular;
  form.appendChild(btn);
}

// ---------- SELECCIÓN DE TIPO DE GASTO ----------
function mostrarSelector(index, boton) {
  const gastos = obtenerDeStorage("gastosDisponibles") || [];
  const menu = document.createElement("div");
  menu.className = "menu-flotante";

  gastos.forEach(gasto => {
    const img = document.createElement("img");
    img.src = gasto.icono;
    img.alt = gasto.nombre;
    img.title = gasto.nombre;
    img.onclick = () => {
      const span = document.getElementById(`gastoTipo${index}`);
      span.innerHTML = `<img src="${gasto.icono}" alt="${gasto.nombre}" class="icono-mini" /> ${gasto.nombre}`;
      guardarEnStorage(`gastoPersona${index}`, gasto);
      menu.remove();
    };
    menu.appendChild(img);
  });

  // Posicionar el menú cerca del botón
  const rect = boton.getBoundingClientRect();
  menu.style.top = `${rect.bottom + window.scrollY}px`;
  menu.style.left = `${rect.left + window.scrollX}px`;

  document.body.appendChild(menu);

  // Cerrar al hacer clic afuera
  document.addEventListener("click", function cerrarMenu(e) {
    if (!menu.contains(e.target) && e.target !== boton) {
      menu.remove();
      document.removeEventListener("click", cerrarMenu);
    }
  });
}

// ---------- CÁLCULO ----------
function calcular() {
  const cantidad = document.getElementById("cantidadPersonas").value;
  let total = 0;
  let detalles = [];

  for (let i = 0; i < cantidad; i++) {
    const nombre = document.getElementById(`nombre${i}`).value || `Persona ${i + 1}`;
    const gasto = parseFloat(document.getElementById(`gasto${i}`).value) || 0;

    // Recuperar tipo de gasto (nombre + icono)
    const span = document.getElementById(`gastoTipo${i}`);
    const tipoGasto = span.textContent;
    const iconoHTML = span.querySelector("img") ? span.querySelector("img").outerHTML : "";

    total += gasto;
    detalles.push({ nombre, gasto, tipoGasto, iconoHTML });
  }

  guardarEnStorage("detallesGastos", detalles);

  const resultado = document.getElementById("resultado");
  resultado.innerHTML = `<p>Total: $${total}</p>`;
  detalles.forEach(d => {
    resultado.innerHTML += `<p>${d.nombre} aportó $${d.gasto} ${d.iconoHTML} ${d.tipoGasto}</p>`;
  });
}

// ---------- INICIO ----------
document.addEventListener("DOMContentLoaded", cargarGastos);
