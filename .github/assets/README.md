# 📸 Screenshots Directory

**Live site screenshots from [ТворцыДобра](https://tvorcy-dobra.vercel.app)**

---

## Screenshot Files

| File | Size | Source page |
| --- | --- | --- |
| `homepage.jpg` | 228 KB | `/ru` desktop 1440×900 |
| `donation-flow.jpg` | 123 KB | `/ru/donate` desktop 1440×900 |
| `programs.jpg` | 142 KB | `/ru/programs` desktop 1440×900 |
| `mobile-view.jpg` | 32 KB | `/ru` mobile 390×844 |
| `q-hero.jpg` | 201 KB | hero artwork used on the landing page |

All four UI screenshots are captured from the deployed Vercel build, downscaled to 1440px wide (500px for the mobile frame) and saved as JPEG q84.

---

## How to Recapture

```bash
# capture with puppeteer at deviceScaleFactor 2 (viewport 1440×900, or 390×844 for mobile)
node -e "require('puppeteer').launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}).then(async b=>{const p=await b.newPage();await p.setViewport({width:1440,height:900,deviceScaleFactor:2});await p.goto('https://tvorcy-dobra.vercel.app/ru',{waitUntil:'networkidle2'});await p.screenshot({path:'/tmp/shot.png'});await b.close();})"

# then flatten to README-friendly size
sips -Z 1440 -s formatOptions 84 -s format jpeg /tmp/shot.png --out .github/assets/homepage.jpg
```

---

*Last updated: October 10, 2026*
