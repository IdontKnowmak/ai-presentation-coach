import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LayoutDashboard, FolderOpen, Upload, Mic2, ChartNoAxesCombined, History, Settings, BookOpen, Search, Plus, ArrowUpRight, Clock3, FileText, ChevronRight, Sparkles, Play, CheckCircle2, AlertCircle, AlertTriangle, CircleHelp, Trash2, X, Menu, Target, Brain, MessageSquareText, Volume2, RotateCcw, Send, ChevronLeft, LogOut } from 'lucide-react';
import './styles.css';
import { API_URL, GOOGLE_CLIENT_ID, apiFetch, toProject } from './lib/api.js';

// -----------------------------------------------------------------------------
// UI copy and language support
// -----------------------------------------------------------------------------
const initialProjects = [];
const UI_TRANSLATIONS = {
  'Dashboard':'แดชบอร์ด','My Projects':'โปรเจกต์ของฉัน','Upload Presentation':'อัปโหลดงานนำเสนอ','Practice Room':'ห้องฝึกซ้อม','Results & Progress':'ผลลัพธ์และพัฒนาการ','Practice History':'ประวัติการฝึก','Settings':'ตั้งค่า','OVERVIEW':'ภาพรวม','PRACTICE':'การฝึก','My Workspace':'พื้นที่ของฉัน','Presently AI Coach':'โค้ชนำเสนอ AI','YOUR WORKSPACE':'พื้นที่ของคุณ','Own the room.':'มั่นใจทุกครั้งที่นำเสนอ','Every single time.':'ในทุกการนำเสนอ','Your personal AI coach is ready when you are. Let\'s make your next presentation your best one.':'โค้ช AI ส่วนตัวพร้อมช่วยคุณเสมอ มาทำให้การนำเสนอครั้งต่อไปดีที่สุดกัน','New project':'โปรเจกต์ใหม่','YOUR NEXT BREAKTHROUGH STARTS HERE':'ก้าวต่อไปของคุณเริ่มตรงนี้','Confidence is a skill.':'ความมั่นใจฝึกฝนได้','Let\'s build yours.':'มาเสริมสร้างความมั่นใจกัน','Practice real questions, get instant feedback, and turn nervous energy into your superpower.':'ฝึกตอบคำถามจริง รับคำแนะนำทันที และเปลี่ยนความประหม่าให้เป็นพลัง','Start a practice session':'เริ่มรอบฝึก','AI presentation coach':'โค้ชนำเสนอ AI','Practice with feedback':'ฝึกพร้อมรับคำแนะนำ','Keep practicing':'ฝึกฝนต่อไป','Active projects':'โปรเจกต์ที่กำลังทำ','Keep the momentum':'ทำต่อเนื่องเพื่อพัฒนา','Practice sessions':'รอบฝึก','Average score':'คะแนนเฉลี่ย','Time practiced':'เวลาที่ฝึก','Recent projects':'โปรเจกต์ล่าสุด','Pick up right where you left off.':'กลับมาทำต่อจากจุดเดิม','View all':'ดูทั้งหมด','Your progress':'พัฒนาการของคุณ','Create a project':'สร้างโปรเจกต์','Set up a presentation to start practicing with AI.':'ตั้งค่างานนำเสนอเพื่อเริ่มฝึกกับ AI','Project name':'ชื่อโปรเจกต์','Project type':'ประเภทโปรเจกต์','Cancel':'ยกเลิก','Create project':'สร้างโปรเจกต์','University':'มหาวิทยาลัย','Business':'ธุรกิจ','Technology':'เทคโนโลยี','Personal':'ส่วนตัว','Previous':'ก่อนหน้า','Next question':'คำถามถัดไป','View results':'ดูผลลัพธ์','Submit answer':'ส่งคำตอบ','Your AI coach':'โค้ช AI ของคุณ','I\'m here to help you feel prepared, not perfect.':'ฉันช่วยให้คุณพร้อมนำเสนอ ไม่จำเป็นต้องสมบูรณ์แบบ','One idea at a time':'ทีละประเด็น','Answer clearly, then add details.':'ตอบให้ชัดเจนแล้วค่อยเพิ่มรายละเอียด','Structure your thoughts':'จัดลำดับความคิด','Point → Reason → Example.':'ประเด็น → เหตุผล → ตัวอย่าง','Be conversational':'พูดอย่างเป็นธรรมชาติ','Talk to people, not slides.':'สื่อสารกับผู้ฟัง ไม่ใช่อ่านตามสไลด์','Practicing':'กำลังฝึก','Results & progress':'ผลลัพธ์และพัฒนาการ','Practice again':'ฝึกอีกครั้ง','YOUR GROWTH, IN FOCUS':'ภาพรวมพัฒนาการของคุณ','Overview':'ภาพรวม','Skills breakdown':'รายละเอียดทักษะ','Recommendations':'คำแนะนำ','YOUR OVERALL PERFORMANCE':'ผลการฝึกโดยรวม','Recent practice scores':'คะแนนการฝึกล่าสุด','No data':'ไม่มีข้อมูล','Strong':'ทำได้ดี','Developing':'กำลังพัฒนา','Keep practicing':'ควรฝึกต่อ','YOUR JOURNEY':'เส้นทางการฝึกของคุณ','Practice history':'ประวัติการฝึก','Every session is a step toward a more confident you.':'ทุกครั้งที่ฝึกช่วยเพิ่มความมั่นใจ','Recent sessions':'รอบฝึกล่าสุด','A record of your practice and progress.':'บันทึกการฝึกและพัฒนาการ','Last 30 days':'30 วันที่ผ่านมา','Completed':'เสร็จสิ้น','In progress':'กำลังดำเนินการ','MAKE IT YOURS':'ปรับแต่งให้เหมาะกับคุณ','Manage your profile and practice preferences.':'จัดการโปรไฟล์และการตั้งค่าการฝึก','Profile information':'ข้อมูลโปรไฟล์','Display name':'ชื่อที่แสดง','Email address':'อีเมล','Practice preferences':'การตั้งค่าการฝึก','Choose how you want to build your skills.':'เลือกรูปแบบการพัฒนาทักษะของคุณ','Practice reminders':'การแจ้งเตือนให้ฝึก','Session feedback':'คำแนะนำหลังฝึก','Show tips after each practice answer.':'แสดงคำแนะนำหลังตอบแต่ละข้อ','Always on':'เปิดตลอด','Language':'ภาษา','Choose your preferred language.':'เลือกภาษาที่ต้องการใช้งาน','Thai':'ไทย','English':'อังกฤษ','Save':'บันทึก','Workspace':'พื้นที่ทำงาน','Built to help you speak with confidence.':'ช่วยให้คุณนำเสนอได้อย่างมั่นใจ','Sign in':'เข้าสู่ระบบ','Sign up':'สมัครสมาชิก','Welcome back':'ยินดีต้อนรับกลับมา','Create your free account':'สร้างบัญชีฟรี','YOUR PERSONAL PRESENTATION COACH':'โค้ชนำเสนอส่วนตัวของคุณ','Continue with Google':'ดำเนินการต่อด้วย Google','or use email':'หรือใช้อีเมล','Name':'ชื่อ','Password':'รหัสผ่าน','At least 8 characters':'อย่างน้อย 8 ตัวอักษร','Log out':'ออกจากระบบ','Search projects...':'ค้นหาโปรเจกต์...','Upload file':'อัปโหลดไฟล์','Browse files':'เลือกไฟล์','Start practicing':'เริ่มฝึก','No projects yet':'ยังไม่มีโปรเจกต์','Accuracy':'ความถูกต้อง','Completeness':'ความครบถ้วน','Reasoning':'การให้เหตุผล','Clarity':'ความชัดเจน'
};
// API requests and project normalization live in src/lib/api.js.


// -----------------------------------------------------------------------------
// Application state, authentication, API workflows, and page routing
// -----------------------------------------------------------------------------
const questionBank = [];
let activePracticeQuestions = [];
let activePracticeEvaluations = [];

function App() {
  const language = 'th';
  const [page, setPage] = useState('Dashboard');
  const [projects, setProjects] = useState(initialProjects);
  const [sessions, setSessions] = useState([]);
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('apc_access_token') || '');
  const [authChecking, setAuthChecking] = useState(true);
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showGuide, setShowGuide] = useState(() => localStorage.getItem('apc_hide_welcome_guide') !== 'true');
  const [dontShowGuideAgain, setDontShowGuideAgain] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('University');
  const [selectedProject, setSelectedProject] = useState(null);
  const [file, setFile] = useState(null);
  const [answer, setAnswer] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [notice, setNotice] = useState('');
  const practiceRestoreStartedForUser = useRef(null);
  const noticeType = /ข้อผิดพลาด|ผิดพลาด|ไม่รองรับ|รองรับ.*เท่านั้น|ไม่พบ|ล้มเหลว|ไม่สำเร็จ|ไม่สามารถ|ไม่ถูกต้อง|หมดอายุ|เกินขนาด|ขนาดไม่เกิน|ไฟล์ต้องมีขนาด|ยังสร้าง.*ไม่ได้|error|failed|invalid|cannot|could not|not found|expired|already exists|does not belong|not configured|quota|limit exceeded/i.test(notice) ? 'error' : /กรุณา|ก่อน|ต้อง|จำเป็น|พิมพ์คำตอบ|ยังไม่มีสไลด์|สร้างโปรเจกต์ก่อน|ยังไม่มีโปรเจกต์|answer.*before|please enter/i.test(notice) ? 'warning' : 'success';
  const filtered = useMemo(() => projects.filter(p => p.title.toLowerCase().includes(query.toLowerCase())), [projects, query]);
  useEffect(() => {
    localStorage.setItem('apc_language', language);
    document.documentElement.lang = language === 'th' ? 'th' : 'en';
    const thaiToEnglish = {'เซสชันหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่ คำตอบที่ยังอยู่ในช่องจะไม่ถูกล้าง':'Your session expired. Please sign in again. Your unsent answer will remain in the field','เกิดข้อผิดพลาด กรุณาลองใหม่':'Something went wrong. Please try again','ตอบโดยอ้างอิงข้อมูลจากสไลด์ พร้อมยกเหตุผลและตัวอย่าง':'Answer using information from the slides, with reasons and examples','รอบฝึกที่บันทึกจริง':'Saved practice sessions','จาก ${completed.length} รอบที่เสร็จแล้ว':'From ${completed.length} completed sessions','คะแนนจากรอบฝึกที่เสร็จสมบูรณ์':'Scores from completed practice sessions','คำนวณจาก':'Calculated from','รอบฝึกที่เสร็จแล้ว':'completed sessions','ยังไม่มีคะแนนจริง':'No real scores yet','ทำแบบฝึกให้เสร็จอย่างน้อยหนึ่งรอบ คะแนนเฉลี่ยและกราฟจะแสดงที่นี่':'Complete at least one practice session to see your average score and chart','ตอบโดยอ้างอิงสไลด์ ยกเหตุผลและตัวอย่าง และหลีกเลี่ยงการเดาข้อมูลที่ไม่มีในสไลด์':'Answer using the slides, provide reasons and examples, and avoid guessing information not in the slides','รองรับไฟล์ PDF และ PPTX เท่านั้น':'Only PDF and PPTX files are supported','ไฟล์ต้องมีขนาดไม่เกิน 20 MB':'Files must be 20 MB or smaller','คะแนนประเมินจากคำตอบนี้':'Evaluation score for this answer','คะแนนรวม':'Total score','ผลคะแนนและคำแนะนำจากรอบฝึกที่บันทึกจริง':'Scores and recommendations from saved practice sessions','ค่าเฉลี่ยจากรอบฝึกที่เสร็จสมบูรณ์':'Average from completed practice sessions','จากผลประเมินที่บันทึกไว้':'From saved evaluations','คะแนนรวมจากแต่ละรอบที่เสร็จแล้ว':'Total scores from completed sessions','เมื่อคุณตอบคำถามและจบรอบฝึก ระบบจะแสดงคะแนนจาก AI ที่บันทึกจริงที่นี่':'After you answer questions and finish a session, your actual AI scores will appear here','ทำแบบฝึกให้เสร็จก่อนเพื่อดูรายละเอียดทักษะ':'Complete a practice session to see skill details','เลือกภาษาไทยเพื่อแสดงผลภาษาไทยเป็นหลัก':'Choose Thai to display the interface primarily in Thai','แก้ไขข้อมูลโปรไฟล์ไม่ได้ในเวอร์ชันนี้ เพื่อไม่ให้แสดงข้อมูลตัวอย่างหรือบันทึกข้อมูลที่ยังไม่เชื่อมกับฐานข้อมูล':'Profile editing is unavailable because it is not connected to the database yet','ตัวเลือกนี้มีผลเฉพาะระหว่างเปิดหน้าเว็บ ยังไม่ได้บันทึกลงบัญชี':'This option only applies while the page is open and is not saved to your account','เข้าสู่ระบบด้วย Google: ต้องตั้งค่า VITE_GOOGLE_CLIENT_ID ก่อน':'Google sign-in: configure VITE_GOOGLE_CLIENT_ID first','หรือใช้อีเมล':'Or use email','ใช้งานฟรีทุกฟีเจอร์ ไม่มี Free plan หรือ Pro plan':'All features are free; there are no Free or Pro plans','ชื่อที่ใช้แสดง':'Display name','ชื่อของคุณ':'Your name','ค้นหาโปรเจกต์...':'Search projects...','อัปโหลดไฟล์':'Upload file','เลือกไฟล์':'Browse files','ยังไม่มีโปรเจกต์':'No projects yet','คะแนนเฉลี่ย':'Average score','ความครบถ้วน':'Completeness','การให้เหตุผล':'Reasoning','ความชัดเจน':'Clarity','จุดที่ทำได้ดี:':'Strengths:','ควรปรับปรุง:':'Areas to improve:','ตัวอย่างคำตอบ:':'Sample answer:','พื้นที่ส่วนตัว':'Personal workspace','ทุกฟีเจอร์เปิดให้ใช้ฟรี':'All features are free','ยังไม่ได้เก็บเวลาฝึก':'Practice time is not tracked yet','ยังไม่มีรอบฝึกที่เสร็จแล้ว':'No completed practice sessions yet','จากผลประเมินที่บันทึกไว้':'From saved evaluation results','ยังไม่มีข้อมูล':'No data','เฉลี่ย ${v}/${max} คะแนน':'Average ${v}/${max} points','โปรเจกต์ล่าสุด':'Recent projects','กลับมาทำต่อจากจุดเดิม':'Pick up right where you left off','ดูทั้งหมด':'View all','ก้าวต่อไปของคุณเริ่มตรงนี้':'Your next breakthrough starts here','ความมั่นใจฝึกฝนได้':'Confidence is a skill','มาเสริมสร้างความมั่นใจกัน':'Let\'s build yours','ฝึกตอบคำถามจริง รับคำแนะนำทันที และเปลี่ยนความประหม่าให้เป็นพลัง':'Practice real questions, get instant feedback, and turn nervous energy into your superpower','เริ่มรอบฝึก':'Start a practice session','โค้ช AI ของคุณ':'Your AI coach','ฉันช่วยให้คุณพร้อมนำเสนอ ไม่จำเป็นต้องสมบูรณ์แบบ':'I\'m here to help you feel prepared, not perfect','ทีละประเด็น':'One idea at a time','ตอบให้ชัดเจนแล้วค่อยเพิ่มรายละเอียด':'Answer clearly, then add details','จัดลำดับความคิด':'Structure your thoughts','ประเด็น → เหตุผล → ตัวอย่าง':'Point → Reason → Example','พูดอย่างเป็นธรรมชาติ':'Be conversational','สื่อสารกับผู้ฟัง ไม่ใช่อ่านตามสไลด์':'Talk to people, not slides','ภาพรวมพัฒนาการของคุณ':'Your growth, in focus','รายละเอียดทักษะ':'Skills breakdown','คำแนะนำ':'Recommendations','ผลการฝึกโดยรวม':'Your overall performance','คะแนนการฝึกล่าสุด':'Recent practice scores','เส้นทางการฝึกของคุณ':'Your journey','ทุกครั้งที่ฝึกช่วยเพิ่มความมั่นใจ':'Every session is a step toward a more confident you','รอบฝึกล่าสุด':'Recent sessions','บันทึกการฝึกและพัฒนาการ':'A record of your practice and progress','30 วันที่ผ่านมา':'Last 30 days','ปรับแต่งให้เหมาะกับคุณ':'Make it yours','จัดการโปรไฟล์และการตั้งค่าการฝึก':'Manage your profile and practice preferences','ข้อมูลโปรไฟล์':'Profile information','ชื่อที่แสดง':'Display name','การตั้งค่าการฝึก':'Practice preferences','เลือกรูปแบบการพัฒนาทักษะของคุณ':'Choose how you want to build your skills','การแจ้งเตือนให้ฝึก':'Practice reminders','คำแนะนำหลังฝึก':'Session feedback','แสดงคำแนะนำหลังตอบแต่ละข้อ':'Show tips after each practice answer','เปิดตลอด':'Always on','เลือกภาษาไทยเพื่อแสดงผลภาษาไทยเป็นหลัก':'Choose Thai to display the interface primarily in Thai','ภาษา':'Language','เลือกภาษาที่ต้องการใช้งาน':'Choose your preferred language','ไทย':'Thai','อังกฤษ':'English','ช่วยให้คุณนำเสนอได้อย่างมั่นใจ':'Built to help you speak with confidence','แดชบอร์ด':'Dashboard','โปรเจกต์ของฉัน':'My Projects','อัปโหลดงานนำเสนอ':'Upload Presentation','ห้องฝึกซ้อม':'Practice Room','ผลลัพธ์และพัฒนาการ':'Results & Progress','ประวัติการฝึก':'Practice History','ตั้งค่า':'Settings','ภาพรวม':'Overview','การฝึก':'Practice','พื้นที่ของฉัน':'My Workspace','พื้นที่ทำงาน':'Workspace','ชื่อที่ใช้แสดง':'Display name','ชื่อของคุณ':'Your name','อีเมล':'Email address','รหัสผ่าน':'Password','อย่างน้อย 8 ตัวอักษร':'At least 8 characters','ยินดีต้อนรับกลับมา':'Welcome back','สร้างบัญชีฟรี':'Create your free account','เข้าสู่ระบบ':'Sign in','สมัครสมาชิก':'Sign up','ออกจากระบบ':'Log out','เริ่มฝึก':'Start practicing','สร้างโปรเจกต์':'Create project','โปรเจกต์ใหม่':'New project','ชื่อโปรเจกต์':'Project name','ประเภทโปรเจกต์':'Project type','มหาวิทยาลัย':'University','ธุรกิจ':'Business','เทคโนโลยี':'Technology','ส่วนตัว':'Personal','ยกเลิก':'Cancel','ก่อนหน้า':'Previous','คำถามถัดไป':'Next question','ดูผลลัพธ์':'View results','ส่งคำตอบ':'Submit answer','กำลังตรวจสอบการเข้าสู่ระบบ…':'Checking your session…','กำลังดำเนินการ…':'Processing…','ข้อมูลบัญชีที่ใช้เข้าสู่ระบบ':'Account information used to sign in','การตั้งค่าการฝึก':'Practice preferences','เลือกภาษาที่ต้องการใช้งาน':'Choose your preferred language','ภาษา':'Language','ไทย':'Thai','อังกฤษ':'English','บันทึกโปรเจกต์ลงฐานข้อมูลแล้ว':'Project saved to the database','ออกจากระบบแล้ว':'Signed out','สร้างโปรเจกต์ก่อนเริ่มฝึก':'Create a project before practicing','โปรเจกต์นี้ยังไม่มีสไลด์ กรุณาอัปโหลด PDF หรือ PPTX ก่อนเริ่มฝึก':'This project has no slides yet. Upload a PDF or PPTX first','ยังสร้างคำถามไม่ได้ กรุณาลองอีกครั้ง':'Could not generate questions. Please try again','พิมพ์คำตอบก่อนส่งนะ':'Please enter an answer before submitting','ไม่พบคำถามหรือรอบฝึก กรุณาเริ่มใหม่':'Question or practice session not found. Please start again','ลบโปรเจกต์จากฐานข้อมูลแล้ว':'Project deleted from the database','จุดที่ทำได้ดี:':'Strengths:','ควรปรับปรุง:':'Improvements:','ตัวอย่างคำตอบ:':'Sample answer:','ยังไม่มีผลคะแนน':'No scores yet','คะแนนจริง':'Actual score','ความถูกต้อง':'Accuracy','ความครบถ้วน':'Completeness','การให้เหตุผล':'Reasoning','ความชัดเจน':'Clarity','ดูทั้งหมด':'View all','เริ่มรอบฝึก':'Start a practice session','ฝึกอีกครั้ง':'Practice again','กำลังฝึก':'Practicing','รอบฝึก':'Practice sessions','คะแนนเฉลี่ย':'Average score','โปรเจกต์ที่กำลังทำ':'Active projects','เวลาที่ฝึก':'Time practiced','ข้อมูลโปรไฟล์':'Profile information','การแจ้งเตือนให้ฝึก':'Practice reminders','คำแนะนำหลังฝึก':'Session feedback','เปิดตลอด':'Always on','เสร็จสิ้น':'Completed','กำลังดำเนินการ':'In progress','30 วันที่ผ่านมา':'Last 30 days','ไม่มีข้อมูล':'No data','ทำได้ดี':'Strong','กำลังพัฒนา':'Developing','ควรฝึกต่อ':'Keep practicing','ทุกฟีเจอร์เปิดให้ใช้ฟรี':'All features are free','พื้นที่ส่วนตัว':'Personal workspace','เริ่มจากสร้างโปรเจกต์และอัปโหลดสไลด์':'Start by creating a project and uploading slides','ยังไม่ได้เก็บเวลาฝึก':'Practice time is not tracked yet','ยังไม่มีรอบฝึกที่เสร็จแล้ว':'No completed practice sessions yet','จากผลประเมินที่บันทึกไว้':'From saved evaluation results','แก้ไขข้อมูลโปรไฟล์ไม่ได้ในเวอร์ชันนี้ เพื่อไม่ให้แสดงข้อมูลตัวอย่างหรือบันทึกข้อมูลที่ยังไม่เชื่อมกับฐานข้อมูล':'Profile editing is not available in this version because it is not connected to the database','การตั้งค่าที่บันทึกถาวรยังไม่รองรับ':'Persistent settings are not supported yet','ตัวเลือกนี้มีผลเฉพาะระหว่างเปิดหน้าเว็บ ยังไม่ได้บันทึกลงบัญชี':'This setting only applies while the page is open and is not saved to your account','ทุกครั้งที่ฝึกช่วยเพิ่มความมั่นใจ':'Every session helps build confidence','ช่วยให้คุณนำเสนอได้อย่างมั่นใจ':'Built to help you speak with confidence'};
    const translations = language === 'th' ? UI_TRANSLATIONS : Object.fromEntries([...Object.entries(UI_TRANSLATIONS).map(([en,th])=>[th,en]), ...Object.entries(thaiToEnglish)]);
    const translate = root => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(node => { const raw = node.nodeValue; const trimmed = raw.trim(); if (trimmed && translations[trimmed]) node.nodeValue = raw.replace(trimmed, translations[trimmed]); });
      root.querySelectorAll('input[placeholder],textarea[placeholder],button[aria-label],input[aria-label]').forEach(el => { for (const attr of ['placeholder','aria-label']) if (el.hasAttribute(attr) && translations[el.getAttribute(attr)]) el.setAttribute(attr, translations[el.getAttribute(attr)]); });
    };
    translate(document.body);
    const observer = new MutationObserver(records => { records.forEach(record => { if (record.type === 'childList') record.addedNodes.forEach(node => { if (node.nodeType === Node.ELEMENT_NODE) translate(node); else if (node.nodeType === Node.TEXT_NODE) { const t=node.nodeValue.trim(); if(t && translations[t]) node.nodeValue=node.nodeValue.replace(t,translations[t]); } }); }); });
    observer.observe(document.body, {childList:true,subtree:true});
    return () => observer.disconnect();
  }, [language]);
  const navigate = p => { setPage(p); setMobileNav(false); setNotice(''); };
  const closeGuide = () => {
    if (dontShowGuideAgain) localStorage.setItem('apc_hide_welcome_guide', 'true');
    else localStorage.removeItem('apc_hide_welcome_guide');
    setShowGuide(false);
  };
  const openGuide = () => { setDontShowGuideAgain(false); setShowGuide(true); };
  const beginFromGuide = () => {
    closeGuide();
    if (!projects.length) { navigate('My Projects'); setShowCreate(true); return; }
    const hasPresentation = projects.some(project => project.presentations?.length);
    navigate(hasPresentation ? 'Practice Room' : 'Upload Presentation');
  };
  useEffect(() => {
    let active = true;
    if (!authToken) { setAuthChecking(false); return () => { active = false; }; }
    (async () => {
      try {
        const me = await apiFetch('/api/auth/me');
        if (!active) return;
        setUser(me);
        const rows = await apiFetch('/api/projects');
        if (active) { const mapped = rows.map(toProject); setProjects(mapped); setSelectedProject(mapped[0] || null); }
        try {
          const groups = await Promise.all(rows.map(async project => (await apiFetch(`/api/projects/${project.id}/sessions`)).map(item => ({...item, project_title:project.title}))));
          if (active) setSessions(groups.flat().sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
        } catch (historyError) { console.error('Could not load practice history', historyError); }
      } catch { localStorage.removeItem('apc_access_token'); localStorage.removeItem('apc_refresh_token'); if (active) { setAuthToken(''); setUser(null); setProjects([]); } }
      finally { if (active) setAuthChecking(false); }
    })();
    return () => { active = false; };
  }, [authToken]);
  // Keep the active practice position and unsent draft across page refreshes.
  useEffect(() => {
    if (!user || !sessionId || !practiceQuestions.length) return;
    const activeKey = `apc_active_practice_${user.id}`;
    let previous = null;
    try { previous = JSON.parse(localStorage.getItem(activeKey) || 'null'); } catch { previous = null; }
    // Keep the project attached to this session even when another project is selected elsewhere.
    const projectId = previous?.sessionId === sessionId
      ? previous.projectId
      : (selectedProject?.id ?? null);
    const snapshot = { sessionId, projectId, questionIndex, answer, showFeedback, savedAt: new Date().toISOString() };
    localStorage.setItem(activeKey, JSON.stringify(snapshot));
    if (projectId != null) localStorage.setItem(`apc_practice_${user.id}_${projectId}`, JSON.stringify(snapshot));
  }, [user, sessionId, selectedProject, practiceQuestions, questionIndex, answer, showFeedback]);

  // Restore the last in-progress session once after authentication and initial projects load.
  // Avoid rerunning when creating a project updates the projects array, which can force navigation to Practice Room.
  useEffect(() => {
    if (!user || !projects.length || practiceRestoreStartedForUser.current === user.id) return;
    practiceRestoreStartedForUser.current = user.id;
    const key = `apc_active_practice_${user.id}`;
    let snapshot;
    try { snapshot = JSON.parse(localStorage.getItem(key) || 'null'); } catch { snapshot = null; }
    let target = snapshot?.projectId
      ? projects.find(project => Number(project.id) === Number(snapshot.projectId))
      : null;
    let cancelled = false;
    (async () => {
      try {
        // Older sessions may predate local autosave; recover the newest unfinished session from the API.
        if (!snapshot?.sessionId || !target) {
          const candidates = await Promise.all(projects.map(async project => ({
            project,
            sessions: await apiFetch(`/api/projects/${project.id}/sessions`),
          })));
          const active = candidates.flatMap(({ project, sessions }) => sessions
            .filter(item => item.status === 'IN_PROGRESS')
            .map(item => ({ ...item, project })))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
          if (!active) return;
          target = active.project;
          snapshot = {
            sessionId: active.id, projectId: target.id,
            questionIndex: null, answer: '', showFeedback: false,
          };
          localStorage.setItem(key, JSON.stringify(snapshot));
          localStorage.setItem(`apc_practice_${user.id}_${target.id}`, JSON.stringify(snapshot));
        }
        if (cancelled || !target) return;
        const presentation = target.presentations?.[0];
        if (!presentation) return;
        const [detail, savedAnswers, sessionRows] = await Promise.all([
          apiFetch(`/api/presentations/${presentation.id}`),
          apiFetch(`/api/sessions/${snapshot.sessionId}/answers`),
          apiFetch(`/api/projects/${target.id}/sessions`),
        ]);
        if (cancelled) return;
        const session = sessionRows.find(item => Number(item.id) === Number(snapshot.sessionId));
        if (!session || session.status !== 'IN_PROGRESS') {
          localStorage.removeItem(key);
          return;
        }
        const qs = (detail.questions || []).map(item => ({
          ...item, q: item.question, tag: item.category || 'PRESENTATION',
          tip: 'ตอบโดยอ้างอิงข้อมูลจากสไลด์ พร้อมยกเหตุผลและตัวอย่าง',
        }));
        if (!qs.length) return;
        const restoredEvaluations = savedAnswers.map(item => ({
          answer_id: item.id, session_id: Number(snapshot.sessionId), question_id: item.question_id,
          scores: { ...item.scores, maxima: { accuracy: 40, completeness: 30, reasoning: 20, clarity: 10 } },
          strengths: item.strengths || [], improvements: item.improvements || [],
          model_answer: item.model_answer || '', summary: item.summary || '',
        }));
        const answeredByQuestion = new Map(savedAnswers.map(item => [Number(item.question_id), item]));
        const requestedIndex = snapshot.questionIndex == null ? savedAnswers.length : (Number(snapshot.questionIndex) || 0);
        const restoredIndex = Math.min(Math.max(0, requestedIndex), qs.length - 1);
        const currentQuestion = qs[restoredIndex];
        const currentSavedAnswer = currentQuestion ? answeredByQuestion.get(Number(currentQuestion.id)) : null;
        activePracticeQuestions = qs;
        activePracticeEvaluations = restoredEvaluations;
        setSelectedProject(target);
        setPracticeQuestions(qs);
        setSessionId(Number(snapshot.sessionId));
        setQuestionIndex(restoredIndex);
        setAnswers(savedAnswers.map(item => ({ question: qs.find(q => Number(q.id) === Number(item.question_id))?.q || '', answer: item.answer })));
        setEvaluations(restoredEvaluations);
        setAnswer(currentSavedAnswer?.answer || snapshot.answer || '');
        setShowFeedback(Boolean(currentSavedAnswer && (snapshot.showFeedback || snapshot.questionIndex == null)));
        localStorage.setItem(key, JSON.stringify({ ...snapshot, projectId: target.id }));
        localStorage.setItem(`apc_practice_${user.id}_${target.id}`, JSON.stringify({ ...snapshot, projectId: target.id }));
        setPage('Practice Room');
        setNotice('กลับมาทำรอบฝึกเดิมแล้ว');
      } catch (err) {
        console.error('Could not restore practice session', err);
      }
    })();
    return () => { cancelled = true; };
  }, [user, projects]);

  const handleAuthSuccess = useCallback(result => { localStorage.setItem('apc_access_token', result.access_token); if (result.refresh_token) localStorage.setItem('apc_refresh_token', result.refresh_token); setAuthToken(result.access_token); setUser(result.user); setAuthChecking(true); }, []);
  const handleLogout = () => { localStorage.removeItem('apc_access_token'); localStorage.removeItem('apc_refresh_token'); practiceRestoreStartedForUser.current = null; setAuthToken(''); setUser(null); setProjects([]); setSelectedProject(null); setPage('Dashboard'); setNotice('ออกจากระบบแล้ว'); };
  const createProject = async e => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    // Duplicate names are allowed, but ask for confirmation to avoid accidental copies.
    const duplicate = projects.find(project =>
      String(project.title || '').trim().toLocaleLowerCase() === title.toLocaleLowerCase()
    );
    if (duplicate) {
      const proceed = window.confirm(
        `คุณมีโปรเจกต์ชื่อ “${duplicate.title}” อยู่แล้ว ต้องการสร้างโปรเจกต์ชื่อซ้ำต่อหรือไม่?\n\nโปรเจกต์ใหม่จะมี ID แยกจากโปรเจกต์เดิม และประวัติการฝึกจะไม่ถูกรวมกัน`
      );
      if (!proceed) return;
    }

    try {
      const data = await apiFetch('/api/projects', {
        method: 'POST',
        body: JSON.stringify({ title, project_type: newType }),
      });
      const p = toProject(data);
      setProjects(prev => [p, ...prev]);
      setSelectedProject(p);
      setNewTitle('');
      setShowCreate(false);
      navigate('My Projects');
      setNotice(duplicate ? 'สร้างโปรเจกต์ชื่อซ้ำแล้ว โดยแยกข้อมูลตาม ID ของแต่ละโปรเจกต์' : 'บันทึกโปรเจกต์ลงฐานข้อมูลแล้ว');
    } catch (err) {
      setNotice(err.message);
    }
  };
  const startPractice = async project => {
    const target = project || projects[0];
    if (!target) { setNotice('สร้างโปรเจกต์ก่อนเริ่มฝึก'); navigate('My Projects'); return; }
    try {
      const presentation = target.presentations?.[0];
      if (!presentation) throw new Error('โปรเจกต์นี้ยังไม่มีสไลด์ กรุณาอัปโหลด PDF หรือ PPTX ก่อนเริ่มฝึก');
      const detail = await apiFetch(`/api/presentations/${presentation.id}`);
      let qs = detail.questions || [];
      if (!qs.length) {
        const generated = await apiFetch(`/api/presentations/${presentation.id}/generate-questions`, {method:'POST', body:JSON.stringify({count:8, language:'th', difficulty:'mixed'})});
        qs = generated.questions || [];
      }
      qs = qs.map(item => ({...item, q:item.question, tag:item.category || 'PRESENTATION', tip:'ตอบโดยอ้างอิงข้อมูลจากสไลด์ พร้อมยกเหตุผลและตัวอย่าง'}));
      if (!qs.length) throw new Error('ยังสร้างคำถามไม่ได้ กรุณาลองอีกครั้ง');
      // Resume an unfinished round for this project instead of creating a duplicate history session.
      const existingSessions = await apiFetch(`/api/projects/${target.id}/sessions`);
      const unfinished = existingSessions.filter(item => item.status === 'IN_PROGRESS')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
      if (unfinished) {
        const savedAnswers = await apiFetch(`/api/sessions/${unfinished.id}/answers`);
        const restoredEvaluations = savedAnswers.map(item => ({
          answer_id: item.id, session_id: Number(unfinished.id), question_id: item.question_id,
          scores: { ...item.scores, maxima: { accuracy: 40, completeness: 30, reasoning: 20, clarity: 10 } },
          strengths: item.strengths || [], improvements: item.improvements || [],
          model_answer: item.model_answer || '', summary: item.summary || '',
        }));
        const answeredByQuestion = new Map(savedAnswers.map(item => [Number(item.question_id), item]));
        const projectSnapshotKey = `apc_practice_${user?.id}_${target.id}`;
        let savedSnapshot = null;
        try { savedSnapshot = JSON.parse(localStorage.getItem(projectSnapshotKey) || 'null'); } catch { savedSnapshot = null; }
        const requestedIndex = savedSnapshot?.sessionId === unfinished.id ? Number(savedSnapshot.questionIndex) || 0 : savedAnswers.length;
        const restoredIndex = Math.min(Math.max(0, requestedIndex), qs.length - 1);
        const currentSavedAnswer = answeredByQuestion.get(Number(qs[restoredIndex]?.id));
        const snapshot = {
          sessionId: unfinished.id, projectId: target.id, questionIndex: restoredIndex,
          answer: currentSavedAnswer?.answer || (savedSnapshot?.sessionId === unfinished.id ? savedSnapshot.answer || '' : ''),
          showFeedback: Boolean(currentSavedAnswer && (savedSnapshot?.showFeedback || savedSnapshot?.questionIndex == null)),
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(`apc_active_practice_${user.id}`, JSON.stringify(snapshot));
        localStorage.setItem(projectSnapshotKey, JSON.stringify(snapshot));
        setSelectedProject(target); activePracticeQuestions = qs; activePracticeEvaluations = restoredEvaluations;
        setPracticeQuestions(qs); setSessionId(Number(unfinished.id)); setQuestionIndex(restoredIndex);
        setAnswers(savedAnswers.map(item => ({ question: qs.find(q => Number(q.id) === Number(item.question_id))?.q || '', answer: item.answer })));
        setEvaluations(restoredEvaluations); setAnswer(snapshot.answer); setShowFeedback(snapshot.showFeedback);
        navigate('Practice Room'); setNotice('กลับมาทำรอบฝึกเดิมแล้ว'); return;
      }
      const created = await apiFetch('/api/sessions', {method:'POST', body:JSON.stringify({project_id:target.id})});
      const snapshot = { sessionId: created.id, projectId: target.id, questionIndex: 0, answer: '', showFeedback: false, savedAt: new Date().toISOString() };
      localStorage.setItem(`apc_active_practice_${user.id}`, JSON.stringify(snapshot));
      localStorage.setItem(`apc_practice_${user.id}_${target.id}`, JSON.stringify(snapshot));
      setSelectedProject(target); activePracticeQuestions = qs; activePracticeEvaluations = []; setPracticeQuestions(qs); setSessionId(created.id); setQuestionIndex(0); setAnswers([]); setEvaluations([]); setAnswer(''); setShowFeedback(false); navigate('Practice Room');
    } catch (err) { setNotice(err.message); }
  };
  const submitAnswer = async () => {
    if (!answer.trim()) { setNotice('พิมพ์คำตอบก่อนส่งนะ'); return; }
    const question = practiceQuestions[questionIndex];
    if (!question || !sessionId) { setNotice('ไม่พบคำถามหรือรอบฝึก กรุณาเริ่มใหม่'); return; }
    try {
      const result = await apiFetch(`/api/sessions/${sessionId}/evaluate`, {method:'POST', body:JSON.stringify({question_id:question.id, answer:answer.trim(), language:'th'})});
      setAnswers(prev => [...prev, {question:question.q, answer:answer.trim()}]); activePracticeEvaluations = [...activePracticeEvaluations, result]; setEvaluations(prev => [...prev, result]); setShowFeedback(true); setNotice('');
    } catch (err) { setNotice(err.message); }
  };
  const nextQuestion = async () => {
    if (questionIndex < practiceQuestions.length - 1) { setQuestionIndex(questionIndex + 1); setAnswer(''); setShowFeedback(false); }
    else {
      try {
        await apiFetch(`/api/sessions/${sessionId}/complete`, {method:'POST'});
        if (user) {
          const activeKey = `apc_active_practice_${user.id}`;
          let completedSnapshot = null;
          try { completedSnapshot = JSON.parse(localStorage.getItem(activeKey) || 'null'); } catch { completedSnapshot = null; }
          localStorage.removeItem(activeKey);
          const completedProjectId = completedSnapshot?.sessionId === sessionId
            ? completedSnapshot.projectId
            : selectedProject?.id;
          if (completedProjectId != null) localStorage.removeItem(`apc_practice_${user.id}_${completedProjectId}`);
        }
        const rows = await apiFetch('/api/projects');
        setProjects(rows.map(toProject));
        const groups = await Promise.all(rows.map(async p => (await apiFetch(`/api/projects/${p.id}/sessions`)).map(s => ({...s, project_title:p.title}))));
        setSessions(groups.flat().sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
        navigate('Results & Progress');
      } catch (err) { setNotice(err.message); }
    }
  };
  const removeProject = async id => {
    try {
      await apiFetch(`/api/projects/${id}`, { method: 'DELETE' });

      const remainingProjects = projects.filter(project => Number(project.id) !== Number(id));
      const deletingSelectedProject = Number(selectedProject?.id) === Number(id);
      let activeSnapshot = null;
      if (user) {
        const activeKey = `apc_active_practice_${user.id}`;
        try { activeSnapshot = JSON.parse(localStorage.getItem(activeKey) || 'null'); } catch { activeSnapshot = null; }

        // Remove only the deleted project's saved progress; preserve other projects' snapshots.
        localStorage.removeItem(`apc_practice_${user.id}_${id}`);
        if (Number(activeSnapshot?.projectId) === Number(id)) {
          localStorage.removeItem(activeKey);
        }
      }

      setProjects(remainingProjects);
      if (deletingSelectedProject) setSelectedProject(remainingProjects[0] || null);

      // If this project owns the current practice session, reset all in-memory practice state.
      if (deletingSelectedProject || Number(activeSnapshot?.projectId) === Number(id)) {
        setSessionId(null);
        setPracticeQuestions([]);
        setQuestionIndex(0);
        setAnswer('');
        setAnswers([]);
        setEvaluations([]);
        activePracticeQuestions = [];
        activePracticeEvaluations = [];
        setShowFeedback(false);
        setPage('My Projects');
      }

      setNotice('ลบโปรเจกต์และความคืบหน้าการฝึกของโปรเจกต์นี้แล้ว');
    } catch (err) {
      setNotice(err.message);
    }
  };
  const navItems = [
    { label: 'OVERVIEW', items: [{ name: 'Dashboard', icon: LayoutDashboard }, { name: 'My Projects', icon: FolderOpen }] },
    { label: 'PRACTICE', items: [{ name: 'Upload Presentation', icon: Upload }, { name: 'Practice Room', icon: Mic2 }, { name: 'Results & Progress', icon: ChartNoAxesCombined }, { name: 'Practice History', icon: History }] },
  ];
  if (authChecking) return <div className="auth-loading">กำลังตรวจสอบการเข้าสู่ระบบ…</div>;
  if (!user) return <AuthScreen onSuccess={handleAuthSuccess}/>;
  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Sparkles size={21}/></div><div><strong>Presently</strong><span>AI PRESENTATION COACH</span></div><button className="mobile-close" onClick={() => setMobileNav(false)}><X size={18}/></button></div>
      <nav>{navItems.map(group => <div className="nav-group" key={group.label}><div className="nav-label">{group.label}</div>{group.items.map(item => <button key={item.name} className={`nav-item ${page === item.name ? 'active' : ''}`} onClick={() => navigate(item.name)}><item.icon size={18}/><span>{item.name}</span></button>)}</div>)}</nav>
      <div className="sidebar-bottom"><div className="free-note"><Sparkles size={16}/><span>ทุกฟีเจอร์เปิดให้ใช้ฟรี</span></div><button className="nav-item guide-nav-item" onClick={openGuide}><BookOpen size={18}/><span>คู่มือการใช้งาน</span></button><button className={`nav-item ${page === 'Settings' ? 'active' : ''}`} onClick={() => navigate('Settings')}><Settings size={18}/><span>ตั้งค่า</span></button><div className="profile"><div className="profile-avatar">{(user.name || user.email).slice(0,1).toUpperCase()}</div><div className="profile-name"><b>{user.name || user.email.split('@')[0]}</b><small>{user.email}</small></div><button className="logout-link" onClick={handleLogout} title="ออกจากระบบ" aria-label="ออกจากระบบ"><LogOut size={16} strokeWidth={2} /></button></div></div>
    </aside>
    {mobileNav && <div className="mobile-scrim" onClick={() => setMobileNav(false)}/>}
    <main className="main-area"><header className="topbar"><button className="mobile-menu" onClick={() => setMobileNav(true)}><Menu size={20}/></button><div className="breadcrumb">Workspace <ChevronRight size={14}/> <b>{page}</b></div><div className="top-actions"></div></header>
    <div className="content">{notice && <div className={`notice notice-${noticeType}`} role={noticeType === 'error' ? 'alert' : 'status'}>{noticeType === 'error' ? <AlertCircle size={19}/> : noticeType === 'warning' ? <AlertTriangle size={19}/> : <CheckCircle2 size={19}/>}<span>{notice}</span><button aria-label="ปิดการแจ้งเตือน" onClick={() => setNotice('')}><X size={16}/></button></div>}
      {page === 'Dashboard' && <Dashboard projects={projects} sessions={sessions} navigate={navigate} startPractice={startPractice} setShowCreate={setShowCreate}/>}
      {page === 'My Projects' && <Projects projects={filtered} query={query} setQuery={setQuery} setShowCreate={setShowCreate} startPractice={startPractice} removeProject={removeProject} setSelectedProject={setSelectedProject} navigate={navigate}/>}
      {page === 'Upload Presentation' && <UploadPage file={file} setFile={setFile} projects={projects} selectedProject={selectedProject} setSelectedProject={setSelectedProject} setProjects={setProjects} startPractice={startPractice} navigate={navigate} setNotice={setNotice}/>}
      {page === 'Practice Room' && <PracticeRoom selectedProject={selectedProject} questions={practiceQuestions} evaluations={evaluations} questionIndex={questionIndex} answer={answer} setAnswer={setAnswer} showFeedback={showFeedback} submitAnswer={submitAnswer} nextQuestion={nextQuestion} setQuestionIndex={setQuestionIndex} setShowFeedback={setShowFeedback} setAnswers={setAnswers} setNotice={setNotice}/>}
      {page === 'Results' || page === 'Results & Progress' ? <Results projects={projects} sessions={sessions} evaluations={evaluations} navigate={navigate} startPractice={startPractice}/> : null}
      {page === 'Practice History' && <HistoryPage sessions={sessions} startPractice={startPractice} projects={projects}/>}
      {page === 'Settings' && <SettingsPage user={user} setNotice={setNotice}/>}
    </div><footer>© 2026 Presently AI Coach <span>Built to help you speak with confidence.</span></footer></main>
    {showGuide && <div className="modal-backdrop guide-backdrop" onClick={closeGuide}><section className="modal guide-modal" role="dialog" aria-modal="true" aria-labelledby="guide-title" onClick={e => e.stopPropagation()}><button type="button" className="modal-close" aria-label="ปิดคู่มือ" onClick={closeGuide}><X size={18}/></button><div className="modal-icon guide-modal-icon"><BookOpen size={22}/></div><div className="guide-eyebrow">เริ่มต้นใช้งาน</div><h2 id="guide-title">ยินดีต้อนรับสู่ AI Presentation Coach</h2><p>ทำตาม 4 ขั้นตอนง่าย ๆ เพื่อเตรียมตัวนำเสนอและฝึกตอบคำถาม</p><ol className="guide-steps"><li><span className="guide-step-icon"><FolderOpen size={19}/></span><div><b>1. สร้างโปรเจกต์</b><small>ตั้งชื่อโปรเจกต์สำหรับงานนำเสนอของคุณ</small></div></li><li><span className="guide-step-icon"><Upload size={19}/></span><div><b>2. อัปโหลดสไลด์</b><small>เพิ่มไฟล์ PDF หรือ PPTX เพื่อให้ AI ใช้เป็นข้อมูลอ้างอิง</small></div></li><li><span className="guide-step-icon"><Mic2 size={19}/></span><div><b>3. ฝึกตอบคำถามกับ AI</b><small>ลองตอบคำถามและส่งคำตอบเพื่อรับคำแนะนำ</small></div></li><li><span className="guide-step-icon"><ChartNoAxesCombined size={19}/></span><div><b>4. ดูคะแนนและพัฒนาคำตอบ</b><small>ตรวจผลประเมิน แล้วนำคำแนะนำไปฝึกต่อ</small></div></li></ol><label className="guide-checkbox"><input type="checkbox" checked={dontShowGuideAgain} onChange={e => setDontShowGuideAgain(e.target.checked)}/><span>ไม่แสดงคู่มือนี้อีก</span></label><div className="modal-actions guide-actions"><button type="button" className="btn-secondary" onClick={closeGuide}>ปิดคู่มือ</button><button type="button" className="btn-primary" onClick={beginFromGuide}>เริ่มใช้งาน <ChevronRight size={16}/></button></div></section></div>}
    {showCreate && <div className="modal-backdrop" onClick={() => setShowCreate(false)}><form className="modal" onSubmit={createProject} onClick={e => e.stopPropagation()}><button type="button" className="modal-close" onClick={() => setShowCreate(false)}><X size={18}/></button><div className="modal-icon"><FolderOpen size={22}/></div><h2>สร้างโปรเจกต์</h2><p>ตั้งค่างานนำเสนอเพื่อเริ่มฝึกกับ AI</p><label>ชื่อโปรเจกต์</label><input autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="เช่น โปรเจกต์จบการศึกษา" required/><label>ประเภทโปรเจกต์</label><select value={newType} onChange={e => setNewType(e.target.value)}><option value="University">มหาวิทยาลัย</option><option value="Business">ธุรกิจ</option><option value="Technology">เทคโนโลยี</option><option value="Personal">ส่วนตัว</option></select><div className="modal-actions"><button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>ยกเลิก</button><button type="submit" className="btn-primary"><Plus size={16}/> สร้างโปรเจกต์</button></div></form></div>}
  </div>;
}
// -----------------------------------------------------------------------------
// Reusable UI and page components
// -----------------------------------------------------------------------------
function PageHeading({eyebrow, title, subtitle, action}) { return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>; }
function Dashboard({projects,sessions,navigate,startPractice,setShowCreate}) {
  const completed = sessions.filter(s=>s.status==='COMPLETED' && s.total_score!==null && s.total_score!==undefined);
  const average = completed.length ? Math.round(completed.reduce((sum,s)=>sum+s.total_score,0)/completed.length) : null;
  const recent = completed.slice(0,8).reverse();
  return <><PageHeading eyebrow="YOUR WORKSPACE" title={<>Own the room.<br/><span className="gradient-text">Every single time.</span></>} subtitle="Your personal AI coach is ready when you are."/><div className="hero-banner"><div className="hero-copy"><div className="hero-kicker"><Sparkles size={14}/> YOUR NEXT BREAKTHROUGH STARTS HERE</div><h2>Confidence is a skill.<br/>Let's build yours.</h2><p>Practice real questions, get instant feedback, and turn nervous energy into your superpower.</p><button className="hero-button" onClick={()=>navigate('My Projects')}><Plus size={17}/> โปรเจกต์ใหม่ <ChevronRight size={17}/></button></div><div className="hero-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="art-center"><Mic2 size={38}/></div><div className="float-card float-score"><span className="float-check"><CheckCircle2 size={15}/></span><div><b>AI presentation coach</b><small>Practice with feedback</small></div></div><div className="float-card float-wave"><span className="wave-bars">▂ ▅ ▃ ▇ ▄ ▆ ▂</span><small>Keep practicing</small></div><div className="sparkle s1">✦</div><div className="sparkle s2">✧</div></div></div><div className="stats-grid"><Stat icon={FolderOpen} label="Active projects" value={projects.length.toString()} note="Keep the momentum" tone="violet"/><Stat icon={Mic2} label="Practice sessions" value={sessions.length.toString()} note="รอบฝึกที่บันทึกจริง" tone="blue"/><Stat icon={Target} label="Average score" value={average===null?'—':`${average}%`} note={completed.length?`จาก ${completed.length} รอบที่เสร็จแล้ว`:'ยังไม่มีรอบฝึกที่เสร็จแล้ว'} tone="green"/><Stat icon={Clock3} label="Time practiced" value="—" note="ยังไม่ได้เก็บเวลาฝึก" tone="orange"/></div><div className="dashboard-grid"><section className="panel projects-panel"><div className="panel-heading"><div><h3>Recent projects</h3><p>Pick up right where you left off.</p></div><button className="text-button" onClick={()=>navigate('My Projects')}>View all <ArrowUpRight size={15}/></button></div><div className="project-list">{projects.slice(0,3).map(p=><ProjectRow key={p.id} project={p} startPractice={startPractice}/>)}</div>{!projects.length&&<p className="empty-copy">ยังไม่มีโปรเจกต์ เริ่มจากสร้างโปรเจกต์และอัปโหลดสไลด์</p>}</section><section className="panel progress-panel"><div className="panel-heading"><div><h3>Your progress</h3><p>คะแนนจากรอบฝึกที่เสร็จสมบูรณ์</p></div></div>{completed.length ? <><div className="progress-summary"><div className="progress-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="49"/><circle className="ring-value" cx="60" cy="60" r="49" style={{strokeDasharray:`${average/100*308} 308`}}/></svg><div><strong>{average}<span>%</span></strong><small>Average score</small></div></div><div className="progress-note"><p>คำนวณจาก <b>{completed.length}</b> รอบฝึกที่เสร็จแล้ว</p></div></div><div className="mini-chart"><div className="chart-grid"><span>100</span><span>75</span><span>50</span><span>25</span></div><div className="chart-bars">{recent.map(s=><div key={s.id} className="bar-current" style={{height:`${Math.max(2,Math.min(100,s.total_score||0))}%`}} title={`Session #${s.id}: ${s.total_score}%`}/>)}</div></div><div className="chart-months"><span>Older</span><span>Recent completed sessions</span></div></> : <div className="empty-state"><Target size={26}/><h3>ยังไม่มีคะแนนจริง</h3><p>ทำแบบฝึกให้เสร็จอย่างน้อยหนึ่งรอบ คะแนนเฉลี่ยและกราฟจะแสดงที่นี่</p></div>}</section></div><section className="tip-banner"><div className="tip-icon"><Sparkles size={19}/></div><div><b>Coach's tip</b><p>ตอบโดยอ้างอิงสไลด์ ยกเหตุผลและตัวอย่าง และหลีกเลี่ยงการเดาข้อมูลที่ไม่มีในสไลด์</p></div><button onClick={()=>navigate('Practice Room')}>Try it out <ChevronRight size={15}/></button></section></>;
}
function Stat({icon:Icon,label,value,note,tone}) { return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19}/></div><span className="stat-label">{label}</span><strong>{value}</strong><small className={note.includes('↑')?'positive':''}>{note}</small></div>; }
function ProjectRow({project:p,startPractice}) { const typeLabels={University:'มหาวิทยาลัย',Business:'ธุรกิจ',Technology:'เทคโนโลยี',Personal:'ส่วนตัว'}; return <div className="project-row"><div className={`file-icon ${p.color}`}><FileText size={20}/></div><div className="project-info"><b>{p.title}</b><small>{typeLabels[p.type] || p.type} <span>·</span> อัปเดตเมื่อ {p.date}</small></div><div className="project-score">{p.score !== null ? <><strong>{p.score}%</strong><small>คะแนนล่าสุด</small></> : <><strong>ใหม่</strong><small>ยังไม่ได้ฝึก</small></>}</div><button className="row-play" onClick={() => startPractice(p)} aria-label={`ฝึกนำเสนอ ${p.title}`}><Play size={15} fill="currentColor"/></button></div>; }
function Projects({projects,query,setQuery,setShowCreate,startPractice,removeProject,setSelectedProject,navigate}) { const typeLabels={University:'มหาวิทยาลัย',Business:'ธุรกิจ',Technology:'เทคโนโลยี',Personal:'ส่วนตัว'}; return <><PageHeading eyebrow="พื้นที่ของคุณ" title="โปรเจกต์ของฉัน" subtitle="รวมงานนำเสนอทั้งหมดของคุณไว้ในที่เดียว" action={<button className="btn-primary" onClick={() => setShowCreate(true)}><Plus size={17}/> สร้างโปรเจกต์ใหม่</button>}/><div className="toolbar"><div className="search-box"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ค้นหาโปรเจกต์..."/></div><span className="results-count">{projects.length} โปรเจกต์</span></div>{projects.length ? <div className="project-cards">{projects.map(p=><div className="project-card" key={p.id}><div className={`project-card-top ${p.color}`}><div className={`file-icon ${p.color}`}><FileText size={22}/></div><button className="more-button" onClick={() => removeProject(p.id)} title="ลบโปรเจกต์"><Trash2 size={17}/></button></div><div className="project-card-body"><span className="type-tag">{typeLabels[p.type] || p.type}</span><h3>{p.title}</h3><p>อัปเดตเมื่อ {p.date}</p><div className="project-card-meta"><span><CircleHelp size={15}/> {p.questions || '—'} คำถาม</span><span><ChartNoAxesCombined size={15}/> {p.score === null ? 'ยังไม่มีคะแนน' : `คะแนน ${p.score}%`}</span></div><div className="project-card-actions"><button className="btn-secondary" onClick={() => {setSelectedProject(p);navigate('Upload Presentation')}}><Upload size={15}/> จัดการไฟล์</button><button className="btn-primary" onClick={() => startPractice(p)}><Play size={14} fill="currentColor"/> เริ่มฝึก</button></div></div></div>)}</div> : <div className="empty-state"><FolderOpen size={32}/><h3>ไม่พบโปรเจกต์</h3><p>ลองค้นหาด้วยคำอื่น หรือสร้างโปรเจกต์ใหม่</p><button className="btn-primary" onClick={() => setShowCreate(true)}><Plus size={16}/> สร้างโปรเจกต์ใหม่</button></div>}</>; }
function UploadPage({file,setFile,projects,selectedProject,setSelectedProject,setProjects,startPractice,navigate,setNotice}) { const [isProcessing,setIsProcessing] = useState(false); const onFile = e => { const f=e.target.files?.[0]; if (!f) return; const ext=f.name.split('.').pop().toLowerCase(); if (!['pdf','pptx'].includes(ext)) {setNotice('รองรับไฟล์ PDF และ PPTX เท่านั้น');return;} if(f.size>20*1024*1024){setNotice('ไฟล์ต้องมีขนาดไม่เกิน 20 MB');return;}setFile(f);setNotice(''); }; return <><PageHeading eyebrow="ตั้งค่าการฝึก" title="อัปโหลดงานนำเสนอ" subtitle="อัปโหลดสไลด์เพื่อเตรียมพร้อมตอบคำถามสำคัญได้อย่างมั่นใจ"/><div className="upload-layout"><section className="panel upload-panel"><div className="upload-note" style={{marginBottom:18}}><CheckCircle2 size={17}/><p><b>จัดการไฟล์โดยคำนึงถึงความเป็นส่วนตัว</b><br/>ไฟล์ต้นฉบับจะถูกใช้ชั่วคราวเพื่ออ่านข้อความเท่านั้น ระบบจะบันทึกเฉพาะข้อความที่ดึงได้และข้อมูลโปรเจกต์ลงฐานข้อมูล แล้วลบไฟล์ต้นฉบับออก</p></div><div className="step-title"><span>1</span><div><h3>เลือกไฟล์งานนำเสนอ</h3><p>อัปโหลดสไลด์เพื่อให้โค้ชเข้าใจเนื้อหาที่คุณจะนำเสนอ</p></div></div><label className={`dropzone ${isProcessing ? 'is-busy' : ''}`}><input type="file" accept=".pdf,.pptx" onChange={onFile} disabled={isProcessing}/><div className="upload-icon"><Upload size={24}/></div><b>{file ? file.name : 'วางไฟล์ที่นี่ หรือคลิกเพื่อเลือกไฟล์'}</b><p>{file ? `${(file.size/1024/1024).toFixed(2)} MB · Ready to use` : 'รองรับ PDF หรือ PPTX (ขนาดไม่เกิน 20 MB)'}</p><span className="browse-button">เลือกไฟล์</span></label>{file && <div className="uploaded-file"><div className="file-icon blue"><FileText size={19}/></div><div><b>{file.name}</b><small>พร้อมสำหรับการฝึก</small></div><button onClick={()=>setFile(null)}><X size={16}/></button></div>}<div className="step-title second-step"><span>2</span><div><h3>เชื่อมโยงกับโปรเจกต์</h3><p>บันทึกรอบฝึกไว้กับโปรเจกต์ที่เกี่ยวข้อง</p></div></div><select className="full-select" value={selectedProject?.id || ''} onChange={e=>setSelectedProject(projects.find(p=>p.id===Number(e.target.value)))}>{projects.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select><div className="upload-note"><Sparkles size={17}/><p><b>ขั้นตอนถัดไป</b><br/>ระบบจะอ่านข้อความจากสไลด์เพื่อสร้างคำถามฝึกซ้อมและคำแนะนำที่เหมาะกับเนื้อหาของคุณ โดยส่งไฟล์ไปประมวลผลที่ระบบหลังบ้าน</p></div>{isProcessing && <div className="processing-panel" role="status" aria-live="polite"><span className="loading-spinner"/><div><b>กำลังประมวลผลไฟล์ของคุณ</b><p>กำลังอัปโหลด อ่านเนื้อหาสไลด์ และเตรียมคำถาม อาจใช้เวลาสักครู่ กรุณาอย่าปิดหน้านี้</p></div></div>}<button className="btn-primary wide-button" disabled={!file || isProcessing} onClick={async()=>{if(!selectedProject){setNotice('กรุณาสร้างโปรเจกต์ก่อนอัปโหลดงานนำเสนอ');return;}setIsProcessing(true);setNotice('');try{const form=new FormData();form.append('file',file);await apiFetch(`/api/projects/${selectedProject.id}/presentations`,{method:'POST',body:form});const rows=await apiFetch('/api/projects');const mapped=rows.map(toProject);setProjects(mapped);const updated=mapped.find(p=>p.id===selectedProject.id);setSelectedProject(updated||null);setFile(null);if(updated)await startPractice(updated);}catch(err){setNotice(err.message);}finally{setIsProcessing(false);}}}>{isProcessing ? <><span className="loading-spinner button-spinner"/> กำลังอัปโหลดและเตรียมคำถาม...</> : <>ดึงข้อความและเริ่มฝึก <ChevronRight size={17}/></>}</button></section><aside className="panel upload-aside"><div className="aside-illustration"><div className="slide-sheet"><div/><div/><div/><div/></div><div className="ai-bubble"><Sparkles size={23}/></div></div><h3>ทำให้ทุกสไลด์มีความหมาย</h3><p>ฝึกตอบคำถามที่อ้างอิงจากงานนำเสนอของคุณ พร้อมรับคำแนะนำที่นำไปปรับใช้ได้ก่อนนำเสนอจริง</p><div className="aside-feature"><CheckCircle2 size={17}/><span>คำถามอ้างอิงจากเนื้อหาของคุณ</span></div><div className="aside-feature"><CheckCircle2 size={17}/><span>คำแนะนำที่นำไปปรับใช้ได้</span></div><div className="aside-feature"><CheckCircle2 size={17}/><span>ฝึกซ้อมได้ตามจังหวะของคุณ</span></div></aside></div></>; }
function PracticeRoom({selectedProject,questions,questionIndex,answer,setAnswer,showFeedback,submitAnswer,nextQuestion,setQuestionIndex,setShowFeedback,setAnswers,setNotice}) {
  const q = questions[questionIndex] || {q:'ยังไม่มีคำถาม',tag:'งานนำเสนอ',tip:'กรุณาอัปโหลดสไลด์ก่อนเริ่มฝึก'};
  const latestEvaluation = activePracticeEvaluations[activePracticeEvaluations.length-1];
  const [showHint,setShowHint] = useState(false);
  const [isSubmitting,setIsSubmitting] = useState(false);
  const scores = latestEvaluation?.scores;
  return <><PageHeading eyebrow="รอบฝึกซ้อม" title="ห้องฝึกซ้อม" subtitle="ลองเรียบเรียงความคิดและตอบคำถามทีละข้อ เพื่อพัฒนาการนำเสนอของคุณ" action={<div className="session-tag"><span/> กำลังฝึกซ้อม</div>}/><div className="practice-layout"><section className="panel practice-main"><div className="practice-progress"><span>คำถามที่ {questionIndex+1} จาก {questions.length}</span><span>{questions.length ? Math.round((questionIndex+1)/questions.length*100) : 0}% เสร็จแล้ว</span></div><div className="progress-track"><div style={{width:`${questions.length ? (questionIndex+1)/questions.length*100 : 0}%`}}/></div><div className="question-tag"><Sparkles size={13}/>{q.tag}</div><h2 className="question-text">{q.q}</h2><p className="question-sub">ตั้งสติ เรียบเรียงความคิด แล้วตอบเสมือนว่าคุณกำลังพูดต่อหน้าผู้ฟัง</p><div className="answer-label"><label htmlFor="answer">คำตอบของคุณ</label><span>{answer.trim() ? answer.trim().split(/\s+/).length : 0} คำ</span></div><textarea id="answer" className="answer-area" value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="เริ่มจากประเด็นหลัก แล้วอธิบายเพิ่มเติมด้วยเหตุผลหรือตัวอย่าง..." disabled={showFeedback || isSubmitting}/><div className="answer-tools"><button className="tool-button" onClick={()=>setShowHint(!showHint)}><Sparkles size={15}/>{showHint?'ซ่อนคำใบ้':'ขอคำใบ้'}</button><button className="tool-button" onClick={()=>{setAnswer('');setShowFeedback(false)}} disabled={showFeedback}><RotateCcw size={15}/> ล้างคำตอบ</button></div>{showHint && <div className="hint-box"><Sparkles size={16}/><span>{q.tip}</span></div>}{isSubmitting && <div className="processing-panel answer-processing" role="status" aria-live="polite"><span className="loading-spinner"/><div><b>AI กำลังตรวจคำตอบของคุณ...</b><p>กำลังวิเคราะห์ความถูกต้อง ความครบถ้วน การให้เหตุผล และความชัดเจน โดยปกติใช้เวลาไม่นาน กรุณารอสักครู่</p></div></div>}{showFeedback && latestEvaluation && <div className="feedback-box"><div className="feedback-heading"><div className="feedback-icon"><CheckCircle2 size={18}/></div><div><b>คำแนะนำจาก AI สำหรับคำตอบของคุณ</b><p>{latestEvaluation.summary || 'คะแนนประเมินจากคำตอบนี้'}</p></div></div><div className="feedback-score"><span>คะแนนรวม</span><div className="score-track"><i style={{width:`${scores?.total ?? 0}%`}}/></div><b>{scores?.total ?? 0}/100</b></div><div className="feedback-score"><span>ความถูกต้อง</span><div className="score-track"><i style={{width:`${(scores?.accuracy ?? 0)/40*100}%`}}/></div><b>{scores?.accuracy ?? 0}/40</b></div><div className="feedback-score"><span>ความครบถ้วน</span><div className="score-track"><i style={{width:`${(scores?.completeness ?? 0)/30*100}%`}}/></div><b>{scores?.completeness ?? 0}/30</b></div><div className="feedback-score"><span>การให้เหตุผล</span><div className="score-track"><i style={{width:`${(scores?.reasoning ?? 0)/20*100}%`}}/></div><b>{scores?.reasoning ?? 0}/20</b></div><div className="feedback-score"><span>ความชัดเจน</span><div className="score-track"><i style={{width:`${(scores?.clarity ?? 0)/10*100}%`}}/></div><b>{scores?.clarity ?? 0}/10</b></div>{latestEvaluation.strengths?.length>0 && <p className="feedback-tip"><b>จุดที่ทำได้ดี:</b> {latestEvaluation.strengths.join(' · ')}</p>}{latestEvaluation.improvements?.length>0 && <p className="feedback-tip"><b>ควรปรับปรุง:</b> {latestEvaluation.improvements.join(' · ')}</p>}{latestEvaluation.model_answer && <p className="feedback-tip"><b>ตัวอย่างคำตอบ:</b> {latestEvaluation.model_answer}</p>}</div>}<div className="practice-footer"><button className="btn-secondary" onClick={()=>{if(questionIndex>0){setQuestionIndex(questionIndex-1);setShowFeedback(false);setAnswer('');}}} disabled={questionIndex===0}><ChevronLeft size={16}/> ก่อนหน้า</button>{showFeedback ? <button className="btn-primary" onClick={nextQuestion}>{questionIndex===questions.length-1?'ดูผลลัพธ์':'คำถามถัดไป'} <ChevronRight size={16}/></button> : <button className="btn-primary" disabled={isSubmitting} onClick={async()=>{if(isSubmitting)return;setIsSubmitting(true);try{await submitAnswer();}finally{setIsSubmitting(false);}}}>{isSubmitting ? <><span className="loading-spinner button-spinner"/> กำลังตรวจคำตอบ...</> : <><Send size={15}/> ส่งคำตอบ</>}</button>}</div></section><aside className="panel coach-panel"><div className="coach-avatar"><Sparkles size={24}/><span/></div><h3>โค้ช AI ของคุณ</h3><p>ฉันจะช่วยให้คุณเตรียมพร้อมและมั่นใจในการนำเสนอมากขึ้น</p><div className="coach-divider"/><div className="coach-stat"><div className="coach-stat-icon"><Target size={17}/></div><div><b>ทีละประเด็น</b><small>ตอบให้ชัดเจน แล้วค่อยเพิ่มรายละเอียด</small></div></div><div className="coach-stat"><div className="coach-stat-icon"><Brain size={17}/></div><div><b>จัดลำดับความคิด</b><small>ประเด็น → เหตุผล → ตัวอย่าง</small></div></div><div className="coach-stat"><div className="coach-stat-icon"><MessageSquareText size={17}/></div><div><b>พูดอย่างเป็นธรรมชาติ</b><small>สื่อสารกับผู้ฟัง ไม่ใช่อ่านตามสไลด์</small></div></div><div className="coach-quote">“นักพูดที่เก่งไม่ได้เก่งมาตั้งแต่เกิด แต่พัฒนาจากการฝึกฝน”</div><div className="coach-session"><span>กำลังฝึก</span><b>{selectedProject?.title || 'การฝึกนำเสนอ'}</b></div></aside></div></>;
}
function Results({projects,sessions=[],navigate,startPractice}) {
  const [tab,setTab]=useState('Overview');
  const [recommendationProjectId,setRecommendationProjectId]=useState(projects[0]?.id || '');
  const [recommendationData,setRecommendationData]=useState(null);
  const [recommendationsLoading,setRecommendationsLoading]=useState(false);
  const [recommendationsError,setRecommendationsError]=useState('');
  const completed=sessions.filter(s=>s.status==='COMPLETED' && s.total_score!==null && s.total_score!==undefined);
  const average=completed.length?Math.round(completed.reduce((sum,s)=>sum+s.total_score,0)/completed.length):null;
  const skillRows=[['Accuracy','accuracy',40],['Completeness','completeness',30],['Reasoning','reasoning',20],['Clarity','clarity',10]];
  const skillAverage=key=>{const rows=completed.filter(s=>s.scores?.[key]!==null&&s.scores?.[key]!==undefined);return rows.length?Math.round(rows.reduce((sum,s)=>sum+s.scores[key],0)/rows.length):null;};
  useEffect(()=>{
    if(tab!=='Recommendations' || !recommendationProjectId){setRecommendationData(null);return;}
    let active=true;
    setRecommendationsLoading(true);
    setRecommendationsError('');
    apiFetch(`/api/projects/${recommendationProjectId}/recommendations`)
      .then(data=>{if(active)setRecommendationData(data);})
      .catch(error=>{if(active){setRecommendationsData(null);setRecommendationsError(error.message || 'โหลดคำแนะนำไม่สำเร็จ');}})
      .finally(()=>{if(active)setRecommendationsLoading(false);});
    return ()=>{active=false;};
  },[tab,recommendationProjectId]);
  useEffect(()=>{if(!recommendationProjectId && projects.length)setRecommendationProjectId(projects[0].id);},[projects,recommendationProjectId]);
  const selectedRecommendationProject=projects.find(p=>String(p.id)===String(recommendationProjectId));
  return <><PageHeading eyebrow="YOUR GROWTH, IN FOCUS" title="Results & progress" subtitle="ผลคะแนนและคำแนะนำจากรอบฝึกที่บันทึกจริง" action={<button className="btn-primary" disabled={!projects.length} onClick={()=>startPractice(projects[0])}><Play size={15} fill="currentColor"/> Practice again</button>}/><div className="result-tabs">{['Overview','Skills breakdown','Recommendations'].map(t=><button className={tab===t?'selected':''} key={t} onClick={()=>setTab(t)}>{t}</button>)}</div>{tab==='Overview' && <>{completed.length ? <><div className="result-hero"><div><span className="result-label"><Sparkles size={14}/> YOUR OVERALL PERFORMANCE</span><div className="result-number">{average}<span>/100</span></div><p>ค่าเฉลี่ยจากรอบฝึกที่เสร็จสมบูรณ์ {completed.length} รอบ ไม่มีการใช้คะแนนตัวอย่าง</p></div><div className="result-orb"><div><ChartNoAxesCombined size={36}/><b>คะแนนจริง</b><span>จากผลประเมินที่บันทึกไว้</span></div></div></div><div className="stats-grid result-stats">{skillRows.map(([label,key,max],i)=>{const v=skillAverage(key);return <Stat key={key} icon={[Target,Brain,MessageSquareText,Volume2][i]} label={label} value={v===null?'—':`${Math.round(v/max*100)}%`} note={v===null?'ยังไม่มีข้อมูล':`เฉลี่ย ${v}/${max} คะแนน`} tone={['violet','blue','green','orange'][i]}/>})}</div><div className="panel result-detail"><div className="panel-heading"><div><h3>Recent practice scores</h3><p>คะแนนรวมจากแต่ละรอบที่เสร็จแล้ว</p></div></div>{completed.map(s=><div className="score-row" key={s.id}><div className="file-icon purple"><FileText size={18}/></div><div className="score-row-name"><b>{projects.find(p=>p.id===s.project_id)?.title || 'Practice session'}</b><small>{s.created_at?new Date(s.created_at).toLocaleString():'—'} · Session #{s.id}</small></div><div className="score-line"><i style={{width:`${s.total_score}%`}}/></div><strong>{s.total_score}%</strong></div>)}</div></> : <div className="panel empty-state"><ChartNoAxesCombined size={32}/><h3>ยังไม่มีผลคะแนน</h3><p>เมื่อคุณตอบคำถามและจบรอบฝึก ระบบจะแสดงคะแนนจาก AI ที่บันทึกจริงที่นี่</p>{projects.length>0&&<button className="btn-primary" onClick={()=>startPractice(projects[0])}><Play size={15}/> เริ่มฝึก</button>}</div>}</>}{tab==='Skills breakdown' && <div className="panel skills-panel">{skillRows.map(([name,key,max])=>{const v=skillAverage(key);return <div className="skill-row" key={key}><div><b>{name}</b><span>{v===null?'No data':v>=max*.85?'Strong':v>=max*.6?'Developing':'Keep practicing'}</span></div><div className="skill-track"><i style={{width:`${v===null?0:v/max*100}%`}}/></div><strong>{v===null?'—':`${Math.round(v/max*100)}%`}</strong></div>})}{!completed.length&&<p>ทำแบบฝึกให้เสร็จก่อนเพื่อดูรายละเอียดทักษะ</p>}</div>}{tab==='Recommendations' && <div className="panel recommendations-panel"><div className="panel-heading"><div><h3>คำแนะนำรายโปรเจกต์</h3><p>คำนวณจากคะแนนและข้อเสนอแนะที่บันทึกไว้ ไม่เรียก AI เพิ่ม</p></div></div>{projects.length ? <label className="recommendation-project-select">เลือกโปรเจกต์<select className="full-select" value={recommendationProjectId} onChange={e=>setRecommendationProjectId(e.target.value)}>{projects.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label> : <p>ยังไม่มีโปรเจกต์ให้เลือก กรุณาสร้างโปรเจกต์และเริ่มฝึกก่อน</p>}{recommendationsLoading ? <div className="processing-panel"><span className="loading-spinner"/><div><b>กำลังอ่านผลการฝึกที่บันทึกไว้</b><p>ขั้นตอนนี้ไม่ใช้ AI เพิ่ม</p></div></div> : recommendationsError ? <div className="auth-error" role="alert">{recommendationsError}</div> : recommendationData && <><div className="recommendation-summary"><b>{selectedRecommendationProject?.title || recommendationData.project_title}</b><span>{recommendationData.completed_sessions} รอบที่เสร็จแล้ว · {recommendationData.evaluated_answers} คำตอบที่ประเมิน</span></div>{recommendationData.recommendations.length ? <div className="recommendation-list">{recommendationData.recommendations.map((item,index)=><div className="recommendation-item" key={item.skill+'-'+index}><div className={`recommendation-marker ${item.priority}`}>{item.priority==='positive'?<CheckCircle2 size={18}/>:<Target size={18}/>}</div><div><b>{item.skill}</b><p>{item.message}</p></div><span className="recommendation-score">{item.score}</span></div>)}</div> : <div className="empty-state"><Sparkles size={28}/><h3>ยังไม่มีคำแนะนำ</h3><p>เมื่อคุณฝึกตอบและจบรอบ ระบบจะใช้ผลประเมินที่บันทึกไว้สร้างคำแนะนำโดยไม่เรียก AI เพิ่ม</p>{selectedRecommendationProject&&<button className="btn-primary" onClick={()=>startPractice(selectedRecommendationProject)}><Play size={15}/> เริ่มฝึก</button>}</div>}</>}</div>}</>;
}
function HistoryPage({sessions,startPractice,projects}) { return <><PageHeading eyebrow="YOUR JOURNEY" title="Practice history" subtitle="Every session is a step toward a more confident you."/><div className="panel history-panel"><div className="panel-heading"><div><h3>Recent sessions</h3><p>A record of your practice and progress.</p></div><span className="history-filter">Last 30 days <ChevronRight size={14}/></span></div>{[...sessions].map((p,i)=><div className="history-row" key={p.id}><div className="history-date"><b>{new Date(p.created_at).getDate()}</b><span>{new Date(p.created_at).toLocaleDateString('en-US',{month:'short'}).toUpperCase()}</span></div><div className={`file-icon ${p.color}`}><Mic2 size={19}/></div><div className="history-info"><b>{p.project_title || 'Practice session'}</b><small>{new Date(p.created_at).toLocaleString()} · Session #{p.id}</small></div><div className="history-score"><b>{p.total_score??'—'}{p.total_score!==null?'%':''}</b><small>{p.status==='COMPLETED'?'Completed':'In progress'}</small></div><button className="icon-button" onClick={()=>startPractice(projects.find(project=>project.id===p.project_id))}><ArrowUpRight size={17}/></button></div>)}</div></>; }
function SettingsPage({user}) { return <><PageHeading eyebrow="การตั้งค่า" title="ตั้งค่า" subtitle="จัดการข้อมูลบัญชีและภาษาที่ใช้ในแอป"/><div className="settings-layout"><section className="panel settings-panel"><h3>ภาษา</h3><p>ระบบใช้ภาษาไทยเป็นภาษาหลัก เพื่อให้ข้อความและคำแนะนำสอดคล้องกันทุกหน้า</p><p className="settings-note">ใช้คำศัพท์เทคนิค เช่น AI, PDF และ PPTX ตามความจำเป็น</p></section><section className="panel settings-panel"><h3>ข้อมูลบัญชี</h3><p>ข้อมูลบัญชีที่ใช้เข้าสู่ระบบ</p><label>ชื่อที่แสดง</label><input value={user?.name || ''} readOnly/><label>อีเมล</label><input type="email" value={user?.email || ''} readOnly/><p className="settings-note">ข้อมูลบัญชีส่วนนี้แสดงเพื่อให้ตรวจสอบได้เท่านั้น ยังไม่รองรับการแก้ไขจากหน้านี้</p></section></div></>; }

// -----------------------------------------------------------------------------
// Authentication screen
// -----------------------------------------------------------------------------
function AuthScreen({ onSuccess }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const render = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: async response => {
        setBusy(true); setError('');
        try {
          const res = await fetch(API_URL + '/api/auth/google', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ credential: response.credential }) });
          const data = await res.json();
          if (!res.ok) throw new Error(data.detail || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
          onSuccess(data);
        } catch (err) { setError(err.message); } finally { setBusy(false); }
      } });
      const target = document.getElementById('google-signin-button');
      if (target) { target.innerHTML = ''; window.google.accounts.id.renderButton(target, { theme: 'outline', size: 'large', shape: 'rectangular', text: 'continue_with', width: 340 }); }
    };
    if (window.google?.accounts?.id) render();
    else { const script = document.createElement('script'); script.src = 'https://accounts.google.com/gsi/client'; script.async = true; script.defer = true; script.onload = render; script.onerror = () => setError('โหลด Google Sign-In ไม่สำเร็จ'); document.head.appendChild(script); }
  }, [onSuccess]);
  const submit = async e => {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const body = mode === 'register' ? { name: name.trim(), email: email.trim(), password } : { email: email.trim(), password };
      const res = await fetch(API_URL + endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'ไม่สามารถเข้าสู่ระบบได้');
      onSuccess(data);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return <main className="auth-page"><section className="auth-card">
    <div className="auth-brand"><div className="brand-mark"><Sparkles size={24}/></div><div><b>Presently AI</b><small>AI PRESENTATION COACH</small></div></div>
    <div className="auth-eyebrow">YOUR PERSONAL PRESENTATION COACH</div>
    <h1>{mode === 'login' ? 'ยินดีต้อนรับกลับมา' : 'สร้างบัญชีฟรี'}</h1>
    <p className="auth-subtitle">เข้าสู่ระบบเพื่อบันทึกโปรเจกต์และฝึกนำเสนอได้ทุกที่</p>
    <div className="auth-tabs"><button type="button" className={mode === 'login' ? 'selected' : ''} onClick={() => { setMode('login'); setError(''); }}>เข้าสู่ระบบ</button><button type="button" className={mode === 'register' ? 'selected' : ''} onClick={() => { setMode('register'); setError(''); }}>สมัครสมาชิก</button></div>
    {GOOGLE_CLIENT_ID ? <div id="google-signin-button" className="google-signin"/> : <div className="google-unavailable">เข้าสู่ระบบด้วย Google: ต้องตั้งค่า VITE_GOOGLE_CLIENT_ID ก่อน</div>}
    <div className="auth-divider"><span/>หรือใช้อีเมล<span/></div>
    <form onSubmit={submit}>
      {mode === 'register' && <label>ชื่อที่ใช้แสดง<input value={name} onChange={e => setName(e.target.value)} required maxLength={60} autoComplete="name" placeholder="ชื่อของคุณ"/></label>}
      <label>อีเมล<input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com"/></label>
      <label>รหัสผ่าน<input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} maxLength={128} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="อย่างน้อย 8 ตัวอักษร"/></label>
      {error && <div className="auth-error" role="alert">{error}</div>}
      <button className="btn-primary auth-submit" type="submit" disabled={busy}>{busy ? 'กำลังดำเนินการ…' : mode === 'login' ? 'เข้าสู่ระบบ →' : 'สมัครสมาชิกฟรี →'}</button>
    </form>
    <p className="auth-free-note">ใช้งานฟรีทุกฟีเจอร์ ไม่มี Free plan หรือ Pro plan</p>
  </section></main>;
}

// Mount the application.
createRoot(document.getElementById('root')).render(<App/>);
