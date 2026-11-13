"""Copy public UI files only, with a disconnected sample transport. No account data."""
from pathlib import Path
import hashlib
import json
import re
import shutil
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT.parents[1] / 'openmail-site'
DEST = ROOT / 'public' / 'openmail'
FILES = ['app.html', 'app-ui.js', 'app.css', 'styles.css', 'workspace.css', 'insights.css', 'workspace-navigation.css', 'favicon.svg']
DEST.mkdir(parents=True, exist_ok=True)
hashes = {}
for name in FILES:
    source = SOURCE / name
    if not source.is_file() or source.is_symlink():
        raise SystemExit(f'Missing or unsafe public file: {name}')
    data = source.read_bytes()
    hashes[name] = hashlib.sha256(data).hexdigest()
    if name == 'app.html':
        html = data.decode()
        # Preserve product layout. Replace only transport, font paths and document tools.
        html = re.sub(r'<link[^>]+fonts\.(?:googleapis|gstatic)\.com[^>]*>', '', html)
        html = html.replace('<head>', '<head>\n<meta name="robots" content="noindex,nofollow">\n<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'self\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data:; font-src \'self\'; connect-src \'none\'; form-action \'none\'; base-uri \'none\'; object-src \'none\';">\n<link rel="stylesheet" href="../assets/fonts.css">\n<script src="sample-transport.js"></script>')
        html = html.replace('href="/insights.css', 'href="insights.css').replace('href="/workspace-navigation.css', 'href="workspace-navigation.css').replace('src="/favicon.svg', 'src="favicon.svg')
        html = re.sub(r'<script[^>]+(?:vendor/mammoth|app-ai-documents)[^>]*></script>', '', html)
        html = html.replace('</head>', '<link rel="stylesheet" href="portfolio-tour.css">\n<script defer src="portfolio-tour.js"></script>\n</head>')
        # The external app link stays inside the sandbox, with no top navigation permission.
        html = html.replace('href="index.html"', 'href="https://freeopenmail.tech/"')
        data = html.encode()
    (DEST / name).write_bytes(data)
(DEST / 'source-manifest.json').write_text(json.dumps({'repository': 'https://github.com/Piyush70007/openmail-site', 'ui_commit': '8fc88c66c9aacffb9784b1e0f8d5fbada766b71c', 'original_sha256': hashes, 'notes': 'app.html has local asset paths and disconnected transport; UI styles and app-ui.js are unchanged. All displayed account data is fictional.'}, indent=2) + '\n')
print(f'Copied {len(FILES)} public interface files; no backend or credentials.')
