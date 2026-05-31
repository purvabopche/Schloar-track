"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import { db, storage } from "@/lib/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { v4 as uuidv4 } from 'uuid';
import { FiUploadCloud, FiCheckCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function ApplyScholarship() {
    const { isAuthorized } = useRoleRedirect({ allowedRoles: ["student"] });
    const { user } = useAuth();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        scholarshipTitle: "",
        fullName: "",
        phone: "",
        address: "",
        income: "",
        institution: "",
    });

    // Files
    const [files, setFiles] = useState({
        aadhaar: null as File | null,
        incomeCert: null as File | null,
        marksheet: null as File | null,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: keyof typeof files) => {
        if (e.target.files && e.target.files[0]) {
            setFiles({ ...files, [type]: e.target.files[0] });
        }
    };

    const uploadFile = async (file: File, path: string): Promise<string> => {
        console.log(`[Firebase Storage] Starting upload for ${file.name} to ${path}...`);
        try {
            const fileRef = ref(storage, `${path}/${uuidv4()}_${file.name}`);
            const snapshot = await uploadBytes(fileRef, file);
            console.log(`[Firebase Storage] Upload successful for ${file.name}. Bytes transferred: ${snapshot.metadata.size}`);
            const url = await getDownloadURL(snapshot.ref);
            console.log(`[Firebase Storage] Download URL retrieved for ${file.name}: ${url}`);
            return url;
        } catch (error) {
            console.error(`[Firebase Storage Error] Failed to upload ${file.name}:`, error);
            throw error;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        let toastId = toast.loading("Submitting application... Please don't close this page.");

        try {
            console.log(`[Firebase Status] Starting new application submission for user: ${user.uid}`);
            
            // 1. Upload documents
            const uploadTasks = [];
            
            if (files.aadhaar) {
                uploadTasks.push(uploadFile(files.aadhaar, `documents/${user.uid}`).then(url => ({ type: 'aadhaarUrl', url })));
            }
            if (files.incomeCert) {
                uploadTasks.push(uploadFile(files.incomeCert, `documents/${user.uid}`).then(url => ({ type: 'incomeCertUrl', url })));
            }
            if (files.marksheet) {
                uploadTasks.push(uploadFile(files.marksheet, `documents/${user.uid}`).then(url => ({ type: 'marksheetUrl', url })));
            }

            toast.loading("Uploading all documents...", { id: toastId });
            console.log(`[Firebase Status] Waiting for ${uploadTasks.length} document uploads to complete in parallel...`);
            
            const uploadedDocs = await Promise.all(uploadTasks);
            console.log("[Firebase Status] All documents uploaded successfully:", uploadedDocs);
            
            const docsUrls = {
                aadhaarUrl: uploadedDocs.find(d => d.type === 'aadhaarUrl')?.url || "",
                incomeCertUrl: uploadedDocs.find(d => d.type === 'incomeCertUrl')?.url || "",
                marksheetUrl: uploadedDocs.find(d => d.type === 'marksheetUrl')?.url || "",
            };

            toast.loading("Saving application data...", { id: toastId });
            console.log("[Firebase Firestore] Creating new application document...");

            // 2. Save application to Firestore
            const docRef = await addDoc(collection(db, "applications"), {
                studentId: user.uid,
                studentEmail: user.email,
                ...formData,
                documents: docsUrls,
                status: "submitted", // Initial state
                submittedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            console.log(`[Firebase Firestore] Application created successfully with ID: ${docRef.id}`);

            toast.success("Application submitted successfully!", { id: toastId });
            router.push("/student");

        } catch (error: any) {
            console.error("[Firebase Error] Submission failed:", error);
            toast.error(error.message || "Failed to submit application", { id: toastId });
        } finally {
            console.log("[Firebase Status] Submission process finished.");
            setLoading(false);
        }
    };

    if (!isAuthorized) return null;

    return (
        <div className="max-w-3xl mx-auto px-4 py-24 relative z-10">
            <Toaster position="top-center" toastOptions={{ className: 'bg-[#1a1640] text-purple-100 border border-purple-500/30' }} />

            <div className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Scholarship Application</h1>
                <p className="text-purple-200/70 mt-3 text-lg">Complete the steps below to apply.</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-12 relative">
                <div className="flex items-center justify-between relative z-10">
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1.5 bg-white/10 -z-10 rounded-full"></div>
                    <div
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 -z-10 transition-all duration-700 ease-in-out rounded-full shadow-[0_0_10px_rgba(217,70,239,0.5)]"
                        style={{ width: step === 1 ? '50%' : '100%' }}
                    ></div>

                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-4 transition-all duration-500 shadow-lg ${step >= 1 ? 'bg-gradient-to-br from-fuchsia-600 to-purple-600 border-[#130f2e] text-white shadow-fuchsia-500/30' : 'bg-[#1a1640] border-[#130f2e] text-purple-200/50 hover:border-white/10'}`}>
                        1
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-4 transition-all duration-500 shadow-lg ${step >= 2 ? 'bg-gradient-to-br from-fuchsia-600 to-purple-600 border-[#130f2e] text-white shadow-fuchsia-500/30' : 'bg-[#1a1640] border-[#130f2e] text-purple-200/50 hover:border-white/10'}`}>
                        2
                    </div>
                </div>
                <div className="flex justify-between mt-4 text-sm font-bold text-purple-200/70 tracking-wide uppercase">
                    <span>Personal Info</span>
                    <span>Documents Review</span>
                </div>
            </div>

            <div className="bg-[#130f2e]/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/50 overflow-hidden border border-white/10 p-8 sm:p-10 relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); setStep(2); }}>
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                                    <span className="bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent">Personal Details</span>
                                    <div className="ml-4 h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-purple-200/80 mb-2 tracking-wider">Select Scholarship</label>
                                        <select
                                            required name="scholarshipTitle" value={formData.scholarshipTitle} onChange={handleInputChange}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all font-medium"
                                        >
                                            <option value="" className="bg-[#130f2e] text-purple-200/50">Select an option...</option>
                                            <option value="Merit Based Scholarship 2026" className="bg-[#130f2e] text-white">Merit Based Scholarship 2026</option>
                                            <option value="Minority Scholarship Scheme" className="bg-[#130f2e] text-white">Minority Scholarship Scheme</option>
                                            <option value="State Excellence Award" className="bg-[#130f2e] text-white">State Excellence Award</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-purple-200/80 mb-2 tracking-wider">Full Name (as per documents)</label>
                                        <input type="text" required name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-200/30 outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all font-medium" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-purple-200/80 mb-2 tracking-wider">Phone Number</label>
                                        <input type="tel" required name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-200/30 outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all font-medium" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-purple-200/80 mb-2 tracking-wider">Annual Family Income (₹)</label>
                                        <input type="number" required name="income" value={formData.income} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-200/30 outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all font-medium" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-purple-200/80 mb-2 tracking-wider">Current Institution / College Name</label>
                                        <input type="text" required name="institution" value={formData.institution} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-200/30 outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all font-medium" />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-purple-200/80 mb-2 tracking-wider">Residential Address</label>
                                        <input type="text" required name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-200/30 outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all font-medium" />
                                    </div>
                                </div>

                                <div className="pt-8 flex justify-end relative z-10">
                                    <button type="submit" className="px-8 py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-fuchsia-500/20 transition-all font-bold transform hover:-translate-y-0.5">
                                        Next Step →
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <h2 className="text-2xl font-bold text-white mb-8 flex items-center relative z-10">
                                    <span className="bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent">Document Uploads</span>
                                    <div className="ml-4 h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                                </h2>
                                <div className="bg-fuchsia-900/20 border border-fuchsia-500/30 text-fuchsia-200 p-5 rounded-2xl text-sm mb-8 relative z-10 backdrop-blur-md font-medium">
                                    <p className="font-bold text-fuchsia-400 mb-1 text-base">Please ensure all uploaded documents are clear and readable.</p>
                                    <p className="text-purple-200/80">Our verification officers and automated AI systems will review these before approval.</p>
                                </div>

                                <div className="space-y-6 relative z-10">
                                    <FileUploadRow
                                        label="Aadhaar Card"
                                        id="aadhaar"
                                        file={files.aadhaar}
                                        onChange={(e) => handleFileChange(e, "aadhaar")}
                                    />
                                    <FileUploadRow
                                        label="Income Certificate"
                                        id="incomeCert"
                                        file={files.incomeCert}
                                        onChange={(e) => handleFileChange(e, "incomeCert")}
                                    />
                                    <FileUploadRow
                                        label="Last Year Marksheet"
                                        id="marksheet"
                                        file={files.marksheet}
                                        onChange={(e) => handleFileChange(e, "marksheet")}
                                    />
                                </div>

                                <div className="pt-10 flex justify-between relative z-10 border-t border-white/10 mt-8">
                                    <button type="button" onClick={() => setStep(1)} className="px-6 py-3 border border-white/20 text-purple-200 hover:text-white hover:bg-white/5 rounded-xl transition-all font-bold">
                                        ← Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || !files.aadhaar || !files.incomeCert || !files.marksheet}
                                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-400 hover:to-emerald-500 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg shadow-green-500/20 transform hover:-translate-y-0.5"
                                    >
                                        {loading ? "Submitting..." : <><FiCheckCircle className="mr-2" size={20} /> Submit Application</>}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </div>
        </div>
    );
}

// Helper component for styled file uploads
const FileUploadRow = ({ label, id, file, onChange }: { label: string, id: string, file: File | null, onChange: (e: any) => void }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-white/10 rounded-2xl bg-black/30 group hover:bg-white/5 transition-all">
        <div className="mb-4 sm:mb-0">
            <label htmlFor={id} className="font-bold text-white cursor-pointer text-base">{label}</label>
            <p className="text-xs text-purple-300/50 mt-1 font-medium tracking-wide">PDF, JPG or PNG (Max. 5MB)</p>
        </div>
        <div className="flex items-center">
            <input
                type="file"
                id={id}
                onChange={onChange}
                accept=".pdf,image/png,image/jpeg"
                className="hidden"
            />
            {file ? (
                <div className="flex items-center text-green-400 bg-green-500/10 px-4 py-2 border border-green-500/30 rounded-xl relative shadow-inner">
                    <FiCheckCircle className="mr-2" size={18} />
                    <span className="text-sm font-bold truncate max-w-[150px]">{file.name}</span>
                </div>
            ) : (
                <label htmlFor={id} className="cursor-pointer inline-flex items-center px-5 py-2.5 border border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-300 hover:bg-fuchsia-500/20 hover:text-fuchsia-200 rounded-xl transition-all text-sm font-bold shadow-[0_0_15px_rgba(217,70,239,0.1)]">
                    <FiUploadCloud className="mr-2" size={18} /> Choose File
                </label>
            )}
        </div>
    </div>
);
