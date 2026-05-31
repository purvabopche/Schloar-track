"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiCheck, FiX, FiFileText, FiDownload, FiCpu } from "react-icons/fi";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";
import { verifyDocumentsWithAI } from "@/app/actions/verifyDocuments";

export default function VerificationReview({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { isAuthorized } = useRoleRedirect({ allowedRoles: ["verifier", "admin"] }); // Admins can review too
    const router = useRouter();

    const [app, setApp] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [remarks, setRemarks] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        const fetchApp = async () => {
            try {
                const docRef = doc(db, "applications", resolvedParams.id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setApp({ id: docSnap.id, ...docSnap.data() });

                    // Mark as under_verification if it was just submitted and viewed by a verifier
                    if (docSnap.data().status === "submitted") {
                        await updateDoc(docRef, { status: "under_verification" });
                        setApp((prev: any) => ({ ...prev, status: "under_verification" }));
                    }
                } else {
                    router.push("/verifier");
                }
            } catch (error) {
                toast.error("Error fetching application");
            } finally {
                setLoading(false);
            }
        };

        if (isAuthorized) {
            fetchApp();
        }
    }, [isAuthorized, resolvedParams.id, router]);

    const runAIAnalysis = async () => {
        if (!app) return;
        setAnalyzing(true);
        const toastId = toast.loading("Gemini AI is analyzing the application...");

        try {
            const result = await verifyDocumentsWithAI(app);
            if (result.success && result.analysis) {
                setAiAnalysis(result.analysis);
                toast.success("AI Analysis complete!", { id: toastId });
            } else {
                toast.error("AI Analysis failed", { id: toastId });
            }
        } catch (error) {
            toast.error("Error running AI verification", { id: toastId });
        } finally {
            setAnalyzing(false);
        }
    };

    const handleDecision = async (decision: "approved" | "rejected") => {
        if (!app) return;
        if (!remarks.trim() && decision === "rejected") {
            toast.error("Remarks are required for rejection");
            return;
        }

        setSubmitting(true);
        const toastId = toast.loading("Processing decision...");

        try {
            await updateDoc(doc(db, "applications", app.id), {
                status: decision,
                remarks: remarks.trim(),
                verifiedAt: new Date(),
                // verifiedBy: user.uid
            });

            const actionTxt = decision === "approved" ? "verified and forwarded to Admin" : "rejected";
            toast.success(`Application ${actionTxt}!`, { id: toastId });
            setTimeout(() => router.push("/verifier"), 1500);
        } catch (error) {
            toast.error("Failed to update application status", { id: toastId });
            setSubmitting(false);
        }
    };

    if (!isAuthorized || loading || !app) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-24 relative z-10">
            <Toaster position="top-center" toastOptions={{ className: 'bg-[#1a1640] text-purple-100 border border-purple-500/30' }} />

            <Link href="/verifier" className="inline-flex items-center text-fuchsia-400 hover:text-fuchsia-300 mb-8 font-bold transition-colors">
                <FiArrowLeft className="mr-2" /> Back to Dashboard
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
                {/* Left Column: Data & Actions */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-[#130f2e]/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/10 p-8 sm:p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                        <h1 className="text-3xl font-extrabold text-white mb-8 tracking-tight relative z-10">Application Review</h1>
                        <div className="grid grid-cols-2 gap-6 pb-2 relative z-10">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider mb-1">Applicant Name</p>
                                <p className="font-bold text-white text-lg">{app.fullName}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider mb-1">Scholarship Program</p>
                                <p className="font-bold text-white text-lg">{app.scholarshipTitle}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider mb-1">Phone</p>
                                <p className="font-medium text-white">{app.phone}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider mb-1">Annual Income</p>
                                <p className="font-medium text-white">₹{app.income}</p>
                            </div>
                            <div className="col-span-2 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider mb-1">Institution</p>
                                <p className="font-medium text-white">{app.institution}</p>
                            </div>
                            <div className="col-span-2 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider mb-1">Address</p>
                                <p className="font-medium text-white">{app.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* AI Analysis Section */}
                    <div className="bg-[#1a1640]/90 rounded-3xl shadow-xl border border-fuchsia-500/30 overflow-hidden relative">
                        <div className="bg-gradient-to-r from-fuchsia-900/40 to-purple-900/40 border-b border-fuchsia-500/30 px-6 py-5 flex justify-between items-center relative z-10">
                            <h2 className="text-lg font-bold text-fuchsia-300 flex items-center">
                                <FiCpu className="mr-3" size={22} /> Gemini AI Verification
                            </h2>
                            <button
                                onClick={runAIAnalysis}
                                disabled={analyzing}
                                className="px-5 py-2 bg-fuchsia-600/20 hover:bg-fuchsia-600/40 border border-fuchsia-500/50 text-fuchsia-200 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                            >
                                {analyzing ? "Analyzing..." : "Run AI Analysis"}
                            </button>
                        </div>
                        <div className="p-8 relative z-10">
                            {aiAnalysis ? (
                                <div className="prose prose-sm prose-invert max-w-none">
                                    <p className="text-purple-100/90 whitespace-pre-wrap leading-relaxed font-medium">{aiAnalysis}</p>
                                </div>
                            ) : (
                                <p className="text-purple-300/60 text-sm italic font-medium">
                                    Run Gemini AI to analyze the applicant's data consistency and flag potential discrepancies before manual approval.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Decision Section */}
                    <div className="bg-[#130f2e]/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/10 p-8 sm:p-10">
                        <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Verification Decision</h2>

                        <div className="mb-8">
                            <label className="block text-sm font-bold text-purple-200/80 uppercase tracking-wider mb-2">Remarks / Feedback to Student</label>
                            <textarea
                                rows={4}
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Enter any feedback, missing details, or reasons for rejection..."
                                className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-fuchsia-500 text-white placeholder-purple-200/30 outline-none resize-none transition-all font-medium"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => handleDecision("approved")}
                                disabled={submitting || app.status === "approved"}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-4 px-2 rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 shadow-lg shadow-green-500/20"
                            >
                                <FiCheck className="mr-2 flex-shrink-0" size={22} /> Validate & Forward to Admin
                            </button>
                            <button
                                onClick={() => handleDecision("rejected")}
                                disabled={submitting || app.status === "rejected"}
                                className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 shadow-lg shadow-red-500/20"
                            >
                                <FiX className="mr-2" size={22} /> Reject Application
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Documents */}
                <div className="space-y-6">
                    <div className="bg-[#130f2e]/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/10 p-8 relative overflow-hidden">
                        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500/20 rounded-full blur-[60px] pointer-events-none"></div>
                        <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4 relative z-10">Uploaded Documents</h2>

                        <div className="space-y-6 relative z-10 pt-2">
                            <DocumentPreview title="Aadhaar Card" url={app.documents?.aadhaarUrl} />
                            <DocumentPreview title="Income Certificate" url={app.documents?.incomeCertUrl} />
                            <DocumentPreview title="Marksheet" url={app.documents?.marksheetUrl} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const DocumentPreview = ({ title, url }: { title: string, url?: string }) => {
    if (!url) {
        return (
            <div className="p-4 bg-red-500/20 text-red-300 rounded-xl border border-red-500/30 flex items-center">
                <FiX className="mr-3 text-red-400" size={20} />
                <span className="text-sm font-bold">{title} - Missing</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col p-5 bg-white/5 border border-white/10 rounded-2xl shadow-sm hover:border-fuchsia-500/30 transition-all group backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-white text-sm flex items-center">
                    <FiFileText className="text-fuchsia-400 mr-3" size={20} /> {title}
                </span>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fuchsia-400 hover:text-white bg-fuchsia-500/10 hover:bg-fuchsia-500/30 p-2 rounded-lg transition-all border border-transparent hover:border-fuchsia-500/30"
                    title="Open in new tab"
                >
                    <FiDownload size={18} />
                </a>
            </div>

            {/* We attempt to show an iframe preview if possible, mostly works for PDFs and images */}
            <div className="w-full h-48 bg-black/40 rounded-xl overflow-hidden border border-white/10 relative">
                <div className="absolute inset-0 flex items-center justify-center -z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-500 opacity-50"></div>
                </div>
                <iframe src={url} className="w-full h-full object-cover pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity bg-transparent" />
            </div>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-center text-xs font-bold text-purple-200/80 hover:text-white py-2.5 border border-white/10 rounded-lg hover:bg-white/10 transition-all uppercase tracking-wider"
            >
                View Full Document
            </a>
        </div>
    );
};
