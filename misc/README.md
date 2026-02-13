# 🛠️ Misc Scripts

Miscellaneous utility scripts.

---

## Mouse Jiggler

**File:** [`mouse_jiggler.py`](./mouse_jiggler.py)

Keeps your computer awake by periodically moving the mouse cursor and pressing the Shift key — preventing screen lock, sleep mode, and idle status on messaging apps.

### How It Works

- Every 50 seconds, moves the mouse in a vertical sweep.
- Presses `Shift` 3 times to simulate activity.
- Logs start/end times and total runtime on exit.

### Requirements

```bash
pip install pyautogui
```

### Usage

```bash
python mouse_jiggler.py
```

Press `Ctrl+C` to stop.
