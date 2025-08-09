// ====== VARIABLES GLOBALES ======
let personas = [];
const tiposDeGasto = [
    { nombre: "Carne", icono: "https://cdn-icons-png.flaticon.com/512/16779/16779245.png" },
    { nombre: "Bebidas", icono: "https://cdn-icons-png.flaticon.com/512/763/763072.png" },
    { nombre: "Leña", icono: "https://cdn-icons-png.flaticon.com/512/9920/9920887.png" },
    { nombre: "Tragos", icono: "https://cdn-icons-png.flaticon.com/512/4067/4067084.png" },
    { nombre: "Cartas", icono: "https://cdn-icons-png.flaticon.com/256/3271/3271161.png" },
    { nombre: "Pizza", icono: "https://cdn-icons-png.flaticon.com/512/1404/1404945.png" },
    { nombre: "Sándwich", icono: "https://cdn-icons-png.flaticon.com/512/1625/1625062.png" },
    { nombre: "Nada", icono: "https://cdn-icons-png.flaticon.com/512/8910/8910710.png" }
];

// ====== CREAR MENU FLOTANTE ======
function crearMenuFlotante(index) {
    // Si ya existe un menú abierto, eliminarlo
    const menuExistente = document.getElementById("menuFlotante");
    if (menuExistente) menuExistente.remove();

    const menu = document.createElement("div");
    menu.id = "menuFlotante";
    menu.classList.add("menu-flotante");

    tiposDeGasto.forEach(t => {
        const icono = document.createElement("img");
        icono.src = t.icono;
        icono.alt = t.nombre;
        icono.title = t.nombre;
        icono.onclick = () => {
            // Cambiar icono en miniIcono
            const miniIcono = document.getElementById(`miniIcono${index}`);
            miniIcono.src = t.icono;
            miniIcono.alt = t.nombre;
            miniIcono.style.display = "inline";

            // Cambiar selección en el selector grande
            const selector = document.getElementById(`selector${index}`);
            selector.querySelectorAll(".gasto-card").forEach(card => card.classList.remove("seleccionado"));
            const match = Array.from(selector.querySelectorAll(".gasto-card")).find(card => card.querySelector("p").textContent === t.nombre);
            if (match) match.classList.add("seleccionado");

            menu.remove();
        };
        menu.appendChild(icono);
    });

    document.body.appendChild(menu);

    // Posicionar cerca del icono clickeado
    const miniIcono = document.getElementById(`miniIcono${index}`);
    const rect = miniIcono.getBoundingClientRect();
    menu.style.top = `${rect.bottom + window.scrollY + 5}px`;
    menu.style.left = `${rect.left + window.scrollX}px`;
}

// ====== GENERAR FORMULARIO ======
function generarFormulario(datosPrevios = null) {
    const cantidad = datosPrevios ? datosPrevios.length : parseInt(document.getElementById("cantidadPersonas").value);
    const container = document.getElementById("personasForm");
    container.innerHTML = "";

    if (!cantidad || cantidad <= 0) {
        alert("Por favor, ingrese un número válido de personas.");
        return;
    }

    for (let i = 0; i < cantidad; i++) {
        const nombreValor = datosPrevios ? datosPrevios[i].nombre : "";
        const gastoValor = datosPrevios ? datosPrevios[i].gasto : "";
        const tipoValor = datosPrevios ? datosPrevios[i].tipo : "";

        const div = document.createElement("div");
        div.classList.add("persona-form");

        div.innerHTML = `
            <label>Nombre:</label>
            <span style="display:flex; align-items:center; gap:5px;">
                <input type="text" id="nombre${i}" placeholder="Persona ${i + 1}" value="${nombreValor}">
                <img id="miniIcono${i}" src="${getIcono(tipoValor)}" alt="${tipoValor}" style="width:25px; height:25px; display:${tipoValor ? 'inline' : 'none'}; cursor:pointer;">
            </span>
            <label>Gasto:</label>
            <input type="number" id="gasto${i}" placeholder="0" value="${gastoValor}">
            <label>Tipo de gasto:</label>
            <div class="selector-iconos" id="selector${i}"></div>
        `;
        container.appendChild(div);

        // Evento click para abrir menú flotante desde mini icono
        document.getElementById(`miniIcono${i}`).onclick = () => crearMenuFlotante(i);

        // Crear iconos en el selector principal
        const selectorDiv = div.querySelector(`#selector${i}`);
        tiposDeGasto.forEach(t => {
            const iconoDiv = document.createElement("div");
            iconoDiv.classList.add("gasto-card");
            if (t.nombre === tipoValor) iconoDiv.classList.add("seleccionado");

            iconoDiv.innerHTML = `<img src="${t.icono}" alt="${t.nombre}"><p>${t.nombre}</p>`;
            iconoDiv.onclick = () => {
                selectorDiv.querySelectorAll(".gasto-card").forEach(card => card.classList.remove("seleccionado"));
                iconoDiv.classList.add("seleccionado");

                const miniIcono = document.getElementById(`miniIcono${i}`);
                miniIcono.src = t.icono;
                miniIcono.alt = t.nombre;
                miniIcono.style.display = "inline";
            };

            selectorDiv.appendChild(iconoDiv);
        });
    }

    const boton = document.createElement("button");
    boton.textContent = "Calcular";
    boton.onclick = guardarYCalcular;
    container.appendChild(boton);
}

// ====== OBTENER ICONO POR NOMBRE ======
function getIcono(nombre) {
    const tipo = tiposDeGasto.find(t => t.nombre === nombre);
    return tipo ? tipo.icono : "";
}

// ====== GUARDAR EN SESSIONSTORAGE Y CALCULAR ======
function guardarYCalcular() {
    personas = [];
    const inputsNombre = document.querySelectorAll('[id^="nombre"]');
    const inputsGasto = document.querySelectorAll('[id^="gasto"]');

    inputsNombre.forEach((input, index) => {
        const nombre = input.value.trim() || `Persona ${index + 1}`;
        const gasto = parseFloat(inputsGasto[index].value) || 0;
        const seleccionado = document.querySelector(`#selector${index} .gasto-card.seleccionado p`);
        const tipo = seleccionado ? seleccionado.textContent : "Nada";

        personas.push({ nombre, gasto, tipo });
    });

    sessionStorage.setItem("personas", JSON.stringify(personas));
    mostrarResultados();
}

// ====== MOSTRAR RESULTADOS ======
function mostrarResultados() {
    const resultadoDiv = document.getElementById("resultado");
    resultadoDiv.innerHTML = "";

    const dataGuardada = sessionStorage.getItem("personas");
    if (!dataGuardada) return;

    const personasRecuperadas = JSON.parse(dataGuardada);
    const total = personasRecuperadas.reduce((sum, p) => sum + p.gasto, 0);
    const promedio = total / personasRecuperadas.length;

    resultadoDiv.innerHTML += `<p>Total gastado: $${total.toFixed(2)}</p>`;
    resultadoDiv.innerHTML += `<p>Promedio por persona: $${promedio.toFixed(2)}</p>`;

    personasRecuperadas.forEach(p => {
        const diferencia = p.gasto - promedio;
        const tipoInfo = tiposDeGasto.find(t => t.nombre === p.tipo) || tiposDeGasto.find(t => t.nombre === "Nada");
        
        const mensaje = diferencia > 0
            ? `${p.nombre} debe recibir $${Math.abs(diferencia).toFixed(2)}`
            : `${p.nombre} debe pagar $${Math.abs(diferencia).toFixed(2)}`;

        resultadoDiv.innerHTML += `
            <p>
                <img src="${tipoInfo.icono}" alt="${p.tipo}" style="width:25px; height:25px; vertical-align:middle; margin-right:5px;">
                <strong>${p.nombre}</strong> (${p.tipo}) → ${mensaje}
            </p>
        `;
    });
}

// ====== BUSCAR GASTO ======
function buscarGasto() {
    const texto = document.getElementById("busquedaGasto").value.toLowerCase();
    const resultadosDiv = document.getElementById("resultadosBusqueda");
    resultadosDiv.innerHTML = "";

    const cards = document.querySelectorAll(".gasto-card");
    cards.forEach(card => {
        const nombreGasto = card.querySelector("p").textContent.toLowerCase();
        if (nombreGasto.includes(texto) && texto !== "") {
            resultadosDiv.innerHTML += `<p>${card.querySelector("p").textContent}</p>`;
        }
    });
}

// ====== RECUPERAR DATOS AL CARGAR ======
window.onload = () => {
    if (sessionStorage.getItem("personas")) {
        const datosPrevios = JSON.parse(sessionStorage.getItem("personas"));
        generarFormulario(datosPrevios);
        mostrarResultados();
    }
};
