# Prompt: Recrear Pac-Man en Java Swing

## Descripción General
Crear un juego completo de Pac-Man usando Java con Swing/AWT. El juego debe incluir interfaz gráfica con JFrame y JPanel, sistema de colisiones, IA para fantasmas, generación procedural de sonidos 8-bit, y mecánicas clásicas del juego original.

## Estructura del Proyecto

### Archivo Principal
- `PacMan.java`: Clase principal que extiende JPanel e implementa ActionListener y KeyListener

### Clases Internas
1. **Ghost**: Clase estática interna para representar fantasmas
2. **Sound**: Clase estática interna para generar sonidos procedurales

## Especificaciones Técnicas

### Configuración de la Ventana
- **Tamaño de tile**: 20 píxeles
- **Columnas del laberinto**: 30
- **Filas del laberinto**: 17
- **Ancho total**: 600 píxeles (30 × 20)
- **Altura total**: 380 píxeles (17 × 20 + 40 píxeles extra para puntuación)
- **Título de ventana**: "Pac-Man - Enhanced"

### Velocidades
- **Velocidad de Pac-Man**: 2 píxeles por frame
- **Velocidad de fantasmas normales**: 1 píxel por frame
- **Velocidad de fantasmas asustados**: 1 píxel por frame

### Temporizador
- **Intervalo de actualización**: 15 milisegundos (~66 FPS)

## Diseño del Laberinto

### Representación
- Matriz bidimensional de enteros (int[][])
- **Valores posibles**:
  - `0`: Espacio vacío (ya comido o área sin puntos)
  - `1`: Pared
  - `2`: Punto pequeño
  - `3`: Power Pellet (píldora de poder)

### Dimensiones
- Matriz de 17 filas × 30 columnas
- Diseño simétrico tradicional de Pac-Man
- 4 Power Pellets en las esquinas (posiciones aproximadas: fila 1 y 15, columnas 1 y 28)
- Área central con casa de fantasmas (filas 6-8, centro del laberinto)
- Pasillos laterales con wrap-around (túneles en los bordes)

### Características del Laberinto
- Paredes exteriores completas
- Bloques internos distribuidos simétricamente
- Espacios amplios para movimiento
- Zona central abierta (casa de fantasmas con valores 0)
- Puntos distribuidos en todos los pasillos accesibles

## Sistema de Personajes

### Pac-Man

#### Propiedades
- **Posición inicial**: x=20, y=20 píxeles (tile 1,1)
- **Tamaño visual**: 20×20 píxeles (ocupa un tile completo)
- **Representación**: Arco circular con "boca" direccional
- **Color**: Amarillo (Color.YELLOW)

#### Estado
- Coordenadas en píxeles (pacX, pacY)
- Dirección actual (dirX, dirY): valores -1, 0 o 1
- Dirección solicitada (reqDirX, reqDirY): para cambios suaves
- Estado de boca (mouthOpen): boolean para animación
- Temporizador de boca (mouthTimer): contador para alternar la animación

#### Animación de Boca
- La boca se abre y cierra cada 20 frames
- Ángulo de boca abierta: 60° (Math.PI/3)
- Ángulo de boca cerrada: 0° (círculo completo)
- Orientación según dirección:
  - Derecha: ángulo inicial 0°
  - Izquierda: ángulo inicial 180°
  - Arriba: ángulo inicial 90°
  - Abajo: ángulo inicial 270°

#### Mecánicas de Movimiento
- Verificar alineación de píxeles con tiles (x % TILE_SIZE == 0)
- Intentar cambiar a dirección solicitada cuando está alineado
- Continuar en dirección actual si no puede cambiar
- Detección de colisión antes de moverse
- Wrap-around en bordes laterales (túnel)

### Fantasmas

#### Clase Ghost - Propiedades
- Posición actual (x, y) en píxeles
- Posición inicial (startX, startY) en píxeles
- Dirección (dirX, dirY)
- Color único (Color)
- Estado de miedo (frightened): boolean
- Temporizador de miedo (frightenedTimer): contador

#### Configuración de Fantasmas (4 total)
1. **Fantasma Rojo**:
   - Posición inicial: tile 14, 7
   - Color: Color.RED
   
2. **Fantasma Rosa**:
   - Posición inicial: tile 15, 7
   - Color: Color.PINK
   
3. **Fantasma Cian**:
   - Posición inicial: tile 16, 7
   - Color: Color.CYAN
   
4. **Fantasma Naranja**:
   - Posición inicial: tile 17, 7
   - Color: Color.ORANGE

#### Inteligencia Artificial de Fantasmas

##### Algoritmo de Movimiento
1. Cuando está alineado con la cuadrícula (x % TILE_SIZE == 0 y y % TILE_SIZE == 0):
   - Calcular todas las direcciones posibles (arriba, abajo, izquierda, derecha)
   - Excluir la dirección opuesta a la actual (no dar vuelta en U inmediatamente)
   - Verificar que cada dirección no tenga pared
   - Si no hay direcciones válidas, permitir dirección opuesta
   - Elegir dirección aleatoria de las válidas

2. Moverse en la dirección elegida
3. Aplicar wrap-around en bordes laterales

##### Comportamiento en Modo Asustado
- Color cambia a azul (Color.BLUE)
- Mantiene el mismo algoritmo de movimiento (aleatorio)
- Duración: ~10 segundos (600 frames a 15ms cada uno)
- Al colisionar con Pac-Man: resetear a posición inicial

#### Método reset()
- Restaurar posición inicial (x = startX, y = startY)
- Desactivar modo asustado (frightened = false)
- Resetear dirección (dirX = 0, dirY = 0)

## Sistema de Renderizado

### Método paintComponent(Graphics g)

#### 1. Dibujar Laberinto
- Iterar por matriz maze[y][x]
- **Paredes (valor 1)**:
  - Color azul (Color.BLUE)
  - Rectángulo relleno de 20×20 píxeles
  
- **Puntos pequeños (valor 2)**:
  - Color blanco (Color.WHITE)
  - Óvalo de 6×6 píxeles centrado en el tile
  
- **Power Pellets (valor 3)**:
  - Color blanco (Color.WHITE)
  - Óvalo de 12×12 píxeles centrado en el tile

#### 2. Dibujar Cereza (si está visible)
- **Cuerpo**: Óvalo rojo de 12×12 píxeles
- **Tallo**: Línea verde desde la cereza hacia arriba
- Posición: cherryX, cherryY (píxeles)

#### 3. Dibujar Pac-Man
- Usar Graphics2D con antialiasing activado
- Color amarillo
- Método fillArc() para crear forma de "pac-man"
- Parámetros del arco:
  - Posición: (pacX, pacY)
  - Tamaño: 20×20 píxeles
  - Ángulo inicial según dirección
  - Ángulo de arco: 300° si boca abierta, 360° si cerrada

#### 4. Dibujar Fantasmas
- Para cada fantasma en la lista:
  - Color según estado: azul si asustado, color original si normal
  - Óvalo de 20×20 píxeles para el cuerpo
  - **Ojos**: Dos óvalos blancos de 4×4 píxeles
  - Posiciones de ojos: (x+4, y+4) y (x+12, y+4)

#### 5. Dibujar UI
- **Puntuación**: "Score: X" en esquina inferior izquierda
- **Vidas**: "Lives: X" en esquina inferior derecha
- Fuente: Arial Bold 18pt
- Color: Blanco

#### 6. Mensajes de Estado
- **Game Over**: 
  - Color rojo
  - Fuente: Arial Bold 40pt
  - Centrado en pantalla
  
- **You Win**: 
  - Color verde
  - Fuente: Arial Bold 40pt
  - Centrado en pantalla

## Sistema de Colisiones

### Método canMove(x, y, dx, dy, speed)

#### Algoritmo
1. Calcular próxima posición: nextX = x + dx × speed, nextY = y + dy × speed
2. Convertir píxeles a tiles:
   - startCol = nextX / TILE_SIZE
   - endCol = (nextX + TILE_SIZE - 1) / TILE_SIZE
   - startRow = nextY / TILE_SIZE
   - endRow = (nextY + TILE_SIZE - 1) / TILE_SIZE
3. Verificar todos los tiles que ocuparía el personaje
4. Si algún tile es pared (valor 1), retornar false
5. Si todos son válidos, retornar true

#### Validación de Límites
- Verificar que row y col estén dentro del rango [0, MAZE_ROWS) y [0, MAZE_COLS)
- Píxeles fuera del laberinto no son válidos

## Mecánicas de Juego

### Sistema de Puntuación
- **Punto pequeño**: 10 puntos
- **Power Pellet**: 50 puntos
- **Fantasma comido**: 200 puntos
- **Cereza**: 100 puntos

### Sistema de Vidas
- **Vidas iniciales**: 3
- **Perder vida**: Al colisionar con fantasma no asustado
- **Game Over**: Cuando lives llega a 0

### Comer Elementos

#### Algoritmo de Detección
1. Calcular centro de Pac-Man:
   - centerX = pacX + TILE_SIZE/2
   - centerY = pacY + TILE_SIZE/2
2. Convertir a coordenadas de grid:
   - gridX = centerX / TILE_SIZE
   - gridY = centerY / TILE_SIZE
3. Verificar valor de maze[gridY][gridX]
4. Según el valor:
   - **Punto (2)**: Sumar 10 puntos, decrementar dots, tocar sonido waka, cambiar tile a 0
   - **Power Pellet (3)**: Sumar 50 puntos, activar modo poder, tocar sonido power, cambiar tile a 0

### Modo Power (Power Mode)
- **Activación**: Al comer Power Pellet
- **Duración**: 600 frames (~10 segundos)
- **Efectos**:
  - Todos los fantasmas: frightened = true
  - frightenedTimer = 600 para cada fantasma
  - Fantasmas se vuelven azules y vulnerables
- **Finalización**: Decrementar timer cada frame, al llegar a 0 desactivar

### Sistema de Cereza

#### Lógica de Aparición
- Aparece cuando: score > 500 y rand.nextInt(1000) < 2 (~0.2% por frame)
- Solo una cereza a la vez
- Posición fija: (14 × TILE_SIZE, 10 × TILE_SIZE)

#### Detección de Colisión
- Usar Rectangle para Pac-Man y cereza
- Si intersectan: sumar 100 puntos, ocultar cereza, tocar sonido

### Condiciones de Victoria/Derrota

#### Victoria (win = true)
- Cuando dots == 0 (todos los puntos comidos)
- Mostrar mensaje "You Win!" en verde
- Detener juego

#### Derrota (gameOver = true)
- Cuando lives == 0
- Mostrar mensaje "Game Over" en rojo
- Detener juego

## Sistema de Control

### Interfaz KeyListener

#### Método keyPressed(KeyEvent e)
- Capturar teclas de flecha (VK_LEFT, VK_RIGHT, VK_UP, VK_DOWN)
- Actualizar dirección solicitada (reqDirX, reqDirY):
  - **Izquierda**: reqDirX = -1, reqDirY = 0
  - **Derecha**: reqDirX = 1, reqDirY = 0
  - **Arriba**: reqDirX = 0, reqDirY = -1
  - **Abajo**: reqDirX = 0, reqDirY = 1

#### Métodos sin implementación
- keyTyped(KeyEvent e): vacío
- keyReleased(KeyEvent e): vacío

## Sistema de Audio (Clase Sound)

### Tecnología
- Usar javax.sound.sampled (AudioFormat, SourceDataLine, AudioSystem)
- Generación procedural de tonos con ondas sinusoidales

### Método Base: playTone(hz, msecs)

#### Parámetros
- **hz**: Frecuencia en Hertz
- **msecs**: Duración en milisegundos

#### Algoritmo
1. Configurar AudioFormat:
   - Sample rate: 8000 Hz
   - Bits: 8
   - Canales: 1 (mono)
   - Signed: true
   - Big Endian: false

2. Obtener SourceDataLine del sistema
3. Abrir y arrancar la línea de audio
4. Para cada sample (msecs × 8):
   - Calcular ángulo: i / (sampleRate / hz) × 2π
   - Generar valor: sin(ángulo) × 127
   - Escribir byte a la línea de audio
5. Drenar y cerrar la línea

#### Manejo de Errores
- Try-catch general
- Ignorar errores de audio (no interrumpir el juego)

### Sonidos Específicos

#### playWaka()
- Frecuencia: 400 Hz
- Duración: 50 ms
- Uso: Al comer punto pequeño

#### playPower()
- Frecuencia: 600 Hz
- Duración: 100 ms
- Uso: Al comer Power Pellet

#### playEatGhost()
- Frecuencia: 800 Hz
- Duración: 100 ms
- Uso: Al comer fantasma asustado

#### playFruit()
- Frecuencia: 1000 Hz
- Duración: 100 ms
- Uso: Al comer cereza

#### playDie()
- Frecuencia: 200 Hz
- Duración: 300 ms
- Uso: Al morir (colisión con fantasma)

#### playStart()
- Ejecutar en thread separado
- Secuencia de 3 tonos:
  - 400 Hz, 100 ms
  - 500 Hz, 100 ms
  - 600 Hz, 100 ms
- Uso: Al iniciar el juego

## Bucle Principal del Juego

### Método actionPerformed(ActionEvent e)

#### Estructura General
```
1. Si gameOver o win: return (no actualizar)

2. Actualizar animación de boca de Pac-Man
   - Incrementar mouthTimer
   - Cada 20 frames: alternar mouthOpen

3. Intentar cambiar dirección de Pac-Man
   - Si está alineado con grid (pacX % TILE_SIZE == 0)
   - Si hay dirección solicitada diferente
   - Si la nueva dirección es válida: aplicar cambio

4. Mover Pac-Man
   - Si puede moverse en dirección actual: aplicar movimiento
   - Aplicar wrap-around en bordes

5. Detectar y procesar elementos comidos
   - Calcular posición en grid
   - Verificar y procesar puntos/power pellets

6. Verificar victoria (dots == 0)

7. Lógica de cereza
   - Aparecer aleatoriamente si score > 500
   - Detectar colisión con Pac-Man

8. Actualizar fantasmas
   - Decrementar frightenedTimer si está asustado
   - Mover cada fantasma (método moveGhost)

9. Detectar colisiones con fantasmas
   - Si colisiona:
     - Fantasma asustado: resetear fantasma, sumar puntos, sonido
     - Fantasma normal: perder vida, sonido de muerte, resetear posiciones

10. Llamar a repaint() para redibujar
```

### Método moveGhost(Ghost g)

#### Algoritmo
1. Determinar velocidad según estado (asustado o normal)

2. Si está alineado con grid:
   - Crear lista de direcciones posibles
   - Probar 4 direcciones: arriba, abajo, izquierda, derecha
   - Excluir dirección opuesta (no U-turn inmediato)
   - Verificar con canMove() que no hay pared
   - Si no hay opciones: permitir dirección opuesta
   - Elegir dirección aleatoria de las válidas
   - Actualizar dirX y dirY del fantasma

3. Intentar moverse en dirección actual
   - Si puede moverse: aplicar movimiento
   - Aplicar wrap-around en bordes laterales

## Inicialización del Juego

### Constructor PacMan()

#### Secuencia
1. Configurar JPanel:
   - setPreferredSize(WIDTH, HEIGHT)
   - setBackground(Color.BLACK)
   - setFocusable(true)
   - addKeyListener(this)

2. Contar puntos totales:
   - Iterar matriz maze
   - Contar tiles con valor 2 o 3
   - Guardar en variable dots

3. Crear 4 fantasmas:
   - Añadir a lista ghosts con posiciones y colores específicos

4. Crear y arrancar Timer:
   - javax.swing.Timer con 15ms de intervalo
   - this como ActionListener
   - timer.start()

5. Reproducir sonido de inicio:
   - Sound.playStart()

### Método main(String[] args)

#### Crear Ventana
1. Crear JFrame con título "Pac-Man - Enhanced"
2. Crear instancia de PacMan (el juego)
3. Agregar juego al frame
4. Configurar:
   - setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE)
   - setResizable(false)
   - pack() para ajustar tamaño
   - setLocationRelativeTo(null) para centrar
   - setVisible(true) para mostrar
5. Solicitar foco: game.requestFocusInWindow()

## Importaciones Necesarias

### Swing/AWT
- javax.swing.JPanel
- javax.swing.JFrame
- javax.swing.Timer
- java.awt.Color
- java.awt.Dimension
- java.awt.Font
- java.awt.Graphics
- java.awt.Graphics2D
- java.awt.Point
- java.awt.Rectangle
- java.awt.RenderingHints
- java.awt.event.ActionEvent
- java.awt.event.ActionListener
- java.awt.event.KeyEvent
- java.awt.event.KeyListener

### Utilidades
- java.util.ArrayList
- java.util.List
- java.util.Random

### Audio
- javax.sound.sampled.AudioFormat
- javax.sound.sampled.AudioSystem
- javax.sound.sampled.SourceDataLine

## Consideraciones de Implementación

### Optimización de Renderizado
- Activar antialiasing para gráficos más suaves
- Usar Graphics2D.setRenderingHint() con RenderingHints.VALUE_ANTIALIAS_ON

### Thread Safety
- Sonido de inicio en Thread separado para no bloquear UI
- Otros sonidos pueden ejecutarse en el hilo principal (son muy cortos)

### Manejo de Estado
- Variables de instancia para estado del juego (score, lives, dots, gameOver, win)
- Variables de instancia para estado de Pac-Man (posición, dirección, animación)
- Lista de fantasmas con estado individual

### Colisiones Precisas
- Verificar todos los tiles que ocupa el personaje (no solo el centro)
- Considerar tamaño completo del sprite (20×20)
- Usar Rectangle.intersects() para colisiones entre personajes

### Wrap-Around (Túneles Laterales)
- Detectar cuando x <= -TILE_SIZE: teleportar a x = WIDTH
- Detectar cuando x >= WIDTH: teleportar a x = -TILE_SIZE
- Aplicar tanto a Pac-Man como a fantasmas

## Flujo del Juego

### Inicio
1. Aparecer ventana centrada
2. Reproducir melodía de inicio
3. Pac-Man en posición inicial
4. Fantasmas en sus posiciones iniciales
5. Score = 0, Lives = 3
6. Timer arranca automáticamente

### Durante el Juego
1. Jugador controla Pac-Man con flechas
2. Pac-Man come puntos y suma score
3. Fantasmas persiguen aleatoriamente
4. Power Pellets activan modo poder
5. Cereza aparece ocasionalmente

### Perder Vida
1. Colisión con fantasma no asustado
2. Reproducir sonido de muerte
3. Decrementar lives
4. Resetear posiciones de todos los personajes
5. Si lives > 0: continuar jugando
6. Si lives == 0: Game Over

### Victoria
1. Todos los puntos comidos (dots == 0)
2. Mostrar "You Win!" en verde
3. Detener actualización del juego
4. Cerrar ventana para salir

### Game Over
1. Lives == 0
2. Mostrar "Game Over" en rojo
3. Detener actualización del juego
4. Cerrar ventana para salir

## Detalles de Implementación Avanzados

### Cambio Suave de Dirección
- No cambiar dirección inmediatamente al presionar tecla
- Guardar en reqDirX, reqDirY
- Aplicar solo cuando Pac-Man está alineado con grid
- Verificar que la nueva dirección no tenga pared
- Si no puede cambiar, continuar en dirección actual

### Animación de Boca Direccional
- Calcular ángulo inicial según dirección actual
- Usar operador ternario anidado para determinar ángulo
- Aplicar ángulo de apertura solo si mouthOpen es true

### IA de Fantasmas No Determinista
- Usar Random para elegir dirección de lista válida
- Esto hace que cada partida sea diferente
- Evitar U-turns inmediatos para comportamiento más natural

### Sincronización de Audio
- AudioFormat a 8000 Hz da calidad retro
- Ondas sinusoidales puras para estilo 8-bit
- Drenar buffer antes de cerrar para evitar cortes abruptos

## Testing y Depuración

### Casos de Prueba
1. Movimiento en las 4 direcciones
2. Colisión con todas las paredes
3. Wrap-around en túneles laterales
4. Comer todos los tipos de elementos
5. Colisión con fantasmas (normal y asustado)
6. Perder todas las vidas
7. Ganar el juego (comer todos los puntos)
8. Activar power mode múltiples veces
9. Colectar cereza

### Puntos de Atención
- Verificar que el conteo de dots sea correcto al inicio
- Asegurar que maze[y][x] cambie a 0 al comer
- Confirmar que frightenedTimer decrementa correctamente
- Validar que wrap-around funcione en ambos bordes
- Verificar que el juego se detenga correctamente en game over/win

## Extensiones Opcionales (No Requeridas)

### Mejoras Visuales
- Animación de muerte de Pac-Man (rotación)
- Colores diferentes para cada fantasma en modo asustado
- Efectos de parpadeo antes de terminar power mode
- Sprite sheets en lugar de formas geométricas

### Mejoras de Gameplay
- Múltiples niveles con laberintos diferentes
- Velocidad creciente en niveles avanzados
- Puntuación multiplicadora al comer fantasmas consecutivamente
- Más tipos de frutas bonus con diferentes valores

### Mejoras de Audio
- Música de fondo continua
- Sonidos específicos para cada fantasma
- Efectos de eco o reverb

### Mejoras de UI
- Pantalla de inicio con instrucciones
- Tabla de puntajes altos
- Botones para pausar/reanudar
- Indicadores visuales de vidas (sprites de Pac-Man)

## Entregables

### Archivo Principal
- `PacMan.java`: Un solo archivo con todas las clases

### Requisitos de Compilación
- Java 8 o superior
- Sin dependencias externas (solo Java SE)

### Requisitos de Ejecución
- JRE instalado
- Soporte para audio (sistema operativo con drivers de sonido)

### Documentación Esperada
- Comentarios en español explicando secciones clave
- Importaciones explícitas (sin wildcards)
- Nombres de variables descriptivos
- Estructura clara con métodos bien separados

---

**Nota Final**: Este prompt describe un juego completamente funcional de Pac-Man en Java. El código resultante debe poder compilarse y ejecutarse sin modificaciones, ofreciendo una experiencia de juego fluida y entretenida.

