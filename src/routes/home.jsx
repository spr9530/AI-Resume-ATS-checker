import Navbar from "../components/Navbar";
import ResumeCard from "../components/ResumeCard";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "../context/userContext";

export default function Home() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { checkAuthStatus, getAllResumes, allResume, resumeLoading} = useUser();

  useEffect(() => {
    const init = async () => {
      const status = await checkAuthStatus();
      if(status){
        setIsAuthenticated(true);
        await getAllResumes();
      }
    }
    init()
  }, [navigate])

  useEffect(() => {
    const loadResumes = async() => {
        setLoadingResumes(true);

        const parsedResumes = allResume;

        setResumes(parsedResumes || []);
        setLoadingResumes(false);
    }

    loadResumes();
  }, [navigate, allResume]);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
      <div className="page-heading py-16">
        <h1>Track Your Applications & Resume Ratings</h1>
        {!resumeLoading && resumes?.length === 0 ? (
            <h2>No resumes found. Upload your first resume to get feedback.</h2>
        ): (
          <h2>Review your submissions and check AI-powered feedback.</h2>
        )}
      </div>
      {resumeLoading && (
          <div className="flex flex-col items-center justify-center">
            <img src="/images/resume-scan-2.gif" className="w-[200px]" />
          </div>
      )}

      {!resumeLoading && resumes.length > 0 && (
        <div className="resumes-section">
          {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
      )}

      {!resumeLoading && resumes?.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
              Upload Resume
            </Link>
          </div>
      )}
    </section>
    </main>
  );
}
