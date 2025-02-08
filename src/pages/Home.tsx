import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";


const Home = () => {
  const [blunders, setBlunders] = useState<[]|string|number>("Loading...")

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
        const value = data[0]["totalBlunders"];
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
    const totalBlunders: number = typeof blunders === "number" ? blunders : 0;
    await fetch("/api/blunders", {method: "POST", body: JSON.stringify({name: null, blunders: totalBlunders+1})});
  }

  return <>
    Blunders: {blunders}
    <div>
      <button onClick={() => navigate("/Items")}>Go to Items</button>
    </div>
    <div>
      <button onClick={async () => {
        await callBlunders();
        await addBlunders()
        await callBlunders();
      }}>Add blunders</button>
    </div>
  </>
}
export default Home;