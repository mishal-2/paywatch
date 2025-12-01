import React, { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);

  // When login is successful
  const handleLogin = (username) => {
    setLoggedInUser(username);
  };

  // When logout button is clicked
  const handleLogout = () => {
    setLoggedInUser(null);
  };

  return (
    <div className="App">
      {loggedInUser ? (
        <Dashboard username={loggedInUser} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;

