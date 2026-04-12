import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <section className="home-container">
      <div className="home-card">
        <h2>Welcome to TexTrack 👋</h2>
        <p className="home-subtitle">
          Manage and monitor your production records easily.
        </p>

        <Link to="/production-records" className="home-btn">
          View Production Records
        </Link>
      </div>
    </section>
  );
}

export default Home;