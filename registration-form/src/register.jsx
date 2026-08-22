import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./register.css";

function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    country: "",
    selectedCourse: "",
  });

  const [users, setUsers] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  // Courses with W3Schools links
  const courses = [
    {
      name: "HTML",
      url: "https://www.w3schools.com/html/",
    },
    {
      name: "CSS",
      url: "https://www.w3schools.com/css/",
    },
    {
      name: "JavaScript",
      url: "https://www.w3schools.com/js/",
    },
    {
      name: "Python",
      url: "https://www.w3schools.com/python/",
    },
    {
      name: "React",
      url: "https://www.w3schools.com/react/",
    },
    {
      name: "SQL",
      url: "https://www.w3schools.com/sql/",
    },
    {
      name: "Java",
      url: "https://www.w3schools.com/java/",
    },
    {
      name: "C++",
      url: "https://www.w3schools.com/cpp/",
    },
    {
      name: "Node.js",
      url: "https://www.w3schools.com/nodejs/",
    },
    {
      name: "Git",
      url: "https://www.w3schools.com/git/",
    },
  ];

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Password does not match");
      return;
    }

    if (editIndex !== null) {
      const updated = [...users];
      updated[editIndex] = formData;
      setUsers(updated);
      setEditIndex(null);
    } else {
      setUsers([...users, formData]);

      // Find selected course
      const selectedCourse = courses.find(
        (course) => course.name === formData.selectedCourse
      );

      // Go to selected W3Schools course
      if (selectedCourse) {
        window.location.href = selectedCourse.url;
        return;
      }
    }

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      gender: "",
      country: "",
      selectedCourse: "",
    });
  };

  const handleEdit = (index) => {
    setFormData(users[index]);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const newUsers = users.filter((_, i) => i !== index);
    setUsers(newUsers);
  };

  return (
    <div>
      <h1>Registration Form</h1>

      <form onSubmit={handleSubmit}>
        <label>First Name</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />

        <label>Last Name</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <label>Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <label>Gender</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <label>Country</label>
        <select
          name="country"
          value={formData.country}
          onChange={handleChange}
          required
        >
          <option value="">Select</option>
          <option value="India">India</option>
          <option value="USA">USA</option>
          <option value="Canada">Canada</option>
          <option value="UK">UK</option>
        </select>

        {/* Course Selection */}
        <label>Select Course</label>
        <select
          name="selectedCourse"
          value={formData.selectedCourse}
          onChange={handleChange}
          required
        >
          <option value="">Choose a course</option>

          {courses.map((course) => (
            <option key={course.name} value={course.name}>
              {course.name}
            </option>
          ))}
        </select>

        <br />
        <br />

        <button type="submit">
          {editIndex !== null ? "Update" : "Register"}
        </button>
      </form>

      <br />

      <h2>User Details</h2>

      <table border="1" cellPadding="10" cellSpacing="0">
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Gender</th>
            <th>Country</th>
            <th>Course</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="7">No Data Found</td>
            </tr>
          ) : (
            users.map((user, index) => (
              <tr key={index}>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.gender}</td>
                <td>{user.country}</td>
                <td>{user.selectedCourse}</td>

                <td>
                  <button
                    type="button"
                    onClick={() => handleEdit(index)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(index)}
                    style={{ marginLeft: "10px" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <br />

      <Link to="/cards">
        <button>View Cards</button>
      </Link>
    </div>
  );
}

export default Register;