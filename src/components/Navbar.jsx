import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router";
import { useUser } from "../context/userContext";
import { useEffect, useState } from "react";

function Navbar() {
  const { checkAuthStatus, deleteFromPuter, deleteResume, getAllResumes, allResume } = useUser()
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate()
  const location = useLocation();

  useEffect(() => {
    const init = async () => {
      const status = await checkAuthStatus();
      setIsAuthenticated(status);
      if (status) {
        await getAllResumes();
      }
    }
      init();
  }, [navigate])

  const handleDelete = async () => {
    await deleteFromPuter();
     await getAllResumes();
  }
  return (
    <nav className="navbar">
      <Link to="/">
        <p className="text-2xl font-bold text-gradient">RESUMIND</p>
      </Link>
      <div className="flex gap-3">
        {allResume?.length > 0 && location.pathname === '/' && <Link onClick={handleDelete}>
          <p className="primary-button w-fit ">{deleteResume ? 'Deleting' : 'Remove All Data'}</p>
        </Link>}
        {isAuthenticated &&
          <Link to="/auth" className="primary-button w-fit">
            LogOut
          </Link>}

        <Link to="/upload" className="primary-button w-fit">
          Upload Resume
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
