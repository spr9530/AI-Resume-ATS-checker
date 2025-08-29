import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import FileUploader from "../components/FileUploader";
import { convertPdfToImage } from "../lib/pdf2img";
import { generateUUID } from "../lib/utils";
import { prepareInstructions } from "../constants";

const Upload = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const next = location.search.split("next=")[1] || "/";

    const [isAuthenticated, setIsAuthenticated] = useState(
        localStorage.getItem("isAuthenticated") === "true"
    );
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [file, setFile] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) navigate("/auth?next=/");
    }, [isAuthenticated, navigate]);

    const handleFileSelect = (selectedFile) => {
        setFile(selectedFile);
    };

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }) => {
        try {
            if (!file) return;

            setIsProcessing(true);
            setStatusText("Converting PDF to image...");

            // Convert PDF to image
            const imageFile = await convertPdfToImage(file);
            if (!imageFile) {
                setStatusText("Error: Failed to convert PDF to image");
                return;
            }

            setStatusText("Preparing data for analysis...");
            const instructions = prepareInstructions({ jobTitle, jobDescription });

            setStatusText("Analyzing resume...");
            const feedback = await analyzeResumeWithAI(imageFile, instructions);
            if (!feedback) {
                setStatusText("Error: Failed to analyze resume");
                return;
            }

            const uuid = generateUUID();

            // Use URL.createObjectURL instead of storing raw blob in localStorage
            const fileToBase64 = (file) => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = (err) => reject(err);
            });

            const resumeBase64 = await fileToBase64(file);
            const imageBase64 = await fileToBase64(imageFile.file);

            const data = {
                id: uuid,
                resumeFile: resumeBase64,
                imageFile: imageBase64,
                companyName,
                jobTitle,
                jobDescription,
                feedback,
            };

            localStorage.setItem(`resume:${uuid}`, JSON.stringify(data));
            setStatusText("Analysis complete!");
            navigate(`/resume/${uuid}`);
        } catch (err) {
            console.error(err);
            setStatusText("Error: Something went wrong during analysis");
        } finally {
            setIsProcessing(false);
        }
    };

    const analyzeResumeWithAI = async (imageFile, instructions) => {
        try {
            const response = await puter.ai.chat(instructions, imageFile, {
                model: "gpt-4o-mini",
                temperature: 0,
            });

            // Updated to match Puter.ai response
            const feedbackText = response?.result?.message?.content || response?.message?.content;
            if (!feedbackText) return null;

            try {
                return JSON.parse(feedbackText); // Expect JSON from AI
            } catch (e) {
                console.warn("Failed to parse AI JSON, returning raw text.");
                return { raw: feedbackText };
            }
        } catch (err) {
            console.error("Puter.ai error:", err);
            return null;
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData(e.currentTarget);
        const companyName = formData.get("company-name");
        const jobTitle = formData.get("job-title");
        const jobDescription = formData.get("job-description");

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    };

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" alt="Processing..." />
                        </>
                    ) : (
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )}

                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button className="primary-button" type="submit">
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Upload;
