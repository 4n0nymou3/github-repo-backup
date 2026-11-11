# 🌐 مجموعه ابزارهای مدیریت و تولید پراکسی

![Number of Projects](https://img.shields.io/badge/Number%20of%20Projects-7-blue) ![License](https://img.shields.io/badge/License-Open%20Source-brightgreen)

## 🚀 معرفی

این مجموعه شامل ۷ پروژه‌ی متن‌باز در زمینه‌ی دریافت، اعتبارسنجی، اسکن، مدیریت، تولید و تبدیل کانفیگ‌های پراکسی، ارائه‌ی سرویس‌های شبکه‌ای مبتنی بر Cloudflare و تهیه‌ی نسخه‌ی پشتیبان از مخازن عمومی GitHub است. یکی از پروژه‌ها نیز دسترسی به Telegram Bot API را از طریق Reverse Proxy فراهم می‌کند. برای هر پروژه، لینک مستقیم مخزن GitHub و در صورت وجود، لینک نسخه‌ی آنلاین آن درج شده است.

## 🛠 پروژه‌های موجود

### 1. 🔗 Multi Proxy Config Fetcher

[![GitHub stars](https://img.shields.io/github/stars/4n0nymou3/multi-proxy-config-fetcher?style=social)](https://github.com/4n0nymou3/multi-proxy-config-fetcher) [![License](https://img.shields.io/github/license/4n0nymou3/multi-proxy-config-fetcher)](https://github.com/4n0nymou3/multi-proxy-config-fetcher)

📦 مخزن GitHub: [مشاهده‌ی ریپازیتوری](https://github.com/4n0nymou3/multi-proxy-config-fetcher)

🌐 داشبورد و خروجی‌های آنلاین: [مشاهده داشبورد](https://4n0nymou3.github.io/Anonymous-Proxy-Hub/)

یک سیستم خودکار برای دریافت، اعتبارسنجی، آزمایش و دسته‌بندی کانفیگ‌های پراکسی از منابع مختلف، از جمله کانال‌های تلگرام، لینک‌های اشتراک Base64 و منابع SSCONF.

**✨ ویژگی‌های کلیدی:**
- پشتیبانی از پروتکل‌های VLESS، VMess، Trojan، Shadowsocks، Hysteria2، WireGuard و TUIC
- آزمایش کانفیگ‌ها با هسته‌های Xray و Sing-box در چند مرحله و چند دور مستقل
- حذف کانفیگ‌های تکراری و فیلترکردن موارد نامعتبر یا ناامن
- تشخیص موقعیت جغرافیایی سرورها و دسته‌بندی کانفیگ‌ها بر اساس کشور
- تولید خروجی در فرمت‌های Xray، Sing-box و Clash/Mihomo
- ارائه‌ی چندین Endpoint و لینک اشتراک با کاربردهای متفاوت
- به‌روزرسانی خودکار و پایش وضعیت منابع

---

### 2. 🔍 Clean IP Scanner

[![GitHub stars](https://img.shields.io/github/stars/4n0nymou3/Clean-IP-Scanner?style=social)](https://github.com/4n0nymou3/Clean-IP-Scanner) [![License](https://img.shields.io/github/license/4n0nymou3/Clean-IP-Scanner)](https://github.com/4n0nymou3/Clean-IP-Scanner)

📦 مخزن GitHub: [مشاهده‌ی ریپازیتوری](https://github.com/4n0nymou3/Clean-IP-Scanner)

ابزاری سریع برای اسکن و ارزیابی IPهای متعلق به CDNهای مختلف؛ با تمرکز بر اجرا در Termux و دستگاه‌های اندرویدی ARM64.

**✨ ویژگی‌های کلیدی:**
- پشتیبانی از Cloudflare، Akamai، Fastly، Amazon CloudFront، Microsoft Azure CDN، Google Cloud CDN، BunnyCDN، KeyCDN، Limelight Networks و سایر CDNهای دارای رنج IP قابل دسترس
- دو روش اسکن Normal و Xray
- بررسی اتصال و اندازه‌گیری سرعت دانلود و آپلود
- امکان اسکن چند پورت و ثبت پورت‌های پاسخ‌گو در خروجی
- پشتیبانی از IPv4 و IPv6
- قابلیت تنظیم تعداد Workerها در حالت Xray
- مدیریت بهینه‌ی حافظه برای اسکن رنج‌های بزرگ IP

---

### 3. ⚙️ Tunnel Config Builder (TCB)

[![GitHub stars](https://img.shields.io/github/stars/4n0nymou3/tcb?style=social)](https://github.com/4n0nymou3/tcb) [![License](https://img.shields.io/github/license/4n0nymou3/tcb)](https://github.com/4n0nymou3/tcb)

📦 مخزن GitHub: [مشاهده‌ی ریپازیتوری](https://github.com/4n0nymou3/tcb)

🌐 لینک دسترسی: [TCB Web App](https://4n0nymou3.github.io/tcb/)

یک ابزار تحت وب برای ساخت کانفیگ‌های VLESS و Trojan و تولید بسته‌ی راه‌اندازی Telegram Web Proxy روی Cloudflare Workers و Cloudflare Pages؛ بدون نیاز به VPS یا سرور شخصی.

**✨ ویژگی‌های کلیدی:**
- پشتیبانی از VLESS و Trojan روی Cloudflare Workers و Pages
- تولید خروجی در فرمت‌های لینک VLESS/Trojan، JSON مخصوص Xray، JSON مخصوص Sing-box و YAML/JSON سازگار با Clash/Mihomo
- تنظیمات پیشرفته‌ی شبکه و DNS، از جمله Fake DNS، IPv6، Local DNS و Remote DNS/DoH
- تنظیمات TLS، ECH، Fragment و سایر گزینه‌های قابل پیکربندی
- پشتیبانی از چند IP و دامنه، مسیر WebSocket و تنظیمات مسیریابی
- امکان Import و Export تنظیمات پنل
- تولید QR Code برای کانفیگ‌ها
- ساخت بسته‌ی آماده‌ی استقرار Telegram Web Proxy برای Cloudflare Workers و Pages

---

### 4. 🛡️ Cloudflare DoH Proxy

[![GitHub stars](https://img.shields.io/github/stars/4n0nymou3/cloudflare-doh-proxy?style=social)](https://github.com/4n0nymou3/cloudflare-doh-proxy) [![License](https://img.shields.io/github/license/4n0nymou3/cloudflare-doh-proxy)](https://github.com/4n0nymou3/cloudflare-doh-proxy)

📦 مخزن GitHub: [مشاهده‌ی ریپازیتوری](https://github.com/4n0nymou3/cloudflare-doh-proxy)

یک سرویس پیشرفته‌ی DNS over HTTPS (DoH) که با استفاده از Cloudflare Workers و Cloudflare Pages قابل استقرار است و برای ارائه‌ی درخواست‌های DNS رمزنگاری‌شده، بهینه و پایدار طراحی شده است.

**✨ ویژگی‌های کلیدی:**
- ارسال موازی درخواست‌ها به چند سرور DNS و انتخاب پاسخ سریع‌تر
- سیستم Circuit Breaker برای شناسایی و مدیریت خودکار سرورهای ناسالم
- Load Balancing هوشمند و انتخاب سرور بر اساس شرایط شبکه و موقعیت جغرافیایی
- Cache هوشمند و مدیریت پاسخ‌های منفی DNS
- تنظیم تطبیقی Timeout بر اساس زمان پاسخ سرورها
- پشتیبانی از CORS و فرمت JSON برای درخواست‌های DoH
- صفحه‌ی آمار و پایش وضعیت سرورها و درخواست‌ها
- امکان استقرار روی Cloudflare Workers یا Cloudflare Pages

---

### 5. 📡 Telegram API Proxy

[![GitHub stars](https://img.shields.io/github/stars/4n0nymou3/Telegram-API-Proxy?style=social)](https://github.com/4n0nymou3/Telegram-API-Proxy) [![License](https://img.shields.io/github/license/4n0nymou3/Telegram-API-Proxy)](https://github.com/4n0nymou3/Telegram-API-Proxy)

📦 مخزن GitHub: [مشاهده‌ی ریپازیتوری](https://github.com/4n0nymou3/Telegram-API-Proxy)

یک Reverse Proxy مبتنی بر Cloudflare Workers برای Telegram Bot API که امکان ارتباط با API تلگرام را در شبکه‌هایی که دسترسی مستقیم به آن محدود شده فراهم می‌کند.

**✨ ویژگی‌های کلیدی:**
- پشتیبانی از متدهای Telegram Bot API
- پشتیبانی از ارسال و دریافت فایل‌ها و رسانه‌ها
- داشبورد وب برای نمایش آدرس API، نمونه‌کدها و بررسی اتصال
- ارائه‌ی آمار درخواست‌ها، زمان پاسخ و وضعیت سرویس
- Rate Limiting در سطح IP، توکن ربات و کل سرویس
- مکانیزم Retry با Backoff و Circuit Breaker
- بررسی ساختار توکن ربات و مدیریت درخواست‌های نامعتبر
- امکان استقرار با Cloudflare و Wrangler CLI

---

### 6. 🔄 Proxy Core Builder (Drill)

[![GitHub stars](https://img.shields.io/github/stars/4n0nymou3/proxy-core-builder?style=social)](https://github.com/4n0nymou3/proxy-core-builder) [![License](https://img.shields.io/github/license/4n0nymou3/proxy-core-builder)](https://github.com/4n0nymou3/proxy-core-builder)

📦 مخزن GitHub: [مشاهده‌ی ریپازیتوری](https://github.com/4n0nymou3/proxy-core-builder)

🌐 لینک دسترسی: [Proxy Core Builder Web App](https://4n0nymou3.github.io/proxy-core-builder/)

یک ابزار تحت وب برای تبدیل کانفیگ‌های پراکسی میان فرمت‌های مختلف و استخراج لینک‌های پراکسی از کانفیگ‌های موجود.

**✨ ویژگی‌های کلیدی:**
- پشتیبانی از VMess، VLESS، Trojan، Hysteria2 و Shadowsocks
- دریافت لینک‌های مستقیم، لینک اشتراک، داده‌های Base64 و کانفیگ‌های JSON/YAML
- تبدیل لینک‌های پراکسی به Sing-box JSON و Clash/Mihomo YAML
- تبدیل مستقیم کانفیگ‌های Sing-box و Clash/Mihomo به یکدیگر
- استخراج لینک‌های پراکسی از کانفیگ‌های Sing-box و Clash/Mihomo
- تولید کانفیگ‌های آماده‌ی استفاده با تنظیمات مسیریابی و DNS
- امکان اجرای محلی یا استقرار با Docker و Docker Compose

---

### 7. 💾 GitHub Repo Backup

[![GitHub stars](https://img.shields.io/github/stars/4n0nymou3/github-repo-backup?style=social)](https://github.com/4n0nymou3/github-repo-backup) [![License](https://img.shields.io/github/license/4n0nymou3/github-repo-backup)](https://github.com/4n0nymou3/github-repo-backup)

📦 مخزن GitHub: [مشاهده‌ی ریپازیتوری](https://github.com/4n0nymou3/github-repo-backup)

🌐 لینک دسترسی: [GitHub Public Repository Backup Tool](https://4n0nymou3.github.io/github-repo-backup/)

یک ابزار تحت وب برای مشاهده و تهیه‌ی نسخه‌ی پشتیبان از مخازن عمومی GitHub با واردکردن نام کاربری.

**✨ ویژگی‌های کلیدی:**
- نمایش فهرست مخازن عمومی یک حساب GitHub و تعداد آن‌ها
- امکان دانلود هر مخزن به‌صورت فایل ZIP مستقل
- امکان دانلود تمام مخازن فهرست‌شده در قالب یک فایل ZIP یکپارچه
- استفاده از Cloudflare Worker برای مدیریت درخواست‌های دانلود گروهی و محدودیت‌های CORS
- رابط کاربری ساده و قابل استفاده از طریق مرورگر

---

## ⚠️ هشدار مهم

تمامی این پروژه‌ها با اهداف آموزشی، پژوهشی و توسعه‌ی ابزارهای متن‌باز ارائه شده‌اند. مسئولیت نحوه‌ی استفاده از آن‌ها و رعایت قوانین محل استفاده و مجوز هر پروژه بر عهده‌ی کاربران است.

## 🤝 مشارکت

برای مشاهده‌ی کد منبع، گزارش مشکل، پیشنهاد قابلیت جدید یا مشارکت در توسعه، به مخزن اختصاصی هر پروژه در GitHub مراجعه کنید.

## 👤 منبع

توسعه‌دهنده: Anonymous (4n0nymou3)

## 📬 راه‌های ارتباطی

- **گیت‌هاب:** https://github.com/4n0nymou3
- **اکس:** https://x.com/an0net
- **ربات تلگرام:** https://t.me/An0nymou3Bot
