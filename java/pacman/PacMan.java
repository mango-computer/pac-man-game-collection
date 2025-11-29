
// Importaciones EXPLÍCITAS para evitar ambigüedad
import javax.swing.JPanel;
import javax.swing.JFrame;
import javax.swing.Timer;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Point;
import java.awt.Rectangle;
import java.awt.RenderingHints;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import javax.sound.sampled.*;

public class PacMan extends JPanel implements ActionListener, KeyListener {
    private static final int TILE_SIZE = 20;
    private static final int MAZE_COLS = 30;
    private static final int MAZE_ROWS = 17;
    private static final int WIDTH = MAZE_COLS * TILE_SIZE;
    private static final int HEIGHT = MAZE_ROWS * TILE_SIZE + 40; // Extra space for score
    private static final int PAC_SPEED = 2;
    private static final int GHOST_SPEED = 1;
    private static final int FRIGHTENED_SPEED = 1;

    // Laberinto: 0=Empty, 1=Wall, 2=Dot, 3=Power Pellet
    private final int[][] maze = {
            { 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 },
            { 1, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 1 },
            { 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1 },
            { 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 },
            { 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1 },
            { 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1 },
            { 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1 },
            { 0, 0, 0, 0, 0, 2, 1, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0 },
            { 1, 1, 1, 1, 1, 2, 1, 2, 2, 2, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 1, 2, 1, 1, 1, 1, 1 },
            { 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0 },
            { 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1 },
            { 0, 0, 0, 0, 0, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 0, 0, 0, 0, 0 },
            { 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 2, 2, 2, 2, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1 },
            { 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 2, 2, 2, 2, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1 },
            { 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1 },
            { 1, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 1 },
            { 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 }
    };

    // Pixel coordinates
    private int pacX = 1 * TILE_SIZE, pacY = 1 * TILE_SIZE;
    private int dirX = 0, dirY = 0;
    private int reqDirX = 0, reqDirY = 0;
    private boolean mouthOpen = true;
    private int mouthTimer = 0;

    private int score = 0;
    private int lives = 3;
    private int dots = 0;
    private boolean gameOver = false;
    private boolean win = false;

    // Cherry
    private boolean showCherry = false;
    private int cherryX = 14 * TILE_SIZE, cherryY = 10 * TILE_SIZE;

    private final List<Ghost> ghosts = new ArrayList<>();
    private javax.swing.Timer timer;
    private Random rand = new Random();

    private static class Ghost {
        int x, y;
        int startX, startY;
        int dirX = 0, dirY = 0;
        Color color;
        boolean frightened = false;
        int frightenedTimer = 0;

        Ghost(int x, int y, Color color) {
            this.startX = x * TILE_SIZE;
            this.startY = y * TILE_SIZE;
            this.x = startX;
            this.y = startY;
            this.color = color;
        }

        void reset() {
            x = startX;
            y = startY;
            frightened = false;
            dirX = 0;
            dirY = 0;
        }
    }

    public PacMan() {
        setPreferredSize(new Dimension(WIDTH, HEIGHT));
        setBackground(Color.BLACK);
        setFocusable(true);
        addKeyListener(this);

        for (int[] row : maze) {
            for (int cell : row) {
                if (cell == 2 || cell == 3)
                    dots++;
            }
        }

        ghosts.add(new Ghost(14, 7, Color.RED));
        ghosts.add(new Ghost(15, 7, Color.PINK));
        ghosts.add(new Ghost(16, 7, Color.CYAN));
        ghosts.add(new Ghost(17, 7, Color.ORANGE));

        timer = new javax.swing.Timer(15, this);
        timer.start();

        Sound.playStart();
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2d = (Graphics2D) g;
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // Draw Maze
        for (int y = 0; y < maze.length; y++) {
            for (int x = 0; x < maze[0].length; x++) {
                if (maze[y][x] == 1) {
                    g.setColor(Color.BLUE);
                    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                } else if (maze[y][x] == 2) {
                    g.setColor(Color.WHITE);
                    g.fillOval(x * TILE_SIZE + TILE_SIZE / 2 - 3, y * TILE_SIZE + TILE_SIZE / 2 - 3, 6, 6);
                } else if (maze[y][x] == 3) {
                    g.setColor(Color.WHITE);
                    g.fillOval(x * TILE_SIZE + TILE_SIZE / 2 - 6, y * TILE_SIZE + TILE_SIZE / 2 - 6, 12, 12);
                }
            }
        }

        // Cherry
        if (showCherry) {
            g.setColor(Color.RED);
            g.fillOval(cherryX + 4, cherryY + 4, 12, 12);
            g.setColor(Color.GREEN);
            g.drawLine(cherryX + 10, cherryY + 4, cherryX + 14, cherryY - 2);
        }

        // Pac-Man
        g.setColor(Color.YELLOW);
        int startAngle = (dirX == 1) ? 0 : (dirX == -1) ? 180 : (dirY == -1) ? 90 : 270;
        int arcAngle = mouthOpen ? 300 : 360;
        g.fillArc(pacX, pacY, TILE_SIZE, TILE_SIZE, startAngle, arcAngle);

        // Ghosts
        for (Ghost gst : ghosts) {
            if (gst.frightened) {
                g.setColor(Color.BLUE);
            } else {
                g.setColor(gst.color);
            }
            g.fillOval(gst.x, gst.y, TILE_SIZE, TILE_SIZE);

            // Eyes
            g.setColor(Color.WHITE);
            g.fillOval(gst.x + 4, gst.y + 4, 4, 4);
            g.fillOval(gst.x + 12, gst.y + 4, 4, 4);
        }

        // UI
        g.setColor(Color.WHITE);
        g.setFont(new Font("Arial", Font.BOLD, 18));
        g.drawString("Score: " + score, 20, HEIGHT - 10);
        g.drawString("Lives: " + lives, WIDTH - 100, HEIGHT - 10);

        if (gameOver) {
            g.setColor(Color.RED);
            g.setFont(new Font("Arial", Font.BOLD, 40));
            g.drawString("Game Over", WIDTH / 2 - 120, HEIGHT / 2);
        } else if (win) {
            g.setColor(Color.GREEN);
            g.setFont(new Font("Arial", Font.BOLD, 40));
            g.drawString("You Win!", WIDTH / 2 - 100, HEIGHT / 2);
        }
    }

    private boolean canMove(int x, int y, int dx, int dy, int speed) {
        int nextX = x + dx * speed;
        int nextY = y + dy * speed;

        int startCol = nextX / TILE_SIZE;
        int endCol = (nextX + TILE_SIZE - 1) / TILE_SIZE;
        int startRow = nextY / TILE_SIZE;
        int endRow = (nextY + TILE_SIZE - 1) / TILE_SIZE;

        for (int r = startRow; r <= endRow; r++) {
            for (int c = startCol; c <= endCol; c++) {
                if (r >= 0 && r < MAZE_ROWS && c >= 0 && c < MAZE_COLS) {
                    if (maze[r][c] == 1) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    private void moveGhost(Ghost g) {
        int speed = g.frightened ? FRIGHTENED_SPEED : GHOST_SPEED;

        if (g.x % TILE_SIZE == 0 && g.y % TILE_SIZE == 0) {
            List<Point> possibleDirs = new ArrayList<>();
            int[][] dirs = { { 0, 1 }, { 0, -1 }, { 1, 0 }, { -1, 0 } };

            for (int[] d : dirs) {
                if (d[0] == -g.dirX && d[1] == -g.dirY && (g.dirX != 0 || g.dirY != 0))
                    continue;
                if (canMove(g.x, g.y, d[0], d[1], speed)) {
                    possibleDirs.add(new Point(d[0], d[1]));
                }
            }

            if (possibleDirs.isEmpty()) {
                g.dirX = -g.dirX;
                g.dirY = -g.dirY;
            } else {
                Point chosen = possibleDirs.get(rand.nextInt(possibleDirs.size()));
                g.dirX = chosen.x;
                g.dirY = chosen.y;
            }
        }

        if (canMove(g.x, g.y, g.dirX, g.dirY, speed)) {
            g.x += g.dirX * speed;
            g.y += g.dirY * speed;

            // Wrap
            if (g.x <= -TILE_SIZE)
                g.x = WIDTH;
            else if (g.x >= WIDTH)
                g.x = -TILE_SIZE;
        }
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        if (gameOver || win)
            return;

        mouthTimer++;
        if (mouthTimer % 20 == 0)
            mouthOpen = !mouthOpen;

        // PacMan Direction
        if (pacX % TILE_SIZE == 0 && pacY % TILE_SIZE == 0) {
            if (reqDirX != 0 || reqDirY != 0) {
                if (canMove(pacX, pacY, reqDirX, reqDirY, PAC_SPEED)) {
                    dirX = reqDirX;
                    dirY = reqDirY;
                }
            }
        }

        // Move PacMan
        if (canMove(pacX, pacY, dirX, dirY, PAC_SPEED)) {
            pacX += dirX * PAC_SPEED;
            pacY += dirY * PAC_SPEED;

            // Wrap
            if (pacX <= -TILE_SIZE)
                pacX = WIDTH;
            else if (pacX >= WIDTH)
                pacX = -TILE_SIZE;
        }

        // Eat Items
        int centerX = pacX + TILE_SIZE / 2;
        int centerY = pacY + TILE_SIZE / 2;
        int gridX = centerX / TILE_SIZE;
        int gridY = centerY / TILE_SIZE;

        if (gridX >= 0 && gridX < MAZE_COLS && gridY >= 0 && gridY < MAZE_ROWS) {
            int cell = maze[gridY][gridX];
            if (cell == 2) { // Dot
                maze[gridY][gridX] = 0;
                score += 10;
                dots--;
                Sound.playWaka();
            } else if (cell == 3) { // Power Pellet
                maze[gridY][gridX] = 0;
                score += 50;
                dots--;
                Sound.playPower();
                for (Ghost g : ghosts) {
                    g.frightened = true;
                    g.frightenedTimer = 600; // 10 seconds approx
                }
            }
        }

        if (dots == 0)
            win = true;

        // Cherry Logic
        if (!showCherry && score > 500 && rand.nextInt(1000) < 2) {
            showCherry = true;
        }
        if (showCherry) {
            Rectangle pacRect = new Rectangle(pacX, pacY, TILE_SIZE, TILE_SIZE);
            Rectangle cherryRect = new Rectangle(cherryX, cherryY, TILE_SIZE, TILE_SIZE);
            if (pacRect.intersects(cherryRect)) {
                showCherry = false;
                score += 100;
                Sound.playFruit();
            }
        }

        // Ghosts
        for (Ghost g : ghosts) {
            if (g.frightened) {
                g.frightenedTimer--;
                if (g.frightenedTimer <= 0)
                    g.frightened = false;
            }
            moveGhost(g);
        }

        // Collision
        Rectangle pacRect = new Rectangle(pacX, pacY, TILE_SIZE, TILE_SIZE);
        for (Ghost g : ghosts) {
            Rectangle ghostRect = new Rectangle(g.x, g.y, TILE_SIZE, TILE_SIZE);
            if (pacRect.intersects(ghostRect)) {
                if (g.frightened) {
                    g.reset();
                    score += 200;
                    Sound.playEatGhost();
                } else {
                    lives--;
                    Sound.playDie();
                    if (lives == 0) {
                        gameOver = true;
                    } else {
                        // Reset positions
                        pacX = 1 * TILE_SIZE;
                        pacY = 1 * TILE_SIZE;
                        dirX = 0;
                        dirY = 0;
                        reqDirX = 0;
                        reqDirY = 0;
                        for (Ghost gh : ghosts)
                            gh.reset();
                    }
                }
            }
        }

        repaint();
    }

    @Override
    public void keyPressed(KeyEvent e) {
        switch (e.getKeyCode()) {
            case KeyEvent.VK_LEFT:
                reqDirX = -1;
                reqDirY = 0;
                break;
            case KeyEvent.VK_RIGHT:
                reqDirX = 1;
                reqDirY = 0;
                break;
            case KeyEvent.VK_UP:
                reqDirX = 0;
                reqDirY = -1;
                break;
            case KeyEvent.VK_DOWN:
                reqDirX = 0;
                reqDirY = 1;
                break;
        }
    }

    @Override
    public void keyTyped(KeyEvent e) {
    }

    @Override
    public void keyReleased(KeyEvent e) {
    }

    public static void main(String[] args) {
        JFrame frame = new JFrame("Pac-Man - Enhanced");
        PacMan game = new PacMan();
        frame.add(game);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setResizable(false);
        frame.pack();
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
        game.requestFocusInWindow();
    }

    // Simple Procedural Sound
    static class Sound {
        public static void playWaka() {
            playTone(400, 50);
        }

        public static void playPower() {
            playTone(600, 100);
        }

        public static void playEatGhost() {
            playTone(800, 100);
        }

        public static void playFruit() {
            playTone(1000, 100);
        }

        public static void playDie() {
            playTone(200, 300);
        }

        public static void playStart() {
            new Thread(() -> {
                playTone(400, 100);
                playTone(500, 100);
                playTone(600, 100);
            }).start();
        }

        private static void playTone(int hz, int msecs) {
            try {
                float sampleRate = 8000F;
                byte[] buf = new byte[1];
                AudioFormat af = new AudioFormat(sampleRate, 8, 1, true, false);
                SourceDataLine sdl = AudioSystem.getSourceDataLine(af);
                sdl.open(af);
                sdl.start();
                for (int i = 0; i < msecs * 8; i++) {
                    double angle = i / (sampleRate / hz) * 2.0 * Math.PI;
                    buf[0] = (byte) (Math.sin(angle) * 127.0);
                    sdl.write(buf, 0, 1);
                }
                sdl.drain();
                sdl.stop();
                sdl.close();
            } catch (Exception e) {
                // Ignore sound errors
            }
        }
    }
}