/* GAME LAB — Shared editor utilities */

// Wire a code editor to a preview iframe.
// Each .editor-shell needs a <textarea class="code-editor"> and an <iframe class="preview-frame">.
// Optional: data-template attr ("html" | "canvas") for boilerplate wrapping.
function initEditors() {
  document.querySelectorAll('.editor-shell').forEach((shell) => {
    const editor = shell.querySelector('.code-editor');
    const frame = shell.querySelector('.preview-frame');
    const runBtn = shell.querySelector('[data-action="run"]');
    const resetBtn = shell.querySelector('[data-action="reset"]');
    if (!editor || !frame) return;

    const initial = editor.value;
    const template = shell.dataset.template || 'canvas';
    const checkFn = shell.dataset.check || null;

    function buildHtml(code) {
      if (template === 'html') return code;
      // canvas template — gives students a 480x320 canvas + ctx + game loop scaffold
      return `<!doctype html><html><head><meta charset="utf-8"><style>
        html,body{margin:0;padding:0;background:#0a0e1a;color:#e8eaf2;font-family:system-ui,sans-serif;
          display:flex;align-items:center;justify-content:center;min-height:100vh;overflow:hidden;}
        canvas{background:#11172a;border:1px solid #232c4a;border-radius:8px;display:block;
          box-shadow:0 0 40px rgba(158,255,90,0.15);}
        .err{position:fixed;left:8px;top:8px;right:8px;background:#3a0f15;color:#ff8a96;
          padding:8px 12px;border-radius:6px;font-family:'JetBrains Mono',monospace;font-size:12px;
          border:1px solid #ff5a6a;display:none;white-space:pre-wrap;}
      </style></head><body>
        <canvas id="canvas" width="480" height="320"></canvas>
        <div id="err" class="err"></div>
        <script>
          const canvas = document.getElementById('canvas');
          const ctx = canvas.getContext('2d');
          const W = canvas.width, H = canvas.height;
          const keys = {};
          const mouse = { x: 0, y: 0, down: false };
          window.addEventListener('keydown', e => keys[e.key] = true);
          window.addEventListener('keyup',   e => keys[e.key] = false);
          canvas.addEventListener('mousemove', e => {
            const r = canvas.getBoundingClientRect();
            mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
            mouse.y = (e.clientY - r.top)  * (canvas.height / r.height);
          });
          canvas.addEventListener('mousedown', () => mouse.down = true);
          canvas.addEventListener('mouseup',   () => mouse.down = false);
          window.onerror = function(msg, src, line, col) {
            const el = document.getElementById('err');
            el.style.display = 'block';
            el.textContent = 'Error (line ' + line + '): ' + msg;
            return true;
          };
          try {
            ${code}
          } catch(e) {
            const el = document.getElementById('err');
            el.style.display = 'block';
            el.textContent = 'Error: ' + e.message;
          }
        <\/script>
      </body></html>`;
    }

    function run() {
      const code = editor.value;
      frame.srcdoc = buildHtml(code);
      if (checkFn && window.CHALLENGE_CHECKS && window.CHALLENGE_CHECKS[checkFn]) {
        const result = shell.parentElement.querySelector('.check-result');
        const passed = window.CHALLENGE_CHECKS[checkFn](code);
        if (result) {
          result.className = 'check-result show ' + (passed.ok ? 'pass' : 'fail');
          result.textContent = passed.message;
        }
      }
    }

    function reset() {
      editor.value = initial;
      run();
    }

    if (runBtn) runBtn.addEventListener('click', run);
    if (resetBtn) resetBtn.addEventListener('click', reset);

    // Tab key support in editor
    editor.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = editor.selectionStart, end = editor.selectionEnd;
        editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
        editor.selectionStart = editor.selectionEnd = start + 2;
      }
      // Ctrl/Cmd + Enter to run
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        run();
      }
    });

    // Auto-run on load
    setTimeout(run, 50);
  });
}

document.addEventListener('DOMContentLoaded', initEditors);

// Challenge check registry — populated per-lesson
window.CHALLENGE_CHECKS = window.CHALLENGE_CHECKS || {};
