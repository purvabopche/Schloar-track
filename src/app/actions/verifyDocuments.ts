"use server";

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function verifyDocumentsWithAI(applicationData: any) {
    try {
        // We send a structured prompt to Gemini asking it to analyze the application details and provide a risk assessment.
        // In a full production system, we would download the actual PDF/Images from the storage URLs and pass them 
        // as base64 inlineData to Gemini 2.0. For this implementation, since fetching external URLs with signed 
        // access directly via Gemini API might have limitations, we simulate the analysis based on standard data checks,
        // but we use the real Gemini API to generate the formatted analysis report.

        const prompt = `
    You are an expert AI Verification Officer for a Scholarship Management System.
    Please review the following application details for consistency, potential risks, and flag any suspicious information.
    
    Applicant Name: ${applicationData.fullName}
    Declared Income: ₹${applicationData.income}
    Institution: ${applicationData.institution}
    Address: ${applicationData.address}
    
    Uploaded Document Links (For Reference):
    1. Aadhaar: ${applicationData.documents?.aadhaarUrl ? 'Provided' : 'Missing'}
    2. Income Certificate: ${applicationData.documents?.incomeCertUrl ? 'Provided' : 'Missing'}
    3. Marksheet: ${applicationData.documents?.marksheetUrl ? 'Provided' : 'Missing'}
    
    Provide a short analysis (max 3 sentences) focusing on:
    1. Are all documents provided?
    2. Is the income reasonable for typical scholarship requirements (usually < ₹8,00,000)?
    3. Overall confidence score (0-100%).
    
    Format the output cleanly.
    `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
        });

        return {
            success: true,
            analysis: response.text,
        };
    } catch (error: any) {
        console.error("Gemini AI API Error:", error);
        return {
            success: false,
            error: error.message || "Failed to analyze documents",
        };
    }
}
