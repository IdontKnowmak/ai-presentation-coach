# AI Presentation Coach

เว็บแอปช่วยเตรียมการนำเสนอจากสไลด์ ผู้ใช้จัดการโปรเจกต์ อัปโหลดไฟล์เพื่อดึงข้อความ สร้างคำถามฝึกซ้อมด้วย AI ตอบคำถาม รับการประเมิน และเก็บประวัติการฝึกไว้ในบัญชีของตน

**Live app:** https://ai-presentation-coach-eta.vercel.app
**Repository:** https://github.com/IdontKnowmak/ai-presentation-coach

> เอกสารนี้สะท้อนแนวทางที่พัฒนามาถึงปัจจุบัน ซึ่งเปลี่ยนจากแผนแรกหลายส่วนแล้ว ความสามารถจริงขึ้นอยู่กับการตั้งค่า environment variables และบริการที่เชื่อมต่อ

## สารบัญ
- [ความสามารถ](#ความสามารถ)
- [สถาปัตยกรรม](#สถาปัตยกรรม)
- [โครงสร้างโปรเจกต์](#โครงสร้างโปรเจกต์)
- [การทำงาน](#การทำงาน)
- [ติดตั้งและรันในเครื่อง](#ติดตั้งและรันในเครื่อง)
- [Environment variables](#environment-variables)
- [Deploy](#deploy)
- [API](#api)
- [ข้อจำกัด](#ข้อจำกัด)
- [ความปลอดภัย](#ความปลอดภัย)

## ความสามารถ

- สมัครสมาชิก/เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน หรือ Google Sign-In
- สร้าง ดู แก้ไข และลบโปรเจกต์ โดยจำกัดการเข้าถึงตามผู้ใช้
- อัปโหลด PDF และ PPTX เพื่อดึงข้อความจากสไลด์
- สร้างคำถามฝึกซ้อมด้วย Cloudflare Workers AI
- ฝึกตอบคำถาม ส่งคำตอบให้ AI ประเมิน และบันทึกผล
- เรียกดูเซสชัน/คำตอบ และสร้างคำแนะนำจากคะแนนและ feedback ที่บันทึกไว้

## สถาปัตยกรรม

| ส่วน | เทคโนโลยี | หน้าที่ |
|---|---|---|
| Frontend | React, Vite, JavaScript, CSS | UI และ workflow ของผู้ใช้ |
| Backend | Python, FastAPI | API, authentication, ประมวลผลไฟล์, AI integration |
| Database | SQLite (local), Neon PostgreSQL (production) | ผู้ใช้ โปรเจกต์ ข้อความสไลด์ และผลการฝึก |
| AI | Cloudflare Workers AI | สร้างคำถามและประเมินคำตอบ |
| Sign-in | Google OAuth 2.0 | เข้าสู่ระบบด้วย Google เท่านั้น ไม่ใช้ Google Drive |
| Hosting | Vercel (frontend), Render (backend) | ให้บริการแอป |
| Source control | GitHub | เก็บซอร์สโค้ด |

```text
Browser
  -> React/Vite on Vercel
  -> FastAPI on Render
       -> Neon PostgreSQL
       -> Cloudflare Workers AI
```

## โครงสร้างโปรเจกต์

```text
ai-presentation-coach/
├── src/
│   ├── main.jsx          # React app, pages, state และ workflow
│   ├── styles.css        # styling และ responsive layout
│   └── lib/api.js        # API URL, auth headers และ mapping ข้อมูล
├── backend/
│   ├── main.py           # FastAPI routes, auth, database และ AI
│   ├── requirements.txt  # Python dependencies
│   ├── .env.example      # ตัวอย่าง environment variables
│   └── README.md         # คู่มือ backend และ API
├── .env.example          # ตัวอย่าง frontend environment variables
├── package.json
└── README.md
```

## การทำงาน

1. ผู้ใช้สมัคร/เข้าสู่ระบบ Backend ออก bearer token สำหรับ API ที่ต้องยืนยันตัวตน
2. ผู้ใช้สร้างโปรเจกต์และอัปโหลด PDF/PPTX
3. Backend ใช้ไฟล์ชั่วคราวเพื่อดึงข้อความ แล้วบันทึกข้อความและ metadata ที่จำเป็นลงฐานข้อมูล
4. Cloudflare Workers AI สร้างคำถามจากเนื้อหาสไลด์ และช่วยประเมินคำตอบ
5. ระบบบันทึกเซสชัน คำตอบ คะแนน และ feedback เพื่อเรียกดูภายหลัง
6. Recommendations สร้างจากคะแนน/feedback ที่บันทึกไว้ โดยไม่จำเป็นต้องเรียก AI เพิ่ม

**ไฟล์ต้นฉบับไม่ได้ถูกเก็บถาวร:** ระบบลบไฟล์ชั่วคราวหลังประมวลผล รวมถึงเมื่อประมวลผลล้มเหลว Google Drive จึงไม่จำเป็นสำหรับ workflow นี้

## ติดตั้งและรันในเครื่อง

ต้องมี Node.js/npm และ Python ติดตั้งไว้แล้ว

### 1. Backend (Windows PowerShell)

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

แก้ไข `backend/.env` ตามหัวข้อถัดไป แล้วเริ่ม server:

```powershell
uvicorn main:app --reload --port 8000
```

- API: http://127.0.0.1:8000
- Swagger UI: http://127.0.0.1:8000/docs

### 2. Frontend

เปิด terminal อีกหน้าต่างที่โฟลเดอร์หลัก:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

เปิด URL ที่ Vite แสดง (ปกติ http://localhost:5173)

### 3. ตรวจสอบ production build

```powershell
npm run build
```

เมื่อสำเร็จ ไฟล์ build จะอยู่ใน `dist/`

## Environment variables

ใช้ไฟล์ตัวอย่างเป็นแนวทาง ห้าม commit ไฟล์ `.env` หรือ credentials จริง

### Frontend: `.env`

| ตัวแปร | รายละเอียด |
|---|---|
| `VITE_API_URL` | URL ของ FastAPI เช่น `http://localhost:8000` หรือ URL backend บน Render |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Web client ID (จำเป็นเมื่อเปิดใช้ Google Sign-In) |

ค่าที่ขึ้นต้นด้วย `VITE_` จะถูกส่งไปยัง browser bundle ห้ามใส่ secret/API token ใน frontend

### Backend: `backend/.env`

| ตัวแปร | รายละเอียด |
|---|---|
| `DATABASE_URL` | Database connection string; ใช้ Neon PostgreSQL ใน production หากไม่กำหนดจะใช้ SQLite local ตามค่าเริ่มต้น |
| `AUTH_SECRET_KEY` | secret สำหรับลงนาม token; ต้องเป็นค่าสุ่มที่แข็งแรงใน production |
| `AUTH_TOKEN_MINUTES` | อายุ bearer token หน่วยนาที (ค่าเริ่มต้น 60) |
| `GOOGLE_CLIENT_ID` | OAuth Web client ID ต้องตรงกับ frontend |
| `CORS_ORIGINS` | frontend origins ที่อนุญาต คั่นด้วย comma |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID |
| `CLOUDFLARE_API_TOKEN` | API token ที่มีสิทธิ์ Workers AI |
| `CLOUDFLARE_MODEL` | โมเดล AI; ค่าเริ่มต้น `@cf/zai-org/glm-4.7-flash` |
| `MAX_UPLOAD_MB` | ขนาดอัปโหลดสูงสุด MB (ค่าเริ่มต้น 20) |
| `MAX_EXTRACTED_CHARS` | จำนวนตัวอักษรสูงสุดที่ดึงจากไฟล์ (ค่าเริ่มต้น 60000) |

สร้าง secret ได้ด้วย:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

สำหรับ Neon ให้คัดลอก connection string จาก Neon dashboard และใช้รูปแบบที่ backend รองรับ (SQLAlchemy/psycopg) อย่านำ database password ไปไว้ฝั่ง frontend

### Google Sign-In

1. สร้าง OAuth 2.0 Client ID ประเภท Web application ใน Google Cloud Console
2. เพิ่ม frontend origin ใน **Authorized JavaScript origins** เช่น `http://localhost:5173` และ `https://ai-presentation-coach-eta.vercel.app`
3. ตั้ง client ID เดียวกันเป็น `VITE_GOOGLE_CLIENT_ID` ใน Vercel และ `GOOGLE_CLIENT_ID` ใน Render
4. ตรวจสอบว่า origin และ client ID ตรงกับเว็บที่ใช้งานจริง

ใช้ Google OAuth สำหรับ Sign-In เท่านั้น ไม่ต้องใช้ Google Drive API

## Deploy

### Frontend — Vercel

1. Import repository จาก GitHub และตั้ง Root Directory เป็นโฟลเดอร์หลัก
2. Build command: `npm run build`
3. Output directory: `dist`
4. ตั้ง `VITE_API_URL` เป็น URL ของ backend บน Render และตั้ง `VITE_GOOGLE_CLIENT_ID` หากใช้ Google Sign-In
5. เพิ่มโดเมน production ใน Google OAuth Authorized JavaScript origins

### Backend — Render

1. สร้าง Web Service จาก repository เดียวกัน และตั้ง Root Directory เป็น `backend`
2. Build command: `pip install -r requirements.txt`
3. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. ตั้งค่า `DATABASE_URL`, `AUTH_SECRET_KEY`, `CORS_ORIGINS`, Cloudflare credentials และ `GOOGLE_CLIENT_ID` ตามที่ใช้งาน
5. กำหนด `CORS_ORIGINS` ให้ตรงกับ frontend origin เช่น `https://ai-presentation-coach-eta.vercel.app`
6. ตรวจสอบ `/health` และ `/docs` หลัง deploy

### Database — Neon

สร้าง PostgreSQL database ใน Neon แล้วตั้ง connection string เป็น `DATABASE_URL` ใน Render ตรวจสอบ log ของ backend เพื่อยืนยันว่าเชื่อมต่อและ initialize schema ได้

### AI — Cloudflare Workers AI

ตั้ง `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` และเลือก `CLOUDFLARE_MODEL` (ถ้าต้องการเปลี่ยนค่าเริ่มต้น) ใน Render จากนั้นทดสอบ `POST /api/ai/test` โดยต้องเข้าสู่ระบบก่อน ตรวจสอบโควตาและสถานะโมเดลจาก Cloudflare dashboard

> การแก้ไฟล์ในเครื่องหรือ push ไป GitHub ไม่ได้เปลี่ยนเว็บ production โดยอัตโนมัติ เว้นแต่ระบบ hosting จะ deploy เวอร์ชันนั้นแล้ว

## API

เปิด `/docs` บน backend เพื่อดู schema และทดลองเรียก API

| Method | Endpoint | หน้าที่ |
|---|---|---|
| GET | `/health` | ตรวจสถานะ backend/การตั้งค่า AI |
| POST | `/api/auth/register` | สมัครสมาชิก |
| POST | `/api/auth/login` | เข้าสู่ระบบด้วยอีเมล/รหัสผ่าน |
| POST | `/api/auth/google` | Google Sign-In |
| GET | `/api/auth/me` | ดูบัญชีปัจจุบัน |
| POST | `/api/ai/test` | ทดสอบ Workers AI (ต้องเข้าสู่ระบบ) |
| GET / POST | `/api/projects` | แสดงรายการ / สร้างโปรเจกต์ |
| GET / PATCH / DELETE | `/api/projects/{id}` | อ่าน / แก้ไข / ลบโปรเจกต์ |
| POST | `/api/projects/{id}/presentations` | อัปโหลด PDF/PPTX และดึงข้อความ |
| GET | `/api/presentations/{id}` | อ่านข้อมูล presentation |
| POST | `/api/presentations/{id}/generate-questions` | สร้างคำถาม |
| POST | `/api/sessions` | สร้างเซสชันฝึกซ้อม |
| POST | `/api/sessions/{id}/evaluate` | ประเมินและบันทึกคำตอบ |
| POST | `/api/sessions/{id}/complete` | จบเซสชัน |
| GET | `/api/sessions/{id}/answers` | ดูคำตอบที่บันทึกไว้ |
| GET | `/api/projects/{id}/sessions` | ดูเซสชันของโปรเจกต์ |
| GET | `/api/projects/{id}/recommendations` | คำแนะนำจากคะแนนและ feedback |

Endpoints สำหรับโปรเจกต์ presentation และ practice session ต้องส่ง `Authorization: Bearer <access_token>`

## ข้อจำกัด

- PDF ที่เป็นภาพสแกนต้องใช้ OCR แต่ OCR ยังไม่รวมอยู่ในระบบ
- รองรับ `.pptx`; ไม่รองรับ PowerPoint รุ่นเก่า `.ppt`
- เก็บข้อความและ metadata ที่ดึงได้ ไม่เก็บไฟล์ต้นฉบับถาวร
- AI feedback อาจผิดพลาด ควรตรวจเทียบกับสไลด์และเกณฑ์ผู้สอน
- คำขอ AI อาจล้มเหลวจากโควตา/ความพร้อมของโมเดล หรือ credentials
- ก่อนเปิดใช้ในวงกว้างควรเพิ่ม rate limiting, password reset, email verification, monitoring และทบทวนการจัดเก็บ token
- ข้อมูลโปรเจกต์เก่าที่ไม่มีเจ้าของใน schema รุ่นก่อนอาจไม่แสดงในบัญชีผู้ใช้

## ความปลอดภัย

- ห้าม commit `.env`, database URL, API tokens หรือ secret จริงลง Git
- เก็บ Cloudflare token และ `AUTH_SECRET_KEY` ฝั่ง backend เท่านั้น
- ใช้ HTTPS และจำกัด CORS ให้เฉพาะ origin ที่เชื่อถือได้
- bearer token ของ prototype เก็บใน browser localStorage จึงควรพิจารณาความเสี่ยง XSS และแนวทาง HttpOnly cookie ก่อนเปิดใช้ในวงกว้าง
- อย่าใช้ผลประเมินจาก AI เป็นข้อสรุปเพียงอย่างเดียว

## Checklist ก่อนส่งงานหรือ Deploy

- [ ] Frontend `VITE_API_URL` ชี้ไป backend ที่ถูกต้อง
- [ ] ตั้งค่า Neon/SQLite และตรวจสอบการเชื่อมต่อฐานข้อมูล
- [ ] ตั้งค่า Google OAuth และ authorized origins (หากใช้)
- [ ] `CORS_ORIGINS` ตรงกับ frontend origin
- [ ] ทดสอบสมัครสมาชิก เข้าสู่ระบบ และการแยกข้อมูลตามผู้ใช้
- [ ] ทดสอบอัปโหลด PDF/PPTX และตรวจข้อความที่ดึงได้
- [ ] ทดสอบสร้างคำถาม ประเมินคำตอบ จบเซสชัน และอ่านผลย้อนหลัง
- [ ] รัน `npm run build`
- [ ] ตรวจ `/health` และ `/docs` ของ backend ที่ deploy แล้ว
