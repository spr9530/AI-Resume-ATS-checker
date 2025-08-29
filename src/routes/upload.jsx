import { useEffect, useState } from 'react';
import Navbar from "../components/Navbar";
import FileUploader from "../components/FileUploader";
// import { usePuterStore } from "../lib/puter";
import { useNavigate, useLocation } from "react-router-dom";
import { convertPdfToImage } from "../lib/pdf2img";
import { generateUUID } from "../lib/utils";
import { prepareInstructions } from "../constants";

const Upload = () => {
    // const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState(null);

    const location = useLocation();
    const next = location.search.split("next=")[1] || "/";

    const [isAuthenticated, setIsAuthenticated] = useState(
        localStorage.getItem("isAuthenticated") === "true"
    );
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) navigate('/auth?next=/');
    }, [isAuthenticated, next, navigate]);

    const handleFileSelect = (file) => {
        setFile(file);
    };

    //   const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }) => {
    //     setIsProcessing(true);

    //     setStatusText('Uploading the file...');
    //     const uploadedFile = await fs.upload([file]);
    //     if (!uploadedFile) return setStatusText('Error: Failed to upload file');

    //     setStatusText('Converting to image...');
    //     const imageFile = await convertPdfToImage(file);
    //     if (!imageFile.file) return setStatusText('Error: Failed to convert PDF to image');

    //     setStatusText('Uploading the image...');
    //     const uploadedImage = await fs.upload([imageFile.file]);
    //     if (!uploadedImage) return setStatusText('Error: Failed to upload image');

    //     setStatusText('Preparing data...');
    //     const uuid = generateUUID();
    //     const data = {
    //       id: uuid,
    //       resumePath: uploadedFile.path,
    //       imagePath: uploadedImage.path,
    //       companyName,
    //       jobTitle,
    //       jobDescription,
    //       feedback: '',
    //     };
    //     await kv.set(`resume:${uuid}`, JSON.stringify(data));

    //     setStatusText('Analyzing...');
    //     const feedback = await ai.feedback(
    //       uploadedFile.path,
    //       prepareInstructions({ jobTitle, jobDescription })
    //     );
    //     if (!feedback) return setStatusText('Error: Failed to analyze resume');

    //     const feedbackText = typeof feedback.message.content === 'string'
    //       ? feedback.message.content
    //       : feedback.message.content[0].text;

    //     data.feedback = JSON.parse(feedbackText);
    //     await kv.set(`resume:${uuid}`, JSON.stringify(data));

    //     setStatusText('Analysis complete, redirecting...');
    //     console.log(data);
    //     navigate(`/resume/${uuid}`);
    //   };

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }) => {
        try {
            setIsProcessing(true);

            setStatusText('Converting PDF to image...');
            const imageFile = await convertPdfToImage(file);
            if (!imageFile?.file) {
                setStatusText('Error: Failed to convert PDF to image');
                return;
            }

            setStatusText('Preparing data for analysis...');
            const instructions = prepareInstructions({ jobTitle, jobDescription });

            setStatusText('Analyzing resume...');
            const feedback = await analyzeResumeWithAI(imageFile, instructions);

            if (!feedback) {
                setStatusText('Error: Failed to analyze resume');
                return;
            }

            const uuid = generateUUID();

            // Convert files to Base64
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
                feedback
            };

            localStorage.setItem(`resume:${uuid}`, JSON.stringify(data));
            setStatusText('Analysis complete!');
            navigate(`/resume/${uuid}`);

        } catch (err) {
            console.error(err);
            setStatusText('Error: Something went wrong during analysis');
        }
    };


    // AI integration with ChatGPT
    const analyzeResumeWithAI = async (imageFile, instructions) => {
        try {
            const response = await puter.ai.chat(instructions, imageFile, {
                model: 'gpt-4o-mini',
                temperature: 0
            });

            // Puter.ai response structure
            const feedbackText = response?.message?.content;
            console.log(response)
            if (!feedbackText) {
                console.warn('No content returned from Puter.ai');
                return null;
            }

            try {
                return JSON.parse(feedbackText); // Expect JSON from AI
            } catch (e) {
                console.warn('Failed to parse AI JSON, returning raw text.');
                return { raw: feedbackText };
            }
        } catch (err) {
            console.error('Puter.ai error:', err);
            return null;
        }
    };





    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if (!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name');
        const jobTitle = formData.get('job-title');
        const jobDescription = formData.get('job-description');

        if (!file) return;

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
                            <img src="/images/resume-scan.gif" className="w-full" />
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
