"""Self-host the Google Fonts used by this design; retain upstream license notices."""
from pathlib import Path
import re
import urllib.request

DEST = Path(__file__).resolve().parents[1] / 'public' / 'assets'
url = 'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap'
request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'})
css = urllib.request.urlopen(request).read().decode()
for i, source in enumerate(dict.fromkeys(re.findall(r'url\((https://[^)]+)\)', css))):
    name = f'font-{i}.woff2'
    urllib.request.urlretrieve(source, DEST / name)
    css = css.replace(source, './' + name)
(DEST / 'fonts.css').write_text(css)
for family in ['manrope', 'dmmono']:
    urllib.request.urlretrieve(f'https://raw.githubusercontent.com/google/fonts/main/ofl/{family}/OFL.txt', DEST / f'{family}-OFL.txt')
print('Downloaded font files and OFL notices for local use.')
