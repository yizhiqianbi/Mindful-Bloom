# 🌸 Mindful Bloom

Mindful Bloom is a tranquil, web-based 3D interactive experience designed to guide users through a short mindfulness and focus exercise. Using the metaphor of a blooming flower, the application encourages sustained attention in a calming, aesthetically pleasing environment.

## ✨ Core Concept

The central idea is to visualize the process of focusing one's mind. A closed flower bud represents an unfocused state. By holding their attention on the flower, the user provides the "energy" for it to slowly open its petals and bloom into a beautiful, vibrant flower. This creates a gentle and rewarding feedback loop for the practice of mindfulness. The entire session is designed to last for 3 minutes, providing a meaningful yet brief moment of calm.

## 🎨 Visual Design

The visual style is intentionally soft, warm, and cartoonish to create a welcoming and non-intimidating atmosphere.

*   **Color Palette**: The scene is dominated by a warm cream background (`#FFF5E1`), with soft greens for the landscape (`#8BC34A`), gentle pinks for the flower petals (`#f4978e`), and a sunny yellow for its center (`#fcdc4d`). This palette is chosen to evoke feelings of warmth, nature, and peace.
*   **Lighting**: The lighting is soft and directional, simulating a warm, late-afternoon sun. This creates gentle shadows and highlights, giving the low-poly models depth. As the user progresses, the scene's lighting subtly intensifies, reflecting the "energy" of their focus.
*   **Environment**: The environment consists of a simple ground plane, low-poly rolling green hills in the distance, and a beautiful gradient sky that transitions from a soft orange near the horizon to a calm blue above. Magical, floating light particles (motes) drift lazily through the air, adding a touch of wonder and serenity to the scene.
*   **3D Models**: The flower and environment are modeled in a charming, cartoon-like style. The shapes are simple and clean, with smooth surfaces provided by the `MeshToonMaterial` in Three.js, which complements the overall aesthetic.

## 🕹️ Interaction and Gameplay

The user journey is divided into three distinct states: IDLE, PRACTICING, and COMPLETED.

### 1. IDLE State
*   **Appearance**: The user is greeted with the fully rendered 3D scene. The flower is in its initial state—a closed bud.
*   **Interaction**: The user can freely explore the scene by clicking and dragging to rotate the camera (`OrbitControls`) and scrolling to zoom in and out.
*   **UI**: A "Start Practice" button is prominently displayed, along with an introductory message inviting the user to begin their session.

### 2. PRACTICING State
This is the core interactive phase of the experience.
*   **Goal**: To maintain focus on the flower for the duration of the 3-minute practice session.
*   **Focus Mechanic**:
    *   The user "focuses" by moving their mouse cursor over any part of the flower (stem, center, or petals).
    *   Additionally, clicking and holding the mouse button anywhere on the screen is also registered as focus. This provides a clear, intentional action and makes the experience accessible for touch devices.
*   **Visual Feedback**:
    *   **Immediate Feedback**: The instant the user's cursor hovers over the flower, its yellow center begins to emit a soft, warm glow. This provides immediate confirmation that their focus is registered. The glow fades when focus is lost.
    *   **Progressive Feedback**: As focus is maintained, a progress bar in the UI begins to fill. This progress is directly tied to several animations:
        1.  **The Bloom**: The flower's petals gracefully and slowly open.
        2.  **The Glow**: The petals themselves begin to develop a subtle, warm emissive glow.
        3.  **The Light**: The entire scene's primary light source intensifies, making the world feel brighter and more vibrant.
*   **Losing Focus**: If the user moves the mouse away from the flower, the progress bar begins to deplete at a faster rate than it was gained, encouraging sustained, gentle attention. All progressive animations pause or reverse slightly.

### 3. COMPLETED State
*   **Trigger**: This state is reached when the progress bar fills completely.
*   **Appearance**: The flower is now fully bloomed and vibrant. To celebrate the user's achievement, the petals pulse with a gentle, radiant light for a few moments.
*   **UI**: The instructional text changes to a congratulatory message. The progress bar disappears, and a "Practice Again" button appears, allowing the user to easily start a new session.

## 🛠️ Tech Stack

*   **Frontend Library**: React
*   **3D Graphics**: Three.js
*   **Animation**: GSAP (GreenSock Animation Platform)
*   **Styling**: Tailwind CSS
