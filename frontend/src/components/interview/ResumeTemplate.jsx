import React from 'react';

export const ResumeTemplate = ({ data, template }) => {
    if (!data || !data.personalInfo) return <div className="text-red-500 p-4">Error loading resume data. Please try again.</div>;

    if (template === 'Creative Tech') {
        return (
            <div className="bg-[#0a0a0f] text-gray-300 p-0 font-sans min-h-full flex flex-col md:flex-row border border-cyan-500/20 shadow-2xl mx-auto w-full max-w-[850px] overflow-hidden rounded-xl">
                {/* Sidebar */}
                <div className="md:w-1/3 bg-[#13151f] p-8 border-r border-cyan-500/10 flex flex-col gap-8">
                    <div>
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl font-black text-white mb-6 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                            {data.personalInfo.name.charAt(0)}
                        </div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">{data.personalInfo.name}</h1>
                        <p className="text-cyan-400 font-medium text-sm">Tech Professional</p>
                    </div>

                    <div className="space-y-3 text-sm">
                        {data.personalInfo.email && <div className="flex items-center gap-3"><span className="p-2 rounded-lg bg-white/5 text-cyan-400">📧</span> <span className="truncate">{data.personalInfo.email}</span></div>}
                        {data.personalInfo.phone && <div className="flex items-center gap-3"><span className="p-2 rounded-lg bg-white/5 text-cyan-400">📱</span> {data.personalInfo.phone}</div>}
                        {data.personalInfo.links && <div className="flex items-center gap-3"><span className="p-2 rounded-lg bg-white/5 text-cyan-400">🔗</span> <span className="truncate">{data.personalInfo.links}</span></div>}
                    </div>

                    <div>
                        <h2 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-4 pb-2 border-b border-white/10">Tech Stack</h2>
                        <div className="flex flex-wrap gap-2">
                            {data.skills?.map((skill, i) => (
                                <span key={i} className="px-3 py-1.5 bg-cyan-500/10 text-cyan-300 text-xs font-semibold rounded-lg border border-cyan-500/20">{skill}</span>
                            ))}
                        </div>
                    </div>

                    {data.education && data.education.length > 0 && (
                        <div>
                            <h2 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-4 pb-2 border-b border-white/10">Education</h2>
                            <div className="space-y-4">
                                {data.education.map((edu, i) => (
                                    <div key={i} className="text-sm">
                                        <div className="font-bold text-white">{edu.degree}</div>
                                        <div className="text-gray-400 text-xs mt-1">{edu.institution}</div>
                                        <div className="text-cyan-500 text-xs font-mono mt-1">{edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="md:w-2/3 p-8 bg-[#0a0a0f]">
                    <div className="mb-10">
                        <p className="text-gray-300 leading-relaxed text-sm font-light">{data.summary}</p>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-sm font-bold text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                            <span className="w-8 h-px bg-cyan-500"></span> Experience
                        </h2>
                        <div className="space-y-8">
                            {data.experience?.map((exp, i) => (
                                <div key={i} className="relative pl-6 border-l border-white/10">
                                    <div className="absolute w-2.5 h-2.5 bg-cyan-500 rounded-full -left-[5px] top-1.5 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                                    <h3 className="text-lg font-bold text-white">{exp.role}</h3>
                                    <div className="flex justify-between items-center text-sm mb-3 mt-1">
                                        <span className="text-cyan-400 font-medium">{exp.company}</span>
                                        <span className="text-gray-500 font-mono text-xs">{exp.duration}</span>
                                    </div>
                                    <ul className="list-none space-y-2 text-sm text-gray-400 font-light">
                                        {exp.description?.map((desc, j) => (
                                            <li key={j} className="relative pl-4">
                                                <span className="absolute left-0 top-2 w-1 h-1 bg-cyan-500/50 rounded-full"></span>
                                                {desc}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    {data.additionalInfo && data.additionalInfo.length > 0 && (
                        <div>
                            <h2 className="text-sm font-bold text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                <span className="w-8 h-px bg-cyan-500"></span> Awards & Extras
                            </h2>
                            <ul className="space-y-2 text-sm text-gray-400 font-light pl-4">
                                {data.additionalInfo.map((info, i) => (
                                    <li key={i} className="relative pl-4">
                                        <span className="absolute left-0 top-2 w-1 h-1 bg-cyan-500/50 rounded-full"></span>
                                        {info}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (template === 'Executive Minimalist') {
        return (
            <div className="bg-white text-gray-800 p-0 font-serif min-h-full flex flex-col md:flex-row shadow-xl mx-auto w-full max-w-[850px] overflow-hidden border border-gray-100">
                {/* Dark Sidebar */}
                <div className="md:w-[32%] bg-slate-900 p-8 text-slate-300 flex flex-col gap-8">
                    <div>
                        <h1 className="text-3xl font-normal text-white mb-2 leading-tight">{data.personalInfo.name.split(' ').map((n, i) => i === 0 ? <span key={i} className="font-bold">{n} </span> : <span key={i}>{n} </span>)}</h1>
                    </div>

                    <div className="space-y-4 text-xs font-sans tracking-wide">
                        {data.personalInfo.email && <div className="break-words">{data.personalInfo.email}</div>}
                        {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                        {data.personalInfo.links && <div className="text-slate-400">{data.personalInfo.links}</div>}
                    </div>

                    <div className="w-full h-px bg-slate-700/50"></div>

                    <div>
                        <h2 className="text-xs font-bold text-white uppercase tracking-[0.15em] mb-4 font-sans">Skills & Expertise</h2>
                        <ul className="space-y-2 text-sm">
                            {data.skills?.map((skill, i) => (
                                <li key={i} className="font-light">{skill}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="w-full h-px bg-slate-700/50"></div>

                    {data.education && data.education.length > 0 && (
                        <div>
                            <h2 className="text-xs font-bold text-white uppercase tracking-[0.15em] mb-4 font-sans">Education</h2>
                            <div className="space-y-5">
                                {data.education.map((edu, i) => (
                                    <div key={i} className="text-sm">
                                        <div className="font-semibold text-white mb-1">{edu.degree}</div>
                                        <div className="text-slate-400 font-light text-xs leading-relaxed">{edu.institution}</div>
                                        <div className="text-slate-500 text-xs font-sans mt-2">{edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* White Main Content */}
                <div className="md:w-[68%] p-10 bg-white">
                    <div className="mb-10">
                        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-[0.15em] mb-4 font-sans border-b-2 border-slate-900 inline-block pb-1">Profile</h2>
                        <p className="text-sm leading-relaxed text-slate-700 text-justify">{data.summary}</p>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-[0.15em] mb-6 font-sans border-b-2 border-slate-900 inline-block pb-1">Professional Experience</h2>
                        <div className="space-y-8">
                            {data.experience?.map((exp, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="text-lg font-bold text-slate-900">{exp.role}</h3>
                                        <span className="text-xs font-sans text-slate-500 tracking-wider whitespace-nowrap ml-4 border border-slate-200 px-2 py-1 rounded">{exp.duration}</span>
                                    </div>
                                    <div className="text-sm font-semibold text-slate-600 mb-4">{exp.company}</div>
                                    <ul className="list-none space-y-2 text-sm text-slate-700 text-justify">
                                        {exp.description?.map((desc, j) => (
                                            <li key={j} className="relative pl-4 leading-relaxed before:content-['•'] before:absolute before:left-0 before:text-slate-400">
                                                {desc}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {data.additionalInfo && data.additionalInfo.length > 0 && (
                        <div className="mb-0">
                            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-[0.15em] mb-6 font-sans border-b-2 border-slate-900 inline-block pb-1">Additional Information</h2>
                            <ul className="list-none space-y-2 text-sm text-slate-700">
                                {data.additionalInfo.map((info, i) => (
                                    <li key={i} className="relative pl-4 leading-relaxed before:content-['•'] before:absolute before:left-0 before:text-slate-400">
                                        {info}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Modern Professional (Default Style)
    return (
        <div className="bg-white text-gray-900 p-8 md:p-12 font-sans min-h-full max-w-[850px] mx-auto shadow-sm border border-gray-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 border-b-4 border-indigo-600 pb-8 gap-6">
                <div className="flex-1">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-2">{data.personalInfo.name}</h1>
                </div>
                <div className="md:text-right text-sm text-gray-600 space-y-1.5 font-medium flex flex-col items-start md:items-end">
                    {data.personalInfo.email && <div className="flex items-center gap-2"><span className="text-indigo-600">✉</span> {data.personalInfo.email}</div>}
                    {data.personalInfo.phone && <div className="flex items-center gap-2"><span className="text-indigo-600">☎</span> {data.personalInfo.phone}</div>}
                    {data.personalInfo.links && <div className="flex items-center gap-2 text-indigo-600"><span className="text-gray-400">🔗</span> {data.personalInfo.links}</div>}
                </div>
            </div>

            <div className="mb-10 max-w-3xl">
                <p className="text-sm md:text-base text-gray-700 leading-relaxed font-medium">{data.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_2.5fr] gap-10">
                {/* Left Column */}
                <div className="space-y-10">
                    <div>
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Core Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {data.skills?.map((skill, i) => (
                                <span key={i} className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-md">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {data.education && data.education.length > 0 && (
                        <div>
                            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Education</h2>
                            <div className="space-y-6">
                                {data.education.map((edu, i) => (
                                    <div key={i} className="text-sm">
                                        <div className="font-bold text-gray-900">{edu.degree}</div>
                                        <div className="text-indigo-600 font-bold mb-1">{edu.institution}</div>
                                        <div className="text-gray-500 text-xs font-bold tracking-wider">{edu.year}</div>
                                        {edu.details && <div className="text-gray-600 text-xs mt-2 leading-relaxed">{edu.details}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {data.additionalInfo && data.additionalInfo.length > 0 && (
                        <div>
                            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Awards</h2>
                            <ul className="space-y-3">
                                {data.additionalInfo.map((info, i) => (
                                    <li key={i} className="text-sm text-gray-700 font-medium leading-relaxed border-l-2 border-indigo-200 pl-3">
                                        {info}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    <div>
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Experience</h2>
                        <div className="space-y-10">
                            {data.experience?.map((exp, i) => (
                                <div key={i} className="group">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2 gap-2">
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{exp.role}</h3>
                                        <span className="text-gray-500 text-sm font-bold tracking-wide">{exp.duration}</span>
                                    </div>
                                    <div className="text-indigo-600 font-bold mb-4">{exp.company}</div>
                                    <ul className="space-y-2.5 text-sm text-gray-700 marker:text-indigo-400">
                                        {exp.description?.map((desc, j) => (
                                            <li key={j} className="relative pl-5 leading-relaxed before:content-[''] before:w-1.5 before:h-1.5 before:bg-indigo-400 before:absolute before:left-0 before:top-2 before:rounded-sm">
                                                {desc}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeTemplate;
