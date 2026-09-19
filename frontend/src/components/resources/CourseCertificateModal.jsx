import React, { useState, useEffect, useRef } from 'react';
import {
    Award, X, Download, Printer, CheckCircle2, Share2, Copy, Sparkles,
    ShieldCheck, Calendar, QrCode, User, ExternalLink, BookmarkCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CourseCertificateModal({
    course,
    studentName = 'Abhishek Kumar',
    onClose,
    onCertificateSaved
}) {
    const [name, setName] = useState(studentName);
    const [isEditingName, setIsEditingName] = useState(false);
    const [isSavedToPortfolio, setIsSavedToPortfolio] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const certRef = useRef(null);

    const credentialId = useRef(
        `SS-NOSQL-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    ).current;

    const issueDate = useRef(
        new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    ).current;

    // Trigger celebration confetti on mount
    useEffect(() => {
        try {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            const timeout = setTimeout(() => {
                confetti({
                    particleCount: 50,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 }
                });
                confetti({
                    particleCount: 50,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 }
                });
            }, 300);
            return () => clearTimeout(timeout);
        } catch (e) {
            console.log('Confetti effect skipped:', e);
        }
    }, []);

    // Check if already in localStorage
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('studyspirit_certificates') || '[]');
            const exists = saved.some(c => c.credentialId === credentialId || c.name.includes('Intelligent NoSQL'));
            if (exists) setIsSavedToPortfolio(true);
        } catch (e) {
            console.error(e);
        }
    }, [credentialId]);

    // Save Certificate to Portfolio
    const handleSaveToPortfolio = () => {
        try {
            const current = JSON.parse(localStorage.getItem('studyspirit_certificates') || '[]');
            const newCert = {
                id: Date.now(),
                name: course?.name || 'Intelligent NoSQL Databases with MongoDB',
                platform: 'StudySpirit Academic',
                issueDate: new Date().toISOString().split('T')[0],
                credentialId: credentialId,
                credentialUrl: `https://studyspirit.in/verify/${credentialId}`,
                category: 'programming',
                hours: '16 Hours',
                grade: 'Distinction (Grade A+)',
                image: null
            };
            const updated = [newCert, ...current.filter(c => c.credentialId !== credentialId)];
            localStorage.setItem('studyspirit_certificates', JSON.stringify(updated));
            setIsSavedToPortfolio(true);
            if (onCertificateSaved) onCertificateSaved(newCert);
        } catch (err) {
            console.error('Error saving certificate:', err);
        }
    };

    // Copy Verification Link
    const handleCopyLink = () => {
        navigator.clipboard.writeText(`https://studyspirit.in/verify/${credentialId}`);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
    };

    // Print Certificate
    const handlePrint = () => {
        window.print();
    };

    // Download PNG using HTML5 Canvas render
    const handleDownloadPng = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 850;
        const ctx = canvas.getContext('2d');

        // Background Gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 1200, 850);
        bgGrad.addColorStop(0, '#ffffff');
        bgGrad.addColorStop(0.5, '#f8fafc');
        bgGrad.addColorStop(1, '#f1f5f9');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1200, 850);

        // Ornate Border
        ctx.lineWidth = 14;
        ctx.strokeStyle = '#0f172a';
        ctx.strokeRect(24, 24, 1152, 802);

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#d97706'; // Gold
        ctx.strokeRect(36, 36, 1128, 778);

        // Header Title
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 24px serif';
        ctx.textAlign = 'center';
        ctx.fillText('STUDYSPIRIT ACADEMIC EXCELLENCE RECOGNITION', 600, 110);

        ctx.fillStyle = '#d97706';
        ctx.font = 'bold 38px Georgia, serif';
        ctx.fillText('CERTIFICATE OF COMPLETION', 600, 170);

        ctx.fillStyle = '#64748b';
        ctx.font = 'italic 18px Georgia, serif';
        ctx.fillText('This official credential certifies that', 600, 230);

        // Student Name
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 44px Georgia, serif';
        ctx.fillText(name || 'Abhishek Kumar', 600, 300);

        // Underline for name
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(350, 320);
        ctx.lineTo(850, 320);
        ctx.stroke();

        // Course Text
        ctx.fillStyle = '#334155';
        ctx.font = '18px sans-serif';
        ctx.fillText('has successfully mastered the comprehensive 16-Hour professional academic curriculum in', 600, 370);

        // Course Name
        ctx.fillStyle = '#047857';
        ctx.font = 'bold 34px sans-serif';
        ctx.fillText(course?.name || 'Intelligent NoSQL Databases with MongoDB', 600, 425);

        // Course Outcomes & Workload
        ctx.fillStyle = '#64748b';
        ctx.font = '15px sans-serif';
        ctx.fillText('Topic: INTELLIGENT NOSQL DATABASES | Course Code: INT252 | Workload: 16 Hours', 600, 470);
        ctx.fillText('Verified Competencies: CO1 (NoSQL Concepts) · CO2 (CRUD & BSON) · CO3 (Schema Design) · CO4 (Aggregation & Indexing)', 600, 505);
        ctx.fillText('CO5 (Node.js & Python Integration) · CO6 (Student Learning Analytics Mini-Project & AI Analytics)', 600, 530);

        // Grade Badge
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('Academic Performance: Grade A+ with Distinction • 96% Final Assessment Score', 600, 580);

        // Signatures Line
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(200, 720);
        ctx.lineTo(420, 720);
        ctx.moveTo(780, 720);
        ctx.lineTo(1000, 720);
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('Dr. Sandeep Sharma', 310, 745);
        ctx.fillStyle = '#64748b';
        ctx.font = '12px sans-serif';
        ctx.fillText('Head of Academic Affairs', 310, 765);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('Prof. Amit Phaltankar', 890, 745);
        ctx.fillStyle = '#64748b';
        ctx.font = '12px sans-serif';
        ctx.fillText('Lead MongoDB Instructor', 890, 765);

        // Seal & Credential Details in Center
        ctx.fillStyle = '#b45309';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(`Credential ID: ${credentialId}`, 600, 745);
        ctx.fillStyle = '#64748b';
        ctx.font = '12px sans-serif';
        ctx.fillText(`Issued On: ${issueDate} • Verified by StudySpirit`, 600, 765);

        // Trigger Download
        const link = document.createElement('a');
        link.download = `StudySpirit_Certificate_NoSQL_MongoDB_${(name || 'Student').replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[96vh]">
                
                {/* Modal Top Control Bar */}
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black">
                            🏆
                        </div>
                        <div>
                            <h2 className="text-sm md:text-base font-black text-white flex items-center gap-2">
                                <span>Official Course Certificate</span>
                                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                                    16 Hours Completed
                                </span>
                            </h2>
                            <p className="text-xs text-slate-400">Verifiable Academic Credential with Course Outcomes (CO1–CO6)</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownloadPng}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm"
                            title="Download Certificate Image"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Download PNG</span>
                        </button>

                        <button
                            onClick={handlePrint}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition border border-slate-700"
                            title="Print or Save as PDF"
                        >
                            <Printer className="w-4 h-4" />
                            <span className="hidden sm:inline">Print / PDF</span>
                        </button>

                        <button
                            onClick={handleSaveToPortfolio}
                            className={`font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition ${
                                isSavedToPortfolio
                                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                            }`}
                        >
                            <BookmarkCheck className="w-4 h-4" />
                            <span>{isSavedToPortfolio ? 'Saved to Portfolio' : 'Add to My Certificates'}</span>
                        </button>

                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition ml-2">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Printable Certificate Canvas Canvas / Display Area */}
                <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-950/60 flex items-center justify-center">
                    <div
                        ref={certRef}
                        id="printable-certificate"
                        className="w-full max-w-4xl bg-white text-slate-900 rounded-2xl p-6 md:p-10 border-8 border-slate-900 shadow-2xl relative overflow-hidden font-sans"
                        style={{
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 0 0 4px #d97706'
                        }}
                    >
                        {/* Guilloche Corner Accents */}
                        <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-600 pointer-events-none" />
                        <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-600 pointer-events-none" />
                        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-600 pointer-events-none" />
                        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-600 pointer-events-none" />

                        {/* Certificate Header Emblem */}
                        <div className="text-center space-y-1 mb-6">
                            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-2">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                <span>StudySpirit Academic Authority</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black font-serif tracking-tight text-slate-900 uppercase">
                                Certificate of Completion
                            </h1>
                            <p className="text-xs md:text-sm text-slate-500 font-serif italic">
                                This official institutional credential is proudly awarded to
                            </p>
                        </div>

                        {/* Recipient Name Area (Click to edit) */}
                        <div className="text-center my-6">
                            {isEditingName ? (
                                <div className="inline-flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="text-2xl md:text-4xl font-black text-center font-serif text-slate-900 border-b-2 border-amber-500 focus:outline-none bg-amber-50/50 px-4 py-1 rounded-md"
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => setIsEditingName(false)}
                                        className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold"
                                    >
                                        Save
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => setIsEditingName(true)}
                                    className="cursor-pointer group inline-block"
                                    title="Click to edit name"
                                >
                                    <h2 className="text-2xl md:text-4xl font-black font-serif text-slate-900 group-hover:text-amber-700 transition tracking-tight">
                                        {name || 'Abhishek Kumar'}
                                    </h2>
                                    <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2" />
                                    <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition block mt-1">
                                        ✏️ Click to customize name
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Course Accomplishment Description */}
                        <div className="text-center max-w-2xl mx-auto space-y-2 mb-6">
                            <p className="text-xs md:text-sm text-slate-600">
                                for successfully completing the 16-Hour comprehensive professional curriculum and rigorous academic examinations in
                            </p>
                            <h3 className="text-lg md:text-2xl font-black text-emerald-800 tracking-tight">
                                {course?.name || 'Intelligent NoSQL Databases with MongoDB'}
                            </h3>
                            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-bold text-slate-500">
                                <span className="bg-slate-100 px-2.5 py-0.5 rounded-md text-slate-700">Code: INT252</span>
                                <span>•</span>
                                <span className="bg-slate-100 px-2.5 py-0.5 rounded-md text-slate-700">Topic: INTELLIGENT NOSQL DATABASES</span>
                                <span>•</span>
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-md font-extrabold">
                                    Duration: 16 Hours
                                </span>
                            </div>
                        </div>

                        {/* Verified Course Outcomes Checklist Grid */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-6 text-xs text-slate-700">
                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                                Verified Core Outcomes & Competencies (CO1 — CO6):
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-medium">
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>CO1: NoSQL & SQL Architecture, CAP Theorem</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>CO2: BSON Types & Document CRUD Operations</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>CO3: Schema Modeling, Embedding & Validation</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>CO4: Indexing Strategies & Aggregation Pipelines</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>CO5: Node.js (Mongoose) & Python (PyMongo)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>CO6: Student Learning Analytics Mini-Project & AI</span>
                                </div>
                            </div>
                        </div>

                        {/* Certificate Signatures & Verification Badge Footer */}
                        <div className="pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                            {/* Signature 1 */}
                            <div className="space-y-1">
                                <div className="font-serif italic font-black text-base text-slate-800">
                                    Dr. Sandeep Sharma
                                </div>
                                <div className="w-36 h-0.5 bg-slate-300 mx-auto md:mx-0" />
                                <p className="text-[11px] font-bold text-slate-700">Dr. Sandeep Sharma</p>
                                <p className="text-[10px] text-slate-400">Head of Academic Affairs</p>
                            </div>

                            {/* Center Gold Stamp Seal */}
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-4 border-amber-200 shadow-md flex items-center justify-center text-white">
                                    <Award className="w-8 h-8" />
                                </div>
                                <span className="text-[9px] font-black uppercase text-amber-800 tracking-wider mt-1">
                                    VERIFIED CREDENTIAL
                                </span>
                            </div>

                            {/* Signature 2 */}
                            <div className="space-y-1 md:text-right">
                                <div className="font-serif italic font-black text-base text-slate-800">
                                    Prof. Amit Phaltankar
                                </div>
                                <div className="w-36 h-0.5 bg-slate-300 mx-auto md:ml-auto md:mr-0" />
                                <p className="text-[11px] font-bold text-slate-700">Prof. Amit Phaltankar</p>
                                <p className="text-[10px] text-slate-400">Lead MongoDB Instructor</p>
                            </div>
                        </div>

                        {/* Bottom Credential ID & Date bar */}
                        <div className="mt-6 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>Credential ID: <strong className="text-slate-700 font-mono">{credentialId}</strong></span>
                            <span>Issue Date: <strong className="text-slate-700">{issueDate}</strong></span>
                            <span>Verify at: <strong className="text-amber-700">studyspirit.in/verify</strong></span>
                        </div>
                    </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-4 shrink-0 text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Cryptographically verified certificate with instant online authenticity verification.</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCopyLink}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
                        >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>{copiedLink ? 'Link Copied!' : 'Share Credential Link'}</span>
                        </button>

                        <button
                            onClick={onClose}
                            className="bg-[#ff5733] hover:bg-orange-600 text-white font-bold px-4 py-1.5 rounded-xl transition"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>

            {/* Print Scoped Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-certificate, #printable-certificate * {
                        visibility: visible;
                    }
                    #printable-certificate {
                        position: fixed;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        border: 8px solid #0f172a !important;
                        box-shadow: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
