const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configuración del juego
const TILE_SIZE = 32; // Doble del tamaño anterior (16 -> 32)
const MAZE_WIDTH = 35;
const MAZE_HEIGHT = 45;
const MOVE_DELAY = 8; // Frames entre movimientos de Pac-Man
const GHOST_MOVE_DELAY = 9; // Frames entre movimientos de fantasmas (10% más lento: 8 * 1.1 = 8.8 ≈ 9)

// Colores estilo Atari 2600 mejorados
const COLORS = {
    WALL: '#4169E1',      // Azul real más vibrante
    DOT: '#FFD700',       // Dorado para mejor visibilidad
    POWER_PELLET: '#FF6B6B', // Rojo coral vibrante (parpadeante)
    PACMAN: '#FFD700',    // Amarillo dorado brillante
    GHOST1: '#FF4444',    // Rojo brillante
    GHOST2: '#FF69B4',    // Rosa hot más suave
    GHOST3: '#00CED1',    // Turquesa oscuro más elegante
    GHOST4: '#FFA500',    // Naranja estándar
    BACKGROUND: '#000000', // Negro
    CHERRY_RED: '#FF1744', // Rojo más intenso para cereza
    CHERRY_GREEN: '#4CAF50' // Verde más suave para tallo
};

// Laberinto más abierto estilo Pac-Man con paredes delgadas
const MAZE = [
    "###################################",
    "#O..............###..............O#",
    "#.####.#######..###..#######.####.#",
    "#.................................#",
    "#.####.###......###......###.####.#",
    "#.####.###.###########.###.######.#",
    "#.#############.....#############.#",
    "#.................................#",
    "#.####.###.....#####.....###.####.#",
    "#.####.###.....#####.....###.####.#",
    "#.................................#",
    "#.####.###......###......###.####.#",
    "#......###...........###......###.#",
    "#.###########.........###########.#",
    "#.................................#",
    "#.####.###.###########.###.######.#",
    "#......###......###......###......#",
    "#.####.#######..###..#######.####.#",
    "#.................................#",
    "#O..............###..............O#",
    "###################################"
  ];
      

// Calcular tamaño del canvas basado en el laberinto
const MAZE_COLS = MAZE[0].length;
const MAZE_ROWS = MAZE.length;
const CANVAS_WIDTH = MAZE_COLS * TILE_SIZE;
const CANVAS_HEIGHT = MAZE_ROWS * TILE_SIZE;

// Configurar tamaño del canvas
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

let gameState = {
    score: 0,
    lives: 3,
    paused: false,
    gameOver: false,
    powerMode: false,
    powerTimer: 0,
    dotsRemaining: 0,
    moveCounter: 0, // Contador para controlar la velocidad de Pac-Man
    ghostMoveCounter: 0, // Contador para controlar la velocidad de los fantasmas
    dotsEaten: 0, // Contador de puntos comidos
    lastCherryScore: 0 // Última puntuación cuando apareció una cereza
};

// Cereza bonus
let cherry = {
    visible: false,
    x: 17, // Posición central del laberinto
    y: 11,
    timer: 0,
    maxTime: 200 // Duración en ciclos de movimiento (~25 segundos)
};

// Posiciones iniciales (ajustadas al nuevo laberinto)
let pacman = {
    x: 17,
    y: 18, // Fila válida cerca de la parte inferior
    direction: 0, // 0: right, 1: down, 2: left, 3: up
    nextDirection: 0,
    mouthOpen: true,
    mouthTimer: 0,
    isMoving: false, // Flag para saber si Pac-Man se está moviendo
    dying: false, // Flag para animación de muerte
    deathTimer: 0, // Timer para animación de muerte
    deathMaxTime: 30 // Duración de la animación de muerte
};

let ghosts = [
    { x: 17, y: 5, direction: 0, color: COLORS.GHOST1, scared: false, strategy: 'chase', lastDirection: -1, eaten: false, eatenTimer: 0, eatenMaxTime: 40, startX: 17, startY: 5 },
    { x: 10, y: 5, direction: 1, color: COLORS.GHOST2, scared: false, strategy: 'ambush', lastDirection: -1, eaten: false, eatenTimer: 0, eatenMaxTime: 40, startX: 10, startY: 5 },
    { x: 24, y: 5, direction: 2, color: COLORS.GHOST3, scared: false, strategy: 'patrol', lastDirection: -1, eaten: false, eatenTimer: 0, eatenMaxTime: 40, startX: 24, startY: 5 },
    { x: 17, y: 8, direction: 3, color: COLORS.GHOST4, scared: false, strategy: 'random', lastDirection: -1, eaten: false, eatenTimer: 0, eatenMaxTime: 40, startX: 17, startY: 8 }
];

// Contar puntos
function countDots() {
    let count = 0;
    for (let row of MAZE) {
        for (let char of row) {
            if (char === '.') count++;
        }
    }
    return count;
}

gameState.dotsRemaining = countDots();

// ========== SISTEMA DE SONIDOS 8 BITS ==========
let audioContext = null;
let powerModeMusic = null; // Oscilador para la música del power mode
let powerModeMusicGain = null; // Gain node para controlar el volumen
let powerModeMusicTimer = null; // Timer para la música en loop
let gameStartSoundPlayed = false; // Flag para controlar si se ha reproducido el sonido de inicio

// Inicializar audio context (requiere interacción del usuario)
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Reanudar si está suspendido
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

// Función para generar sonidos 8 bits
function playSound(frequency, duration, type = 'square', volume = 0.3) {
    if (!audioContext) {
        initAudio();
    }
    if (!audioContext) {
        return; // No reproducir si el audio no está disponible
    }
    
    // Intentar reanudar si está suspendido (async)
    if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            // Reproducir sonido después de reanudar
            playSoundInternal(frequency, duration, type, volume);
        }).catch(() => {
            // Si falla, intentar reproducir de todas formas
            playSoundInternal(frequency, duration, type, volume);
        });
        return;
    }
    
    playSoundInternal(frequency, duration, type, volume);
}

// Función interna para reproducir sonido
function playSoundInternal(frequency, duration, type = 'square', volume = 0.3) {
    if (!audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        console.log('Error al reproducir sonido:', e);
    }
}

// Sonidos del juego
const sounds = {
    eatDot: () => {
        playSound(800, 0.05, 'square', 0.2);
    },
    eatPowerPellet: () => {
        playSound(400, 0.2, 'square', 0.3);
        setTimeout(() => playSound(600, 0.2, 'square', 0.3), 100);
    },
    eatGhost: () => {
        playSound(200, 0.1, 'square', 0.4);
        setTimeout(() => playSound(400, 0.1, 'square', 0.4), 100);
        setTimeout(() => playSound(600, 0.1, 'square', 0.4), 200);
        setTimeout(() => playSound(800, 0.1, 'square', 0.4), 300);
    },
    death: () => {
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                playSound(200 - i * 10, 0.1, 'sawtooth', 0.3);
            }, i * 50);
        }
    },
    powerModeWarning: () => {
        playSound(300, 0.1, 'square', 0.2);
    },
    eatCherry: () => {
        playSound(1000, 0.1, 'square', 0.4);
        setTimeout(() => playSound(1200, 0.1, 'square', 0.4), 100);
    },
    footstep: () => {
        playSound(200, 0.03, 'square', 0.225); // Sonido de pasos (50% más volumen: 0.15 * 1.5 = 0.225)
    },
    gameStart: () => {
        // Sonido de inicio del juego
        playSound(400, 0.1, 'square', 0.3);
        setTimeout(() => playSound(600, 0.1, 'square', 0.3), 100);
        setTimeout(() => playSound(800, 0.1, 'square', 0.3), 200);
    }
};

// Iniciar música de fondo del power mode
function startPowerModeMusic() {
    if (!audioContext) {
        initAudio();
    }
    if (!audioContext || audioContext.state === 'suspended') {
        return;
    }
    
    // Detener música anterior si existe
    stopPowerModeMusic();
    
    try {
        // Crear gain node para controlar el volumen
        powerModeMusicGain = audioContext.createGain();
        powerModeMusicGain.connect(audioContext.destination);
        powerModeMusicGain.gain.value = 0.35; // Volumen más alto para música de fondo del power mode
        
        // Melodía estilo 8 bits para power mode (secuencia de notas)
        const melody = [
            { freq: 523, duration: 0.15 }, // C5
            { freq: 659, duration: 0.15 }, // E5
            { freq: 784, duration: 0.15 }, // G5
            { freq: 659, duration: 0.15 }, // E5
            { freq: 784, duration: 0.3 },  // G5 (más largo)
            { freq: 523, duration: 0.15 }, // C5
            { freq: 659, duration: 0.15 }, // E5
            { freq: 784, duration: 0.3 }   // G5 (más largo)
        ];
        
        let noteIndex = 0;
        
        function playNextNote() {
            if (!gameState.powerMode || gameState.paused || gameState.gameOver) {
                stopPowerModeMusic();
                return;
            }
            
            const note = melody[noteIndex];
            const oscillator = audioContext.createOscillator();
            const noteGain = audioContext.createGain();
            
            oscillator.connect(noteGain);
            noteGain.connect(powerModeMusicGain);
            
            oscillator.type = 'square';
            oscillator.frequency.value = note.freq;
            
            const now = audioContext.currentTime;
            noteGain.gain.setValueAtTime(0.5, now); // Volumen más alto para las notas
            noteGain.gain.exponentialRampToValueAtTime(0.01, now + note.duration);
            
            oscillator.start(now);
            oscillator.stop(now + note.duration);
            
            noteIndex = (noteIndex + 1) % melody.length;
            
            // Programar siguiente nota
            powerModeMusicTimer = setTimeout(playNextNote, note.duration * 1000);
        }
        
        // Iniciar la melodía
        playNextNote();
    } catch (e) {
        console.log('Error al iniciar música de power mode:', e);
    }
}

// Detener música de fondo del power mode
function stopPowerModeMusic() {
    if (powerModeMusicTimer) {
        clearTimeout(powerModeMusicTimer);
        powerModeMusicTimer = null;
    }
    if (powerModeMusic) {
        try {
            powerModeMusic.stop();
        } catch (e) {
            // Ignorar errores al detener
        }
        powerModeMusic = null;
    }
    if (powerModeMusicGain) {
        try {
            powerModeMusicGain.disconnect();
        } catch (e) {
            // Ignorar errores al desconectar
        }
        powerModeMusicGain = null;
    }
}

// Dibujar laberinto con paredes delgadas
function drawMaze() {
    const WALL_THICKNESS = 4; // Grosor de las paredes (más delgado que los pasillos)
    
    for (let y = 0; y < MAZE.length; y++) {
        for (let x = 0; x < MAZE[y].length; x++) {
            const tileX = x * TILE_SIZE;
            const tileY = y * TILE_SIZE;
            
            if (MAZE[y][x] === '#') {
                ctx.fillStyle = COLORS.WALL;
                
                // Dibujar paredes solo en los bordes, no ocupando todo el tile
                // Verificar si hay paredes adyacentes para dibujar solo los bordes necesarios
                const hasWallLeft = x > 0 && MAZE[y][x - 1] === '#';
                const hasWallRight = x < MAZE[y].length - 1 && MAZE[y][x + 1] === '#';
                const hasWallUp = y > 0 && MAZE[y - 1][x] === '#';
                const hasWallDown = y < MAZE.length - 1 && MAZE[y + 1][x] === '#';
                
                // Dibujar borde superior
                if (!hasWallUp) {
                    ctx.fillRect(tileX, tileY, TILE_SIZE, WALL_THICKNESS);
                }
                // Dibujar borde inferior
                if (!hasWallDown) {
                    ctx.fillRect(tileX, tileY + TILE_SIZE - WALL_THICKNESS, TILE_SIZE, WALL_THICKNESS);
                }
                // Dibujar borde izquierdo
                if (!hasWallLeft) {
                    ctx.fillRect(tileX, tileY, WALL_THICKNESS, TILE_SIZE);
                }
                // Dibujar borde derecho
                if (!hasWallRight) {
                    ctx.fillRect(tileX + TILE_SIZE - WALL_THICKNESS, tileY, WALL_THICKNESS, TILE_SIZE);
                }
                
                // Si está completamente rodeado de paredes, dibujar todo el tile
                if (hasWallLeft && hasWallRight && hasWallUp && hasWallDown) {
                    ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
                }
            } else if (MAZE[y][x] === '.') {
                ctx.fillStyle = COLORS.DOT;
                ctx.fillRect(tileX + 12, tileY + 12, 8, 8);
            } else if (MAZE[y][x] === 'O') {
                // Power pellet (parpadeante)
                if (Math.floor(Date.now() / 200) % 2 === 0) {
                    ctx.fillStyle = COLORS.POWER_PELLET;
                    ctx.beginPath();
                    ctx.arc(tileX + TILE_SIZE/2, tileY + TILE_SIZE/2, 12, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
}

// Dibujar Pac-Man
function drawPacman() {
    if (pacman.dying) {
        // Animación de muerte: abrir la boca gradualmente hasta desaparecer
        const pixelX = pacman.x * TILE_SIZE;
        const pixelY = pacman.y * TILE_SIZE;
        const progress = pacman.deathTimer / pacman.deathMaxTime; // 0 a 1
        const scale = 1 - progress; // Escala de 1 a 0
        const mouthAngle = Math.PI * progress; // Abrir la boca de 0 a PI
        
        ctx.save();
        ctx.translate(pixelX + TILE_SIZE/2, pixelY + TILE_SIZE/2);
        ctx.scale(scale, scale);
        
        ctx.fillStyle = COLORS.PACMAN;
        ctx.beginPath();
        const angle = pacman.direction * Math.PI / 2;
        ctx.arc(
            0,
            0,
            TILE_SIZE/2 - 1,
            angle + mouthAngle,
            angle + Math.PI * 2 - mouthAngle
        );
        ctx.lineTo(0, 0);
        ctx.fill();
        
        // Ojo único durante la animación de muerte (si no está muy avanzada)
        if (progress < 0.7) {
            const eyeOffsetX = [3, 0, -3, 0][pacman.direction]; // right, down, left, up
            const eyeOffsetY = [0, 3, 0, -2][pacman.direction]; // Ajustado para arriba: -2 en lugar de -3
            
            // Ojo único (vista lateral)
            // Cuando mira hacia arriba, el ojo debe estar más abajo
            const baseEyeY = pacman.direction === 3 ? -6 : -8; // 3 = up
            const eyeX = eyeOffsetX;
            const eyeY = baseEyeY + eyeOffsetY;
            
            // Ojo blanco
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(eyeX - 3, eyeY, 6, 6);
            
            // Pupila negra
            ctx.fillStyle = '#000000';
            ctx.fillRect(eyeX - 1 + eyeOffsetX * 0.3, eyeY + 2 + eyeOffsetY * 0.3, 4, 4);
            
            // Highlight amarillo
            ctx.fillStyle = COLORS.PACMAN;
            ctx.fillRect(eyeX + eyeOffsetX * 0.3, eyeY + 3 + eyeOffsetY * 0.3, 2, 2);
        }
        
        ctx.restore();
    } else {
        const pixelX = pacman.x * TILE_SIZE;
        const pixelY = pacman.y * TILE_SIZE;
        const centerX = pixelX + TILE_SIZE/2;
        const centerY = pixelY + TILE_SIZE/2;
        
        ctx.fillStyle = COLORS.PACMAN;
        ctx.beginPath();
        
        const angle = pacman.direction * Math.PI / 2;
        const mouthAngle = pacman.mouthOpen ? Math.PI / 3 : 0;
        
        ctx.arc(
            centerX,
            centerY,
            TILE_SIZE/2 - 1,
            angle + mouthAngle,
            angle + Math.PI * 2 - mouthAngle
        );
        ctx.lineTo(centerX, centerY);
        ctx.fill();
        
        // Ojo único de Pac-Man (vista lateral - mira en la dirección del movimiento)
        // Offset de la pupila según la dirección: right, down, left, up
        const eyeOffsetX = [3, 0, -3, 0][pacman.direction];
        const eyeOffsetY = [0, 3, 0, -2][pacman.direction]; // Ajustado para arriba: -2 en lugar de -3
        
        // Posición del ojo según la dirección (centrado horizontalmente, arriba verticalmente)
        // Cuando mira hacia arriba, el ojo debe estar más abajo para quedar dentro del cuerpo
        const baseEyeY = pacman.direction === 3 ? centerY - 6 : centerY - 8; // 3 = up
        const eyeX = centerX + eyeOffsetX;
        const eyeY = baseEyeY + eyeOffsetY;
        
        // Ojo blanco
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(eyeX - 3, eyeY, 6, 6);
        
        // Pupila negra
        ctx.fillStyle = '#000000';
        ctx.fillRect(eyeX - 1 + eyeOffsetX * 0.3, eyeY + 2 + eyeOffsetY * 0.3, 4, 4);
        
        // Highlight amarillo en el ojo
        ctx.fillStyle = COLORS.PACMAN;
        ctx.fillRect(eyeX + eyeOffsetX * 0.3, eyeY + 3 + eyeOffsetY * 0.3, 2, 2);
    }
}

// Dibujar fantasmas
function drawGhosts() {
    ghosts.forEach(ghost => {
        if (ghost.eaten) {
            // Animación de fantasma comido: solo ojos volviendo a la base
            const pixelX = ghost.x * TILE_SIZE;
            const pixelY = ghost.y * TILE_SIZE;
            
            // Calcular dirección hacia la base
            const targetX = ghost.startX * TILE_SIZE + TILE_SIZE/2;
            const targetY = ghost.startY * TILE_SIZE + TILE_SIZE/2;
            const currentX = pixelX + TILE_SIZE/2;
            const currentY = pixelY + TILE_SIZE/2;
            
            // Dibujar solo los ojos (estilo mejorado)
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(pixelX + 6, pixelY + 10, 10, 10);
            ctx.fillRect(pixelX + 18, pixelY + 10, 10, 10);
            
            // Pupilas oscuras con highlight amarillo
            ctx.fillStyle = '#000000';
            ctx.fillRect(pixelX + 8, pixelY + 12, 6, 6);
            ctx.fillRect(pixelX + 20, pixelY + 12, 6, 6);
            
            // Highlight amarillo en el centro de cada ojo
            ctx.fillStyle = COLORS.PACMAN;
            ctx.fillRect(pixelX + 10, pixelY + 14, 2, 2);
            ctx.fillRect(pixelX + 22, pixelY + 14, 2, 2);
            
            // Ajustar dirección de las pupilas hacia la base
            const dx = targetX - currentX;
            const dy = targetY - currentY;
            if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
                const eyeOffsetX = Math.sign(dx) * 1;
                const eyeOffsetY = Math.sign(dy) * 1;
                ctx.fillStyle = '#000000';
                ctx.fillRect(pixelX + 8 + eyeOffsetX, pixelY + 12 + eyeOffsetY, 6, 6);
                ctx.fillRect(pixelX + 20 + eyeOffsetX, pixelY + 12 + eyeOffsetY, 6, 6);
                ctx.fillStyle = COLORS.PACMAN;
                ctx.fillRect(pixelX + 10 + eyeOffsetX, pixelY + 14 + eyeOffsetY, 2, 2);
                ctx.fillRect(pixelX + 22 + eyeOffsetX, pixelY + 14 + eyeOffsetY, 2, 2);
            }
        } else {
            const pixelX = ghost.x * TILE_SIZE;
            const pixelY = ghost.y * TILE_SIZE;
            
            ctx.fillStyle = ghost.scared ? COLORS.WALL : ghost.color; // Usar color de pared cuando está asustado
            
            // Parte superior redondeada (semicírculo)
            ctx.beginPath();
            ctx.arc(pixelX + TILE_SIZE/2, pixelY + TILE_SIZE/2 - 4, TILE_SIZE/2 - 2, Math.PI, 0, false);
            ctx.fill();
            
            // Cuerpo rectangular (parte media)
            ctx.fillRect(pixelX + 2, pixelY + TILE_SIZE/2 - 4, TILE_SIZE - 4, TILE_SIZE/2 + 4);
            
            // Parte inferior con patrón ondulado/escalonado (3 "patas" con forma ondulada)
            const waveWidth = (TILE_SIZE - 4) / 3; // 3 ondas
            const waveDepth = 6; // Profundidad de las ondas
            const midY = pixelY + TILE_SIZE/2;
            const bottomY = pixelY + TILE_SIZE - 2;
            
            // Onda izquierda (más alta en el centro)
            ctx.beginPath();
            ctx.moveTo(pixelX + 2, midY);
            ctx.lineTo(pixelX + 2 + waveWidth/2, bottomY - waveDepth);
            ctx.lineTo(pixelX + 2 + waveWidth, midY);
            ctx.lineTo(pixelX + 2 + waveWidth, bottomY);
            ctx.lineTo(pixelX + 2, bottomY);
            ctx.closePath();
            ctx.fill();
            
            // Onda central (más alta en el centro)
            ctx.beginPath();
            ctx.moveTo(pixelX + 2 + waveWidth, midY);
            ctx.lineTo(pixelX + 2 + waveWidth + waveWidth/2, bottomY - waveDepth);
            ctx.lineTo(pixelX + 2 + waveWidth * 2, midY);
            ctx.lineTo(pixelX + 2 + waveWidth * 2, bottomY);
            ctx.lineTo(pixelX + 2 + waveWidth, bottomY);
            ctx.closePath();
            ctx.fill();
            
            // Onda derecha (más alta en el centro)
            ctx.beginPath();
            ctx.moveTo(pixelX + 2 + waveWidth * 2, midY);
            ctx.lineTo(pixelX + 2 + waveWidth * 2 + waveWidth/2, bottomY - waveDepth);
            ctx.lineTo(pixelX + TILE_SIZE - 2, midY);
            ctx.lineTo(pixelX + TILE_SIZE - 2, bottomY);
            ctx.lineTo(pixelX + 2 + waveWidth * 2, bottomY);
            ctx.closePath();
            ctx.fill();
            
            // Ojos (estilo mejorado)
            if (!ghost.scared) {
                // Ojos blancos cuadrados
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(pixelX + 6, pixelY + 10, 10, 10);
                ctx.fillRect(pixelX + 18, pixelY + 10, 10, 10);
                
                // Pupilas oscuras
                ctx.fillStyle = '#000000';
                ctx.fillRect(pixelX + 8, pixelY + 12, 6, 6);
                ctx.fillRect(pixelX + 20, pixelY + 12, 6, 6);
                
                // Highlight amarillo en el centro de cada ojo
                ctx.fillStyle = COLORS.PACMAN;
                ctx.fillRect(pixelX + 10, pixelY + 14, 2, 2);
                ctx.fillRect(pixelX + 22, pixelY + 14, 2, 2);
            } else {
                // Ojos asustados (más pequeños y horizontales)
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(pixelX + 4, pixelY + 18, 8, 4);
                ctx.fillRect(pixelX + 20, pixelY + 18, 8, 4);
                
                // Pupilas pequeñas
                ctx.fillStyle = '#000000';
                ctx.fillRect(pixelX + 6, pixelY + 19, 2, 2);
                ctx.fillRect(pixelX + 22, pixelY + 19, 2, 2);
            }
        }
    });
}

// Dibujar cereza
function drawCherry() {
    if (!cherry.visible) return;
    
    const pixelX = cherry.x * TILE_SIZE;
    const pixelY = cherry.y * TILE_SIZE;
    const centerX = pixelX + TILE_SIZE / 2;
    const centerY = pixelY + TILE_SIZE / 2;
    
    // Tallo verde
    ctx.fillStyle = COLORS.CHERRY_GREEN;
    ctx.fillRect(centerX - 1, centerY - 12, 2, 6);
    
    // Hojas (dos pequeñas hojas verdes)
    ctx.beginPath();
    ctx.arc(centerX - 4, centerY - 10, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 4, centerY - 10, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Dos cerezas rojas
    ctx.fillStyle = COLORS.CHERRY_RED;
    // Cereza izquierda
    ctx.beginPath();
    ctx.arc(centerX - 6, centerY - 2, 6, 0, Math.PI * 2);
    ctx.fill();
    // Cereza derecha
    ctx.beginPath();
    ctx.arc(centerX + 6, centerY - 2, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Reflejo en las cerezas (punto blanco pequeño)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(centerX - 7, centerY - 4, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 5, centerY - 4, 2, 0, Math.PI * 2);
    ctx.fill();
}

// Verificar colisión con paredes
function canMove(x, y) {
    if (x < 0 || x >= MAZE[0].length || y < 0 || y >= MAZE.length) {
        return false;
    }
    return MAZE[y][x] !== '#';
}

// Mover Pac-Man
function movePacman() {
    // Intentar cambiar de dirección
    if (pacman.nextDirection !== pacman.direction) {
        const directions = [
            { dx: 1, dy: 0 },  // right
            { dx: 0, dy: 1 },  // down
            { dx: -1, dy: 0 }, // left
            { dx: 0, dy: -1 }  // up
        ];
        
        const next = directions[pacman.nextDirection];
        if (canMove(pacman.x + next.dx, pacman.y + next.dy)) {
            pacman.direction = pacman.nextDirection;
        }
    }
    
    // Mover en la dirección actual
    const directions = [
        { dx: 1, dy: 0 },  // right
        { dx: 0, dy: 1 },  // down
        { dx: -1, dy: 0 }, // left
        { dx: 0, dy: -1 }  // up
    ];
    
    const dir = directions[pacman.direction];
    const newX = pacman.x + dir.dx;
    const newY = pacman.y + dir.dy;
    
    if (canMove(newX, newY)) {
        pacman.x = newX;
        pacman.y = newY;
        
        // Comer punto
        if (MAZE[pacman.y][pacman.x] === '.') {
            // Reemplazar punto con espacio
            const row = MAZE[pacman.y].split('');
            row[pacman.x] = ' ';
            MAZE[pacman.y] = row.join('');
            gameState.score += 10;
            gameState.dotsRemaining--;
            gameState.dotsEaten++;
            updateScore();
            sounds.eatDot();
        } else if (MAZE[pacman.y][pacman.x] === 'O') {
            // Power pellet
            const row = MAZE[pacman.y].split('');
            row[pacman.x] = ' ';
            MAZE[pacman.y] = row.join('');
            gameState.score += 50;
            gameState.powerMode = true;
            gameState.powerTimer = 40; // Duración en ciclos de movimiento (~5 segundos)
            ghosts.forEach(ghost => ghost.scared = true);
            sounds.eatPowerPellet();
            startPowerModeMusic(); // Iniciar música de fondo del power mode
        } else if (MAZE[pacman.y][pacman.x] === ' ') {
            // Caminar por espacio vacío (sin pastillas) - sonido discreto de pasos
            sounds.footstep();
        }
    }
    
}

// Calcular distancia Manhattan
function manhattanDistance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

// Obtener direcciones válidas (evitando la dirección opuesta)
function getValidDirections(ghost) {
    const directions = [
        { dx: 1, dy: 0, dir: 0 },   // right
        { dx: 0, dy: 1, dir: 1 },   // down
        { dx: -1, dy: 0, dir: 2 },  // left
        { dx: 0, dy: -1, dir: 3 }   // up
    ];
    
    const valid = [];
    const oppositeDir = (ghost.direction + 2) % 4; // Evitar dar la vuelta
    
    directions.forEach(d => {
        const newX = ghost.x + d.dx;
        const newY = ghost.y + d.dy;
        if (canMove(newX, newY) && d.dir !== oppositeDir) {
            valid.push(d);
        }
    });
    
    // Si no hay direcciones válidas, permitir la opuesta
    if (valid.length === 0) {
        directions.forEach(d => {
            const newX = ghost.x + d.dx;
            const newY = ghost.y + d.dy;
            if (canMove(newX, newY)) {
                valid.push(d);
            }
        });
    }
    
    return valid;
}

// Estrategia: Perseguir directamente
function chaseStrategy(ghost) {
    const validDirs = getValidDirections(ghost);
    if (validDirs.length === 0) return;
    
    let bestDir = validDirs[0];
    let minDist = Infinity;
    
    validDirs.forEach(d => {
        const newX = ghost.x + d.dx;
        const newY = ghost.y + d.dy;
        const dist = manhattanDistance(newX, newY, pacman.x, pacman.y);
        if (dist < minDist) {
            minDist = dist;
            bestDir = d;
        }
    });
    
    ghost.direction = bestDir.dir;
}

// Estrategia: Emboscada (intentar interceptar)
function ambushStrategy(ghost) {
    const validDirs = getValidDirections(ghost);
    if (validDirs.length === 0) return;
    
    // Predecir posición de Pac-Man
    const directions = [
        { dx: 1, dy: 0 },  // right
        { dx: 0, dy: 1 },  // down
        { dx: -1, dy: 0 }, // left
        { dx: 0, dy: -1 }  // up
    ];
    const pacDir = directions[pacman.direction];
    const predictedX = pacman.x + pacDir.dx * 3;
    const predictedY = pacman.y + pacDir.dy * 3;
    
    let bestDir = validDirs[0];
    let minDist = Infinity;
    
    validDirs.forEach(d => {
        const newX = ghost.x + d.dx;
        const newY = ghost.y + d.dy;
        const dist = manhattanDistance(newX, newY, predictedX, predictedY);
        if (dist < minDist) {
            minDist = dist;
            bestDir = d;
        }
    });
    
    ghost.direction = bestDir.dir;
}

// Estrategia: Patrullar área
function patrolStrategy(ghost) {
    const validDirs = getValidDirections(ghost);
    if (validDirs.length === 0) return;
    
    // Si está lejos, perseguir. Si está cerca, patrullar
    const dist = manhattanDistance(ghost.x, ghost.y, pacman.x, pacman.y);
    
    if (dist > 10) {
        // Perseguir
        chaseStrategy(ghost);
    } else {
        // Patrullar: moverse en círculos o aleatoriamente
        if (Math.random() < 0.7) {
            // Continuar en la misma dirección si es posible
            const currentDir = validDirs.find(d => d.dir === ghost.direction);
            if (currentDir) {
                return; // Mantener dirección
            }
        }
        // Cambiar dirección aleatoriamente
        ghost.direction = validDirs[Math.floor(Math.random() * validDirs.length)].dir;
    }
}

// Estrategia: Aleatorio pero inteligente
function randomStrategy(ghost) {
    const validDirs = getValidDirections(ghost);
    if (validDirs.length === 0) return;
    
    // 60% perseguir, 40% aleatorio
    if (Math.random() < 0.6) {
        chaseStrategy(ghost);
    } else {
        ghost.direction = validDirs[Math.floor(Math.random() * validDirs.length)].dir;
    }
}

// Estrategia: Huir cuando está asustado
function fleeStrategy(ghost) {
    const validDirs = getValidDirections(ghost);
    if (validDirs.length === 0) return;
    
    let bestDir = validDirs[0];
    let maxDist = -1;
    
    validDirs.forEach(d => {
        const newX = ghost.x + d.dx;
        const newY = ghost.y + d.dy;
        const dist = manhattanDistance(newX, newY, pacman.x, pacman.y);
        if (dist > maxDist) {
            maxDist = dist;
            bestDir = d;
        }
    });
    
    ghost.direction = bestDir.dir;
}

// Mover fantasmas (IA mejorada)
function moveGhosts() {
    ghosts.forEach(ghost => {
        // No mover fantasmas que están siendo comidos
        if (ghost.eaten) return;
        const directions = [
            { dx: 1, dy: 0 },  // right
            { dx: 0, dy: 1 },  // down
            { dx: -1, dy: 0 }, // left
            { dx: 0, dy: -1 }  // up
        ];
        
        // Si está asustado, huir
        if (ghost.scared) {
            fleeStrategy(ghost);
        } else {
            // Aplicar estrategia según el tipo de fantasma
            switch(ghost.strategy) {
                case 'chase':
                    chaseStrategy(ghost);
                    break;
                case 'ambush':
                    ambushStrategy(ghost);
                    break;
                case 'patrol':
                    patrolStrategy(ghost);
                    break;
                case 'random':
                    randomStrategy(ghost);
                    break;
                default:
                    chaseStrategy(ghost);
            }
        }
        
        // Mover en la dirección elegida
        const dir = directions[ghost.direction];
        const newX = ghost.x + dir.dx;
        const newY = ghost.y + dir.dy;
        
        if (canMove(newX, newY)) {
            ghost.x = newX;
            ghost.y = newY;
            ghost.lastDirection = ghost.direction;
        } else {
            // Si no puede moverse, elegir nueva dirección válida
            const validDirs = getValidDirections(ghost);
            if (validDirs.length > 0) {
                ghost.direction = validDirs[Math.floor(Math.random() * validDirs.length)].dir;
            }
        }
    });
}

// Encontrar posición válida para la cereza
function findValidCherryPosition() {
    const validPositions = [];
    
    // Buscar todas las posiciones válidas (donde no hay pared)
    for (let y = 0; y < MAZE.length; y++) {
        for (let x = 0; x < MAZE[y].length; x++) {
            if (MAZE[y][x] !== '#' && MAZE[y][x] !== 'O') {
                // Evitar posiciones donde está Pac-Man o los fantasmas
                const isPacmanPos = (x === pacman.x && y === pacman.y);
                const isGhostPos = ghosts.some(ghost => ghost.x === x && ghost.y === y);
                
                if (!isPacmanPos && !isGhostPos) {
                    validPositions.push({ x, y });
                }
            }
        }
    }
    
    // Si hay posiciones válidas, elegir una aleatoria
    if (validPositions.length > 0) {
        return validPositions[Math.floor(Math.random() * validPositions.length)];
    }
    
    // Fallback: posición central
    return { x: 17, y: 11 };
}

// Actualizar cereza
function updateCherry() {
    // Aparecer cereza después de comer 70 puntos, y luego cada 70 puntos adicionales
    if (!cherry.visible && gameState.dotsEaten >= 70) {
        const pointsSinceLastCherry = gameState.dotsEaten - gameState.lastCherryScore;
        if (pointsSinceLastCherry >= 70) {
            // Buscar una posición válida para la cereza
            const validPos = findValidCherryPosition();
            cherry.x = validPos.x;
            cherry.y = validPos.y;
            cherry.visible = true;
            cherry.timer = 0;
            gameState.lastCherryScore = gameState.dotsEaten;
        }
    }
    
    // Actualizar timer de la cereza
    if (cherry.visible) {
        cherry.timer++;
        if (cherry.timer >= cherry.maxTime) {
            cherry.visible = false;
            cherry.timer = 0;
        }
    }
}

// Verificar colisiones
function checkCollisions() {
    // Colisión con cereza
    if (cherry.visible && cherry.x === pacman.x && cherry.y === pacman.y) {
        cherry.visible = false;
        cherry.timer = 0;
        gameState.score += 100; // 100 puntos por cereza
        updateScore();
        sounds.eatCherry();
        // No contar la cereza como punto comido para el spawn
    }
    
    // Colisión con fantasmas
    ghosts.forEach(ghost => {
        if (ghost.x === pacman.x && ghost.y === pacman.y && !pacman.dying && !ghost.eaten) {
            if (ghost.scared) {
                // Comer fantasma - iniciar animación
                ghost.eaten = true;
                ghost.eatenTimer = 0;
                ghost.scared = false;
                gameState.score += 200;
                updateScore();
                sounds.eatGhost();
            } else {
                // Perder vida - iniciar animación de muerte de Pac-Man
                pacman.dying = true;
                pacman.deathTimer = 0;
                gameState.lives--;
                updateLives();
                sounds.death();
            }
        }
    });
}

// Actualizar animaciones de muerte
function updateDeathAnimations() {
    // Animación de muerte de Pac-Man
    if (pacman.dying) {
        pacman.deathTimer++;
        if (pacman.deathTimer >= pacman.deathMaxTime) {
            pacman.dying = false;
            pacman.deathTimer = 0;
            if (gameState.lives <= 0) {
                gameState.gameOver = true;
            } else {
                // Resetear posiciones
                pacman.x = 17;
                pacman.y = 18;
                ghosts[0].x = 17; ghosts[0].y = 5;
                ghosts[1].x = 10; ghosts[1].y = 5;
                ghosts[2].x = 24; ghosts[2].y = 5;
                ghosts[3].x = 17; ghosts[3].y = 8;
                cherry.visible = false;
                cherry.timer = 0;
                gameState.dotsEaten = 0;
                gameState.lastCherryScore = 0;
            }
        }
    }
    
    // Animación de fantasmas comidos
    ghosts.forEach(ghost => {
        if (ghost.eaten) {
            ghost.eatenTimer++;
            
            // Mover hacia la base
            const targetX = ghost.startX;
            const targetY = ghost.startY;
            const dx = targetX - ghost.x;
            const dy = targetY - ghost.y;
            
            if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
                // Mover hacia la base
                if (Math.abs(dx) > Math.abs(dy)) {
                    ghost.x += Math.sign(dx);
                } else {
                    ghost.y += Math.sign(dy);
                }
            }
            
            // Si llegó a la base o se acabó el tiempo, resetear
            if ((ghost.x === targetX && ghost.y === targetY) || ghost.eatenTimer >= ghost.eatenMaxTime) {
                ghost.eaten = false;
                ghost.eatenTimer = 0;
                ghost.x = ghost.startX;
                ghost.y = ghost.startY;
            }
        }
    });
}

// Actualizar power mode
function updatePowerMode() {
    if (gameState.powerMode) {
        gameState.powerTimer--;
        // Sonido de advertencia cuando el power mode está por terminar
        if (gameState.powerTimer <= 5 && gameState.powerTimer > 0) {
            if (gameState.powerTimer % 2 === 0) {
                sounds.powerModeWarning();
            }
        }
        if (gameState.powerTimer <= 0) {
            gameState.powerMode = false;
            ghosts.forEach(ghost => ghost.scared = false);
            stopPowerModeMusic(); // Detener música de fondo del power mode
        }
    }
}

// Actualizar UI
function updateScore() {
    document.getElementById('score').textContent = gameState.score;
}

function updateLives() {
    document.getElementById('lives').textContent = gameState.lives;
}

// Bucle principal del juego
function gameLoop() {
    if (gameState.paused || gameState.gameOver) {
        if (gameState.paused) {
            stopPowerModeMusic(); // Detener música si el juego está pausado
        }
        if (gameState.gameOver) {
            stopPowerModeMusic(); // Detener música si el juego terminó
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#FF0000';
            ctx.font = '40px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
        }
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // Reiniciar música si el juego se reanudó y todavía está en power mode
    if (gameState.powerMode && !powerModeMusicTimer && !gameState.paused) {
        startPowerModeMusic();
    }
    
    // Limpiar canvas con color diferente durante power mode
    if (gameState.powerMode) {
        // Fondo ligeramente azulado durante power mode
        ctx.fillStyle = '#0a0a1a'; // Azul muy oscuro
    } else {
        ctx.fillStyle = COLORS.BACKGROUND; // Negro normal
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Actualizar animaciones de muerte
    updateDeathAnimations();
    
    // Actualizar Pac-Man cada MOVE_DELAY frames (solo si no está muriendo)
    if (!pacman.dying) {
        gameState.moveCounter++;
        if (gameState.moveCounter >= MOVE_DELAY) {
            // Guardar posición antes de mover
            const prevX = pacman.x;
            const prevY = pacman.y;
            
            movePacman();
            
            // Actualizar flag de movimiento basado en si cambió de posición
            pacman.isMoving = (pacman.x !== prevX || pacman.y !== prevY);
            
            checkCollisions();
            updatePowerMode(); // Actualizar power mode solo cuando hay movimiento
            updateCherry(); // Actualizar cereza
            gameState.moveCounter = 0;
        }
    }
    
    // Actualizar fantasmas cada GHOST_MOVE_DELAY frames (10% más lento)
    // Solo mover fantasmas que no están siendo comidos
    gameState.ghostMoveCounter++;
    if (gameState.ghostMoveCounter >= GHOST_MOVE_DELAY) {
        // Mover solo fantasmas que no están siendo comidos
        const activeGhosts = ghosts.filter(ghost => !ghost.eaten);
        if (activeGhosts.length > 0) {
            moveGhosts();
        }
        checkCollisions(); // Verificar colisiones también después de mover fantasmas
        gameState.ghostMoveCounter = 0;
    }
    
    // Animación de boca de Pac-Man
    // 50% más lenta cuando camina (8 frames), 80% más lenta cuando no camina (9 frames)
    pacman.mouthTimer++;
    const mouthDelay = pacman.isMoving ? 8 : 9; // 5 * 1.5 = 7.5 ≈ 8, 5 * 1.8 = 9
    if (pacman.mouthTimer >= mouthDelay) {
        pacman.mouthOpen = !pacman.mouthOpen;
        pacman.mouthTimer = 0;
    }
    
    // Dibujar
    drawMaze();
    drawCherry(); // Dibujar cereza antes de Pac-Man y fantasmas
    drawPacman();
    drawGhosts();
    
    // Verificar victoria
    if (gameState.dotsRemaining === 0) {
        gameState.gameOver = true;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00FF00';
        ctx.font = '40px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('YOU WIN!', canvas.width/2, canvas.height/2);
    }
    
    requestAnimationFrame(gameLoop);
}

// Controles
const keys = {};

document.addEventListener('keydown', (e) => {
    initAudio(); // Inicializar audio al presionar tecla
    // Asegurar que el audio esté activo
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            // Reproducir sonido de inicio si aún no se ha reproducido
            if (!gameStartSoundPlayed) {
                setTimeout(() => {
                    sounds.gameStart();
                    gameStartSoundPlayed = true;
                }, 100);
            }
        });
    } else if (audioContext && !gameStartSoundPlayed) {
        // Si el audio ya está activo, reproducir sonido de inicio
        setTimeout(() => {
            sounds.gameStart();
            gameStartSoundPlayed = true;
        }, 100);
    }
    keys[e.key.toLowerCase()] = true;
    
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        pacman.nextDirection = 0;
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        pacman.nextDirection = 1;
    } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        pacman.nextDirection = 2;
    } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        pacman.nextDirection = 3;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Botones
document.getElementById('startBtn').addEventListener('click', () => {
    initAudio(); // Inicializar audio al hacer clic
    if (gameState.gameOver) {
        // Reiniciar juego
        location.reload();
    } else {
        gameState.paused = false;
        gameState.gameOver = false;
        // Reproducir sonido de inicio
        setTimeout(() => {
            sounds.gameStart();
        }, 100);
    }
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    gameState.paused = !gameState.paused;
});

// Inicializar audio automáticamente al cargar la página
// Intentar inicializar audio inmediatamente
initAudio();

// También intentar inicializar cuando el usuario interactúa con la página
document.addEventListener('click', () => {
    initAudio();
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            if (!gameStartSoundPlayed) {
                setTimeout(() => {
                    sounds.gameStart();
                    gameStartSoundPlayed = true;
                }, 100);
            }
        });
    }
}, { once: true });

// Iniciar juego
updateScore();
updateLives();

// Reproducir sonido de inicio después de 1 segundo (si el audio está activo)
setTimeout(() => {
    initAudio();
    if (audioContext) {
        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                if (!gameStartSoundPlayed) {
                    sounds.gameStart();
                    gameStartSoundPlayed = true;
                }
            });
        } else {
            if (!gameStartSoundPlayed) {
                sounds.gameStart();
                gameStartSoundPlayed = true;
            }
        }
    }
}, 1000);

gameLoop();

