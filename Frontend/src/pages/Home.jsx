import { Link } from "react-router-dom";

function Home() {
  return (
    <section className="page-card">
      <h2>Home</h2>
      <p>Welcome to TexTrack.</p>
      <p>
        <Link to="/production-records">View Your Production Records</Link>
      </p>
    </section>
  );
}

export default Home;
