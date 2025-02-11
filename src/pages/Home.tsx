import {useEffect, useState} from "react";
import { motion } from "motion/react";

const Home = () => {
  const [blunders, setBlunders] = useState<string|number>("Loading...")
  const [name, setName] = useState<string|null>("Loading...")
  const [blundersContributed, setBlundersContributed] = useState<number>(0)
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
    const baseUrl = window.location.origin;
    const url = new URL("api/blunders", baseUrl);

    const params = new URLSearchParams();
    if (name) {
      params.append("name", name);
    }
    url.search = params.toString();
    return fetch(url, {method: "GET"}).then((response) => {
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
    const getNamed = async () => {
      const b = callNamedBlunders(name);
      setBlundersContributed(await b);
    }
    getNamed()

  }, []);



  const addBlunders = async (value: number): Promise<void> => {
    try {
      const totalBlunders = await callNamedBlunders(name) ?? 0;
      console.log("Total Blunders", totalBlunders);
      const baseUrl = window.location.origin;
      const url = new URL("api/blunders", baseUrl);
      const params = new URLSearchParams();
      if (name) {
        params.append("name", name);
      } else {
        params.append("name", "default");
      }

      console.log("Value", value);
      if (typeof totalBlunders == "number" && typeof value === "number" ) {
        params.append("blunders", String(value + totalBlunders));

      } else {
        params.append("blunders", String(totalBlunders));
      }

      url.search = params.toString();
      await fetch(url, {method: "POST"});
    }
    catch (error) {
      console.log("Error adding blunders:", error);
    }
  }

  const updateName = (name: string) => {
    sessionStorage.setItem("name", name);
    setName(name);
    const fetchNamedBlunders = async () => {
      const b = callNamedBlunders(name)
      setBlundersContributed(await b)
    }
    fetchNamedBlunders();
  }



  const text = "The Button".split(" ");

  return <div className={"container"}>
    <div className={"item"}>
      <span style={{fontSize: "2em"}}>BLUNDERS:</span>
      <div className={"blunders-box"}>
        {blunders}
      </div>
    </div>
    <motion.div
      className="item"
    >
      <motion.button
        onClick={async ()=> {
          await callBlunders();
          await addBlunders(1)
        }}
        whileTap={{scale: 0.9}}
        transition={{type: "spring", stiffness: 400, damping: 25}}
        initial={{scale: 0.6}}
        animate={{scale: 1}}
        whileHover={{scale: 1.1}}
      >
          {text.map((char, i) => (
            <motion.span
              key={`${char}-${i}`}
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{
                duration: 0.4,
                delay: i * 0.05,
                ease: "easeOut"
              }}
            >
              {char}
              {i < text.length - 1 && " "}
            </motion.span>
          ))}
      </motion.button>
    </motion.div>
    <div className={"item"}>
      <input onChange={(e) => updateName(e.target.value)} value={name || ""} placeholder={"(Optional)Your Name"}/>
    </div>
    <div className={"item"} style={{fontSize: "1em", color: "#3d3d3d"}}>
      {name != "" ? "You've contributed: " + blundersContributed : ""}
    </div>
  </div>
}
export default Home;