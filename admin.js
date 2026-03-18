// ================================================================
// GHOSTLY STORE — PANEL ADMIN v5
// Todo se guarda en IndexedDB como un único objeto JSON.
// Las imágenes base64 viven dentro del mismo objeto.
// Sin hashes, sin referencias cruzadas, sin bugs de ID.
// ================================================================

const ADMIN_PASSWORD = 'ghostly1982';
const DB_NAME    = 'GhostlyDB';
const DB_STORE   = 'store';
const DB_KEY     = 'productos_data';   // única clave que usamos

const imageStore = { edit: [], add: [] }; // {src: dataURL|ruta}
let editingIndex  = -1;
let adminFilterCat = 'all';

// ================================================================
// IndexedDB — UN SOLO OBJETO, UNA SOLA CLAVE
// ================================================================
let _db = null;

function getDB() {
    return new Promise((res, rej) => {
        if (_db) { res(_db); return; }
        const r = indexedDB.open(DB_NAME, 1);
        r.onupgradeneeded = e => e.target.result.createObjectStore(DB_STORE);
        r.onsuccess = e => { _db = e.target.result; res(_db); };
        r.onerror   = e => rej(e.target.error);
    });
}

async function dbSave(value) {
    const db = await getDB();
    return new Promise((res, rej) => {
        const tx = db.transaction(DB_STORE, 'readwrite');
        tx.objectStore(DB_STORE).put(value, DB_KEY);
        tx.oncomplete = res;
        tx.onerror = e => rej(e.target.error);
    });
}

async function dbLoad() {
    const db = await getDB();
    return new Promise((res, rej) => {
        const req = db.transaction(DB_STORE).objectStore(DB_STORE).get(DB_KEY);
        req.onsuccess = e => res(e.target.result || null);
        req.onerror   = e => rej(e.target.error);
    });
}

// ================================================================
// GUARDAR — serializa TODO el estado actual
// ================================================================
async function saveAll() {
    const cards = Array.from(document.querySelectorAll('.producto-card'));
    const data  = cards.map(card => {
        const nombre = card.querySelector('.producto-nombre')?.textContent.trim() || '';
        const precio = card.querySelector('.producto-precio')?.textContent.trim() || '';
        const cat    = card.getAttribute('data-category') || 'otros';
        const vendido= card.getAttribute('data-vendido') === 'true';
        // Leer imágenes guardadas en data-all-images (evita leer el src del DOM que puede ser ruta relativa resuelta)
        const stored = card.getAttribute('data-all-images');
        let images;
        if (stored) {
            images = JSON.parse(stored);
        } else {
            // Primer guardado: tomar del atributo data-images o src
            const img = card.querySelector('.skin-img');
            const raw = img?.getAttribute('data-images') || img?.src || '';
            images = raw.split(',').map(s => s.trim()).filter(Boolean);
        }
        const desc = (typeof descripcionesProductos !== 'undefined' && descripcionesProductos[nombre]) || [];
        return { nombre, precio, cat, vendido, images, desc };
    });

    // Guardar descripciones extra
    let allDesc = {};
    if (typeof descripcionesProductos !== 'undefined') allDesc = descripcionesProductos;

    await dbSave({ productos: data, descripciones: allDesc });
}

// ================================================================
// CARGAR — restaura el estado al arrancar
// ================================================================
async function loadAndApply() {
    const saved = await dbLoad();
    if (!saved || !saved.productos) return;

    // Restaurar descripciones
    if (saved.descripciones && typeof descripcionesProductos !== 'undefined') {
        Object.assign(descripcionesProductos, saved.descripciones);
    }

    const grid  = document.querySelector('.productos-grid');
    const cards = Array.from(document.querySelectorAll('.producto-card'));

    saved.productos.forEach((data, i) => {
        if (i < cards.length) {
            applyToCard(cards[i], data);
        } else {
            const nc = buildCard(data);
            grid?.appendChild(nc);
        }
    });

    // Eliminar cards sobrantes del HTML
    const all = document.querySelectorAll('.producto-card');
    for (let j = saved.productos.length; j < all.length; j++) all[j].remove();

    // Re-inicializar carruseles DESPUES de escribir data-all-images en todas las cards
    setTimeout(() => {
        document.querySelectorAll('.producto-card').forEach(card => {
            if (typeof window.reinitCarousel === 'function') window.reinitCarousel(card);
        });
    }, 150);

    // Aplicar filtro activo
    const active = document.querySelector('.categoria-btn.active');
    if (active) applyFilter(active.getAttribute('data-category'));
}

// Aplica datos de un objeto guardado a una card del DOM
function applyToCard(card, data) {
    card.setAttribute('data-category', data.cat);
    const nombreEl = card.querySelector('.producto-nombre');
    const precioEl = card.querySelector('.producto-precio');
    const imgEl    = card.querySelector('.skin-img');
    const imgCont  = card.querySelector('.producto-imagen');

    if (nombreEl) nombreEl.textContent = data.nombre;
    if (precioEl) precioEl.textContent = data.precio;

    if (imgEl && data.images?.length) {
        imgEl.src = data.images[0];
        imgEl.setAttribute('data-images', data.images.join(','));
        card.setAttribute('data-all-images', JSON.stringify(data.images));
        if (data.images.length > 1) {
            imgEl.classList.add('carousel-img', 'active');
            imgCont?.classList.add('carousel-container');
        } else {
            imgEl.classList.remove('carousel-img', 'active');
            imgCont?.classList.remove('carousel-container');
        }
    }

    if (typeof descripcionesProductos !== 'undefined' && data.desc?.length) {
        descripcionesProductos[data.nombre] = data.desc;
    }
}

// Construye una card nueva
function buildCard(data) {
    const isC = data.images?.length > 1;
    const div = document.createElement('div');
    div.className = 'producto-card';
    div.setAttribute('data-category', data.cat);
    div.setAttribute('data-all-images', JSON.stringify(data.images || []));
    if (data.vendido) div.setAttribute('data-vendido', 'true');
    div.innerHTML = `
        <div class="producto-imagen${isC ? ' carousel-container' : ''}">
            <img src="${data.images?.[0] || ''}" alt="${esc(data.nombre)}"
                 class="skin-img${isC ? ' carousel-img active' : ''}"
                 ${isC ? `data-images="${data.images.join(',')}"` : ''}>
        </div>
        <div class="producto-info">
            <div class="producto-nombre">${esc(data.nombre)}</div>
            <div class="producto-precio">${esc(data.precio)}</div>
            <button class="btn-comprar">Comprar</button>
        </div>`;
    if (typeof descripcionesProductos !== 'undefined' && data.desc?.length) {
        descripcionesProductos[data.nombre] = data.desc;
    }
    return div;
}

// Event listener del botón Comprar — usa la función central del script.js
function setupBtnComprar(card) {
    // No hace falta: el grid usa event delegation en script.js (abrirModalProducto)
    // Este stub queda por compatibilidad
}

function applyFilter(cat) {
    document.querySelectorAll('.producto-card').forEach(card => {
        const c = card.getAttribute('data-category');
        card.style.display = (cat==='all' || c===cat) ? 'block' : 'none';
    });
}

// ================================================================
// ARRANQUE
// ================================================================
document.addEventListener('DOMContentLoaded', async () => {
    // Logos → doble clic
    [document.getElementById('ghostly-logo-header'),
     document.querySelector('.spinning-logo'),
     document.querySelector('.logo')
    ].forEach(el => el?.addEventListener('dblclick', openPasswordModal));

    // Contraseña enter
    const pwInput = document.getElementById('admin-password-input');
    pwInput?.addEventListener('keydown', e => { if(e.key==='Enter') checkAdminPassword(); });
    pwInput?.addEventListener('input', () => {
        document.getElementById('admin-pw-error').style.display='none';
        pwInput.style.borderColor='#4a3080';
    });
    document.getElementById('admin-pw-close')?.addEventListener('click', closePasswordModal);

    // Cargar datos guardados
    await loadAndApply();
});

// ================================================================
// CONTRASEÑA
// ================================================================
function openPasswordModal() {
    document.getElementById('admin-password-modal').style.display='block';
    document.body.style.overflow='hidden';
    setTimeout(()=>{
        const i=document.getElementById('admin-password-input');
        if(i){i.value='';i.focus();}
        document.getElementById('admin-pw-error').style.display='none';
    },50);
}
function closePasswordModal() {
    document.getElementById('admin-password-modal').style.display='none';
    document.body.style.overflow='auto';
}
function checkAdminPassword() {
    const input=document.getElementById('admin-password-input');
    if(input.value===ADMIN_PASSWORD){ closePasswordModal(); openAdminPanel(); }
    else {
        document.getElementById('admin-pw-error').style.display='block';
        input.style.borderColor='#ff4757'; input.value=''; input.focus();
    }
}

// ================================================================
// PANEL ADMIN
// ================================================================
function openAdminPanel() {
    document.getElementById('admin-panel').style.display='block';
    document.body.style.overflow='hidden';
    adminTab('products');
}
function cerrarAdmin() {
    document.getElementById('admin-panel').style.display='none';
    document.body.style.overflow='auto';
    const a=document.querySelector('.categoria-btn.active');
    if(a) applyFilter(a.getAttribute('data-category'));
}
function adminTab(tab) {
    document.getElementById('admin-tab-products').style.display = tab==='products'?'block':'none';
    document.getElementById('admin-tab-add').style.display      = tab==='add'?'block':'none';
    styleTab('tab-products', tab==='products');
    styleTab('tab-add',      tab==='add');
    if(tab==='add')      renderAddForm();
    if(tab==='products') renderAdminList();
}
function styleTab(id, active) {
    const b=document.getElementById(id); if(!b)return;
    b.style.background  = active?'#7c3aed':'transparent';
    b.style.borderColor = active?'#7c3aed':'#4a3080';
}

// ================================================================
// LISTA PANEL — con filtro por categoría
// ================================================================
function renderAdminList() {
    const container = document.getElementById('admin-products-list');
    const allCards  = Array.from(document.querySelectorAll('.producto-card'));

    const cats = [
        ['all','🌐 Todas'],['minecraft','⛏️ Minecraft'],['streaming','🎬 Streaming'],
        ['fortnite','🎮 Fortnite'],['freefire','🔥 Free Fire'],
        ['brawlstars','⭐ Brawl Stars'],['discord','💬 Discord'],
        ['robux','🎯 Robux'],['otros','📦 Otros'],
    ];

    const filterBar = `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px;">
        ${cats.map(([v,l])=>`
        <button onclick="setAdminFilter('${v}')" id="af-${v}"
            style="padding:7px 13px;border-radius:20px;cursor:pointer;font-size:13px;font-weight:600;
                   border:2px solid ${adminFilterCat===v?'#7c3aed':'#2d1b69'};
                   background:${adminFilterCat===v?'#7c3aed':'transparent'};
                   color:${adminFilterCat===v?'#fff':'#b794f6'};">
            ${l}
        </button>`).join('')}
    </div>`;

    const filtered = allCards.filter(c =>
        adminFilterCat==='all' || c.getAttribute('data-category')===adminFilterCat
    );

    const counter = `<p style="color:#888;font-size:13px;margin:0 0 14px;">
        Mostrando <strong style="color:#b794f6">${filtered.length}</strong> de ${allCards.length} productos
    </p>`;

    const rows = filtered.length===0
        ? `<p style="color:#555;text-align:center;padding:24px;">Sin productos en esta categoría.</p>`
        : filtered.map(card => {
            const i      = allCards.indexOf(card);
            const nombre = card.querySelector('.producto-nombre')?.textContent.trim()||'';
            const precio = card.querySelector('.producto-precio')?.textContent.trim()||'';
            const cat    = card.getAttribute('data-category')||'';
            const imgs   = JSON.parse(card.getAttribute('data-all-images')||'[]');
            const firstImg = imgs[0] || card.querySelector('.skin-img')?.getAttribute('data-images')?.split(',')[0]?.trim() || '';
            return `
            <div style="display:flex;align-items:center;gap:14px;background:#0f0828;border-radius:12px;
                        padding:12px 16px;border:1px solid #2d1b69;flex-wrap:wrap;transition:border-color .2s;"
                 onmouseenter="this.style.borderColor='#7c3aed'"
                 onmouseleave="this.style.borderColor='#2d1b69'">
                <img src="${firstImg}" onerror="this.style.opacity='.15'"
                     style="width:56px;height:56px;object-fit:cover;border-radius:9px;background:#2d1b69;flex-shrink:0;">
                <div style="flex:1;min-width:120px;">
                    <div style="color:#e2d9f3;font-weight:700;font-size:14px;">${nombre}</div>
                    <div style="color:#7c3aed;font-size:13px;margin-top:2px;">${precio}</div>
                    <div style="color:#555;font-size:11px;margin-top:2px;">📂 ${cat} &nbsp;|&nbsp; 🖼️ ${imgs.length||1} img</div>
                </div>
                <button onclick="openEditProduct(${i})"
                    style="background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;border:none;
                           padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:700;font-size:13px;">✏️ Editar</button>
                <button onclick="deleteProduct(${i})"
                    style="background:#ff4757;color:#fff;border:none;padding:8px 12px;
                           border-radius:8px;cursor:pointer;font-weight:700;font-size:13px;">🗑️</button>
            </div>`;
        }).join('');

    container.innerHTML = filterBar + counter + `<div style="display:flex;flex-direction:column;gap:10px;">${rows}</div>`;
}

function setAdminFilter(cat) { adminFilterCat=cat; renderAdminList(); }

// ================================================================
// EDITOR
// ================================================================
function openEditProduct(index) {
    editingIndex = index;
    const card = document.querySelectorAll('.producto-card')[index];
    if (!card) return;

    const nombre  = card.querySelector('.producto-nombre')?.textContent.trim() || '';
    const precio  = card.querySelector('.producto-precio')?.textContent.trim() || '';
    const cat     = card.getAttribute('data-category') || 'otros';
    const imgs    = JSON.parse(card.getAttribute('data-all-images') || '[]');
    const raw     = card.querySelector('.skin-img')?.getAttribute('data-images') || '';
    const allImgs = imgs.length ? imgs : raw.split(',').map(s=>s.trim()).filter(Boolean);
    const desc    = (typeof descripcionesProductos !== 'undefined' && descripcionesProductos[nombre]) || [];

    imageStore.edit = allImgs.map(src => ({ src }));

    // Construir el HTML SIN poner la descripción adentro (para evitar que & < > rompan el textarea)
    const container = document.getElementById('admin-edit-content');
    container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:16px;">
        <div><label style="${L()}">📝 Nombre</label>
             <input id="edit-nombre" style="${I()}"></div>
        <div><label style="${L()}">💰 Precio</label>
             <input id="edit-precio" style="${I()}"></div>
        <div><label style="${L()}">📂 Categoría</label>
             <select id="edit-categoria" style="${I()}">${catOpts(cat)}</select></div>
        <div>
            <label style="${L()}">🖼️ Imágenes</label>
            <div id="edit-thumbs-grid" style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:12px;min-height:20px;"></div>
            <label style="${U()}" onmouseenter="this.style.background='#2d1b69'" onmouseleave="this.style.background='#1a0f3a'">
                📁&nbsp; Agregar imagen
                <input type="file" accept="image/*" multiple style="display:none;" onchange="handleUpload(this,'edit')">
            </label>
            <p style="color:#555;font-size:12px;margin:6px 0 0;text-align:center;">Puedes subir varias · ✕ para quitar · la primera es la portada</p>
        </div>
        <div><label style="${L()}">📋 Descripción <span style="color:#888;font-weight:400;">(una línea = un punto)</span></label>
             <textarea id="edit-descripcion" rows="6" style="${I()}resize:vertical;"
                placeholder="❯ Punto 1&#10;❯ Punto 2"></textarea></div>
        <div style="display:flex;gap:10px;">
            <button onclick="saveEdit()"
                style="flex:1;padding:13px;border-radius:10px;background:linear-gradient(135deg,#7c3aed,#4f46e5);
                       color:#fff;font-size:15px;font-weight:700;border:none;cursor:pointer;">💾 Guardar Cambios</button>
            <button onclick="document.getElementById('admin-edit-modal').style.display='none'"
                style="padding:13px 20px;border-radius:10px;background:#2d1b69;
                       color:#b794f6;font-size:15px;font-weight:700;border:none;cursor:pointer;">Cancelar</button>
        </div>
    </div>`;

    // Asignar valores por propiedad (no por innerHTML) para evitar que & < > rompan el HTML
    document.getElementById('edit-nombre').value = nombre;
    document.getElementById('edit-precio').value = precio;
    document.getElementById('edit-descripcion').value = desc.join('\n');

    renderThumbs('edit');
    document.getElementById('admin-edit-modal').style.display = 'block';
}

async function saveEdit() {
    const card = document.querySelectorAll('.producto-card')[editingIndex];
    if (!card) return;

    const nombre    = document.getElementById('edit-nombre').value.trim();
    const precio    = document.getElementById('edit-precio').value.trim();
    const categoria = document.getElementById('edit-categoria').value;
    const descTxt   = document.getElementById('edit-descripcion').value.trim();
    const imgs      = imageStore.edit.map(o=>o.src);

    if (!nombre)      { alert('El nombre no puede estar vacío.'); return; }
    if (!imgs.length) { alert('Agrega al menos 1 imagen.');       return; }

    const nombreViejo = card.querySelector('.producto-nombre')?.textContent.trim();

    card.querySelector('.producto-nombre').textContent = nombre;
    card.querySelector('.producto-precio').textContent = precio;
    card.setAttribute('data-category', categoria);
    card.setAttribute('data-all-images', JSON.stringify(imgs));

    const imgEl   = card.querySelector('.skin-img');
    const imgCont = card.querySelector('.producto-imagen');
    if (imgEl) {
        imgEl.src = imgs[0];
        imgEl.setAttribute('data-images', imgs.join(','));
        if (imgs.length>1) { imgEl.classList.add('carousel-img','active'); imgCont?.classList.add('carousel-container'); }
        else               { imgEl.classList.remove('carousel-img','active'); imgCont?.classList.remove('carousel-container'); }
    }

    if (typeof descripcionesProductos!=='undefined') {
        if (nombreViejo && nombreViejo!==nombre) delete descripcionesProductos[nombreViejo];
        descripcionesProductos[nombre] = descTxt.split('\n').filter(l=>l.trim());
    }

    await saveAll();
    // Re-inicializar carrusel con las imagenes nuevas
    if (typeof window.reinitCarousel === 'function') window.reinitCarousel(card);
    document.getElementById('admin-edit-modal').style.display='none';
    renderAdminList();
    showToast('✅ Producto guardado');
}

// ================================================================
// ELIMINAR
// ================================================================
async function deleteProduct(index) {
    const card   = document.querySelectorAll('.producto-card')[index];
    const nombre = card?.querySelector('.producto-nombre')?.textContent.trim();
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    card.remove();
    if (typeof descripcionesProductos!=='undefined') delete descripcionesProductos[nombre];
    await saveAll();
    renderAdminList();
    showToast('🗑️ Producto eliminado');
}

// ================================================================
// AGREGAR PRODUCTO
// ================================================================
function renderAddForm() {
    const c = document.getElementById('admin-form-add'); if(!c) return;
    imageStore.add = [];
    c.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:16px;">
        <div><label style="${L()}">📝 Nombre *</label>
             <input id="add-nombre" placeholder="Ej: Netflix Premium 1 Mes" style="${I()}"></div>
        <div><label style="${L()}">💰 Precio *</label>
             <input id="add-precio" placeholder="Ej: $5 USD" style="${I()}"></div>
        <div><label style="${L()}">📂 Categoría *</label>
             <select id="add-categoria" style="${I()}">${catOpts('')}</select></div>
        <div>
            <label style="${L()}">🖼️ Imágenes *</label>
            <div id="add-thumbs-grid" style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:12px;min-height:20px;">
                <p style="color:#555;font-size:13px;">Sin imágenes todavía.</p>
            </div>
            <label style="${U()}" onmouseenter="this.style.background='#2d1b69'" onmouseleave="this.style.background='#1a0f3a'">
                📁&nbsp; Agregar imagen
                <input type="file" accept="image/*" multiple style="display:none;" onchange="handleUpload(this,'add')">
            </label>
            <p style="color:#555;font-size:12px;margin:6px 0 0;text-align:center;">Puedes subir varias · la primera será la portada</p>
        </div>
        <div><label style="${L()}">📋 Descripción <span style="color:#888;font-weight:400;">(una línea = un punto)</span></label>
             <textarea id="add-descripcion" rows="5" style="${I()}resize:vertical;"
                placeholder="❯ Punto 1&#10;❯ Punto 2&#10;❯ Punto 3"></textarea></div>
        <button onclick="addProduct()"
            style="padding:14px;border-radius:10px;background:linear-gradient(135deg,#7c3aed,#4f46e5);
                   color:#fff;font-size:16px;font-weight:700;border:none;cursor:pointer;">
            ➕ Agregar Producto
        </button>
    </div>`;
}

async function addProduct() {
    const nombre    = document.getElementById('add-nombre').value.trim();
    const precio    = document.getElementById('add-precio').value.trim();
    const categoria = document.getElementById('add-categoria').value;
    const descTxt   = document.getElementById('add-descripcion').value.trim();
    const imgs      = imageStore.add.map(o=>o.src);

    if (!nombre)      { alert('❌ El nombre es obligatorio.'); return; }
    if (!precio)      { alert('❌ El precio es obligatorio.'); return; }
    if (!imgs.length) { alert('❌ Agrega al menos 1 imagen.'); return; }

    const data = {
        nombre, precio, cat: categoria, vendido: false, images: imgs,
        desc: descTxt.split('\n').filter(l=>l.trim())
    };
    const newCard = buildCard(data);
    document.querySelector('.productos-grid')?.appendChild(newCard);
    setupBtnComprar(newCard);

    // Mostrar según filtro activo
    const activeBtn = document.querySelector('.categoria-btn.active');
    const activeCat = activeBtn?.getAttribute('data-category') || 'all';
    newCard.style.display = (activeCat==='all' || activeCat===categoria) ? 'block' : 'none';

    await saveAll();
    showToast('✅ Producto agregado — persiste al recargar');
    renderAddForm();
    adminTab('products');
}

// ================================================================
// SUBIDA DE IMÁGENES
// ================================================================
function handleUpload(input, ctx) {
    const files = Array.from(input.files);
    if (!files.length) return;
    let loaded = 0;
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
            imageStore[ctx].push({ src: e.target.result });
            if (++loaded === files.length) renderThumbs(ctx);
        };
        reader.readAsDataURL(file);
    });
    input.value = '';
}

function renderThumbs(ctx) {
    const grid = document.getElementById(`${ctx}-thumbs-grid`); if(!grid) return;
    const imgs = imageStore[ctx];
    if (!imgs.length) { grid.innerHTML=`<p style="color:#555;font-size:13px;">Sin imágenes todavía.</p>`; return; }
    grid.innerHTML = imgs.map((o,i)=>`
        <div style="position:relative;width:80px;height:80px;flex-shrink:0;">
            <img src="${o.src}" onerror="this.style.opacity='.3'"
                 style="width:80px;height:80px;object-fit:cover;border-radius:10px;
                        background:#2d1b69;border:2px solid ${i===0?'#7c3aed':'#4a3080'};">
            <button onclick="removeThumb(${i},'${ctx}')"
                style="position:absolute;top:-7px;right:-7px;width:22px;height:22px;
                       border-radius:50%;background:#ff4757;color:#fff;border:none;cursor:pointer;
                       font-size:12px;display:flex;align-items:center;justify-content:center;
                       box-shadow:0 2px 6px rgba(0,0,0,.5);">✕</button>
            ${i===0?`<div style="position:absolute;bottom:0;left:0;right:0;text-align:center;
                                 font-size:9px;font-weight:700;color:#fff;
                                 background:rgba(124,58,237,.85);border-radius:0 0 8px 8px;
                                 padding:2px 0;">PORTADA</div>`:''}
        </div>`).join('');
}

function removeThumb(i, ctx) { imageStore[ctx].splice(i,1); renderThumbs(ctx); }

// ================================================================
// HELPERS DE ESTILO
// ================================================================
function L() { return 'color:#b794f6;font-size:13px;font-weight:600;display:block;margin-bottom:6px;'; }
function I() { return 'width:100%;padding:10px 14px;border-radius:8px;border:2px solid #4a3080;background:#0f0828;color:#fff;font-size:14px;outline:none;box-sizing:border-box;'; }
function U() { return 'display:flex;align-items:center;justify-content:center;gap:10px;padding:13px;border-radius:10px;border:2px dashed #7c3aed;background:#1a0f3a;color:#b794f6;font-size:14px;font-weight:700;cursor:pointer;transition:background .2s;user-select:none;'; }

function catOpts(sel) {
    return [['minecraft','⛏️ Minecraft'],['streaming','🎬 Streaming'],
            ['fortnite','🎮 Fortnite'],  ['freefire','🔥 Free Fire'],
            ['brawlstars','⭐ Brawl Stars'],['discord','💬 Discord'],
            ['robux','🎯 Robux'],        ['otros','📦 Otros']]
        .map(([v,l])=>`<option value="${v}" ${v===sel?'selected':''}>${l}</option>`).join('');
}

function esc(s) {
    return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showToast(msg) {
    const t=document.createElement('div');
    t.textContent=msg;
    t.style.cssText=`position:fixed;bottom:30px;right:30px;z-index:9999999;
        background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;
        padding:14px 22px;border-radius:12px;font-weight:700;font-size:14px;
        box-shadow:0 4px 20px rgba(124,58,237,.45);animation:fadeInUp .3s ease;`;
    document.body.appendChild(t);
    setTimeout(()=>{ t.style.transition='opacity .4s'; t.style.opacity='0'; setTimeout(()=>t.remove(),400); }, 2800);
}
