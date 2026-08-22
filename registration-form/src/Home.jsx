import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  const courses = [
    { id: "html", name: "HTML" },
    { id: "css", name: "CSS" },
    { id: "javascript", name: "JavaScript" },
    { id: "python", name: "Python" },
    { id: "react", name: "React" },
    { id: "sql", name: "SQL" },
    { id: "java", name: "Java" },
    { id: "cpp", name: "C++" },
    { id: "nodejs", name: "Node.js" },
    { id: "git", name: "Git" },
  ];

  return (
    <div className="home">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          Code<span>Hub</span>
        </div>
        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#courses">Courses</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <Link to="/register" className="register-btn">
            Register
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-content">
          <p className="welcome-text">WELCOME TO CODEHUB</p>
          <h1>
            Learn Coding
            <br />
            <span>Build Your Skills</span>
          </h1>
          <p className="hero-text">
            Learn programming languages with simple lessons, examples and
            practical exercises.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="start-btn">
              Get Started
            </Link>
            <a href="#courses" className="course-btn">
              View Courses
            </a>
          </div>
        </div>
      </section>

      {/* Courses Section - 10 Courses as Cards */}
      <section className="courses-section" id="courses">
        <div className="section-title">
          <p>EXPLORE</p>
          <h2>All Courses</h2>
          <span>
            Start learning from the basics and become a better developer.
          </span>
        </div>

        <div className="course-container">
          {courses.map((course) => (
            <Link
              to={`/course/${course.id}`}
              key={course.id}
              className="course-card"
            >
              <div className="course-top">
                <div className="course-icon">{course.name.slice(0, 2).toUpperCase()}</div>
                <span className="level">Course</span>
              </div>
              <h3>{course.name}</h3>
              <p>Learn {course.name} from basics to advanced.</p>
              <button>Start Learning →</button>
            </Link>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="about" id="about">
        <div className="about-content">
          <div className="about-left">
            <p>WHY CHOOSE US?</p>
            <h2>
              Learn at your
              <br />
              own pace.
            </h2>
          </div>
          <div className="about-right">
            <p>
              Our platform makes learning programming simple and enjoyable.
              Choose a course, learn the concepts, practice examples and improve
              your coding skills.
            </p>
            <div className="about-points">
              <div><strong>01</strong><span>Simple Lessons</span></div>
              <div><strong>02</strong><span>Practical Examples</span></div>
              <div><strong>03</strong><span>Learn Anytime</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Register CTA */}
      <section className="register-section">
        <h2>Ready to start learning?</h2>
        <p>Create your account and start learning today.</p>
        <Link to="/register">Create Account →</Link>
      </section>

      {/* Contact */}
      <section className="contact" id="contact">
        <h2>Get in Touch</h2>
        <p>Have questions? We would love to hear from you.</p>
        <div className="contact-info">
          <span>📧 codehub@gmail.com</span>
          <span>📞 +91 9876543210</span>
          <span>📍 Tamil Nadu, India</span>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-logo">
          Code<span>Hub</span>
        </div>
        <p>Learn. Practice. Build.</p>
        <small>© 2026 CodeHub. All Rights Reserved.</small>
      </footer>
    </div>
  );
}

export default Home;