# Webzuno website — how to run it

This is a **static front-end site**. There is **no npm install**, no Node project, and no build step.

Your colleague only needs the `CMR_Web` folder and a browser.

```
CMR_Web/
  index.html
  styles.css
  script.js
  assets/
    logo-mark.png
    logo-wordmark.jpg
```

Ignore `verify.mjs` and `verify-shots` if they are in the folder. They are not required to view the site.

**Internet is required** the first time you open it. GSAP, Lenis, and fonts load from a CDN.

---

## 1. Share the folder

Copy the whole `CMR_Web` folder (zip it, USB, email, OneDrive, Google Drive, or a git clone).

Keep `index.html`, `styles.css`, `script.js`, and `assets` together. Do not move those files into different folders.

---

## 2. Fastest way — open the file

### Windows

1. Open the `CMR_Web` folder in File Explorer.
2. Double-click `index.html`.
3. It should open in Edge or Chrome.

Or right-click `index.html` → **Open with** → Chrome / Edge.

### macOS

1. Open the `CMR_Web` folder in Finder.
2. Double-click `index.html`.
3. It should open in Safari or Chrome.

Or right-click → **Open With** → Google Chrome.

### Linux

1. Open the `CMR_Web` folder in the file manager.
2. Double-click `index.html`, or run:

```bash
xdg-open index.html
```

---

## 3. Recommended — local server (all platforms)

A local server is more reliable for some browsers (fonts, canvas, and scroll animations).

You need **Python 3** only. You do **not** need npm.

### Check Python

**Windows (PowerShell or Command Prompt):**

```bat
python --version
```

If that fails:

```bat
py --version
```

**macOS / Linux:**

```bash
python3 --version
```

If Python is missing:

- Windows: [https://www.python.org/downloads/](https://www.python.org/downloads/) — tick **Add python.exe to PATH**
- macOS: `python3` is usually already there, or install from [python.org](https://www.python.org/downloads/)
- Linux: `sudo apt install python3` (Debian/Ubuntu) or `sudo dnf install python3` (Fedora)

### Start the site

1. Open a terminal.
2. Go into `CMR_Web`.

**Windows PowerShell:**

```powershell
cd "C:\path\to\CMR_Web"
python -m http.server 8765
```

If `python` is not found:

```powershell
py -m http.server 8765
```

**Windows Command Prompt:**

```bat
cd C:\path\to\CMR_Web
python -m http.server 8765
```

**macOS / Linux:**

```bash
cd /path/to/CMR_Web
python3 -m http.server 8765
```

3. Leave that window open.
4. In a browser, open:

**http://127.0.0.1:8765/**

or

**http://localhost:8765/**

5. Stop the server with `Ctrl + C` in the terminal.

If port `8765` is already in use, pick another port:

```bash
python3 -m http.server 5500
```

Then open `http://127.0.0.1:5500/`.

---

## 4. Optional — VS Code / Cursor Live Server

If they already use VS Code or Cursor:

1. Open the `CMR_Web` folder.
2. Right-click `index.html`.
3. Choose **Open with Live Server** (if that extension is installed).

Still no npm install for this project.

---

## 5. Open from another device on the same Wi‑Fi

On the computer that is serving the files:

**Windows PowerShell:**

```powershell
python -m http.server 8765 --bind 0.0.0.0
```

**macOS / Linux:**

```bash
python3 -m http.server 8765 --bind 0.0.0.0
```

Find that computer’s LAN IP:

- Windows: `ipconfig` — look for **IPv4 Address** (for example `192.168.1.20`)
- macOS: `ipconfig getifaddr en0`
- Linux: `hostname -I`

On the phone or other laptop, open:

`http://192.168.1.20:8765/`

(Use the IP you actually saw.)

Both devices must be on the same network. A company firewall may block this.

---

## 6. What they should see

- Home: copy on the left, dotted icon animation on the right (changes every 5 seconds)
- Moon / sun toggle in the nav for dark and light mode
- Scroll sections: services cylinder, industry cards, pricing, contact form

If the page is blank or animations do not load, check that the device is **online** (CDN scripts) and that they opened `index.html` from inside `CMR_Web`, not a copy of that one file alone.

---

## 7. Common problems

| Problem | What to try |
|---|---|
| Page opens but looks unstyled | `styles.css` is missing or not next to `index.html` |
| Logo missing | Keep the `assets` folder next to `index.html` |
| Animations do not run | Allow JavaScript; connect to the internet |
| `python` is not recognized | Use `py` on Windows or `python3` on Mac/Linux |
| Port already in use | Use another port, e.g. `5500` |
| Double-click works, but some effects fail | Use the Python server method above |

---

## Not required

- Node.js
- npm / yarn / pnpm
- `npm install`
- Any build command (`npm run dev`, webpack, etc.)
