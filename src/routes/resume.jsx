import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState, useMemo } from "react";
import Summary from "../components/Summary";
import ATS from "../components/ATS";
import Details from "../components/Details";
import { useUser } from "../context/userContext";

const Resume = () => {
  const { id } = useParams();
  const [resumeState, setResumeState] = useState({
    resumeUrl: null,
    imageUrl: null,
    feedback: null,
  });

  const navigate = useNavigate();
  const { checkAuthStatus, getFromPuter, gettingResume } = useUser();

  // Auth check
  useEffect(() => {
    const init = async () => {
      const status = await checkAuthStatus();
      if (!gettingResume && !status) {
        navigate(`/auth?next=/resume/${id}`);
      }
    };
    init();
  }, [navigate]);

  // Resume fetch
  useEffect(() => {
    const loadResume = async () => {
      const resumeData = await getFromPuter(`resume-${id}`);
      if (!resumeData) return;

      let resumeUrl = null;
      let imageUrl = null;

      if (resumeData.resumePath) {
        try {
          const resumeBlobData = await puter.fs.read(resumeData.resumePath);
          const pdfBlob = new Blob([resumeBlobData], { type: "application/pdf" });
          resumeUrl = URL.createObjectURL(pdfBlob);
          resumeUrl = URL.createObjectURL(pdfBlob);
        } catch (err) {
          console.error("Error processing resume file:", err);
        }
      }

      if (resumeData.imagePath) {
        try {
          const image = await puter.fs.read(resumeData.imagePath);
          imageUrl = URL.createObjectURL(image);
        } catch (err) {
          console.error("Error processing image file:", err);
        }
      }

      setResumeState({
        resumeUrl,
        imageUrl,
        feedback: safeParse(resumeData.feedback),
      });
    };

    if (resumeUrl === null ||
      imageUrl === null ||
      feedback === null) {
      loadResume();
    }
  }, [id, getFromPuter]);

  // Helper: safely parse JSON feedback
  const safeParse = (data) => {
    if (!data) return null;
    try {
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch {
      return data;
    }
  };

  // Memoized destructuring for smoother rendering
  const { resumeUrl, imageUrl, feedback } = useMemo(
    () => resumeState,
    [resumeState]
  );

  return (
    <main className="!pt-0">
      <nav className="resume-nav">
        <Link to="/" className="back-button">
          <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
          <span className="text-gray-800 text-sm font-semibold">
            Back to Homepage
          </span>
        </Link>
      </nav>

      <div className="flex flex-row w-full max-lg:flex-col-reverse">
        {/* Resume Preview */}
        <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
          {imageUrl && resumeUrl && (
            <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={imageUrl}
                  className="w-full h-full object-contain rounded-2xl"
                  title="resume"
                />
              </a>
            </div>
          )}
        </section>

        {/* Feedback */}
        <section className="feedback-section">
          <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
          {feedback ? (
            <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
              <Summary feedback={feedback} />
              <ATS
                score={feedback.ATS?.score || 0}
                suggestions={feedback.ATS?.tips || []}
              />
              <Details feedback={feedback} />
            </div>
          ) : (
            <img src="/images/resume-scan-2.gif" className="w-full" />
          )}
        </section>
      </div>
    </main>
  );
};

export default Resume;
