import { createContext, useContext, useState } from "react";
import { useParams } from "react-router";
import { resumes } from "../constants";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [deleteResume, setDeleteResume] = useState(false);
    const [allResume, setAllResumed] = useState([])
    const [resumeLoading, setResumeLoading] = useState(false);
    const [gettingResume, setGettingResume] = useState(false);


    const getPuter = () => {
        if (typeof window !== "undefined" && window.puter) {
            return window.puter;
        }
        return null;
    };

    const signIn = async () => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return false;
        }
        setLoading(true);
        setError(null);
        try {
            const signedInUser = await puter.auth.signIn();

            if (signedInUser) {
                const currentUser = await puter.auth.getUser();
                setUser(currentUser);
            } else {
                setUser(null);
            }
            setLoading(false);
            return true;
        } catch (err) {
            setLoading(false);
            setError(err instanceof Error ? err.message : "Sign out failed");
            return false;
        }
    };

    const signOut = async () => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return false;
        }
        setLoading(true);
        setError(null);
        try {
            await puter.auth.signOut();
            setUser(null);
            setLoading(false);
            return true;
        } catch (err) {
            setLoading(false);
            setError(err instanceof Error ? err.message : String(err));
            return false;
        }
    }

    const saveToPuter = async (data) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }

        try {
            const user = await puter.auth.getUser();
            if (!user) {
                return { success: false, message: "User not authenticated" };
            }

            const metadata = {
                id: data.id,
                companyName: data.companyName,
                jobTitle: data.jobTitle,
                jobDescription: data.jobDescription,
                feedback: data.feedback,
                imagePath: data.imagePath,
                resumePath: data.resumePath,
                uploadedAt: new Date().toISOString(),
            };


            await puter.kv.set(`resume-${data.id}`, JSON.stringify(metadata));

            console.log({ success: true, message: "Upload successful" });
            return { success: true, message: "Upload successful" };
        } catch (err) {
            console.error("Upload error:", err);
            return { success: false, message: "Upload failed" };
        }
    };

    const getAllResumes = async () => {
        setResumeLoading(true)
        try {
            const resumes = (await puter.kv.list('resume-*', true));

            const parsedResumes = resumes?.map((resume) => (
                JSON.parse(resume.value)
            ))
            setAllResumed(parsedResumes || []);
            setResumeLoading(false);
        }catch(error){
            console.log(error);
            setResumeLoading(false);
        }
    }

    const deleteFromPuter = async () => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        setDeleteResume(true)
        try {
            const keys = await puter.kv.list();

            const resumeKeys = keys.filter((key) => key.startsWith("resume-"));

            for (const key of resumeKeys) {
                await puter.kv.flush(key);
            }
            setDeleteResume(false);
            console.log("All resume entries deleted successfully.");
            return { success: true };

        } catch (err) {
            setDeleteResume(false)
            console.error("Delete error:", err);
            return { success: false, error: err.message };
        }
    };


    const getFromPuter = async (path) => {
        const puter = getPuter();
        if (!puter) return null;
        setGettingResume(true);
        try {
            const resume = await puter.kv.get(path);
            if (!resume) return;

            const data = JSON.parse(resume);

            
            setGettingResume(false);
            return data;
        } catch (err) {
            console.error("Fetch error:", err);
            setGettingResume(false);
            return [];
        }
    };

    const checkAuthStatus = async () => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return false;
        }

        setLoading(true);
        setError(null);

        try {
            const isSignedIn = await puter.auth.isSignedIn();
            if (isSignedIn) {
                const currentUser = await puter.auth.getUser();
                setUser(currentUser);
                setLoading(false);
                return true;
            } else {
                setUser(null);
                setLoading(false);
                return false;
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to check auth status";
            setError(msg);
            setLoading(false);
            return false;
        }
    };

    const refreshUser = async () => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const currentUser = await puter.auth.getUser();
            setUser(currentUser);
            setLoading(false);
        } catch (err) {
            setUser(null);
            setLoading(false);
            setError(err instanceof Error ? err.message : String(err));
        }
    };

    return (
        <UserContext.Provider
            value={{
                user,
                loading,
                error,
                allResume,
                deleteResume,
                gettingResume,
                resumeLoading,
                signIn,
                signOut,
                checkAuthStatus,
                refreshUser,
                saveToPuter,
                deleteFromPuter,
                getFromPuter,
                getAllResumes,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
