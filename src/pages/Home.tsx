import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";


const Home = () => {
  const [items, setItems] = useState<[]|string>("Loading...")

  const navigate = useNavigate();

  const callItems = async ()  => {
    fetch("/api/items")
      .then(async (response) => {
        if (!response.ok) {
          setItems(await response.json());
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
  }

  useEffect(() => {
    callItems();
  }, []);

  return <>
    Items: {items}
    <div>
      <button onClick={() => navigate("/Items")}>Go to Items</button>
    </div>
    <div>
      <button onClick={() => callItems()}>Request API Again</button>
    </div>
  </>
}
export default Home;