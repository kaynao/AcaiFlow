// Default initial deck of orders
const defaultDeck = [
    {
        id: 1,
        clientName: "Mariana Souza",
        coneType: "Casquinha Recheada",
        flavor: "Açaí",
        syrup: "Chocolate",
        filling: "Nutella",
        observation: "Caprichar bastante na Nutella por favor!"
    },
    {
        id: 2,
        clientName: "Lucas Gabriel",
        coneType: "Casquinha Comum",
        flavor: "Mista",
        syrup: "Morango",
        filling: "",
        observation: ""
    },
    {
        id: 3,
        clientName: "Camila Rodrigues",
        coneType: "Casquinha Recheada",
        flavor: "Creme",
        syrup: "Chocolate",
        filling: "Morango",
        observation: "Cliente pediu sem calda por cima."
    }
];

let deck = [];
let currentIndex = 0;
let statsDone = 0;
let lastCompletedCard = null;
let historyLog = [];

function initApp() {
    const savedDeck = localStorage.getItem('acai_deck_v4');
    const savedStats = localStorage.getItem('acai_done_count_v4');
    const savedHistory = localStorage.getItem('acai_history_log_v4');
    
    if (savedDeck) {
        try { deck = JSON.parse(savedDeck); } catch (e) { deck = [...defaultDeck]; }
    } else {
        deck = [...defaultDeck];
    }

    if (savedStats) statsDone = parseInt(savedStats) || 0;
    if (savedHistory) {
        try { historyLog = JSON.parse(savedHistory); } catch (e) { historyLog = []; }
    }

    renderCard();
    updateStats();
}

function saveStorage() {
    localStorage.setItem('acai_deck_v4', JSON.stringify(deck));
    localStorage.setItem('acai_done_count_v4', statsDone);
    localStorage.setItem('acai_history_log_v4', JSON.stringify(historyLog));
}

function updateStats() {
    document.getElementById('stat-done').textContent = statsDone;
    document.getElementById('stat-remaining').textContent = Math.max(0, deck.length - currentIndex);
}

// Switch between Production Flashcards and Dashboard
function switchView(viewName) {
    const flashcardsView = document.getElementById('view-flashcards');
    const dashboardView = document.getElementById('view-dashboard');
    const btnFlash = document.getElementById('btn-view-flashcards');
    const btnDash = document.getElementById('btn-view-dashboard');

    if (viewName === 'flashcards') {
        flashcardsView.classList.remove('hidden');
        dashboardView.classList.add('hidden');
        btnFlash.className = 'px-3.5 py-2 bg-purple-600 text-white text-xs sm:text-sm font-semibold rounded-xl transition shadow flex items-center space-x-1.5';
        btnDash.className = 'px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center space-x-1.5';
        renderCard();
    } else {
        flashcardsView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        btnDash.className = 'px-3.5 py-2 bg-purple-600 text-white text-xs sm:text-sm font-semibold rounded-xl transition shadow flex items-center space-x-1.5';
        btnFlash.className = 'px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center space-x-1.5';
        renderDashboardData();
    }
}

function toggleFillingField() {
    const typeSelect = document.getElementById('new-type');
    const fillingContainer = document.getElementById('filling-container');
    if (typeSelect.value === 'Casquinha Recheada') {
        fillingContainer.classList.remove('hidden');
    } else {
        fillingContainer.classList.add('hidden');
    }
}

// Flavor Theme Color Mapping
function getFlavorTheme(flavor) {
    if (flavor === 'Açaí') {
        return {
            bg: 'bg-purple-950 text-white shadow-2xl border-2 border-purple-900',
            badge: 'bg-purple-900/90 text-purple-200 border border-purple-700/60',
            highlightText: 'text-amber-300',
            divider: 'border-purple-800/80',
            backBg: 'bg-purple-950 text-white'
        };
    } else if (flavor === 'Creme') {
        return {
            bg: 'bg-amber-50 text-slate-900 shadow-2xl border-2 border-amber-200',
            badge: 'bg-amber-200/80 text-amber-900 border border-amber-300',
            highlightText: 'text-amber-800 font-bold',
            divider: 'border-amber-200',
            backBg: 'bg-amber-50 text-slate-900'
        };
    } else { // Mista
        return {
            bg: 'bg-gradient-to-r from-purple-950 via-purple-900 to-amber-50 text-white shadow-2xl border-2 border-purple-800',
            badge: 'bg-purple-900/90 text-amber-200 border border-purple-700',
            highlightText: 'text-amber-300 font-bold',
            divider: 'border-white/20',
            backBg: 'bg-gradient-to-br from-purple-950 via-purple-900 to-slate-900 text-white'
        };
    }
}

function renderCard() {
    const arena = document.getElementById('card-arena');
    arena.innerHTML = '';

    if (deck.length === 0 || currentIndex >= deck.length) {
        arena.innerHTML = `
            <div class="w-full h-full bg-slate-50 border border-slate-200 rounded-3xl flex flex-col items-center justify-center p-8 text-center shadow-lg animate-in fade-in zoom-in-95 duration-300">
                <div class="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-inner">
                    <i class="fa-solid fa-ice-cream text-purple-600"></i>
                </div>
                <h3 class="text-xl font-bold text-slate-900 mb-2">Fila Concluída!</h3>
                <p class="text-sm text-slate-600 mb-6 max-w-xs">Todos os pedidos atuais de casquinhas foram produzidos.</p>
                <button onclick="resetDeck()" class="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg transition flex items-center space-x-2">
                    <i class="fa-solid fa-rotate-right"></i>
                    <span>Reiniciar Fila</span>
                </button>
            </div>
        `;
        updateStats();
        return;
    }

    const card = deck[currentIndex];
    const theme = getFlavorTheme(card.flavor);
    const hasObs = card.observation && card.observation.trim().length > 0;
    const isRecheada = card.coneType === 'Casquinha Recheada';

    const cardEl = document.createElement('div');
    cardEl.id = 'active-flashcard';
    cardEl.className = 'w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing select-none touch-none transition-transform duration-200 ease-out';
    
    cardEl.innerHTML = `
        <div class="w-full h-full relative perspective-1000">
            <div id="card-inner" class="w-full h-full relative transform-style-3d transition-transform duration-500 rounded-3xl shadow-xl ${theme.bg}">
                
                <!-- Front Face -->
                <div class="absolute inset-0 backface-hidden rounded-3xl p-6 sm:p-7 flex flex-col justify-between overflow-hidden">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-semibold opacity-80">Pedido ${currentIndex + 1} de ${deck.length}</span>
                        ${hasObs ? `
                            <span class="px-3 py-1 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-full flex items-center space-x-1.5 animate-bounce shadow-md">
                                <i class="fa-solid fa-triangle-exclamation"></i>
                                <span>OBSERVAÇÃO!</span>
                            </span>
                        ` : ''}
                    </div>
                    
                    <div class="my-auto text-center py-2 space-y-3.5">
                        <div>
                            <span class="inline-block px-4 py-1.5 rounded-xl text-sm sm:text-base font-extrabold uppercase tracking-wider ${theme.badge} shadow-sm">
                                ${escapeHtml(card.coneType)}
                            </span>
                        </div>
                        <div class="space-y-1.5">
                            <p class="text-base sm:text-lg font-medium opacity-90">Sabor: <strong class="font-bold">${escapeHtml(card.flavor)}</strong></p>
                            <p class="text-base sm:text-lg font-medium opacity-90">Calda: <strong class="font-bold">${escapeHtml(card.syrup)}</strong></p>
                            ${isRecheada ? `<p class="text-base sm:text-lg font-medium ${theme.highlightText}">Recheio: <strong class="font-bold">${escapeHtml(card.filling)}</strong></p>` : ''}
                        </div>
                    </div>

                    <div class="w-full text-center pb-1 pt-3 border-t ${theme.divider}">
                        <span class="block text-[10px] uppercase tracking-widest opacity-70 font-bold mb-0.5">Cliente</span>
                        <h2 class="text-2xl sm:text-3xl font-black tracking-tight drop-shadow">${escapeHtml(card.clientName)}</h2>
                        <span class="inline-block mt-2 text-[11px] opacity-75 py-1 px-3 rounded-full border border-current">
                            <i class="fa-solid fa-rotate mr-1"></i> Toque para detalhes
                        </span>
                    </div>
                </div>

                <!-- Back Face -->
                <div class="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl p-6 sm:p-7 flex flex-col justify-between ${theme.backBg}">
                    <div class="flex items-center justify-between">
                        <span class="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded-full">Detalhes & Observações</span>
                        <span class="text-xs opacity-75">Verso</span>
                    </div>
                    
                    <div class="my-auto text-center py-4 space-y-3">
                        <h4 class="text-lg font-bold">${escapeHtml(card.clientName)}</h4>
                        <div class="bg-black/20 p-4 rounded-2xl border border-white/20 text-left space-y-2 text-sm">
                            <p><strong>Tipo:</strong> ${escapeHtml(card.coneType)}</p>
                            <p><strong>Sabor:</strong> ${escapeHtml(card.flavor)}</p>
                            <p><strong>Calda:</strong> ${escapeHtml(card.syrup)}</p>
                            ${isRecheada ? `<p><strong>Recheio:</strong> ${escapeHtml(card.filling)}</p>` : ''}
                            <hr class="border-white/20 my-2">
                            <p class="text-amber-300 font-semibold"><strong>Obs:</strong> ${escapeHtml(card.observation || 'Nenhuma.')}</p>
                        </div>
                    </div>

                    <div class="text-center pb-1">
                        <span class="text-xs bg-black/30 py-2 px-4 rounded-xl border border-white/20 inline-block">
                            <i class="fa-solid fa-rotate"></i> Toque para voltar
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Overlays -->
        <div id="stamp-done" class="absolute top-6 left-1/2 -translate-x-1/2 z-20 opacity-0 transition-opacity pointer-events-none border-4 border-emerald-500 text-emerald-300 font-black text-xl px-4 py-2 rounded-2xl bg-emerald-950/90 shadow-2xl">CONCLUÍDO! ↑</div>
        <div id="stamp-undo" class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 opacity-0 transition-opacity pointer-events-none border-4 border-amber-500 text-amber-300 font-black text-xl px-4 py-2 rounded-2xl bg-amber-950/90 shadow-2xl">VOLTANDO... ↓</div>
        <div id="stamp-next" class="absolute right-6 top-1/2 -translate-y-1/2 z-20 opacity-0 transition-opacity pointer-events-none border-4 border-indigo-500 text-indigo-300 font-black text-lg px-3 py-2 rounded-2xl bg-indigo-950/90 shadow-2xl">PRÓXIMO ➔</div>
        <div id="stamp-prev" class="absolute left-6 top-1/2 -translate-y-1/2 z-20 opacity-0 transition-opacity pointer-events-none border-4 border-slate-500 text-slate-300 font-black text-lg px-3 py-2 rounded-2xl bg-slate-950/90 shadow-2xl">← ANTERIOR</div>
    `;

    arena.appendChild(cardEl);
    initGestures(cardEl);
    updateStats();
}

function escapeHtml(str) {
    return String(str || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// 4-Directional Gesture Controller
function initGestures(cardElement) {
    const cardInner = document.getElementById('card-inner');
    const stampDone = document.getElementById('stamp-done');
    const stampUndo = document.getElementById('stamp-undo');
    const stampNext = document.getElementById('stamp-next');
    const stampPrev = document.getElementById('stamp-prev');

    let isDragging = false;
    let startX = 0, startY = 0, currentX = 0, currentY = 0;
    let isFlipped = false, hasMoved = false;

    cardElement.addEventListener('click', () => {
        if (hasMoved) return;
        isFlipped = !isFlipped;
        cardInner.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
    });

    function onPointerDown(e) {
        isDragging = true;
        hasMoved = false;
        startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        startY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
        cardElement.style.transition = 'none';
    }

    function onPointerMove(e) {
        if (!isDragging) return;
        currentX = (e.clientX || (e.touches && e.touches[0].clientX) || 0) - startX;
        currentY = (e.clientY || (e.touches && e.touches[0].clientY) || 0) - startY;

        if (Math.abs(currentX) > 5 || Math.abs(currentY) > 5) hasMoved = true;
        cardElement.style.transform = `translate(${currentX}px, ${currentY}px)`;

        stampDone.style.opacity = '0'; stampUndo.style.opacity = '0'; stampNext.style.opacity = '0'; stampPrev.style.opacity = '0';

        if (Math.abs(currentY) > Math.abs(currentX)) {
            if (currentY < -40) stampDone.style.opacity = Math.min(1, Math.abs(currentY) / 100);
            else if (currentY > 40) stampUndo.style.opacity = Math.min(1, currentY / 100);
        } else {
            if (currentX < -40) stampNext.style.opacity = Math.min(1, Math.abs(currentX) / 100);
            else if (currentX > 40) stampPrev.style.opacity = Math.min(1, Math.abs(currentX) / 100);
        }
    }

    function onPointerUp() {
        if (!isDragging) return;
        isDragging = false;
        cardElement.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease';
        const threshold = 90;

        if (Math.abs(currentY) > Math.abs(currentX)) {
            if (currentY < -threshold) {
                cardElement.style.transform = `translate(0px, -500px)`; cardElement.style.opacity = '0';
                setTimeout(() => handleGestureAction('up'), 250); return;
            } else if (currentY > threshold) {
                cardElement.style.transform = `translate(0px, 500px)`; cardElement.style.opacity = '0';
                setTimeout(() => handleGestureAction('down'), 250); return;
            }
        } else {
            if (currentX < -threshold) {
                cardElement.style.transform = `translate(-500px, 0px)`; cardElement.style.opacity = '0';
                setTimeout(() => handleGestureAction('right'), 250); return;
            } else if (currentX > threshold) {
                cardElement.style.transform = `translate(500px, 0px)`; cardElement.style.opacity = '0';
                setTimeout(() => handleGestureAction('left'), 250); return;
            }
        }

        cardElement.style.transform = 'translate(0px, 0px)';
        stampDone.style.opacity = '0'; stampUndo.style.opacity = '0'; stampNext.style.opacity = '0'; stampPrev.style.opacity = '0';
        currentX = 0; currentY = 0;
    }

    cardElement.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    cardElement.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
}

function handleGestureAction(direction) {
    if (direction === 'up') {
        if (currentIndex < deck.length) {
            lastCompletedCard = deck[currentIndex];
            statsDone++;
            historyLog.unshift({
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                client: lastCompletedCard.clientName,
                type: lastCompletedCard.coneType,
                flavor: lastCompletedCard.flavor,
                syrup: lastCompletedCard.syrup,
                filling: lastCompletedCard.filling || '-'
            });
            deck.splice(currentIndex, 1);
            saveStorage();
            showToast('Pedido Concluído! (↑)', 'emerald', 'fa-check');
        }
    } else if (direction === 'down') {
        if (lastCompletedCard) {
            deck.splice(currentIndex, 0, lastCompletedCard);
            if (historyLog.length > 0) historyLog.shift();
            lastCompletedCard = null;
            if (statsDone > 0) statsDone--;
            saveStorage();
            showToast('Retornou o último pedido (↓)', 'amber', 'fa-rotate-left');
        } else {
            showToast('Nenhum pedido recente', 'slate', 'fa-info');
            renderCard();
        }
    } else if (direction === 'right') {
        if (currentIndex < deck.length - 1) { currentIndex++; showToast('Próximo', 'purple', 'fa-arrow-right'); }
        else { showToast('Último pedido', 'slate', 'fa-flag'); }
    } else if (direction === 'left') {
        if (currentIndex > 0) { currentIndex--; showToast('Anterior', 'slate', 'fa-arrow-left'); }
        else { showToast('Início da fila', 'slate', 'fa-flag'); }
    }
    renderCard();
    updateStats();
}

function triggerSwipe(dir) {
    handleGestureAction(dir);
}

function resetDeck() {
    currentIndex = 0; statsDone = 0; lastCompletedCard = null;
    deck = [...defaultDeck];
    saveStorage();
    renderCard();
    showToast('Fila reiniciada!', 'purple', 'fa-rotate-right');
}

// Render Dashboard Data
function renderDashboardData() {
    document.getElementById('dash-total-done').textContent = statsDone;
    document.getElementById('dash-remaining').textContent = Math.max(0, deck.length - currentIndex);

    let comumCount = 0;
    let recheadaCount = 0;
    let flavorCounts = { 'Açaí': 0, 'Mista': 0, 'Creme': 0 };
    let syrupCounts = { 'Chocolate': 0, 'Morango': 0 };
    let fillingCounts = { 'Nutella': 0, 'Morango': 0 };

    historyLog.forEach(item => {
        if (item.type === 'Casquinha Comum') comumCount++;
        else recheadaCount++;

        if (flavorCounts[item.flavor] !== undefined) flavorCounts[item.flavor]++;
        if (syrupCounts[item.syrup] !== undefined) syrupCounts[item.syrup]++;
        if (item.filling && fillingCounts[item.filling] !== undefined) fillingCounts[item.filling]++;
    });

    document.getElementById('dash-comum').textContent = comumCount;
    document.getElementById('dash-recheada').textContent = recheadaCount;

    // Render Flavors progress bars
    const flavorCont = document.getElementById('flavor-stats-container');
    flavorCont.innerHTML = `
        <div class="text-xs space-y-1">
            <div class="flex justify-between font-medium"><span>Açaí</span><span>${flavorCounts['Açaí']}</span></div>
            <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden"><div class="bg-purple-700 h-full" style="width: ${statsDone ? (flavorCounts['Açaí']/statsDone)*100 : 0}%"></div></div>
        </div>
        <div class="text-xs space-y-1">
            <div class="flex justify-between font-medium"><span>Mista</span><span>${flavorCounts['Mista']}</span></div>
            <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden"><div class="bg-purple-500 h-full" style="width: ${statsDone ? (flavorCounts['Mista']/statsDone)*100 : 0}%"></div></div>
        </div>
        <div class="text-xs space-y-1">
            <div class="flex justify-between font-medium"><span>Creme</span><span>${flavorCounts['Creme']}</span></div>
            <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden"><div class="bg-amber-400 h-full" style="width: ${statsDone ? (flavorCounts['Creme']/statsDone)*100 : 0}%"></div></div>
        </div>
    `;

    // Render Syrups & Fillings
    const syrupCont = document.getElementById('syrup-stats-container');
    syrupCont.innerHTML = `
        <div class="text-xs space-y-1">
            <div class="flex justify-between font-medium"><span>Calda Chocolate</span><span>${syrupCounts['Chocolate']}</span></div>
            <div class="flex justify-between font-medium"><span>Calda Morango</span><span>${syrupCounts['Morango']}</span></div>
            <div class="flex justify-between font-medium text-amber-700 font-bold"><span>Recheio Nutella</span><span>${fillingCounts['Nutella']}</span></div>
            <div class="flex justify-between font-medium text-rose-600 font-bold"><span>Recheio Morango</span><span>${fillingCounts['Morango']}</span></div>
        </div>
    `;

    // Render History Log
    const logList = document.getElementById('history-log-list');
    logList.innerHTML = '';
    if (historyLog.length === 0) {
        logList.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">Nenhum pedido finalizado nesta sessão.</p>`;
        return;
    }

    historyLog.forEach(log => {
        const div = document.createElement('div');
        div.className = 'bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between text-xs';
        div.innerHTML = `
            <div>
                <span class="font-bold text-slate-900">${escapeHtml(log.client)}</span>
                <span class="text-slate-500 block">${escapeHtml(log.type)} • ${escapeHtml(log.flavor)} • Calda: ${escapeHtml(log.syrup)}</span>
            </div>
            <span class="font-mono text-purple-600 font-semibold">${log.time}</span>
        `;
        logList.appendChild(div);
    });
}

function clearDashboardHistory() {
    if (confirm('Deseja limpar todo o histórico e estatísticas do dashboard?')) {
        historyLog = [];
        statsDone = 0;
        saveStorage();
        renderDashboardData();
        updateStats();
        showToast('Dashboard limpo!', 'rose', 'fa-trash-can');
    }
}

// Modal management
function openAddModal() {
    document.getElementById('add-modal').classList.remove('hidden');
    document.getElementById('add-modal').classList.add('flex');
    document.getElementById('new-client').focus();
}

function closeAddModal() {
    document.getElementById('add-modal').classList.remove('flex');
    document.getElementById('add-modal').classList.add('hidden');
    document.getElementById('add-form').reset();
    document.getElementById('filling-container').classList.add('hidden');
}

function handleAddNewCard(e) {
    e.preventDefault();
    const clientName = document.getElementById('new-client').value.trim();
    const coneType = document.getElementById('new-type').value;
    const flavor = document.getElementById('new-flavor').value;
    const syrup = document.getElementById('new-syrup').value;
    const filling = coneType === 'Casquinha Recheada' ? document.getElementById('new-filling').value : '';
    const observation = document.getElementById('new-obs').value.trim();

    if (!clientName) return;

    deck.push({ id: Date.now(), clientName, coneType, flavor, syrup, filling, observation });
    saveStorage();
    closeAddModal();
    renderCard();
    showToast('Novo pedido adicionado!', 'purple', 'fa-circle-plus');
}

function showToast(message, color = 'emerald', icon = 'fa-check') {
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');

    toastMsg.textContent = message;
    toastIcon.className = `w-6 h-6 rounded-full bg-${color}-500/20 text-${color}-400 flex items-center justify-center text-xs`;
    toastIcon.innerHTML = `<i class="fa-solid ${icon}"></i>`;

    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

window.addEventListener('DOMContentLoaded', initApp);