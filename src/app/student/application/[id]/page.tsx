"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "@/lib/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiClock, FiCheckCircle, FiXCircle, FiFileText, FiDownload, FiInfo, FiUploadCloud } from "react-icons/fi";
import Link from "next/link";
import { use } from "react";
import { toast } from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

interface ApplicationDetails {
    id: string;
    studentId: string;
    scholarshipTitle: string;
    fullName: string;
    phone: string;
    address: string;
    income: string;
    institution: string;
    status: "submitted" | "under_verification" | "approved" | "rejected" | "disbursed";
    submittedAt: any;
    remarks?: string;
    documents: {
        aadhaarUrl: string;
        incomeCertUrl: string;
        marksheetUrl: string;
    };
}

const statusConfig = {
    submitted: { color: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: <FiClock className="mr-2" size={20} />, label: "Submitted", desc: "Your application has been received." },
    under_verification: { color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", icon: <FiFileText className="mr-2" size={20} />, label: "Under Verification", desc: "Documents are being reviewed." },
    approved: { color: "bg-green-500/20 text-green-300 border-green-500/30", icon: <FiCheckCircle className="mr-2" size={20} />, label: "Approved!", desc: "Application approved by Admin." },
    rejected: { color: "bg-red-500/20 text-red-300 border-red-500/30", icon: <FiXCircle className="mr-2" size={20} />, label: "Rejected", desc: "Application was rejected." },
    disbursed: { color: "bg-purple-500/20 text-purple-300 border-purple-500/30", icon: <FiCheckCircle className="mr-2" size={20} />, label: "Disbursed", desc: "Scholarship funds have been disbursed." },
};

export default function StudentApplicationDetails({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { isAuthorized } = useRoleRedirect({ allowedRoles: ["student"] });
    const { user } = useAuth();
    const router = useRouter();

    const [app, setApp] = useState<ApplicationDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApp = async () => {
            if (!user) return;
            try {
                console.log(`[Firebase Firestore] Fetching application details for ID: ${resolvedParams.id}...`);
                const docRef = doc(db, "applications", resolvedParams.id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as Omit<ApplicationDetails, "id">;
                    console.log("[Firebase Firestore] Application data retrieved.");
                    if (data.studentId !== user.uid) {
                        console.warn("[Security] Unauthorized access attempt detected.");
                        router.push("/student"); // Security check
                        return;
                    }
                    setApp({ id: docSnap.id, ...data });
                } else {
                    console.warn(`[Firebase Firestore] Application ${resolvedParams.id} not found.`);
                    router.push("/student");
                }
            } catch (error) {
                console.error("[Firebase Error] Failed to fetch application details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthorized) {
            fetchApp();
        }
    }, [user, isAuthorized, resolvedParams.id, router]);

    const handleReupload = async (e: React.ChangeEvent<HTMLInputElement>, docType: keyof ApplicationDetails["documents"]) => {
        const file = e.target.files?.[0];
        if (!file || !user || !app) return;

        const toastId = toast.loading(`Uploading new ${docType}...`);
        try {
            console.log(`[Firebase Status] Starting re-upload for ${docType}: ${file.name}`);
            const fileRef = ref(storage, `documents/${user.uid}/${uuidv4()}_${file.name}`);
            const snapshot = await uploadBytes(fileRef, file);
            console.log(`[Firebase Storage] Upload successful. Bytes transferred: ${snapshot.metadata.size}`);
            
            const downloadUrl = await getDownloadURL(snapshot.ref);
            console.log(`[Firebase Storage] New download URL retrieved: ${downloadUrl}`);

            console.log(`[Firebase Firestore] Updating application ${app.id} documents object...`);
            const updatedDocs = { ...app.documents, [docType]: downloadUrl };
            await updateDoc(doc(db, "applications", app.id), {
                documents: updatedDocs
            });
            console.log(`[Firebase Firestore] Document updated successfully.`);

            setApp({ ...app, documents: updatedDocs });
            toast.success("Document re-uploaded successfully!", { id: toastId });
        } catch (error) {
            console.error("[Firebase Error] Re-upload failed:", error);
            toast.error("Upload failed", { id: toastId });
        }
    };

    if (!isAuthorized || loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500"></div>
            </div>
        );
    }

    if (!app) return null;

    const currentStatus = statusConfig[app.status] || statusConfig.submitted;

    return (
        <div className="max-w-5xl mx-auto px-4 py-24 relative z-10">
            <Link href="/student" className="inline-flex items-center text-fuchsia-400 hover:text-fuchsia-300 mb-8 font-bold transition-colors">
                <FiArrowLeft className="mr-2" /> Back to Dashboard
            </Link>

            <div className="bg-[#130f2e]/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/50 border border-white/10 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                {/* Header Section */}
                <div className="border-b border-white/10 p-8 sm:p-10 bg-white/5 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">{app.scholarshipTitle}</h1>
                            <p className="text-purple-200/70 mt-2 font-medium">Application ID: <span className="font-mono text-sm bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 ml-1">{app.id}</span></p>
                        </div>
                        <div className={`flex items-center px-5 py-3 rounded-xl border backdrop-blur-sm ${currentStatus.color}`}>
                            {currentStatus.icon}
                            <div>
                                <p className="font-bold text-sm uppercase tracking-wider">{currentStatus.label}</p>
                                <p className="text-xs opacity-80 mt-0.5">{currentStatus.desc}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Remarks Banner */}
                {app.remarks && (
                    <div className="bg-blue-900/20 border-l-4 border-blue-500 p-5 m-8 sm:mx-10 flex items-start rounded-r-xl backdrop-blur-sm relative z-10">
                        <FiInfo className="text-blue-400 mt-0.5 mr-4 flex-shrink-0" size={24} />
                        <div>
                            <h3 className="text-base font-bold text-blue-300">Message from Verification Officer / Admin</h3>
                            <p className="text-sm text-blue-100/80 mt-2 font-medium leading-relaxed">{app.remarks}</p>
                            {app.status === "rejected" && (
                                <Link href="/student/apply" className="inline-block mt-4 text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 px-5 py-2.5 rounded-lg font-bold transition-all">
                                    Submit New Application
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-8 sm:p-10 relative z-10">
                    {/* Details Section */}
                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 inline-block">Applicant Details</h2>
                        <dl className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                            <div className="sm:col-span-1 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <dt className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider mb-1">Full Name</dt>
                                <dd className="text-base text-white font-medium">{app.fullName}</dd>
                            </div>
                            <div className="sm:col-span-1 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <dt className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider mb-1">Phone</dt>
                                <dd className="text-base text-white font-medium">{app.phone}</dd>
                            </div>
                            <div className="sm:col-span-2 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <dt className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider mb-1">Institution</dt>
                                <dd className="text-base text-white font-medium">{app.institution}</dd>
                            </div>
                            <div className="sm:col-span-1 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <dt className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider mb-1">Annual Income</dt>
                                <dd className="text-base text-white font-medium">₹{app.income}</dd>
                            </div>
                            <div className="sm:col-span-2 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <dt className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider mb-1">Address</dt>
                                <dd className="text-base text-white font-medium">{app.address}</dd>
                            </div>
                            <div className="sm:col-span-2 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <dt className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider mb-1">Submission Date</dt>
                                <dd className="text-base text-white font-medium">
                                    {app.submittedAt?.toDate().toLocaleString() || "N/A"}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Documents Section */}
                    <div className="space-y-6 bg-black/30 p-8 rounded-3xl border border-white/10 relative overflow-hidden h-fit">
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/20 rounded-full blur-[60px] pointer-events-none"></div>
                        <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 inline-block relative z-10">Uploaded Documents</h2>

                        <div className="space-y-5 relative z-10 pt-2">
                            <DocumentLink 
                                title="Aadhaar Card" url={app.documents?.aadhaarUrl} 
                                allowReupload={app.status === "rejected" || app.status === "under_verification"}
                                onUpload={(e) => handleReupload(e, "aadhaarUrl" as any)}
                            />
                            <DocumentLink 
                                title="Income Certificate" url={app.documents?.incomeCertUrl} 
                                allowReupload={app.status === "rejected" || app.status === "under_verification"}
                                onUpload={(e) => handleReupload(e, "incomeCertUrl" as any)}
                            />
                            <DocumentLink 
                                title="Marksheet" url={app.documents?.marksheetUrl} 
                                allowReupload={app.status === "rejected" || app.status === "under_verification"}
                                onUpload={(e) => handleReupload(e, "marksheetUrl" as any)}
                            />
                        </div>
                    </div>

                    {/* Progress Timeline Section */}
                    <div className="md:col-span-2 space-y-6 bg-[#1a0b2e]/40 p-10 rounded-3xl border border-fuchsia-500/20 shadow-[0_10px_30px_rgba(217,70,239,0.1)] relative overflow-hidden">
                        <div className="absolute top-0 right-1/4 w-60 h-60 bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none"></div>
                        <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 inline-block relative z-10">Application Progress Tracker</h2>
                        
                        <div className="relative pt-12 pb-6 px-4">
                            {/* Background Line for Desktop */}
                            <div className="absolute top-1/2 left-10 right-10 h-1 bg-white/10 -translate-y-1/2 rounded-full hidden md:block z-0"></div>
                            
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-10 md:gap-0">
                                {["submitted", "under_verification", "approved", "disbursed"].map((step, idx) => {
                                    const stepLabels = {
                                        submitted: "Application Submitted",
                                        under_verification: "Under Verification",
                                        approved: "Admin Approved",
                                        disbursed: "Funds Disbursed"
                                    };
                                    
                                    // Status logic
                                    let isCompleted = false;
                                    let isCurrent = false;
                                    let isRejected = app.status === "rejected" && idx === 1; // Simplification
                                    
                                    const statusOrder = ["submitted", "under_verification", "approved", "disbursed"];
                                    const currentIdx = statusOrder.indexOf(app.status);
                                    
                                    if (app.status === "rejected") {
                                        if (idx === 0) isCompleted = true; 
                                    } else {
                                        if (idx < currentIdx) isCompleted = true;
                                        if (idx === currentIdx) isCurrent = true;
                                    }

                                    return (
                                        <div key={step} className="flex flex-row md:flex-col items-center gap-6 md:gap-4 relative w-full md:w-auto">
                                            {/* Colored active line for desktop */}
                                            {idx > 0 && (isCompleted || isCurrent) && (
                                                <div className="absolute top-1/2 right-[50%] w-[100vw] h-1 bg-gradient-to-r from-fuchsia-500 to-purple-500 -translate-y-1/2 z-[-1] hidden md:block" style={{ width: '250%'}}></div>
                                            )}
                                            
                                            {/* Mobile vertical line connecting dots */}
                                            {idx > 0 && <div className={`absolute -top-10 left-6 sm:left-7 w-0.5 h-10 md:hidden ${isCompleted || isCurrent ? 'bg-fuchsia-500' : 'bg-white/10'}`}></div>}
                                            
                                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-lg shadow-xl z-10 flex-shrink-0 transition-all duration-500
                                                ${isCompleted ? 'bg-gradient-to-br from-fuchsia-600 to-purple-600 text-white shadow-fuchsia-500/40' : 
                                                isCurrent ? 'bg-gradient-to-br from-fuchsia-400 to-purple-500 text-white border-4 border-[#070514] box-content shadow-fuchsia-500/60 scale-110 animate-pulse' : 
                                                isRejected && idx === 1 ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-red-500/40' :
                                                'bg-white/5 text-white/30 border-2 border-white/10 backdrop-blur-md'}`}
                                            >
                                                {isCompleted ? <FiCheckCircle size={24} /> : isRejected && idx === 1 ? <FiXCircle size={24} /> : idx + 1}
                                            </div>
                                            <div className="text-left md:text-center flex-1">
                                                <p className={`font-bold text-base md:text-sm whitespace-nowrap ${isCurrent || isCompleted ? 'text-white' : isRejected && idx === 1 ? 'text-red-400' : 'text-white/40'}`}>
                                                    {isRejected && idx === 1 ? "Application Rejected" : stepLabels[step as keyof typeof stepLabels]}
                                                </p>
                                                {isCurrent && <p className="text-[10px] text-fuchsia-400 font-bold uppercase tracking-widest mt-1.5 md:mt-2 bg-fuchsia-500/10 inline-block px-2 py-1 rounded-md border border-fuchsia-500/20">Current Stage</p>}
                                                {isRejected && idx === 1 && <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mt-1.5 md:mt-2 bg-red-500/10 inline-block px-2 py-1 rounded-md border border-red-500/20">Needs Attention</p>}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const DocumentLink = ({ title, url, allowReupload, onUpload }: { title: string, url?: string, allowReupload?: boolean, onUpload?: (e: any) => void }) => {
    if (!url) return null;

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl shadow-sm hover:bg-white/10 transition-all group gap-4 sm:gap-0">
            <div className="flex items-center">
                <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-500/30 flex items-center justify-center mr-4">
                    <FiFileText className="text-fuchsia-400" size={20} />
                </div>
                <span className="font-bold text-white break-words pr-2">{title}</span>
            </div>
            <div className="flex items-center gap-3">
                {allowReupload && (
                    <label className="cursor-pointer flex items-center px-4 py-2 text-xs font-bold text-fuchsia-300 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-xl hover:bg-fuchsia-500/20 transition-all shadow-inner">
                        <FiUploadCloud className="mr-1.5" size={16} /> Re-upload
                        <input type="file" accept=".pdf,image/png,image/jpeg" className="hidden" onChange={onUpload} />
                    </label>
                )}
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-2.5 text-purple-300 hover:text-white bg-purple-500/10 hover:bg-fuchsia-500/30 border border-transparent hover:border-fuchsia-500/30 rounded-xl transition-all shadow-[0_0_10px_rgba(217,70,239,0)] hover:shadow-[0_0_10px_rgba(217,70,239,0.3)]"
                >
                    <FiDownload size={18} />
                </a>
            </div>
        </div>
    );
};
