import urllib.request
import re
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

categories = ['pizza', 'burger', 'indian curry', 'chocolate cake', 'healthy salad', 'cold beverage', 'noodles', 'sandwich', 'ice cream']
results = {}

for cat in categories:
    url = f"https://www.google.com/search?q={urllib.parse.quote(cat)}+food+photography&tbm=isch"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
    try:
        html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8')
        # Google images returns base64 and URLs. We look for encypted strings or simply raw urls.
        # But wait, Google Images in simple HTML mode returns normal <img> tags with src!
        urls = re.findall(r'src="(https://encrypted-tbn0\.gstatic\.com/images\?q=[^"]+)"', html)
        results[cat] = urls[:25]
        print(f"{cat}: {len(urls)} images")
    except Exception as e:
        print(f"Error for {cat}: {e}")

with open('google_images.json', 'w') as f:
    json.dump(results, f, indent=2)
