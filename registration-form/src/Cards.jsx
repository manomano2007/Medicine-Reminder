import "./register.css";

function Cards() {

  const users = JSON.parse(localStorage.getItem("users")) || [];

  return (
    <div className="container">

      <h2>User Cards</h2>

      <div className="card-container">

        {users.length === 0 ? (
          <p>No Users Available</p>
        ) : (
          users.map((user, index) => (
            <div className="user-card" key={index}>

              <h3>
                {user.firstName} {user.lastName}
              </h3>

              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Gender:</strong> {user.gender}</p>
              <p><strong>Country:</strong> {user.country}</p>

            </div>
          ))
        )}

      </div>

    </div>
  );
}

export default Cards;