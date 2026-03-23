import { useEffect, useState } from "react";
import API from "../services/api";

function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    API.get("/")
      .then((res) => setMessage(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Home Dashboard</h1>
      <p className="text-gray-700">Backend message: {message}</p>
    </div>
  );
}

export default Home;