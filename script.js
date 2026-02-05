// ======================
// MOVIE DATA
// ======================
const movies = [
    { id: 1, title: "Bruce Almighty", color: "#1a472a" },
    { id: 2, title: "Gladiator", color: "#0d3d0d" },
    { id: 3, title: "The Life of Chuck", color: "#1a1a2e" },
    { id: 4, title: "Groundhog Day", color: "#2d1b00" },
    { id: 5, title: "George of the Jungle", color: "#3d1e1e" },
    { id: 6, title: "Knives Out", color: "#2e4a2e" },
    { id: 7, title: "Rush", color: "#1e2d3d" },
    { id: 8, title: "The Dark Knight", color: "#0f0f0f" },
    { id: 9, title: "The Green Mile", color: "#1a3a1a" },
    { id: 10, title: "Leon", color: "#2d2d1a" },
    { id: 11, title: "A Man Called Otto", color: "#1a472a" },
    { id: 12, title: "Self/less", color: "#0d3d0d" },
    { id: 13, title: "Night Hunter", color: "#1a1a2e" },
    { id: 14, title: "Die My Love", color: "#2d1b00" },
    { id: 15, title: "Roofman", color: "#3d1e1e" },
    { id: 16, title: "For Richer or Poorer", color: "#2e4a2e" },
    { id: 17, title: "The Pink Panther 2", color: "#1e2d3d" },
    { id: 18, title: "57 Seconds", color: "#0f0f0f" },
    { id: 19, title: "The Scorpion King", color: "#1a3a1a" },
    { id: 20, title: "The Irishman", color: "#2d2d1a" },
];

// ======================
// GAME STATE
// ======================
let gameState = {
    userName: '',
    score: 0,
    streak: 0,
    selectedMovie: null,
    selectedFrame: null,
    matchedPairs: []
};

// ======================
// INIT
// ======================
document.addEventListener('DOMContentLoaded', () => {
    loadGameState();

    if (!gameState.userName) {
        openNameModal();
    } else {
        startGame();
    }

    bindRestartModal();
});

// ======================
// NAME MODAL
// ======================
function openNameModal() {
    const modal = document.getElementById('nameModal');
    const input = document.getElementById('nameInput');
    const submit = document.getElementById('submitName');

    modal.style.display = 'flex';
    input.focus();

    submit.onclick = submitName;

    input.onkeydown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            submitName();
        }
    };
}

function submitName() {
    const input = document.getElementById('nameInput');
    const name = input.value.trim();
    if (!name) return;

    gameState.userName = name;
    saveGameState();

    document.getElementById('nameModal').style.display = 'none';
    startGame();
}

// ======================
// START GAME
// ======================
function startGame() {
    updateScoreDisplay();
    updateProgress();
    renderFrames();
    renderMovieTitles();
}

// ======================
// RENDER FRAMES
// ======================
function renderFrames() {
    const grid = document.getElementById('framesGrid');
    grid.innerHTML = '';

    [...movies].sort(() => Math.random() - 0.5).forEach(movie => {
        const frame = document.createElement('div');
        frame.className = 'frame';
        frame.dataset.movieId = movie.id;

        const matched = gameState.matchedPairs.includes(movie.id);
        if (matched) {
            frame.classList.add('correct');
            frame.style.pointerEvents = 'none';
        }

        const img = document.createElement('img');
        img.className = 'frame-image';
        img.src = `img/img-${movie.id}.webp`;
        img.alt = movie.title;

        img.onerror = () => {
            const ph = document.createElement('div');
            ph.className = 'frame-image frame-placeholder';
            ph.style.background =
                `linear-gradient(135deg, ${movie.color}, ${adjustColor(movie.color, 40)})`;

            const icon = document.createElement('div');
            icon.className = 'camera-icon';
            icon.textContent = '🎬';
            ph.appendChild(icon);

            frame.replaceChild(ph, img);
        };

        frame.appendChild(img);

        if (!matched) {
            frame.addEventListener('click', () => selectFrame(movie.id));
            frame.addEventListener('dragover', handleDragOver);
            frame.addEventListener('dragleave', handleDragLeave);
            frame.addEventListener('drop', handleDropOnFrame);
        }

        grid.appendChild(frame);
    });
}

// ======================
// RENDER MOVIE TITLES
// ======================
function renderMovieTitles() {
    const list = document.getElementById('moviesList');
    list.innerHTML = '';

    [...movies].sort(() => Math.random() - 0.5).forEach(movie => {
        if (gameState.matchedPairs.includes(movie.id)) return;

        const item = document.createElement('div');
        item.className = 'movie-item';
        item.textContent = movie.title;
        item.dataset.movieId = movie.id;
        item.draggable = true;

        item.addEventListener('click', () => selectMovie(movie.id));
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);

        list.appendChild(item);
    });
}

// ======================
// SELECTION
// ======================
function selectMovie(id) {
    resetSelection('movie');
    gameState.selectedMovie = id;

    document.querySelector(`.movie-item[data-movie-id="${id}"]`)
        ?.classList.add('selected');

    tryMatch();
}

function selectFrame(id) {
    resetSelection('frame');
    gameState.selectedFrame = id;

    document.querySelector(`.frame[data-movie-id="${id}"]`)
        ?.classList.add('selected');

    tryMatch();
}

function resetSelection(except = null) {
    if (except !== 'movie') gameState.selectedMovie = null;
    if (except !== 'frame') gameState.selectedFrame = null;

    if (except !== 'movie') {
        document.querySelectorAll('.movie-item.selected')
            .forEach(e => e.classList.remove('selected'));
    }
    if (except !== 'frame') {
        document.querySelectorAll('.frame.selected')
            .forEach(e => e.classList.remove('selected'));
    }
}

// ======================
// DRAG & DROP
// ======================
function handleDragStart(e) {
    resetSelection();
    gameState.selectedMovie = Number(e.target.dataset.movieId);
    e.dataTransfer.setData('movieId', gameState.selectedMovie);
    e.target.classList.add('dragging');
}

function handleDragEnd() {
    document.querySelectorAll('.dragging').forEach(e => e.classList.remove('dragging'));
    document.querySelectorAll('.drag-over').forEach(e => e.classList.remove('drag-over'));
}

function handleDragOver(e) {
    e.preventDefault();
    autoScrollOnDrag(e);
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDropOnFrame(e) {
    e.preventDefault();
    gameState.selectedFrame = Number(e.currentTarget.dataset.movieId);
    handleDragEnd();
    tryMatch();
}

// ======================
// MATCH LOGIC
// ======================
function tryMatch() {
    if (gameState.selectedMovie && gameState.selectedFrame) {
        checkMatch(gameState.selectedMovie, gameState.selectedFrame);
        resetSelection();
    }
}

function checkMatch(movieId, frameId) {
    movieId === frameId
        ? handleCorrectMatch(movieId)
        : handleIncorrectMatch(frameId);
}

function handleCorrectMatch(movieId) {
    gameState.streak++;

    let points = 5;
    if (gameState.streak >= 10) points = 9;
    else if (gameState.streak >= 5) points = 7;

    gameState.score += points;
    gameState.matchedPairs.push(movieId);

    document.querySelector(`.frame[data-movie-id="${movieId}"]`)
        ?.classList.add('correct');

    document.querySelector(`.movie-item[data-movie-id="${movieId}"]`)
        ?.remove();

    showFeedback(`Correct! +${points}`, 'success');

    saveGameState();
    updateScoreDisplay();
    updateProgress();

    if (gameState.matchedPairs.length === movies.length) {
        document.getElementById('finalScore').textContent = gameState.score;
        document.getElementById('completeModal').style.display = 'flex';
    }
}

function handleIncorrectMatch(frameId) {
    gameState.streak = 0;
    gameState.score = Math.max(0, gameState.score - 2);

    const frame = document.querySelector(`.frame[data-movie-id="${frameId}"]`);
    frame?.classList.add('incorrect');

    showFeedback('Wrong match! -2', 'error');

    setTimeout(() => frame?.classList.remove('incorrect'), 700);

    saveGameState();
    updateScoreDisplay();
}

// ======================
// UI HELPERS
// ======================
function showFeedback(text, type) {
    const el = document.getElementById('feedback');
    el.textContent = text;
    el.className = `feedback ${type} show`;
    setTimeout(() => el.classList.remove('show'), 2000);
}

function updateScoreDisplay() {
    document.getElementById('userName').textContent = gameState.userName;
    document.getElementById('score').textContent = gameState.score;

    const streak = document.getElementById('streak');
    if (gameState.streak >= 5) {
        streak.style.display = 'inline-flex';
        streak.textContent = `🔥 ${gameState.streak}`;
    } else {
        streak.style.display = 'none';
    }
}

function updateProgress() {
    const percent = Math.round(
        (gameState.matchedPairs.length / movies.length) * 100
    );

    document.getElementById('progressBar')?.style.setProperty('width', `${percent}%`);
    const progressText = document.getElementById('progressPercent');
    if (progressText) progressText.textContent = `${percent}%`;
}

// ======================
// RESTART MODAL
// ======================
function bindRestartModal() {
    const openBtn = document.getElementById('resetBtn');
    const modal = document.getElementById('restartModal');
    const cancel = document.getElementById('cancelRestart');
    const confirm = document.getElementById('confirmRestart');

    openBtn.onclick = () => modal.style.display = 'flex';
    cancel.onclick = () => modal.style.display = 'none';

    confirm.onclick = () => {
        localStorage.removeItem('movieGameState');

        gameState = {
            userName: '',
            score: 0,
            streak: 0,
            selectedMovie: null,
            selectedFrame: null,
            matchedPairs: []
        };

        modal.style.display = 'none';
        openNameModal();
        updateProgress();
    };
}

// ======================
// LOCAL STORAGE
// ======================
function saveGameState() {
    localStorage.setItem('movieGameState', JSON.stringify(gameState));
}

function loadGameState() {
    const saved = localStorage.getItem('movieGameState');
    if (!saved) return;
    Object.assign(gameState, JSON.parse(saved));
}

// ======================
// UTILS
// ======================
function adjustColor(color, amount) {
    const num = parseInt(color.slice(1), 16);
    const r = Math.min(255, (num >> 16) + amount);
    const g = Math.min(255, ((num >> 8) & 255) + amount);
    const b = Math.min(255, (num & 255) + amount);
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

function autoScrollOnDrag(e) {
    const scrollZone = 80; // px from top/bottom
    const scrollSpeed = 20;

    const y = e.clientY;
    const windowHeight = window.innerHeight;

    if (y < scrollZone) {
        window.scrollBy(0, -scrollSpeed);
    } else if (y > windowHeight - scrollZone) {
        window.scrollBy(0, scrollSpeed);
    }
}


document.getElementById('closeCompleteModal').onclick = () => {
    document.getElementById('completeModal').style.display = 'none';
};

document.getElementById('restartFromComplete').onclick = () => {
    document.getElementById('completeModal').style.display = 'none';

    localStorage.removeItem('movieGameState');

    gameState = {
        userName: '',
        score: 0,
        streak: 0,
        selectedMovie: null,
        selectedFrame: null,
        matchedPairs: []
    };

    openNameModal();
    updateProgress();
};

