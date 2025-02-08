import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";


const Home = () => {
  const [blunders, setBlunders] = useState<[]|string>("Loading...")

  const navigate = useNavigate();

  const callBlunders = async ()  => {
    fetch("/api/blunders")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        const value = data[0]["$1"];
        setBlunders(value);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }

  useEffect(() => {
    callBlunders();
  }, []);

  const addBlunders = async (): Promise<void> => {
    await fetch("/api/blunders", {method: "POST", body: JSON.stringify({name: null, blunders: 1})});
  }

  return <>
    Blunders: {blunders.toString}
    <div>
      <button onClick={() => navigate("/Items")}>Go to Items</button>
    </div>
    <div>
      <button onClick={() => addBlunders()}>Add blunders</button>
    </div>
  </>
}
export default Home;