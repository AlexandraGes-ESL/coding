# 🌲 Roll & Speak: Autumn Forest Path 🍂

**Roll & Speak: Autumn Forest Path** is an interactive, storybook-style ESL speaking game designed for English language teachers and students (levels A1–B1). It runs directly in any modern web browser — ideal for interactive whiteboards, classroom projectors, online lessons (Zoom/Teams), or tablets.

No physical dice or printed cards needed — built-in dice rolling, automated token movement, special forest action events, and customizable question banks are all included!

---

## 🚀 Quick Start & How to Play

1. **Open the Game:** Open `index.html` in your web browser or visit your published GitHub Pages link.
2. **Setup Players:** Choose 2 to 4 players or teams, name your teams (e.g. *Fox Team*, *Owl Team*), and click **Start Forest Adventure!**.
3. **Roll the Die:** On their turn, students click **"Roll the Die!"** or press the <kbd>Spacebar</kbd>.
4. **Move & Speak:**
   - The team's animal token moves step-by-step along the winding forest path.
   - **💬 Question Spaces:** The player answers the speaking prompt out loud in English before clicking "Got it!".
   - **🍄 Special Event Spaces:** Forest events like *Mushroom Slide*, *Lucky Acorn*, *Bonus Roll*, *Sleepy Rest*, or *Forest Charades* trigger automatically!
5. **Win the Game:** The first team to reach Space 20 (the Finish Line) wins the forest journey!

---

## 🛠️ Editing Questions (`data/questions.json`)

All speaking prompts and special events are stored in `/data/questions.json`. Teachers can easily customize or translate the questions using any text editor (Notepad, VS Code, TextEdit) without editing any JavaScript code!

### JSON Structure:
```json
{
  "spaces": [
    {
      "id": 1,
      "type": "question",
      "text": "What is your favorite autumn activity and why?"
    },
    {
      "id": 3,
      "type": "special",
      "icon": "mushroom",
      "text": "🍄 Mushroom Patch! Slip on a damp mushroom. Go back 2 spaces.",
      "action": { "move": -2 }
    }
  ]
}
```

### Supported Special Actions:
- `{ "move": -2 }` — move token back 2 spaces.
- `{ "move": 1 }` — move token forward 1 space.
- `{ "bonus": true }` — player rolls again.
- `{ "skip": true }` — player misses next turn.
- `{ "ask_other": true }` — ask another player a question.
- `{ "act_out": true }` — act out an action without speaking.

---

## 🌐 Publishing on GitHub Pages

You can host this game for free on GitHub Pages in under 2 minutes:

1. **Create a Repository:** Create a new repository on [GitHub](https://github.com/) (e.g., `roll-and-speak-autumn`).
2. **Upload Files:** Push or upload all files from this project preserving the folder structure:
   ```
   roll-and-speak-game/
   ├── index.html
   ├── style.css
   ├── script.js
   ├── README.md
   ├── /assets/
   └── /data/
       └── questions.json
   ```
3. **Enable GitHub Pages:**
   - Go to repository **Settings** → **Pages**.
   - Under **Build and deployment** → **Source**, select **Deploy from a branch**.
   - Choose branch `main` (or `master`) and folder `/ (root)`.
   - Click **Save**.
4. **Access your Game:** After 1-2 minutes, GitHub Pages will provide a live URL like:  
   `https://<your-username>.github.io/roll-and-speak-autumn/`

---

## 🎨 Visual Language & Palette

- **Cream:** `#F5EFE2`
- **Mustard:** `#E3A857`
- **Terracotta:** `#C4614A`
- **Olive:** `#6E7F4E`
- **Brown:** `#4A342A`
- **Typography:** *Patrick Hand* (Body text) & *Caveat* (Storybook Headings)

---

## 📜 License & Credits

Designed for ESL teachers worldwide. Free to use, adapt, and share in educational settings.
