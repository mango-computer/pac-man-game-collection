# Prompt: Recrear Pac-Man Atari 2600

## Descripción General
Crear un juego completo de Pac-Man estilo Atari 2600 con HTML5 Canvas, JavaScript y CSS. El juego debe tener un diseño visual mejorado con modo oscuro, animaciones fluidas, sistema de sonidos 8-bit, y una IA avanzada para los fantasmas.

## Estructura de Archivos
- `index.html`: Estructura HTML con canvas, score board, y controles
- `style.css`: Estilos con modo oscuro, gradientes, y efectos visuales
- `game.js`: Lógica completa del juego

## Características del Juego

### Configuración Visual
- **Tamaño de tiles**: 32x32 píxeles
- **Laberinto**: 35 columnas x 23 filas
- **Canvas**: Tamaño dinámico basado en el laberinto
- **Estilo**: Pixel art 8-bit con `image-rendering: pixelated`

### Paleta de Colores
- **Paredes**: `#4169E1` (Azul real vibrante)
- **Puntos**: `#FFD700` (Dorado)
- **Power Pellets**: `#FF6B6B` (Rojo coral, parpadeante)
- **Pac-Man**: `#FFD700` (Amarillo dorado)
- **Fantasmas**: 
  - Rojo: `#FF4444`
  - Rosa: `#FF69B4`
  - Turquesa: `#00CED1`
  - Naranja: `#FFA500`
- **Fondo**: Negro `#000000`
- **Cereza**: Rojo `#FF1744`, Verde `#4CAF50`

### Laberinto
- Laberinto tradicional de Pac-Man con 35 caracteres de ancho
- Paredes delgadas (4px de grosor) más delgadas que los pasillos
- 4 power pellets en las esquinas (carácter 'O')
- Puntos distribuidos por todo el laberinto (carácter '.')

### Personajes

#### Pac-Man
- **Tamaño**: 32x32 píxeles
- **Ojo único**: Vista lateral con un solo ojo que mira en la dirección del movimiento
- **Animación de boca**: 
  - 50% más lenta cuando camina (8 frames)
  - 80% más lenta cuando está quieto (9 frames)
- **Animación de muerte**: Abre la boca gradualmente y se encoge hasta desaparecer (30 frames)
- **Velocidad**: Mueve cada 8 frames
- **Posición inicial**: x: 17, y: 18

#### Fantasmas
- **Tamaño**: 32x32 píxeles
- **Diseño**: 
  - Parte superior redondeada (semicírculo)
  - Cuerpo rectangular
  - Parte inferior con 3 "patas" onduladas/escalonadas
  - Ojos cuadrados blancos (10x10px) con pupilas negras (6x6px) y highlight amarillo (2x2px)
- **Estrategias de IA**:
  - Ghost 1 (Rojo): Persecución directa
  - Ghost 2 (Rosa): Emboscada (intercepta)
  - Ghost 3 (Turquesa): Patrullaje
  - Ghost 4 (Naranja): Aleatorio inteligente
- **Estado asustado**: Cambian a color azul cuando Pac-Man come power pellet
- **Animación cuando son comidos**: Solo ojos volviendo a la base
- **Velocidad**: 10% más lento que Pac-Man (mueven cada 9 frames)

### Mecánicas de Juego

#### Sistema de Puntuación
- Puntos: 10 puntos
- Power Pellets: 50 puntos
- Fantasmas comidos: 200 puntos
- Cerezas: 100 puntos

#### Power Mode
- Duración: 40 ciclos de movimiento (~5 segundos)
- Efectos:
  - Fantasmas se vuelven azules y huyen
  - Fondo cambia a azul muy oscuro `#0a0a1a`
  - Música de fondo 8-bit en loop (volumen 0.35)
  - Sonido de advertencia cuando está por terminar

#### Cerezas Bonus
- Aparecen después de comer 70 puntos
- Luego cada 70 puntos adicionales
- Aparecen en posiciones válidas aleatorias (no en paredes)
- Desaparecen después de ~25 segundos si no se comen
- Diseño: Dos cerezas rojas con tallo verde y hojas

#### Sistema de Vidas
- Inicio: 3 vidas
- Se pierde una vida al tocar un fantasma no asustado
- Animación de muerte antes de resetear

### Sistema de Sonidos 8-bit

#### Sonidos Implementados
- **Comer punto**: Frecuencia 800Hz, duración 0.05s
- **Comer power pellet**: Dos tonos (400Hz y 600Hz)
- **Comer fantasma**: Secuencia ascendente (200-800Hz)
- **Muerte**: Secuencia descendente (200-100Hz)
- **Comer cereza**: Dos tonos altos (1000Hz y 1200Hz)
- **Pasos**: Frecuencia 200Hz, volumen 0.225 (discreto)
- **Inicio del juego**: Secuencia de 3 tonos (400-600-800Hz)
- **Advertencia power mode**: Frecuencia 300Hz

#### Música de Fondo
- **Power mode**: Melodía en loop con notas C5-E5-G5
- Volumen: 0.35
- Se detiene automáticamente cuando termina el power mode

### Diseño CSS (Modo Oscuro)

#### Estilos Principales
- **Fondo**: Gradiente oscuro `linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)`
- **Container**: Gradiente azul oscuro con borde azul real y sombras
- **Título**: Dorado con múltiples sombras y efecto de brillo
- **Score Board**: Fondo semitransparente con borde dorado
- **Canvas**: Borde azul con sombras internas y externas
- **Botones**: Gradientes con efecto hover dorado y animaciones

### Controles
- **Teclado**: Flechas o WASD para mover
- **Botones**: "Iniciar Juego" y "Pausa"
- **Audio**: Se inicializa automáticamente al interactuar

### Animaciones

#### Pac-Man
- Boca que se abre y cierra según movimiento
- Ojo único que mira en la dirección del movimiento
- Animación de muerte: abre boca y se encoge

#### Fantasmas
- Ojos con pupilas que miran hacia la base cuando son comidos
- Patrón ondulado en la parte inferior
- Cambio de color cuando están asustados

### Detalles Técnicos

#### Velocidades
- Pac-Man: Mueve cada 8 frames
- Fantasmas: Mueven cada 9 frames (10% más lento)
- Animación de boca: 8 frames (caminando) / 9 frames (quieto)

#### Colisiones
- Detección por posición de tile
- Los fantasmas no pueden moverse durante animación de ser comidos
- Pac-Man no se mueve durante animación de muerte

#### Inicialización de Audio
- Se activa automáticamente al cargar
- Se reanuda en la primera interacción del usuario
- Sonido de inicio se reproduce después de 1 segundo

## Requisitos de Implementación

1. HTML5 Canvas para renderizado
2. Web Audio API para sonidos 8-bit
3. Sistema de game loop con `requestAnimationFrame`
4. Detección de colisiones por tiles
5. IA de pathfinding para fantasmas
6. Sistema de estados del juego (pausa, game over, power mode)
7. Animaciones basadas en timers
8. Diseño responsive con CSS

## Notas de Diseño
- Mantener estilo pixel art auténtico
- Colores vibrantes pero armoniosos
- Efectos visuales sutiles (sombras, brillos)
- Transiciones suaves en botones
- Modo oscuro completo con gradientes

