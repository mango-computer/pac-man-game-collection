# Pac-Man Game Collection

This repository contains two complete implementations of the classic Pac-Man game, showcasing different programming approaches and technologies.

## 📁 Projects Overview

### 1. Java Pac-Man (`/java/pacman/`)
A desktop implementation of Pac-Man using Java Swing with procedural sound generation.

### 2. Web Pac-Man (`/pacman/`)
A browser-based implementation inspired by Atari 2600 aesthetics, featuring HTML5 Canvas and 8-bit audio.

---

## 🎮 Java Pac-Man

### Technologies
- **Language:** Java
- **GUI Framework:** Swing (JPanel, JFrame)
- **Graphics:** Java 2D Graphics API
- **Audio:** javax.sound.sampled (procedural sound generation)

### Features
- ✅ Classic maze-based gameplay (30x17 tiles)
- ✅ Smooth movement with pixel-perfect collision detection
- ✅ Four ghosts with different behaviors:
  - **Red Ghost:** Aggressive chaser
  - **Pink Ghost:** Ambush strategy
  - **Cyan Ghost:** Patrol behavior
  - **Orange Ghost:** Random movement
- ✅ Power pellets that make ghosts vulnerable
- ✅ Cherry bonus item for extra points
- ✅ Lives system (3 lives)
- ✅ Score tracking
- ✅ Procedurally generated 8-bit sound effects:
  - Waka-waka eating sound
  - Power-up sound
  - Ghost eating sound
  - Death sound
  - Fruit collection sound
  - Game start melody

### How to Run
```bash
cd java/pacman
javac PacMan.java
java PacMan
```

### Controls
- **Arrow Keys:** Move Pac-Man (Up, Down, Left, Right)

### Game Mechanics
- **Dots:** 10 points each
- **Power Pellets:** 50 points each (4 total, located in corners)
- **Ghosts:** 200 points when eaten during power mode
- **Cherry:** 100 points (appears randomly after reaching 500 points)
- **Power Mode Duration:** ~10 seconds
- **Win Condition:** Collect all dots
- **Lose Condition:** Lose all 3 lives

### Technical Highlights
- Real-time collision detection with rectangular bounds
- Ghost AI with pathfinding and strategy patterns
- Procedural audio synthesis using sine wave oscillators
- Smooth animations at 15ms refresh rate (66 FPS)
- Clean OOP design with inner classes for Ghost and Sound

---

## 🌐 Web Pac-Man

### Technologies
- **Languages:** HTML5, CSS3, JavaScript (ES6+)
- **Graphics:** HTML5 Canvas API
- **Audio:** Web Audio API
- **Styling:** Modern CSS with dark mode and gradients

### Features
- ✅ Atari 2600-inspired pixel art aesthetic
- ✅ Large maze with thin walls (35x21 tiles)
- ✅ Advanced ghost AI with four distinct strategies:
  - **Chase:** Direct pursuit
  - **Ambush:** Intercepts Pac-Man's path
  - **Patrol:** Guards areas and switches between patrol/chase
  - **Random:** Unpredictable 60/40 chase/random mix
- ✅ Smooth animations:
  - Pac-Man mouth opening/closing
  - Death animation with gradual shrinking
  - Ghost eyes returning to base when eaten
- ✅ Power mode with:
  - Background music loop (C5-E5-G5 melody)
  - Visual effects (darker blue background)
  - Warning sounds before expiration
- ✅ Cherry bonus system:
  - Appears after eating 70 dots
  - Random spawn locations
  - Time-limited (25 seconds)
- ✅ Comprehensive 8-bit sound system:
  - Dot eating sounds
  - Power pellet sounds
  - Ghost eating sequence
  - Death sequence
  - Cherry collection
  - Footstep sounds
  - Game start melody
- ✅ Modern UI with dark mode design
- ✅ Pause/Resume functionality
- ✅ Score and lives display

### How to Run
```bash
cd pacman
# Option 1: Open directly in browser
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows

# Option 2: Use a local server (recommended)
python3 -m http.server 8000
# Then open http://localhost:8000 in your browser
```

### Controls
- **Arrow Keys** or **WASD:** Move Pac-Man
- **Start Button:** Begin/Resume game
- **Pause Button:** Pause/Unpause game

### Game Mechanics
- **Dots:** 10 points each
- **Power Pellets:** 50 points each (4 total, pulsating)
- **Ghosts:** 200 points when eaten during power mode
- **Cherry:** 100 points (appears every 70 dots eaten)
- **Power Mode Duration:** ~5 seconds (40 movement cycles)
- **Speed:**
  - Pac-Man moves every 8 frames
  - Ghosts move every 9 frames (10% slower)

### Visual Design
#### Color Palette
- **Walls:** `#4169E1` (Royal Blue)
- **Dots:** `#FFD700` (Gold)
- **Power Pellets:** `#FF6B6B` (Coral Red, pulsating)
- **Pac-Man:** `#FFD700` (Golden Yellow)
- **Ghosts:**
  - Red: `#FF4444`
  - Pink: `#FF69B4`
  - Cyan: `#00CED1`
  - Orange: `#FFA500`
- **Background:** `#000000` (Black)
- **Power Mode BG:** `#0a0a1a` (Dark Blue)

#### UI Elements
- Dark gradient background
- Golden title with glow effect
- Semi-transparent score board
- Canvas with blue borders and shadows
- Gradient buttons with hover effects

### Technical Highlights
- Game loop using `requestAnimationFrame` for smooth 60 FPS
- Advanced pathfinding AI using Manhattan distance
- Ghost strategies that avoid opposite direction (no instant U-turns)
- Flee behavior during power mode
- Web Audio API for procedural sound generation
- Responsive design with CSS Grid
- State management for game, pause, and power modes
- Separate timers for Pac-Man, ghosts, and animations
- Death animation system with timers
- Dynamic cherry spawning with position validation

### Project Structure
```
pacman/
├── index.html      # Game structure and canvas
├── style.css       # Dark mode styling and UI
├── game.js         # Complete game logic and rendering
└── PROMPT.md       # Detailed specification document
```

---

## 🎯 Comparison

| Feature | Java Version | Web Version |
|---------|-------------|-------------|
| Platform | Desktop (Cross-platform via JVM) | Browser (All modern browsers) |
| Graphics | Java 2D | HTML5 Canvas |
| Resolution | 600x380 pixels | 1120x672 pixels |
| Maze Size | 30x17 tiles | 35x21 tiles |
| Tile Size | 20px | 32px |
| Audio | Procedural (javax.sound) | Web Audio API |
| Ghost AI | Basic pathfinding | Advanced strategies |
| Animations | Basic | Advanced (death, eaten ghosts) |
| UI | Minimal | Modern dark mode |
| Power Mode | Yes | Yes + Background music |
| Cherry Bonus | Random spawn (>500 pts) | Every 70 dots |
| Code Lines | ~460 | ~1290 |

---

## 🚀 Future Enhancements

### Possible Additions
- [ ] Multiple maze levels
- [ ] High score persistence
- [ ] Mobile touch controls (web version)
- [ ] Multiplayer mode
- [ ] Difficulty settings
- [ ] Leaderboard system
- [ ] Different ghost behaviors based on level
- [ ] Fruit variety (beyond cherries)
- [ ] Cutscenes between levels
- [ ] Sound on/off toggle

---

## 📝 License

These projects are created for educational purposes. Pac-Man is a trademark of Bandai Namco Entertainment Inc.

---

## 👨‍💻 Development Notes

### Java Version
- Explicit imports avoid ambiguity
- Timer-based game loop (15ms intervals)
- Collision detection uses Rectangle intersections
- Sound generation uses 8-bit style square waves
- Clean separation of concerns with inner classes

### Web Version
- ES6+ JavaScript with modern syntax
- Modular function design
- Pixel-perfect rendering with `image-rendering: pixelated`
- Audio context initialization handles browser autoplay policies
- Extensive commenting for educational purposes
- State machines for game states and animations

---

## 🎓 Learning Outcomes

By studying these implementations, you can learn:
- Game loop patterns in different environments
- Collision detection algorithms
- AI pathfinding and behavior trees
- Sound synthesis and generation
- Canvas rendering techniques
- State management in games
- Animation timing and interpolation
- Event-driven programming
- Object-oriented vs functional approaches

---

## 🙏 Acknowledgments

Created as part of educational content demonstrating game development concepts across different platforms and technologies. Special thanks to the classic Pac-Man game that inspired generations of developers.

---

**Enjoy playing and learning from these implementations! 🎮👾**

