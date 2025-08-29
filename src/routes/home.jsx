import Navbar from "../components/Navbar";
import ResumeCard from "../components/ResumeCard";
import { usePuterStore } from "../lib/puter";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export function meta() {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  // const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const location = useLocation();
  const next = location.search.split("next=")[1] || "/";
  
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth?next=/');
  }, [isAuthenticated, next, navigate]);

  // useEffect(() => {
  //   const loadResumes = async () => {
  //     setLoadingResumes(true);

  //     const resumesList = await kv.list("resume:*", true);

  //     const parsedResumes = resumesList?.map((resume) =>
  //       JSON.parse(resume.value)
  //     );

  //     setResumes(parsedResumes || []);
  //     setLoadingResumes(false);
  //   };

  //   loadResumes();
  // }, []);

  useEffect(() => {
    const loadResumes = () => {
      setLoadingResumes(true);

      const parsedResumes = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key.startsWith("resume:")) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              parsedResumes.push(JSON.parse(data));
            } catch (e) {
              console.warn(`Failed to parse resume ${key}`, e);
            }
          }
        }
      }

      setResumes(parsedResumes);
      console.log(resumes)
      setLoadingResumes(false);
    };

    loadResumes();
  }, []);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications & Resume Ratings</h1>
          {!loadingResumes && resumes?.length === 0 ? (
            <h2>No resumes found. Upload your first resume to get feedback.</h2>
          ) : (
            <h2>Review your submissions and check AI-powered feedback.</h2>
          )}
        </div>

        {loadingResumes && (
          <div className="flex flex-col items-center justify-center">
            <img
              src="/images/resume-scan-2.gif"
              className="w-[200px]"
              alt="Loading"
            />
          </div>
        )}

        {!loadingResumes && resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}

        {!loadingResumes && resumes?.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link
              to="/upload"
              className="primary-button w-fit text-xl font-semibold"
            >
              Upload Resume
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
