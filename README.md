# CineWave – وێبسایتی فلیم/زنجیرە/ئەنیمەیشن (Vanilla JS/CSS)

- **تایبەت**: دیزاینی نیۆن + گڵاس، ئەنیمەیشن، هاوڕێی مۆبایل
- **فیچر**: گەڕان، فلتەر، گرید/لیست، لۆدی کەمتەر بە لەیزی لۆودینگ، لیستی سەیرکردن (localStorage)، مۆدی تریڵەر
- **ڕیکلام**: ئەو شوێنە هەیە بۆ Adsterra (Top/Sidebar/Footer/In‑feed/In‑article/Interstitial)

## کارپێکردن

1) پڕۆژەکە بکەرەوە بە سێرڤەری بەسادە:

```bash
cd /workspace
python3 -m http.server 5173
```

پاشان بچۆ بە `http://localhost:5173/`.

یاخود لە نۆد:

```bash
npx serve -l 5173 .
```

## زیادکردنی ریکلامەکانی Adsterra

1) فایلی `ads/adsterra-config.sample.js` بکەپیکەرەوە بۆ `ads/adsterra-config.js`.
2) کۆدی ڕاستەوخۆی ریکلامەکانت لە داشبۆڕدی Adsterra وەرگرە و لە ناو ئەم ئەوبجێکتە دابنێ:

```js
window.ADSTERRA_TAGS = {
  bannerTop: `<!-- your top banner tag -->`,
  sidebar: `<!-- your sidebar tag -->`,
  footer: `<!-- your footer tag -->`,
  inFeed: `<!-- your in-feed tag -->`,
  inArticle: `<!-- your in-article tag -->`,
  interstitial: `<!-- optional social bar/interstitial tag -->`
};
```

3) هەموو شوێنە ریکلامییەکان لەلایەن ئاپەکەوە خۆکارانە پڕدەکرێنەوە. ئەگەر کۆد نەدانێیت، پلاسی هۆڵدەری "Ad Slot" دەبینیت.

## پێداچونەوەی کۆد

- سەرەکی: `index.html`
- ستایل: `styles/styles.css`
- سکرپت: `scripts/app.js`
- ریکلام: `ads/adsterra.js` + `ads/adsterra-config.js`
- داتا: `data/movies.json`

## تێبینی

- ئەمە نموونەیە؛ دەتوانیت پلەیەری ڤیدیۆ، APIەکان، لاگین و هتد زیاد بکەیت.
- ئاگاداربە لە مافی کۆپیڕایت. ئەو داتایە لێرەدا نموونەیە. 
