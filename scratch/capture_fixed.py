import time
import urllib.request
import json
from playwright.sync_api import sync_playwright

req = urllib.request.Request(
    'http://localhost:3001/api/auth/login',
    data=json.dumps({'email': 'admin@cti.com', 'password': 'Admin@123'}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
resp = urllib.request.urlopen(req)
data = json.loads(resp.read().decode('utf-8'))['data']

access_token = data['accessToken']
refresh_token = data['refreshToken']
user_data = json.dumps(data['user'])

with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(viewport={'width': 1280, 'height': 800})
    page = context.new_page()
    page.goto('http://localhost:3000/login', wait_until='domcontentloaded')
    time.sleep(1)
    
    page.evaluate(f'''() => {{
        localStorage.setItem('accessToken', "{access_token}");
        localStorage.setItem('refreshToken', "{refresh_token}");
        localStorage.setItem('user', JSON.stringify({user_data}));
    }}''')
    
    page.goto('http://localhost:3000/geo-map', wait_until='domcontentloaded')
    time.sleep(5)
    page.screenshot(path='scratch/screen_geomap_fixed.png')
    browser.close()

print('Successfully captured screen_geomap_fixed.png!')
