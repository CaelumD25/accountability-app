import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";


const Home = () => {
  const [items, setItems] = useState([])

  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/Items")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setItems(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  return <>Items: {items} <button onClick={() => navigate("/Items")}>Add</button></>
}
export default Home;