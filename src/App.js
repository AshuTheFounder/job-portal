import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./App.css";
import { auth, provider } from "./firebase"; 
import { signInWithPopup, signOut, onAuthStateChanged, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// Fix for Leaflet's default marker icons in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const lang = {
  en: { appName: "JobHub", statTotalJobs: "Total jobs", statApplicants: "Applicants", statHired: "Hired", yourJobs: "Your jobs", platformTotals: "Platform totals", tagline: "Find your next opportunity", sub: "Jobs for everyone — cities, towns & villages", searchPlaceholder: "Job title or company...", search: "Search", allTypes: "All types", allLevels: "All levels", entry: "Entry", mid: "Mid", senior: "Senior", browseJobs: "Browse Jobs", aiMatch: "AI Match", saved: "Saved", mapView: "Map View", viewApplicants: "View Applicants", allApplications: "All Applications", noApplicationsYet: "No applications yet. Post a job to start receiving applications.", applyNow: "Apply Now", save: "Save", saved2: "Saved", location: "Location", type: "Type", salary: "Salary", level: "Level", aboutRole: "About the role", requirements: "Requirements", skills: "Skills", posted: "Posted", fullTime: "Full-time", partTime: "Part-time", remote: "Remote", internship: "Internship", dailyWage: "Daily Wage", farming: "Farming", construction: "Construction", teaching: "Teaching", healthcare: "Healthcare", aiMatchTitle: "AI Job Matching", aiMatchSub: "Tell us your skills and we'll find the best jobs for you", aiPlaceholder: "e.g. I know driving, farming, construction work, stitching...", matchBtn: "Find My Jobs ✨", matching: "Finding matches...", topMatches: "Your Top Matches", savedJobs: "Saved Jobs", noSaved: "No saved jobs yet", postTitle: "Post a Job", jobTitle: "Job Title", companyName: "Company / Owner Name", jobLocation: "Location (Village / City)", jobSalary: "Salary / Wages", jobType: "Job Type", jobDomain: "Domain", jobDesc: "Job Description", applicationDeadline: "Application Deadline", publish: "Publish Job", fillAll: "Please fill all fields", deadlineExpired: "Applications closed", daysLeft: "days left", applySoon: "Apply soon!", jobPublished: "Job published! ✅", appSubmitted: "Application submitted! ✅", jobSavedMsg: "Job saved! ⭐", jobRemovedMsg: "Removed from saved", noJobs: "No jobs found", owner: "Owner (Hiring)", customer: "Customer (Finding Jobs)", employer: "Employer", employee: "Employee", businessProfile: "Business Profile", employerDash: "Staff & Attendance", employeeDash: "Employee Tracker", addEmployee: "+ Add Employee", addEmployeeTitle: "Add a Worker", employeeName: "Worker's Name", employeeRole: "Work / Role", wageType: "Pay Type", dailyWageOpt: "Daily Wage", monthlyWageOpt: "Monthly Salary", wageAmount: "Amount (₹)", addBtn: "Add Worker", employeeAdded: "Worker added! ✅", noEmployees: "No workers added yet. Add your first worker to start tracking attendance.", selectEmployeeMsg: "Select a worker to view & mark attendance", thisMonth: "This Month", daysPresent: "Days Present", daysLeave: "Days on Leave", estSalary: "Estimated Salary", tapToMark: "Tap a date to mark Present (green) or Leave (orange)", legendPresent: "Present", legendLeave: "On Leave", legendUnmarked: "Not marked", removeWorker: "Remove Worker", perDay: "/day", perMonth: "/month", confirmRemove: "Remove this worker?", applyFormTitle: "Apply for this job", yourName: "Your Name", yourPhone: "Phone Number", yourMessage: "Tell the employer about yourself (optional)", cancel: "Cancel", submitApplication: "Submit Application", applicantsLabel: "applicants", noApplicants: "No applications yet", yourPostedJobs: "Your Posted Jobs & Applicants", noPostedJobsYet: "You haven't posted any jobs yet.", markHired: "Mark as Hired", hired: "Hired ✅", appliedOn: "Applied", verifiedEmployer: "Verified Employer", reportSuccess: "Reported! Thanks for keeping it safe.", hiresCount: "People hired", voiceSearch: "बोलकर खोजो", readAloud: "Read aloud", womenOnly: "Women-only", familyFriendly: "Family-friendly", governmentScheme: "Govt scheme", shareWhatsApp: "Share on WhatsApp", reportThis: "Report job", online: "🟢 Online", offline: "🔴 Offline", voiceUnavailable: "Voice search not available", readUnavailable: "Read-aloud not available", selectJob: "Select a job to see details", jobsNearby: "jobs in this area", tapPinToView: "Tap any pin to view job details", showOnMap: "Show on Map", allAreas: "All Areas", postJob: "+ Post Job" },
  hi: { appName: "जॉबहब", statTotalJobs: "कुल नौकरियां", statApplicants: "आवेदक", statHired: "नियुक्त", yourJobs: "आपकी नौकरियां", platformTotals: "प्लेटफ़ॉर्म कुल", tagline: "अपनी अगली नौकरी खोजें", sub: "सभी के लिए नौकरी — शहर, कस्बे और गाँव", searchPlaceholder: "नौकरी या कंपनी खोजें...", search: "खोजें", allTypes: "सभी प्रकार", allLevels: "सभी स्तर", entry: "शुरुआती", mid: "मध्यम", senior: "वरिष्ठ", browseJobs: "नौकरी देखें", aiMatch: "AI मिलान", saved: "सहेजे", mapView: "नक्शा देखें", viewApplicants: "आवेदक देखें", allApplications: "सभी आवेदन", noApplicationsYet: "अभी तक कोई आवेदन नहीं। नौकरी डालें।", applyNow: "अभी आवेदन करें", save: "सहेजें", saved2: "सहेजा", location: "स्थान", type: "प्रकार", salary: "वेतन", level: "स्तर", aboutRole: "नौकरी के बारे बारे में", requirements: "आवश्यकताएं", skills: "कौशल", posted: "पोस्ट किया", fullTime: "पूर्णकालिक", partTime: "अंशकालिक", remote: "घर से काम", internship: "इंटर्नशिप", dailyWage: "दैनिक मजदूरी", farming: "खेती", construction: "निर्माण", teaching: "शिक्षण", healthcare: "स्वास्थ्य", aiMatchTitle: "AI नौकरी मिलान", aiMatchSub: "अपने कौशल बताएं और हम आपके लिए सबसे अच्छी नौकरी ढूंढेंगे", aiPlaceholder: "जैसे: मुझे गाड़ी चलाना, खेती, निर्माण कार्य, सिलाई आता है...", matchBtn: "मेरी नौकरी खोजें ✨", matching: "मिलान हो रहा है...", topMatches: "आपके लिए सबसे अच्छी नौकरियां", savedJobs: "सहेजी गई नौकरियां", noSaved: "कोई नौकरी सहेजी नहीं", postTitle: "नौकरी डालें", jobTitle: "नौकरी का नाम", companyName: "कंपनी / मालिक का नाम", jobLocation: "स्थान (गाँव / शहर)", jobSalary: "वेतन / मजदूरी", jobType: "नौकरी का प्रकार", jobDomain: "क्षेत्र", jobDesc: "नौकरी का विवरण", applicationDeadline: "आवेदन की अंतिम तारीख", publish: "नौकरी प्रकाशित करें", fillAll: "कृपया सभी जानकारी भरें", deadlineExpired: "आवेदन बंद", daysLeft: "दिन बाकी", applySoon: "जल्दी आवेदन करें!", jobPublished: "नौकरी प्रकाशित हो गई! ✅", appSubmitted: "आवेदन हो गया! ✅", jobSavedMsg: "नौकरी सहेजी! ⭐", jobRemovedMsg: "हटा दिया गया", noJobs: "कोई नौकरी नहीं मिली", owner: "मालिक (भर्ती)", customer: "कामगार (काम खोज)", employer: "नियोक्ता", employee: "कर्मचारी", businessProfile: "व्यवसाय प्रोफ़ाइल", employerDash: "स्टाफ़ और हाज़िरी", employeeDash: "कर्मचारी ट्रैकर", addEmployee: "+ कर्मचारी जोड़ें", addEmployeeTitle: "कर्मचारी जोड़ें", employeeName: "कर्मचारी का नाम", employeeRole: "काम / पद", wageType: "वेतन प्रकार", dailyWageOpt: "दैनिक मजदूरी", monthlyWageOpt: "मासिक वेतन", wageAmount: "राशि (₹)", addBtn: "कर्मचारी जोड़ें", employeeAdded: "कर्मचारी जोड़ा गया! ✅", noEmployees: "अभी तक कोई कर्मचारी नहीं जोड़ा गया।", selectEmployeeMsg: "हाज़िरी देखने के लिए कर्मचारी चुनें", thisMonth: "इस महीने", daysPresent: "उपस्थित दिन", daysLeave: "छुट्टी के दिन", estSalary: "अनुमानित वेतन", tapToMark: "तारीख पर टैप करें — उपस्थित या छुट्टी", legendPresent: "उपस्थित", legendLeave: "छुट्टी", legendUnmarked: "अंकित नहीं", removeWorker: "कर्मचारी हटाएं", perDay: "/दिन", perMonth: "/महीना", confirmRemove: "इस कर्मचारी को हटाएं?", applyFormTitle: "इस नौकरी के लिए आवेदन करें", yourName: "आपका नाम", yourPhone: "फ़ोन नंबर", yourMessage: "अपने बारे बारे में बताएं (वैकल्पिक)", cancel: "रद्द करें", submitApplication: "आवेदन भेजें", applicantsLabel: "आवेदक", noApplicants: "अभी कोई आवेदन नहीं", yourPostedJobs: "आपकी डाली गई नौकरियां", noPostedJobsYet: "आपने अभी तक कोई नौकरी नहीं डाली।", markHired: "नियुक्त करें", hired: "नियुक्त ✅", appliedOn: "आवेदन किया", verifiedEmployer: "सत्यापित नियोक्ता", reportSuccess: "रिपोर्ट हो गई! धन्यवाद।", hiresCount: "लोग नियुक्त", voiceSearch: "बोलकर खोजो", readAloud: "पढ़कर सुनें", womenOnly: "महिलाओं के लिए", familyFriendly: "परिवार के लिए ठीक", governmentScheme: "सरकारी योजना", shareWhatsApp: "WhatsApp पर शेयर करें", reportThis: "रिपोर्ट करें", online: "🟢 ऑनलाइन", offline: "🔴 ऑफ़लाइन", voiceUnavailable: "वॉइस सर्च उपलब्ध नहीं", readUnavailable: "पढ़कर सुनना उपलब्ध नहीं", selectJob: "विवरण देखने के लिए नौकरी चुनें", jobsNearby: "नौकरियां इस क्षेत्र में", tapPinToView: "नौकरी देखने के लिए पिन पर टैप करें", showOnMap: "नक्शे पर दिखाएं", allAreas: "सभी क्षेत्र", postJob: "+ नौकरी डालें" },
  mr: { appName: "जॉबहब", statTotalJobs: "कुल काम", statApplicants: "अरजीकर्ता", statHired: "रख्या", yourJobs: "आपणा काम", platformTotals: "कुल जमा", tagline: "आपणो काम खोजो", sub: "सगळा माटे काम — शहर, कस्बो अर गाँव", searchPlaceholder: "काम या मालिक खोजो...", search: "खोजो", allTypes: "सगळा प्रकार", allLevels: "सगळा स्तर", entry: "नवो", mid: "बिचलो", senior: "पुरानो", browseJobs: "काम देखो", aiMatch: "AI मिलान", saved: "राखेला", mapView: "नक्शो देखो", viewApplicants: "अरजी देखो", allApplications: "सगळी अरजी", noApplicationsYet: "अबी कोई अरजी कोनी। काम डालो।", applyNow: "अबी अरजी करो", save: "राखो", saved2: "राख्यो", location: "जगह", type: "प्रकार", salary: "तनख्वाह", level: "स्तर", aboutRole: "काम के बारे में", requirements: "जरूरत", skills: "हुनर", posted: "डाल्यो", fullTime: "पूरो टेम", partTime: "आधो टेम", remote: "घर से काम", internship: "सीखणो", dailyWage: "रोज री मजदूरी", farming: "खेती", construction: "निर्माण", teaching: "पढ़ाणो", healthcare: "सेहत", aiMatchTitle: "AI काम मिलान", aiMatchSub: "आपणो हुनर बताओ अर हम आपणे माटे काम ढूंढां", aiPlaceholder: "जैसे: मने गाड़ी चलाणो, खेती, राज मिस्त्री, सिलाई आवे...", matchBtn: "म्हारो काम खोजो ✨", matching: "मिलान हो रह्यो है...", topMatches: "आपणे माटे सबसे बढ़िया काम", savedJobs: "राखेला काम", noSaved: "कोई काम नी राख्यो", postTitle: "काम डालो", jobTitle: "काम रो नाम", companyName: "कंपनी / मालिक रो नाम", jobLocation: "जगह (गाँव / शहर)", jobSalary: "तनख्वाह / मजदूरी", jobType: "काम रो प्रकार", jobDomain: "काम रो क्षेत्र", jobDesc: "काम रो विवरण", applicationDeadline: "अरजी री आखरी तारीख", publish: "काम प्रकाशित करो", fillAll: "कृपया सगळी जानकारी भरो", deadlineExpired: "अरजी बंद", daysLeft: "दिन बाकी", applySoon: "जल्दी अरजी करो!", jobPublished: "काम प्रकाशित हो ग्यो! ✅", appSubmitted: "अरजी हो गी! ✅", jobSavedMsg: "काम राख्यो! ⭐", jobRemovedMsg: "हटा द्यो", noJobs: "कोई काम नी मिल्यो", owner: "मालिक (भर्ती)", customer: "कामगार (काम खोज)", employer: "मालिक", employee: "कामगार", businessProfile: "व्यवसाय प्रोफाइल", employerDash: "कामगार अर हाजरी", employeeDash: "कामगार ट्रैकर", addEmployee: "+ कामगार जोड़ो", addEmployeeTitle: "कामगार जोड़ो", employeeName: "कामगार रो नाम", employeeRole: "काम / पद", wageType: "तनख्वाह प्रकार", dailyWageOpt: "रोज री मजदूरी", monthlyWageOpt: "मासिक तनख्वाह", wageAmount: "राशि (₹)", addBtn: "कामगार जोड़ो", employeeAdded: "कामगार जुड़ ग्यो! ✅", noEmployees: "अबी कोई कामगार नी जोड्यो।", selectEmployeeMsg: "हाजरी देखणे माटे कामगार चुनो", thisMonth: "इण महीने", daysPresent: "आयेला दिन", daysLeave: "छुट्टी रा दिन", estSalary: "अनुमानित तनख्वाह", tapToMark: "तारीख पर टैप करो — आयो या छुट्टी", legendPresent: "आयो", legendLeave: "छुट्टी", legendUnmarked: "नी भर्यो", removeWorker: "कामगार हटाओ", perDay: "/दिन", perMonth: "/महीनो", confirmRemove: "इण कामगार ने हटाओ?", applyFormTitle: "इस नौकरी के लिए आवेदन करें", yourName: "आपणो नाम", yourPhone: "फ़ोन नंबर", yourMessage: "आपणे बारे में बताओ (वैकल्पिक)", cancel: "रद्द करो", submitApplication: "अरजी भेजो", applicantsLabel: "अरजीकर्ता", noApplicants: "अबी कोई अरजी कोनी", yourPostedJobs: "आपणा डाल्या काम", noPostedJobsYet: "आपणे अबी कोई काम नी डाल्यो।", markHired: "रख ल्यो", hired: "रख्यो ✅", appliedOn: "अरजी करी", verifiedEmployer: "सत्यापित मालिक", reportSuccess: "रिपोर्ट हो गी! धन्यवाद।", hiresCount: "लोग रख्या", voiceSearch: "बोलकर खोजो", readAloud: "पढ़कर सुनाओ", womenOnly: "महिलाओं माटे", familyFriendly: "परिवार माटे ठीक", governmentScheme: "सरकारी योजना", shareWhatsApp: "WhatsApp पर शेयर करो", reportThis: "रिपोर्ट करो", online: "🟢 ऑनलाइन", offline: "🔴 ऑफ़लाइन", voiceUnavailable: "वॉइस सर्च उपलब्ध नी", readUnavailable: "पढ़कर सुनाणो उपलब्ध नी", selectJob: "काम चुनो तो विवरण देखो", jobsNearby: "काम इण क्षेत्र में", tapPinToView: "काम देखणे माटे पिन पर टैप करो", showOnMap: "नक्शे पर देखो", allAreas: "सगळा क्षेत्र", postJob: "+ काम डालो" }
};

const initialJobs = [
  { id: 1, title: "Driver / ड्राइवर", company: "Rajesh Transport", location: "Neemuch, MP", salary: "₹15,000/month", type: "Full-time", domain: "Transport", exp: "Entry", desc: "Need experienced driver for goods transport between Neemuch-Mandsaur-Indore route. Must have valid license.", req: ["Valid driving license", "2+ years experience", "Knowledge of MP roads"], skills: ["Driving", "Navigation"], posted: "Today", verified: true, hires: 24, gender: "all", scheme: "Transport Incentive", lat: 24.4735, lng: 74.8692 },
  { id: 2, title: "Kisan Sahayak / किसान सहायक", company: "Mandsaur Krishi Farm", location: "Mandsaur, MP", salary: "₹400/day", type: "Daily Wage", domain: "Farming", exp: "Entry", desc: "Kaam: Fasal katai, beej bona, khet ki dekhbhal. Soyabean aur garlic farm pe kaam.", req: ["Farming knowledge", "Physical fitness", "Local resident preferred"], skills: ["Farming", "Harvesting"], posted: "Today", verified: false, hires: 8, gender: "all", scheme: "Agri Support", lat: 24.0553, lng: 75.0688 },
  { id: 3, title: "Silai Mistri / सिलाई मिस्त्री", company: "Pooja Garment Center", location: "Jawad, Neemuch", salary: "₹8,000–12,000/month", type: "Full-time", domain: "Skilled Work", exp: "Mid", desc: "Ladies tailor needed for suit, salwar, blouse stitching. Experience in Rajasthani and MP style preferred.", req: ["Stitching experience", "Knowledge of designs", "Own machine preferred"], skills: ["Stitching", "Designing"], posted: "Yesterday", verified: true, hires: 15, gender: "women-only", scheme: "Skill Program", lat: 24.6012, lng: 74.8530 },
  { id: 4, title: "Raj Mistri / राज मिस्त्री", company: "Sharma Construction", location: "Mandsaur, MP", salary: "₹600/day", type: "Daily Wage", domain: "Construction", exp: "Mid", desc: "Experienced mason needed for house construction. Plastering, brickwork, and finishing work.", req: ["5+ years masonry", "Plastering skills", "Team player"], skills: ["Masonry", "Plastering"], posted: "2 days ago", verified: true, hires: 28, gender: "family-friendly", scheme: "Housing Scheme", lat: 24.0720, lng: 75.0810 },
  { id: 5, title: "School Teacher / स्कूल शिक्षक", company: "Saraswati Vidya Mandir", location: "Singoli, Mandsaur", salary: "₹12,000/month", type: "Full-time", domain: "Teaching", exp: "Mid", desc: "Hindi and Social Science teacher needed for classes 6-10. B.Ed preferred.", req: ["B.Ed or equivalent", "Hindi medium teaching", "Patient and dedicated"], skills: ["Teaching", "Hindi", "Social Science"], posted: "3 days ago", verified: true, hires: 20, gender: "women-only", scheme: "Education Drive", lat: 24.1200, lng: 75.1200 },
  { id: 6, title: "Medical Store Helper", company: "Jan Aushadhi Kendra", location: "Neemuch, MP", salary: "₹7,000/month", type: "Full-time", domain: "Healthcare", exp: "Entry", desc: "Helper needed at medical store. Basic medicine knowledge helpful. 10th pass minimum.", req: ["10th pass", "Basic reading/writing", "Honest and punctual"], skills: ["Customer service", "Basic maths"], posted: "Today", verified: false, hires: 9, gender: "all", scheme: "Health Scheme", lat: 24.4680, lng: 74.8750 },
  { id: 7, title: "Mobile Repair / मोबाइल मिस्त्री", company: "Raju Mobile Shop", location: "Mandsaur, MP", salary: "₹10,000/month", type: "Full-time", domain: "Technical", exp: "Entry", desc: "Mobile phone repair technician needed. Screen replacement, charging port, software issues.", req: ["Mobile repair knowledge", "Basic tools", "Eager to learn"], skills: ["Mobile repair", "Hardware", "Software"], posted: "4 days ago", verified: false, hires: 7, gender: "all", scheme: "Skill Program", lat: 24.0600, lng: 75.0600 },
  { id: 8, title: "Anganwadi Helper", company: "Govt. of MP", location: "Villages, Mandsaur", salary: "₹5,000/month", type: "Full-time", domain: "Government", exp: "Entry", desc: "Anganwadi sahayika needed for village child care center. Local women preferred.", req: ["8th pass minimum", "Local resident", "Care for children"], skills: ["Childcare", "Cooking"], posted: "1 week ago", verified: true, hires: 55, gender: "women-only", scheme: "MGNREGA", lat: 24.0400, lng: 75.0400 },
];

const colors = [
  { bg: "#E6F1FB", text: "#185FA5" }, { bg: "#EAF3DE", text: "#3B6D11" },
  { bg: "#EEEDFE", text: "#3C3489" }, { bg: "#FAEEDA", text: "#854F0B" },
  { bg: "#FAECE7", text: "#993C1D" }, { bg: "#FBEAF0", text: "#993556" },
  { bg: "#E1F5EE", text: "#0F6E56" }, { bg: "#FCEBEB", text: "#A32D2D" },
];

const domainColors = {
  "Transport": "#3B82F6", "Farming": "#16A34A", "Skilled Work": "#D97706",
  "Construction": "#B45309", "Teaching": "#7C3AED", "Healthcare": "#DC2626",
  "Technical": "#0891B2", "Government": "#1D4ED8", "Services": "#9333EA",
  "Trading": "#EA580C", "default": "#f97316",
};

function initials(name) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function JobMap({ jobs, onSelectJob, selectedJobId, language }) {
  const t_map = { en: { tapPin: "Tap a pin to view job details", noJobs: "No jobs to show" }, hi: { tapPin: "नौकरी देखने के लिए पिन पर टैप करें", noJobs: "कोई नौकरी नहीं" }, mr: { tapPin: "काम देखणे माटे पिन पर टैप करो", noJobs: "कोई काम नी" } };
  const tm = t_map[language] || t_map.en;
  const mapCenter = [24.26, 74.96];
  const jobsWithPos = jobs.filter((j) => j.lat && j.lng);

  return (
    <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
      <MapContainer center={mapCenter} zoom={10} style={{ width: "100%", height: "420px", zIndex: 1 }}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {jobsWithPos.map((job) => (
          <Marker key={job.id} position={[job.lat, job.lng]} eventHandlers={{ click: () => onSelectJob(job) }}>
            <Popup><strong style={{ fontSize: "14px" }}>{job.title}</strong><br /><span style={{ color: "#666" }}>{job.company}</span><br /><span style={{ color: "#c2410c", fontWeight: "bold" }}>{job.salary}</span></Popup>
          </Marker>
        ))}
      </MapContainer>
      <div style={{ padding: "8px 14px", background: "#FFF7ED", borderTop: "1px solid #FED7AA", fontSize: 12, color: "#92400E", textAlign: "center" }}>📍 {tm.tapPin} · {jobsWithPos.length} jobs shown</div>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null); 
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [language, setLanguage] = useState("en");
  const [page, setPage] = useState("browse");
  const [selectedJob, setSelectedJob] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterExp, setFilterExp] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterScheme, setFilterScheme] = useState("");
  const [reportedJobs, setReportedJobs] = useState([]);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [userMode, setUserMode] = useState("customer");
  const [toast, setToast] = useState("");
  const [postedJobs, setPostedJobs] = useState([]);
  const [postForm, setPostForm] = useState({ title: "", company: "", location: "", salary: "", type: "Full-time", domain: "Farming", desc: "", deadline: "" });
  const [businessProfile, setBusinessProfile] = useState({ name: "Rajesh Transport", owner: "Rajesh Kumar", location: "Neemuch, MP", description: "Reliable local transport service.", contact: "+91 98765 43210", website: "", tags: ["Transport", "Local", "Verified"] });
  const [aiSkills, setAiSkills] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [employees, setEmployees] = useState([
    { id: 1, name: "Ramesh Kumar", role: "Driver", wageType: "daily", wageAmount: 500, attendance: {}, experience: 18, rating: 4.3 },
    { id: 2, name: "Sunita Bai", role: "Silai Mistri", wageType: "monthly", wageAmount: 9000, attendance: {}, experience: 24, rating: 4.8 },
  ]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [empForm, setEmpForm] = useState({ name: "", role: "", wageType: "daily", wageAmount: "" });
  const [applications, setApplications] = useState([]);
  const [applyingJob, setApplyingJob] = useState(null);
  const [applyForm, setApplyForm] = useState({ name: "", phone: "", message: "" });
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [online, setOnline] = useState(navigator.onLine);
  const [darkMode, setDarkMode] = useState(false);
  const [mapAreaFilter, setMapAreaFilter] = useState("");
  
  // NEW STATE VARIABLES FOR OTP LOGIN
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  const t = lang[language];
  const allJobs = [...postedJobs, ...initialJobs];

  // Recaptcha initialization
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Login Functions
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      showToast("Logged in successfully! ✅");
    } catch (error) {
      alert("FIREBASE ERROR: " + error.code + "\n" + error.message);
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    showToast("Logged out.");
  };

  const requestOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) { 
      showToast("Enter a valid phone number"); 
      return; 
    }
    try {
      showToast("Sending OTP...");
      const formattedNumber = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`;
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
      setConfirmationResult(result);
      showToast("OTP sent! ✅");
    } catch (error) {
      showToast("Error: " + error.message);
      console.error(error);
    }
  };

  const verifyOTP = async () => {
    if (!otp) return;
    try {
      await confirmationResult.confirm(otp);
      showToast("Login Successful! 🎉");
      setShowLoginModal(false);
      setConfirmationResult(null);
      setPhoneNumber("");
      setOtp("");
    } catch (error) {
      showToast("Wrong OTP! ❌");
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    const onlineHandler = () => setOnline(true);
    const offlineHandler = () => setOnline(false);
    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);
    return () => { window.removeEventListener("resize", handleResize); window.removeEventListener("online", onlineHandler); window.removeEventListener("offline", offlineHandler); };
  }, []);

  useEffect(() => {
    try { if (darkMode) document.documentElement.classList.add("dark-mode"); else document.documentElement.classList.remove("dark-mode"); } catch (e) {}
  }, [darkMode]);

  // --- GET ROUTE (Fetch from MySQL via Python) ---
  useEffect(() => {
    async function fetchJobsFromPython() {
      try {
        const response = await fetch(`https://job-portal-334v.onrender.com/jobs?t=${new Date().getTime()}`);
        const data = await response.json();
        setPostedJobs(data.jobs); 
        console.log("Python se data aa gaya:", data.jobs);
      } catch (error) { 
        console.error("Backend se data nahi aaya, check karo server chalu hai ya nahi: ", error); 
      }
    }
    fetchJobsFromPython();
  }, []);

  const filtered = allJobs.filter((job) => {
    const query = search.toLowerCase();
    const matchQuery = !query || job.title.toLowerCase().includes(query) || job.company.toLowerCase().includes(query) || job.location.toLowerCase().includes(query);
    const matchType = !filterType || job.type === filterType;
    const matchExp = !filterExp || job.exp === filterExp;
    const matchGender = !filterGender || job.gender === filterGender;
    const matchScheme = !filterScheme || Boolean(job.scheme);
    return matchQuery && matchType && matchExp && matchGender && matchScheme;
  });

  const mapFilteredJobs = mapAreaFilter ? allJobs.filter(j => j.location.toLowerCase().includes(mapAreaFilter.toLowerCase())) : allJobs;

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2500); }
  function toggleSave(job) { if (savedJobs.find((j) => j.id === job.id)) { setSavedJobs(savedJobs.filter((j) => j.id !== job.id)); showToast(t.jobRemovedMsg); } else { setSavedJobs([...savedJobs, job]); showToast(t.jobSavedMsg); } }

  // --- POST ROUTE (Send Data to Python/MySQL) ---
  async function handlePost() {
    if (!postForm.title || !postForm.company || !postForm.desc) { showToast(t.fillAll); return; }
    
    try {
      showToast("Publishing to cloud database...");
      
      const response = await fetch("https://job-portal-334v.onrender.com/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: postForm.title,
          company: postForm.company,
          location: postForm.location,
          salary: postForm.salary,
          type: postForm.type,
          description: postForm.desc
        })
      });

      if (response.ok) {
        setPostForm({ title: "", company: "", location: "", salary: "", type: "Full-time", domain: "Farming", desc: "", deadline: "" });
        showToast("Job published! ✅");
        
        const refreshRes = await fetch(`https://job-portal-334v.onrender.com/jobs?t=${new Date().getTime()}`);
        const freshData = await refreshRes.json();
        setPostedJobs(freshData.jobs);
        
        setPage("browse"); 
      } else {
        showToast("Error saving job to MySQL!");
      }
    } catch (error) { 
      console.error("Backend error: ", error); 
      showToast("Error saving job!"); 
    }
  }

  function openApply(job) { setApplyingJob(job); setApplyForm({ name: "", phone: "", message: "" }); }
  function submitApplication() {
    if (!applyForm.name.trim() || !applyForm.phone.trim()) { showToast(t.fillAll); return; }
    const newApp = { id: Date.now(), jobId: applyingJob.id, jobTitle: applyingJob.title, name: applyForm.name.trim(), phone: applyForm.phone.trim(), message: applyForm.message.trim(), status: "pending", rating: 0, appliedAt: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }) };
    setApplications([newApp, ...applications]); setApplyingJob(null); showToast(t.appSubmitted);
  }

  function toggleHired(appId) { setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status: a.status === "hired" ? "pending" : "hired" } : a))); }
  function rateApplication(appId, value) { setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, rating: value } : a))); }

  async function runAIMatch() {
    if (!aiSkills.trim()) { showToast(t.fillAll); return; }
    if (!process.env.REACT_APP_GROQ_KEY) { setAiResult("⚠️ ERROR: API Key nahi mili! Terminal mein 'npm start' ko band (Ctrl+C) karke wapis chalao."); return; }
    setAiLoading(true); setAiResult("");
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST", headers: { "Authorization": `Bearer ${process.env.REACT_APP_GROQ_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama-3.1-8b-instant", temperature: 0.2, messages: [{ role: "system", content: `You are a strict, highly accurate job matching assistant for JobHub. Your ONLY job is to match the user's skills with the provided job list.\n\nRULES:\n1. ONLY suggest jobs that are explicitly present in the provided list. Do not invent or assume jobs.\n2. Look for DIRECT MATCHES first (e.g., if user says 'driver', find the job with 'driver' in title).\n3. Output the exact Job Title, Location, and a short 1-line reason why it matches.\n4. Reply strictly in ${language === "hi" ? "Hindi" : language === "mr" ? "Marathi" : "English"}.` }, { role: "user", content: `My exact skills/requirements are: "${aiSkills}". \n\nHere is the Available Jobs List: \n${allJobs.map(j => `[Title: ${j.title}, Location: ${j.location}, Description: ${j.desc}]`).join(" | ")}` }] })
      });
      const data = await response.json();
      if (!response.ok) { setAiResult(`❌ Server ne bola: ${data.error?.message || "Format galat hai"}`); setAiLoading(false); return; }
      setAiResult(data.choices[0].message.content);
    } catch (error) { setAiResult(`❌ System Error: ${error.message}`); }
    setAiLoading(false);
  }
  function reportJob(jobId) { setReportedJobs([...reportedJobs, jobId]); showToast(t.reportSuccess); }
  function readJobAloud(job) { if (!window.speechSynthesis) { showToast(t.readUnavailable); return; } const utterance = new SpeechSynthesisUtterance(`${job.title}. ${job.company}. ${job.location}. ${job.desc}`); utterance.lang = language === "hi" ? "hi-IN" : "en-US"; window.speechSynthesis.speak(utterance); }
  function startVoiceSearch() { const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) { showToast(t.voiceUnavailable); return; } setVoiceLoading(true); try { const r = new SR(); r.lang = language === "hi" ? "hi-IN" : "en-US"; r.onresult = (e) => { setSearch(e.results[0][0].transcript); setVoiceLoading(false); }; r.onerror = () => setVoiceLoading(false); r.onend = () => setVoiceLoading(false); r.start(); } catch { setVoiceLoading(false); } }
  function shareWhatsApp(job) { const text = `${job.title} at ${job.company} in ${job.location}. Salary: ${job.salary}. Apply now on JobHub!`; window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank"); }
  function copyProfileLink() { navigator.clipboard.writeText(window.location.href + "?profile=" + encodeURIComponent(businessProfile.name)).then(() => showToast("Profile link copied!")); }
  function dateKey(y, m, d) { return `${y}-${m}-${d}`; }
  function handleAddEmployee() { if (!empForm.name || !empForm.role || !empForm.wageAmount) { showToast(t.fillAll); return; } setEmployees([{ id: Date.now(), name: empForm.name, role: empForm.role, wageType: empForm.wageType, wageAmount: Number(empForm.wageAmount), attendance: {}, experience: 0, rating: 0 }, ...employees]); setEmpForm({ name: "", role: "", wageType: "daily", wageAmount: "" }); showToast(t.employeeAdded); }
  function removeEmployee(id) { if (!window.confirm(t.confirmRemove)) return; setEmployees(employees.filter((e) => e.id !== id)); if (selectedEmployee?.id === id) setSelectedEmployee(null); }
  function cycleAttendance(empId, key) { const cycle = (att) => { const n = { ...att }; if (!n[key]) n[key] = "present"; else if (n[key] === "present") n[key] = "leave"; else delete n[key]; return n; }; setEmployees((prev) => prev.map((e) => e.id !== empId ? e : { ...e, attendance: cycle(e.attendance) })); setSelectedEmployee((prev) => prev?.id !== empId ? prev : { ...prev, attendance: cycle(prev.attendance) }); }
  function monthStats(emp, year, month) { const prefix = `${year}-${month}-`; let present = 0, leave = 0; Object.keys(emp.attendance).forEach((k) => { if (k.startsWith(prefix)) { if (emp.attendance[k] === "present") present++; else if (emp.attendance[k] === "leave") leave++; } }); const salary = emp.wageType === "daily" ? present * emp.wageAmount : Math.max(0, Math.round(emp.wageAmount - leave * (emp.wageAmount / 30))); return { present, leave, salary }; }

  const now = new Date(); const year = now.getFullYear(); const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = now.toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", { month: "long", year: "numeric" });
  const ownerJobs = postedJobs; const totalOwnerJobs = ownerJobs.length; const ownerApplicants = applications.filter((a) => ownerJobs.some((j) => j.id === a.jobId)).length; const ownerHired = applications.filter((a) => a.status === "hired" && ownerJobs.some((j) => j.id === a.jobId)).length; const totalJobsGlobal = allJobs.length; const totalApplicantsGlobal = applications.length; const totalHiredGlobal = applications.filter((a) => a.status === "hired").length;

  // --- NAYA BLUE & MINIMALIST THEME (NAUKRI / INDEED STYLE) ---
  const s = {
    app: { fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh", background: "#F3F4F6", color: "#1F2937" }, 
    logo: { fontWeight: 900, fontSize: 22, color: "#2563EB", display: "flex", alignItems: "center", gap: 8, letterSpacing: "-0.5px" }, 
    dot: { width: 12, height: 12, background: "#2563EB", borderRadius: "2px", transform: "rotate(45deg)" }, 
    langBtn: (active) => ({ background: active ? "#EFF6FF" : "#fff", color: active ? "#1D4ED8" : "#4B5563", border: active ? "1px solid #BFDBFE" : "1px solid #D1D5DB", borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer", fontWeight: active ? 700 : 600 }),
    navBtn: (active) => ({ background: active ? "#EFF6FF" : "transparent", border: "none", padding: "8px 14px", borderRadius: 8, fontSize: 14, cursor: "pointer", color: active ? "#1D4ED8" : "#4B5563", fontWeight: active ? 700 : 600, transition: "all 0.2s" }),
    postBtn: { background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)" },
    statusBadge: { padding: "5px 10px", borderRadius: 8, fontSize: 11, background: online ? "#DCFCE7" : "#FEE2E2", color: online ? "#166534" : "#B91C1C", fontWeight: 700, border: online ? "1px solid #BBF7D0" : "1px solid #FECACA" },
    
    hero: { background: "#ffffff", padding: "3.5rem 1rem 3rem", textAlign: "center", borderBottom: "1px solid #E5E7EB", marginBottom: "1rem" },
    h1: { fontSize: 32, fontWeight: 900, color: "#111827", marginBottom: 12, letterSpacing: "-1px" },
    sub: { color: "#6B7280", fontSize: 16, marginBottom: "2rem", fontWeight: 500 },
    searchRow: { display: "flex", gap: 6, maxWidth: 700, margin: "0 auto", background: "#fff", border: "1px solid #D1D5DB", borderRadius: 999, padding: "6px 8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" },
    input: { flex: 1, minWidth: 160, padding: "10px 16px", border: "none", fontSize: 15, outline: "none", background: "transparent", color: "#111827" },
    searchBtn: { background: "#2563EB", color: "#fff", border: "none", borderRadius: 999, padding: "12px 24px", fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "background 0.2s" },
    voiceBtn: { background: "transparent", color: "#6B7280", border: "none", padding: "10px", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center" },
    
    chipRow: { display: "flex", gap: 10, justifyContent: "center", marginTop: 24, flexWrap: "wrap" },
    trustChip: { background: "#F3F4F6", color: "#374151", borderRadius: 999, padding: "8px 14px", fontSize: 13, border: "1px solid #E5E7EB", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 },
    
    filtersBar: { display: "flex", gap: 10, padding: "0.5rem 1rem", background: "transparent", overflowX: "auto", flexWrap: "nowrap", marginBottom: "1rem", WebkitOverflowScrolling: "touch" },
    select: { border: "1px solid #D1D5DB", background: "#fff", padding: "10px 14px", borderRadius: 999, fontSize: 13, cursor: "pointer", color: "#374151", fontWeight: 500 },
    chip: (active) => ({ border: active ? "1px solid #2563EB" : "1px solid #D1D5DB", background: active ? "#EFF6FF" : "#fff", padding: "10px 16px", borderRadius: 999, fontSize: 13, cursor: "pointer", color: active ? "#1D4ED8" : "#374151", whiteSpace: "nowrap", fontWeight: 500, transition: "all 0.2s" }),
    
    layout: { display: "flex", maxHeight: "calc(100vh - 240px)", gap: 16, padding: "0 1rem", maxWidth: 1200, margin: "0 auto" },
    jobList: { overflowY: "auto", padding: "0.2rem 0" },
    
    jobCard: (selected) => ({ background: "#fff", border: selected ? "2px solid #2563EB" : "1px solid #E5E7EB", borderRadius: 12, padding: "1.2rem", marginBottom: 12, cursor: "pointer", boxShadow: selected ? "0 4px 12px rgba(37,99,235,0.1)" : "0 1px 2px rgba(0,0,0,0.05)", transition: "all 0.2s" }),
    cardTop: { display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 },
    logoBox: (bg, text) => ({ width: 48, height: 48, borderRadius: 8, background: "#F3F4F6", color: "#4B5563", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, flexShrink: 0, border: "1px solid #E5E7EB" }),
    jobTitle: { fontSize: 16, fontWeight: 700, color: "#111827", lineHeight: 1.3, marginBottom: 4 },
    jobSub: { fontSize: 13, color: "#4B5563" },
    badgeRow: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 },
    badge: (bg, color) => ({ fontSize: 12, padding: "4px 10px", borderRadius: 6, background: "#F3F4F6", color: "#374151", fontWeight: 600, border: "1px solid #E5E7EB" }),
    
    detail: { padding: "1.5rem", overflowY: "auto", background: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" },
    empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 280, color: "#9CA3AF", fontSize: 15, gap: 12 },
    detailTitle: { fontSize: 22, fontWeight: 800, color: "#111827", marginBottom: 8 },
    detailSub: { fontSize: 14, color: "#4B5563" },
    metaRow: { display: "flex", gap: 12, flexWrap: "wrap", margin: "1.2rem 0", padding: "1rem", background: "#F8FAFC", borderRadius: 12, border: "1px solid #E2E8F0" },
    metaItem: { fontSize: 13, color: "#1E293B", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 },
    applyBtn: { background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 4px rgba(37,99,235,0.2)" },
    saveBtn: (saved) => ({ background: saved ? "#EFF6FF" : "#fff", border: saved ? "1px solid #BFDBFE" : "1px solid #D1D5DB", borderRadius: 8, padding: "12px 16px", cursor: "pointer", color: saved ? "#1D4ED8" : "#4B5563", fontWeight: 700 }),
    section: { marginBottom: "1.5rem" },
    sectionTitle: { fontSize: 15, fontWeight: 800, color: "#111827", marginBottom: 10 },
    skillTag: { display: "inline-block", background: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: 6, fontSize: 13, padding: "6px 12px", marginRight: 8, marginBottom: 8, color: "#374151", fontWeight: 500 },
    
    page: { maxWidth: 1000, margin: "0 auto", padding: "1.5rem 1rem" },
    formLabel: { display: "block", fontSize: 14, color: "#374151", marginBottom: 6, fontWeight: 600 },
    formInput: { width: "100%", padding: "12px 14px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 15, marginBottom: "1rem", outline: "none", background: "#fff", transition: "border 0.2s" },
    formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
    submitBtn: { background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", boxShadow: "0 2px 4px rgba(37,99,235,0.2)" },
    
    aiBox: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "1.2rem", marginBottom: "1rem", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" },
    aiBtn: { background: "#8B5CF6", color: "#fff", border: "none", borderRadius: 8, padding: "12px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }, 
    aiResult: { background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 12, padding: "1.2rem", marginTop: "1rem" },
    toast: { position: "fixed", bottom: "1.5rem", right: "1.5rem", background: "#1F2937", color: "#fff", padding: "12px 20px", borderRadius: 8, fontSize: 14, zIndex: 9999, display: toast ? "block" : "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", fontWeight: 500 },
    
    statRow: { display: "flex", gap: 12, marginBottom: "1.5rem", flexWrap: "wrap" },
    statBox: (bg, color) => ({ background: "#fff", color: color, borderRadius: 12, padding: "1.2rem", flex: 1, minWidth: 120, border: "1px solid #E5E7EB", borderTop: `4px solid ${color}`, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }),
    statNum: { fontSize: 24, fontWeight: 900, color: "#111827" }, 
    statLabel: { fontSize: 13, marginTop: 4, color: "#6B7280", fontWeight: 500 },
    calGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginTop: 12 },
    calCell: (status) => ({ aspectRatio: "1", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer", fontWeight: 600, background: status === "present" ? "#DCFCE7" : status === "leave" ? "#FEE2E2" : "#F3F4F6", color: status === "present" ? "#166534" : status === "leave" ? "#B91C1C" : "#4B5563", border: "1px solid", borderColor: status === "present" ? "#BBF7D0" : status === "leave" ? "#FECACA" : "#E5E7EB" }),
    legendRow: { display: "flex", gap: 16, marginTop: 12, fontSize: 13, color: "#4B5563", fontWeight: 500 },
    legendDot: (color) => ({ display: "inline-block", width: 12, height: 12, borderRadius: "50%", background: color, marginRight: 6, verticalAlign: "middle" }),
    modalOverlay: { position: "fixed", inset: 0, background: "rgba(17, 24, 39, 0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem", backdropFilter: "blur(4px)" },
    modalBox: { background: "#fff", borderRadius: 16, padding: "1.8rem", width: "100%", maxWidth: 450, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" },
    applicantCard: { background: "#fff", borderRadius: 12, padding: "1.2rem", marginBottom: 12, border: "1px solid #E5E7EB" },
    hireBtn: (hired) => ({ background: hired ? "#DCFCE7" : "#fff", color: hired ? "#166534" : "#2563EB", border: hired ? "1px solid #BBF7D0" : "1px solid #BFDBFE", borderRadius: 6, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }),
    ratingDot: (active) => ({ width: 18, height: 18, borderRadius: "50%", background: active ? "#F59E0B" : "#E5E7EB", marginRight: 4, cursor: "pointer", display: "inline-block" }),
    empCard: (selected) => ({ background: selected ? "#EFF6FF" : "#fff", border: selected ? "1px solid #BFDBFE" : "1px solid #E5E7EB", borderRadius: 12, padding: "1.2rem", marginBottom: 12, cursor: "pointer", transition: "all 0.2s" }),
    empAvatar: (bg, text) => ({ width: 44, height: 44, borderRadius: "50%", background: "#F3F4F6", color: "#4B5563", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, flexShrink: 0 }),
    removeLink: { background: "none", border: "none", color: "#EF4444", fontSize: 13, cursor: "pointer", fontWeight: 600 },
  };

  return (
    <div style={s.app}>
      
      {/* --- SPLIT NAVBAR --- */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        
        {/* ROW 1: Logo + Owner Button + Post Job */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 1rem", borderBottom: "1px solid #E5E7EB" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ ...s.logo, cursor: "pointer" }} onClick={() => { setPage("browse"); setUserMode("customer"); setSelectedJob(null); }}>
              <div style={s.dot}></div>{t.appName}
            </div>

            <button
              style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", borderRadius: 999, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
              onClick={() => { setUserMode(userMode === "customer" ? "owner" : "customer"); setPage(userMode === "customer" ? "business" : "browse"); setSelectedJob(null); }}
            >
              {userMode === "customer" ? "💼 " + t.owner : "👥 " + t.customer}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {!isMobile && (
              <>
                <span style={s.statusBadge}>{online ? t.online : t.offline}</span>
                <button style={s.langBtn(language === "en")} onClick={() => setLanguage("en")}>EN</button>
                <button style={s.langBtn(language === "hi")} onClick={() => setLanguage("hi")}>हि</button>
                <button style={s.langBtn(language === "mr")} onClick={() => setLanguage("mr")}>मा</button>
              </>
            )}

            {/* LOGIN BUTTON UPDATED TO OPEN MODAL */}
            {!currentUser ? (
              <button 
                style={{ background: "#fff", color: "#374151", border: "1px solid #D1D5DB", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }} 
                onClick={() => setShowLoginModal(true)}
              >
                Login
              </button>
            ) : (
              <button 
                style={{ background: "#FEE2E2", color: "#B91C1C", border: "1px solid #FECACA", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }} 
                onClick={handleLogout}
              >
                Logout
              </button>
            )}

            <button style={s.postBtn} onClick={() => { setPage("post"); setSelectedJob(null); }}>{t.postJob || "+ Post"}</button>
          </div>
        </div>

        {/* ROW 2: Tabs */}
        <div style={{ display: "flex", justifyContent: isMobile ? "center" : "flex-start", gap: 4, padding: "8px 1rem", background: "#fff", overflowX: "auto", borderBottom: "1px solid #E5E7EB" }}>
          {userMode === "customer" ? (
            <>
              {!isMobile && <button style={s.navBtn(page === "browse")} onClick={() => { setPage("browse"); setSelectedJob(null); }}>🏡 {t.browseJobs}</button>}
              <button style={s.navBtn(page === "map")} onClick={() => setPage("map")}>🗺️ {t.mapView}</button>
              <button style={s.navBtn(page === "ai")} onClick={() => setPage("ai")}>🤖 {t.aiMatch}</button>
              <button style={s.navBtn(page === "saved")} onClick={() => setPage("saved")}>💾 {t.saved} ({savedJobs.length})</button>
            </>
          ) : (
            <>
              <button style={s.navBtn(page === "business")} onClick={() => setPage("business")}>🏢 {t.businessProfile}</button>
              <button style={s.navBtn(page === "employer")} onClick={() => setPage("employer")}>👷 {t.employerDash}</button>
              <button style={s.navBtn(page === "applicants")} onClick={() => setPage("applicants")}>👥 {t.viewApplicants} ({applications.length})</button>
            </>
          )}
        </div>
      </div>

      {/* BROWSE PAGE */}
      {page === "browse" && (
        <>
          {/* NAYA NAUKRI/INDEED STYLE HERO SECTION */}
          {(!isMobile || !selectedJob) && (
            <div style={s.hero}>
              <h1 style={s.h1}>{t.tagline}</h1>
              <p style={s.sub}>{t.sub}</p>
              
              <div style={s.searchRow}>
                <span style={{ padding: "10px 0 10px 14px", fontSize: 18 }}>🔍</span>
                <input style={s.input} placeholder={t.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} />
                <div style={{ width: 1, background: "#E5E7EB", margin: "8px 0" }}></div>
                <button style={s.voiceBtn} onClick={startVoiceSearch} title={t.voiceSearch}>{voiceLoading ? "⏳" : "🎙️"}</button>
                <button style={s.searchBtn}>{t.search}</button>
              </div>
              
              <div style={s.chipRow}>
                <span style={s.trustChip}>💼 10,000+ Jobs</span>
                <span style={s.trustChip}>🏢 {t.verifiedEmployer}</span>
                <span style={s.trustChip}>⚡ Easy apply</span>
                <button style={{ ...s.trustChip, cursor: "pointer", background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }} onClick={() => setPage("map")}>📍 {t.mapView}</button>
              </div>
            </div>
          )}

          {(!isMobile || !selectedJob) && (
            <div style={s.filtersBar}>
              <select style={s.select} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="">{t.allTypes}</option>
                <option value="Full-time">{t.fullTime}</option>
                <option value="Part-time">{t.partTime}</option>
                <option value="Remote">{t.remote}</option>
                <option value="Daily Wage">{t.dailyWage}</option>
                <option value="Internship">{t.internship}</option>
              </select>
              <select style={s.select} value={filterExp} onChange={(e) => setFilterExp(e.target.value)}>
                <option value="">{t.allLevels}</option>
                <option value="Entry">{t.entry}</option>
                <option value="Mid">{t.mid}</option>
                <option value="Senior">{t.senior}</option>
              </select>
              <button style={s.chip(filterGender === "women-only")} onClick={() => setFilterGender(filterGender === "women-only" ? "" : "women-only")}>👩 {t.womenOnly}</button>
              <button style={s.chip(filterGender === "family-friendly")} onClick={() => setFilterGender(filterGender === "family-friendly" ? "" : "family-friendly")}>🏠 {t.familyFriendly}</button>
              <button style={s.chip(filterScheme === "government")} onClick={() => setFilterScheme(filterScheme === "government" ? "" : "government")}>🏛 {t.governmentScheme}</button>
            </div>
          )}

          <div style={s.layout}>
            {(!isMobile || !selectedJob) && (
              <div style={{ ...s.jobList, width: isMobile ? "100%" : 400, paddingRight: isMobile ? 0 : 10 }}>
                {filtered.length === 0 && <p style={{ color: "#aaa", textAlign: "center", marginTop: "2rem", fontSize: 14 }}>{t.noJobs}</p>}
                {filtered.map((job, i) => {
                  const c = colors[i % colors.length];
                  const isSaved = !!savedJobs.find((j) => j.id === job.id);
                  const isReported = reportedJobs.includes(job.id);
                  return (
                    <div key={job.id} style={s.jobCard(selectedJob?.id === job.id)} onClick={() => setSelectedJob(job)}>
                      <div style={s.cardTop}>
                        <div style={s.logoBox(c.bg, c.text)}>{initials(job.company)}</div>
                        <div style={{ flex: 1 }}>
                          <div style={s.jobTitle}>{job.title}</div>
                          <div style={s.jobSub}>{job.company} {job.verified ? <span style={{ background: "#EFF6FF", color: "#1D4ED8", borderRadius: 4, padding: "2px 6px", fontSize: 10, fontWeight: 700, marginLeft: 6, border: "1px solid #BFDBFE" }}>✅ Verified</span> : null}</div>
                          <div style={{ ...s.jobSub, marginTop: 4 }}>📍 {job.location}</div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); toggleSave(job); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: isSaved ? "#2563EB" : "#D1D5DB" }}>{isSaved ? "★" : "☆"}</button>
                      </div>
                      <div style={s.badgeRow}>
                        <span style={s.badge()}>{job.type}</span>
                        <span style={s.badge()}>{job.salary}</span>
                        {job.scheme && <span style={s.badge()}>{job.scheme}</span>}
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", borderTop: "1px solid #E5E7EB", paddingTop: 10 }}>
                        <button onClick={(e) => { e.stopPropagation(); shareWhatsApp(job); }} style={{ fontSize: 12, background: "transparent", color: "#166534", border: "none", cursor: "pointer", fontWeight: 600 }}>📲 {t.shareWhatsApp}</button>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedJob(job); setPage("map"); }} style={{ fontSize: 12, background: "transparent", color: "#1D4ED8", border: "none", cursor: "pointer", fontWeight: 600 }}>🗺️ {t.showOnMap}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {(!isMobile || selectedJob) && (
              <div style={{ ...s.detail, flex: isMobile ? "none" : 1, width: isMobile ? "100%" : "auto", display: isMobile && !selectedJob ? "none" : "block" }}>
                {!selectedJob ? (
                  <div style={s.empty}><span style={{ fontSize: 48 }}>💼</span><p>{t.selectJob}</p></div>
                ) : (
                  <>
                    {isMobile && (
                      <button 
                        onClick={() => setSelectedJob(null)} 
                        style={{ background: "#fff", border: "1px solid #D1D5DB", padding: "8px 16px", borderRadius: 8, marginBottom: 16, cursor: "pointer", fontWeight: 600, fontSize: 13, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}
                      >
                        ⬅️ Back to Jobs
                      </button>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                      <div>
                        <div style={s.detailTitle}>{selectedJob.title}</div>
                        <div style={s.detailSub}>{selectedJob.company} · {selectedJob.location} · {t.posted} {selectedJob.posted}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button style={s.saveBtn(!!savedJobs.find((j) => j.id === selectedJob.id))} onClick={() => toggleSave(selectedJob)}>{savedJobs.find((j) => j.id === selectedJob.id) ? `★ ${t.saved2}` : `☆ ${t.save}`}</button>
                        <button style={s.applyBtn} onClick={() => openApply(selectedJob)}>{t.applyNow}</button>
                      </div>
                    </div>
                    <div style={s.metaRow}>
                      <span style={s.metaItem}>📍 {selectedJob.location}</span>
                      <span style={s.metaItem}>⏰ {selectedJob.type}</span>
                      <span style={s.metaItem}>💰 {selectedJob.salary}</span>
                      <span style={s.metaItem}>👥 {selectedJob.hires || 0} {t.hiresCount}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
                      <button onClick={() => readJobAloud(selectedJob)} style={{ fontSize: 13, background: "#fff", color: "#374151", border: "1px solid #D1D5DB", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600 }}>🔊 {t.readAloud}</button>
                      <button onClick={() => setPage("map")} style={{ fontSize: 13, background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600 }}>🗺️ {t.showOnMap}</button>
                      <button onClick={() => shareWhatsApp(selectedJob)} style={{ fontSize: 13, background: "#DCFCE7", color: "#166534", border: "1px solid #BBF7D0", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600 }}>📲 Share</button>
                    </div>
                    <div style={s.section}><div style={s.sectionTitle}>{t.aboutRole}</div><p style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.7 }}>{selectedJob.desc}</p></div>
                    <div style={s.section}><div style={s.sectionTitle}>{t.requirements}</div><ul style={{ paddingLeft: "1.2rem", margin: 0 }}>{(selectedJob.req || []).map((r, i) => <li key={i} style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.8 }}>{r}</li>)}</ul></div>
<div style={s.section}><div style={s.sectionTitle}>{t.skills}</div><div>{(selectedJob.skills || []).map((sk) => <span key={sk} style={s.skillTag}>{sk}</span>)}</div></div>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* MAP PAGE */}
      {page === "map" && (
        <div style={s.page}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: 10 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111827", marginBottom: 4 }}>🗺️ {t.mapView}</h2>
              <p style={{ fontSize: 13, color: "#6B7280" }}>{t.tapPinToView}</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["", "Neemuch", "Mandsaur", "Jawad"].map(area => (
                <button key={area} style={s.chip(mapAreaFilter === area)} onClick={() => setMapAreaFilter(area)}>
                  {area || t.allAreas}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1rem" }}>
            {Object.entries(domainColors).filter(([k]) => k !== "default").slice(0, 6).map(([domain, color]) => (
              <span key={domain} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, background: "#fff", color: "#374151", border: "1px solid #E5E7EB", fontWeight: 600 }}>
                <span style={{ color: color, marginRight: 4 }}>●</span>{domain}
              </span>
            ))}
          </div>

          <JobMap jobs={mapFilteredJobs} onSelectJob={(job) => setSelectedJob(job)} selectedJobId={selectedJob?.id} language={language} />

          {selectedJob && (
            <div style={{ marginTop: "1rem", background: "#fff", borderRadius: 16, padding: "1.5rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid #E5E7EB" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#111827", marginBottom: 4 }}>{selectedJob.title}</div>
                  <div style={{ fontSize: 14, color: "#4B5563" }}>{selectedJob.company} · {selectedJob.location}</div>
                  <div style={s.badgeRow}>
                    <span style={s.badge()}>{selectedJob.type}</span>
                    <span style={s.badge()}>{selectedJob.salary}</span>
                    {selectedJob.verified && <span style={s.badge()}>✅ {t.verifiedEmployer}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button style={s.saveBtn(!!savedJobs.find((j) => j.id === selectedJob.id))} onClick={() => toggleSave(selectedJob)}>{savedJobs.find((j) => j.id === selectedJob.id) ? `★ ${t.saved2}` : `☆ ${t.save}`}</button>
                  <button style={s.applyBtn} onClick={() => openApply(selectedJob)}>{t.applyNow}</button>
                  <button onClick={() => setPage("browse")} style={{ background: "#fff", border: "1px solid #D1D5DB", borderRadius: 8, padding: "12px 16px", cursor: "pointer", color: "#374151", fontSize: 14, fontWeight: 700 }}>📋 Details</button>
                </div>
              </div>
              <p style={{ fontSize: 14, color: "#6B7280", marginTop: 12, lineHeight: 1.6 }}>{selectedJob.desc?.slice(0, 120)}...</p>
            </div>
          )}

          <div style={{ marginTop: "2rem" }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#111827", marginBottom: "1rem" }}>
              📍 {mapFilteredJobs.filter(j => j.lat).length} {t.jobsNearby}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 12 }}>
              {mapFilteredJobs.filter(j => j.lat).map((job, i) => {
                const c = colors[i % colors.length];
                return (
                  <div key={job.id} style={{ ...s.jobCard(selectedJob?.id === job.id), marginBottom: 0 }} onClick={() => setSelectedJob(job)}>
                    <div style={s.cardTop}>
                      <div style={s.logoBox(c.bg, c.text)}>{initials(job.company)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ ...s.jobTitle, fontSize: 14 }}>{job.title}</div>
                        <div style={s.jobSub}>{job.location}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: "#2563EB", fontWeight: 700, marginTop: 8 }}>{job.salary}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* AI MATCH */}
      {page === "ai" && (
        <div style={s.page}>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, color: "#111827" }}>{t.aiMatchTitle}</h2>
          <p style={{ color: "#6B7280", fontSize: 15, marginBottom: "1.5rem" }}>{t.aiMatchSub}</p>
          <div style={s.aiBox}>
            <textarea
              style={{ width: "100%", border: "none", outline: "none", fontSize: 15, lineHeight: 1.6, resize: "vertical", minHeight: 120, background: "transparent", fontFamily: "inherit", color: "#111827" }}
              placeholder={t.aiPlaceholder}
              value={aiSkills}
              onChange={(e) => setAiSkills(e.target.value)}
            />
          </div>
          <button style={s.aiBtn} onClick={runAIMatch} disabled={aiLoading}>{aiLoading ? t.matching : t.matchBtn}</button>
          {aiResult && (
            <div style={s.aiResult}>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, color: "#4C1D95" }}>✨ {t.topMatches}</h3>
              <p style={{ fontSize: 15, color: "#5B21B6", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{aiResult}</p>
            </div>
          )}
        </div>
      )}

      {/* SAVED */}
      {page === "saved" && (
        <div style={s.page}>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: "1.5rem", color: "#111827" }}>{t.savedJobs}</h2>
          {savedJobs.length === 0 ? (
            <div style={s.empty}><span style={{ fontSize: 48 }}>🔖</span><p>{t.noSaved}</p></div>
          ) : savedJobs.map((job, i) => {
            const c = colors[i % colors.length];
            return (
              <div key={job.id} style={s.jobCard(false)} onClick={() => { setSelectedJob(job); setPage("browse"); }}>
                <div style={s.cardTop}>
                  <div style={s.logoBox(c.bg, c.text)}>{initials(job.company)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={s.jobTitle}>{job.title}</div>
                    <div style={s.jobSub}>{job.company} · {job.location}</div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#2563EB" }}>{job.salary}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* APPLICANTS */}
      {page === "applicants" && (
        <div style={s.page}>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: "1.5rem", color: "#111827" }}>{t.allApplications}</h2>
          {applications.length === 0 ? (
            <div style={s.empty}><span style={{ fontSize: 48 }}>📬</span><p>{t.noApplicationsYet}</p></div>
          ) : applications.map((app) => (
            <div key={app.id} style={s.applicantCard}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <strong style={{ fontSize: 16, color: "#111827" }}>{app.name}</strong>
                  <p style={{ fontSize: 14, color: "#4B5563", margin: "6px 0" }}>📞 <a href={`tel:${app.phone}`} style={{ color: "#2563EB", textDecoration: "none", fontWeight: 600 }}>{app.phone}</a></p>
                  <p style={{ fontSize: 13, color: "#6B7280", margin: "2px 0" }}>🧾 {app.jobTitle} · {t.appliedOn} {app.appliedAt}</p>
                  {app.message && <p style={{ fontSize: 14, color: "#374151", fontStyle: "italic", margin: "8px 0", background: "#F3F4F6", padding: 8, borderRadius: 6 }}>"{app.message}"</p>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
                  <button style={s.hireBtn(app.status === "hired")} onClick={() => toggleHired(app.id)}>{app.status === "hired" ? t.hired : t.markHired}</button>
                  <div>{Array.from({ length: 5 }, (_, i) => <span key={i} style={s.ratingDot(app.rating > i)} onClick={() => rateApplication(app.id, i + 1)}></span>)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BUSINESS PROFILE */}
      {page === "business" && (
        <div style={s.page}>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: "1.5rem", color: "#111827" }}>🏢 {t.businessProfile}</h2>
          <div style={s.statRow}>
            <div style={s.statBox("#fff", "#2563EB")}><div style={s.statNum}>{totalJobsGlobal}</div><div style={s.statLabel}>{t.statTotalJobs}</div></div>
            <div style={s.statBox("#fff", "#F59E0B")}><div style={s.statNum}>{totalApplicantsGlobal}</div><div style={s.statLabel}>{t.statApplicants}</div></div>
            <div style={s.statBox("#fff", "#10B981")}><div style={s.statNum}>{totalHiredGlobal}</div><div style={s.statLabel}>{t.statHired}</div></div>
          </div>
          <div style={s.formGrid}>
            <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, color: "#111827" }}>{businessProfile.owner}</div>
              <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 12 }}>{businessProfile.location}</div>
              <p style={{ color: "#374151", lineHeight: 1.7, marginBottom: 16, fontSize: 15 }}>{businessProfile.description}</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button style={{ ...s.postBtn, padding: "10px 16px", fontSize: 13, background: "#F3F4F6", color: "#374151" }} onClick={copyProfileLink}>🔗 Share Profile</button>
                <button style={{ ...s.postBtn, padding: "10px 16px", fontSize: 13, background: "#16A34A" }} onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(businessProfile.name + " - " + businessProfile.description)}`, "_blank")}>📲 WhatsApp</button>
              </div>
            </div>
            <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: "#111827" }}>Update Profile</h3>
              <label style={s.formLabel}>Business name</label><input style={s.formInput} value={businessProfile.name} onChange={(e) => setBusinessProfile({ ...businessProfile, name: e.target.value })} />
              <label style={s.formLabel}>Owner name</label><input style={s.formInput} value={businessProfile.owner} onChange={(e) => setBusinessProfile({ ...businessProfile, owner: e.target.value })} />
              <label style={s.formLabel}>Location</label><input style={s.formInput} value={businessProfile.location} onChange={(e) => setBusinessProfile({ ...businessProfile, location: e.target.value })} />
              <label style={s.formLabel}>Description</label><textarea style={{ ...s.formInput, minHeight: 80, resize: "vertical" }} value={businessProfile.description} onChange={(e) => setBusinessProfile({ ...businessProfile, description: e.target.value })} />
              <label style={s.formLabel}>Contact</label><input style={s.formInput} value={businessProfile.contact} onChange={(e) => setBusinessProfile({ ...businessProfile, contact: e.target.value })} />
            </div>
          </div>
        </div>
      )}

      {/* EMPLOYER DASHBOARD */}
      {page === "employer" && (
        <div style={{ ...s.page, display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: "1.5rem", color: "#111827" }}>👷 {t.employerDash}</h2>
            <div style={{ background: "#fff", borderRadius: 16, padding: "1.2rem", marginBottom: 16, border: "2px dashed #BFDBFE" }}>
              <label style={s.formLabel}>{t.employeeName}</label>
              <input style={s.formInput} placeholder="e.g. Ramesh Kumar" value={empForm.name} onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })} />
              <label style={s.formLabel}>{t.employeeRole}</label>
              <input style={s.formInput} placeholder="e.g. Driver, Mistri" value={empForm.role} onChange={(e) => setEmpForm({ ...empForm, role: e.target.value })} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={s.formLabel}>{t.wageType}</label>
                  <select style={s.formInput} value={empForm.wageType} onChange={(e) => setEmpForm({ ...empForm, wageType: e.target.value })}>
                    <option value="daily">{t.dailyWageOpt}</option>
                    <option value="monthly">{t.monthlyWageOpt}</option>
                  </select>
                </div>
                <div>
                  <label style={s.formLabel}>{t.wageAmount}</label>
                  <input type="number" style={s.formInput} placeholder="e.g. 500" value={empForm.wageAmount} onChange={(e) => setEmpForm({ ...empForm, wageAmount: e.target.value })} />
                </div>
              </div>
              <button style={s.submitBtn} onClick={handleAddEmployee}>{t.addBtn}</button>
            </div>
            {employees.length === 0 ? (
              <p style={{ color: "#9CA3AF", fontSize: 14, textAlign: "center", padding: "2rem 0" }}>{t.noEmployees}</p>
            ) : employees.map((emp, i) => {
              const stats = monthStats(emp, year, month);
              const c = colors[i % colors.length];
              return (
                <div key={emp.id} style={s.empCard(selectedEmployee?.id === emp.id)} onClick={() => setSelectedEmployee(emp)}>
                  <div style={s.cardTop}>
                    <div style={s.empAvatar(c.bg, c.text)}>{initials(emp.name)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={s.jobTitle}>{emp.name}</div>
                      <div style={s.jobSub}>{emp.role}</div>
                    </div>
                  </div>
                  <div style={s.badgeRow}>
                    <span style={{ ...s.badge(), background: "#DCFCE7", color: "#166534", border: "none" }}>{stats.present} {t.daysPresent}</span>
                    <span style={{ ...s.badge(), background: "#FEE2E2", color: "#B91C1C", border: "none" }}>{stats.leave} {t.daysLeave}</span>
                    <span style={{ ...s.badge(), background: "#F3F4F6", color: "#374151", border: "none" }}>₹{stats.salary}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ background: "#fff", borderRadius: 16, padding: "1.8rem", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            {!selectedEmployee ? (
              <div style={s.empty}><span style={{ fontSize: 54 }}>🧑‍🔧</span><p>{t.selectEmployeeMsg}</p></div>
            ) : (() => {
              const emp = employees.find((e) => e.id === selectedEmployee.id) || selectedEmployee;
              const stats = monthStats(emp, year, month);
              return (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                    <div>
                      <div style={s.detailTitle}>{emp.name}</div>
                      <div style={s.detailSub}>{emp.role} · <strong style={{ color: "#111827" }}>{emp.wageType === "daily" ? `₹${emp.wageAmount}${t.perDay}` : `₹${emp.wageAmount}${t.perMonth}`}</strong></div>
                    </div>
                    <button style={s.removeLink} onClick={() => removeEmployee(emp.id)}>{t.removeWorker}</button>
                  </div>
                  <div style={s.statRow}>
                    <div style={s.statBox("#fff", "#10B981")}><div style={s.statNum}>{stats.present}</div><div style={s.statLabel}>{t.daysPresent}</div></div>
                    <div style={s.statBox("#fff", "#EF4444")}><div style={s.statNum}>{stats.leave}</div><div style={s.statLabel}>{t.daysLeave}</div></div>
                    <div style={s.statBox("#fff", "#3B82F6")}><div style={s.statNum}>₹{stats.salary}</div><div style={s.statLabel}>{t.estSalary}</div></div>
                  </div>
                  <div style={{ ...s.sectionTitle, marginTop: "2rem" }}>{t.thisMonth} — {monthName}</div>
                  <p style={{ fontSize: 13, color: "#6B7280", margin: "8px 0 16px" }}>{t.tapToMark}</p>
                  <div style={s.calGrid}>
                    {Array.from({ length: daysInMonth }, (_, idx) => {
                      const day = idx + 1;
                      const key = dateKey(year, month, day);
                      const status = emp.attendance[key];
                      return <div key={day} style={s.calCell(status)} onClick={() => cycleAttendance(emp.id, key)}>{day}</div>;
                    })}
                  </div>
                  <div style={s.legendRow}>
                    <span><span style={s.legendDot("#16A34A")}></span>{t.legendPresent}</span>
                    <span><span style={s.legendDot("#DC2626")}></span>{t.legendLeave}</span>
                    <span><span style={s.legendDot("#E5E7EB")}></span>{t.legendUnmarked}</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* POST JOB */}
      {page === "post" && (
        <div style={s.page}>
          <div style={{ background: "#fff", padding: "2rem", borderRadius: 16, border: "1px solid #E5E7EB", maxWidth: 800, margin: "0 auto", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: "1.5rem", color: "#111827" }}>{t.postTitle}</h2>
            <div style={s.formGrid}>
              <div><label style={s.formLabel}>{t.jobTitle}</label><input style={s.formInput} placeholder="e.g. Driver, Mistri, Teacher" value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} /></div>
              <div><label style={s.formLabel}>{t.companyName}</label><input style={s.formInput} placeholder="e.g. Ramesh Ji ka Kaam" value={postForm.company} onChange={(e) => setPostForm({ ...postForm, company: e.target.value })} /></div>
            </div>
            <div style={s.formGrid}>
              <div><label style={s.formLabel}>{t.jobLocation}</label><input style={s.formInput} placeholder="e.g. Neemuch, Mandsaur" value={postForm.location} onChange={(e) => setPostForm({ ...postForm, location: e.target.value })} /></div>
              <div><label style={s.formLabel}>{t.jobSalary}</label><input style={s.formInput} placeholder="e.g. ₹500/day" value={postForm.salary} onChange={(e) => setPostForm({ ...postForm, salary: e.target.value })} /></div>
            </div>
            <div style={s.formGrid}>
              <div>
                <label style={s.formLabel}>{t.jobType}</label>
                <select style={s.formInput} value={postForm.type} onChange={(e) => setPostForm({ ...postForm, type: e.target.value })}>
                  <option value="Full-time">{t.fullTime}</option>
                  <option value="Part-time">{t.partTime}</option>
                  <option value="Daily Wage">{t.dailyWage}</option>
                  <option value="Internship">{t.internship}</option>
                </select>
              </div>
              <div>
                <label style={s.formLabel}>{t.jobDomain}</label>
                <select style={s.formInput} value={postForm.domain} onChange={(e) => setPostForm({ ...postForm, domain: e.target.value })}>
                  <option>Farming</option><option>Construction</option><option>Teaching</option>
                  <option>Healthcare</option><option>Transport</option><option>Skilled Work</option>
                  <option>Government</option><option>Technical</option><option>Other</option>
                </select>
              </div>
            </div>
            <label style={s.formLabel}>{t.applicationDeadline}</label>
            <input type="date" style={s.formInput} value={postForm.deadline} onChange={(e) => setPostForm({ ...postForm, deadline: e.target.value })} />
            <label style={s.formLabel}>{t.jobDesc}</label>
            <textarea style={{ ...s.formInput, minHeight: 120, resize: "vertical" }} placeholder="Kaam ke baare mein batayen..." value={postForm.desc} onChange={(e) => setPostForm({ ...postForm, desc: e.target.value })} />
            <button style={s.submitBtn} onClick={handlePost}>{t.publish}</button>

            <div style={{ marginTop: 40, borderTop: "1px solid #E5E7EB", paddingTop: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: "1.5rem", color: "#111827" }}>{t.yourPostedJobs}</h3>
              {postedJobs.length === 0 && <p style={{ color: "#9CA3AF", fontSize: 14 }}>{t.noPostedJobsYet}</p>}
              {postedJobs.map((job) => {
                const apps = applications.filter((a) => a.jobId === job.id);
                const expanded = expandedJobId === job.id;
                return (
                  <div key={job.id} style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 12, marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "14px 16px" }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{job.title}</div>
                        <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>{job.company}</div>
                      </div>
                      <button style={{ ...s.chip(expanded), background: expanded ? "#EFF6FF" : "#fff", padding: "8px 14px", fontSize: 12 }} onClick={() => setExpandedJobId(expanded ? null : job.id)}>
                        {expanded ? "Collapse" : `View Applicants (${apps.length})`}
                      </button>
                    </div>
                    {expanded && (
                      <div style={{ borderTop: "1px solid #E5E7EB", padding: 16, background: "#fff", borderRadius: "0 0 12px 12px" }}>
                        {apps.length === 0 ? (
                          <p style={{ color: "#9CA3AF", fontSize: 14 }}>{t.noApplicants}</p>
                        ) : apps.map((app) => (
                          <div key={app.id} style={{ ...s.applicantCard, background: "#F9FAFB", boxShadow: "none" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                              <div>
                                <strong style={{ color: "#111827" }}>{app.name}</strong>
                                <p style={{ fontSize: 13, color: "#4B5563", margin: "6px 0" }}>
                                  <a href={`tel:${app.phone}`} style={{ color: "#2563EB", textDecoration: "none", fontWeight: 600 }}>{app.phone}</a>
                                </p>
                                {app.message && <p style={{ fontSize: 13, color: "#374151", fontStyle: "italic" }}>"{app.message}"</p>}
                              </div>
                              <button style={s.hireBtn(app.status === "hired")} onClick={() => toggleHired(app.id)}>
                                {app.status === "hired" ? t.hired : t.markHired}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* APPLY MODAL */}
      {applyingJob && (
        <div style={s.modalOverlay} onClick={() => setApplyingJob(null)}>
          <div style={s.modalBox} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6, color: "#111827" }}>{t.applyFormTitle}</h3>
            <p style={{ fontSize: 14, color: "#6B7280", marginBottom: "1.5rem" }}>{applyingJob.title} · {applyingJob.company}</p>
            <label style={s.formLabel}>{t.yourName} *</label>
            <input style={s.formInput} placeholder="Apna naam likho..." value={applyForm.name} onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })} />
            <label style={s.formLabel}>{t.yourPhone} *</label>
            <input style={s.formInput} type="tel" placeholder="+91 98765 43210" value={applyForm.phone} onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })} />
            <label style={s.formLabel}>{t.yourMessage}</label>
            <textarea style={{ ...s.formInput, minHeight: 90, resize: "vertical" }} placeholder="Apne baare mein kuch batayen..." value={applyForm.message} onChange={(e) => setApplyForm({ ...applyForm, message: e.target.value })} />
            <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
              <button style={{ ...s.submitBtn, background: "#F3F4F6", color: "#374151", boxShadow: "none" }} onClick={() => setApplyingJob(null)}>{t.cancel}</button>
              <button style={s.submitBtn} onClick={submitApplication}>{t.submitApplication}</button>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN MODAL (OTP + Google) */}
      {showLoginModal && (
        <div style={s.modalOverlay} onClick={() => setShowLoginModal(false)}>
          <div style={{ ...s.modalBox, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: "1.5rem", color: "#111827" }}>Login to JobHub</h3>

            {!confirmationResult ? (
              <>
                <label style={{ ...s.formLabel, textAlign: "left" }}>Phone Number</label>
                <div style={{ display: "flex", gap: 10 }}>
                  <span style={{ padding: "12px 14px", background: "#F3F4F6", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 15, color: "#374151", fontWeight: 600 }}>+91</span>
                  <input style={{ ...s.formInput, marginBottom: 0 }} type="tel" placeholder="9876543210" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))} maxLength={10} />
                </div>
                <button style={{ ...s.submitBtn, marginTop: "1rem" }} onClick={requestOTP}>Send OTP</button>

                <div style={{ margin: "1.5rem 0", color: "#9CA3AF", fontSize: 13, fontWeight: 600, position: "relative", zIndex: 1 }}>
                  <span style={{ background: "#fff", padding: "0 10px" }}>OR</span>
                  <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "#E5E7EB", zIndex: -1 }}></div>
                </div>

                <button 
                  style={{ ...s.submitBtn, background: "#fff", color: "#374151", border: "1px solid #D1D5DB", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }} 
                  onClick={() => { handleLogin(); setShowLoginModal(false); }}
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="G" width={18}/> 
                  Login with Google
                </button>
              </>
            ) : (
              <>
                <label style={{ ...s.formLabel, textAlign: "left" }}>Enter 6-digit OTP</label>
                <input style={s.formInput} type="number" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} />
                <button style={s.submitBtn} onClick={verifyOTP}>Verify & Login</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* INVISIBLE RECAPTCHA FOR FIREBASE */}
      <div id="recaptcha-container"></div>

      {/* TOAST */}
      <div style={s.toast}>{toast}</div>
    </div>
  );
}