import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import FileUploader from "../components/FileUploader";
import { convertPdfToImage } from "../lib/pdf2img";
import { generateUUID } from "../lib/utils";
import { prepareInstructions } from "../constants";
import { useUser } from "../context/userContext";

const Upload = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const next = location.search.split("next=")[1] || "/";
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [file, setFile] = useState(null);

    const { user, checkAuthStatus, saveToPuter, loading, error } = useUser();


    useEffect(() => {
        const init = async () => {
            const status = await checkAuthStatus()
            if (!status) navigate('/auth?next=/upload');
        }
        init()
    }, [navigate]);

    const handleFileSelect = (selectedFile) => {
        setFile(selectedFile);
    };

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }) => {
        try {
            if (!file) return;

            setIsProcessing(true);

            setStatusText('Uploading the file...');
            const uploadedFile = await puter.fs.upload([file]);
            if (!uploadedFile) return setStatusText('Error: Failed to upload file');

            setStatusText('Converting to image...');
            const imageFile = await convertPdfToImage(file);
            if (!imageFile.file) return setStatusText('Error: Failed to convert PDF to image');

            setStatusText('Uploading the image...');
            const uploadedImage = await puter.fs.upload([imageFile.file]);
            if (!uploadedImage) return setStatusText('Error: Failed to upload image');

            setStatusText("Preparing data for analysis...");
            const instructions = prepareInstructions({ jobTitle, jobDescription });

            setStatusText("Analyzing resume...");
            const feedback = await analyzeResumeWithAI(imageFile, instructions);
            if (!feedback) {
                setStatusText("Error: Failed to analyze resume");
                return;
            }

            const uuid = generateUUID();

            const data = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName,
                jobTitle,
                jobDescription,
                feedback,
            };
            setStatusText('Analysis complete, redirecting...');

            saveToPuter(data)
            setStatusText("Analysis complete!");
            navigate(`/resume/${uuid}`);
        } catch (err) {
            console.error(err);
            setStatusText("Error: Something went wrong during analysis");
        } finally {
            setIsProcessing(false);
        }
    };

    const analyzeResumeWithAI = async (uploadedFile, instructions) => {
        try {
            const response = await puter.ai.chat(instructions, uploadedFile, {
                model: "gpt-5-nano",
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
