import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";


const Home = () => {
  const [blunders, setBlunders] = useState<[]|string|number>("Loading...")
  const [name, setName] = useState<string|null>("Loading...")

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

  const callNamedBlunders = async (name: string | null): Promise<number>  => {
    return fetch("api/blunders", {method: "GET", body: JSON.stringify({name: name})}).then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
      .then((data) => {
        return parseInt(data[0]["totalBlunders"]);
      }).catch((error) => {
        console.error("Error fetching data:", error);
        return 0;
      });
  }

  useEffect(() => {
    setName(sessionStorage.getItem("name"));
    callBlunders();
  }, []);



  const addBlunders = async (value: number): Promise<void> => {
    try {
      const totalBlunders = await callNamedBlunders(name);
      await fetch("/api/blunders", {method: "POST", body: JSON.stringify({name: null, blunders: value + totalBlunders})});
    }
    catch (error) {
      console.log("Error adding blunders:", error);
    }
  }

  const updateName = (name: string) => {
    sessionStorage.setItem("name", name);
    setName(name);
  }

  return <>
    Blunders: {blunders}
    <div>
      <button onClick={() => navigate("/Items")}>Go to Items</button>
    </div>
    <div>
      <button onClick={async () => {
        await callBlunders();
        await addBlunders(1)
        await callBlunders();
      }}>Add blunders</button>
    </div>
    <div>
      <input onChange={(e) => updateName(e.target.value)} value={name || ""} />
    </div>
  </>
}
export default Home;