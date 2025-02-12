import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CircularProgress } from "@mui/material";


// API functions
const api = {
  async getBlunders(): Promise<number> {
    const response = await fetch("/api/blunders");
    if (!response.ok) throw new Error("Failed to fetch blunders");
    const data = await response.json();
    return data[0].totalBlunders;
  },

  async getNamedBlunders(name: string | null): Promise<number> {
    const baseUrl = window.location.origin;
    const url = new URL("api/blunders", baseUrl);

    if (name) {
      url.searchParams.append("name", name);
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch named blunders");
    const data = await response.json();
    return parseInt(data[0].totalBlunders);
  },

  async addBlunders(name: string | null, blunderCount: number): Promise<number> {
    const baseUrl = window.location.origin;
    const url = new URL("api/blunders", baseUrl);

    url.searchParams.append("name", name || "default");
    url.searchParams.append("blunders", String(blunderCount));

    const response = await fetch(url, { method: "POST" });
    if (!response.ok) throw new Error("Failed to add blunders");
    const data = await response.json();
    return data.blunders;
  }
};

const Home = () => {
  const [totalBlunders, setTotalBlunders] = useState<string | number>("Loading...");
  const [name, setName] = useState<string | null>("Loading...");
  const [blundersContributed, setBlundersContributed] = useState<number>(0);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

  useEffect(() => {
    const initializeData = async () => {
      const storedName = sessionStorage.getItem("name");
      setName(storedName);

      try {
        const [total, contributed] = await Promise.all([
          api.getBlunders(),
          api.getNamedBlunders(storedName)
        ]);

        setTotalBlunders(total);
        setBlundersContributed(contributed);
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };

    initializeData();
  }, []);

  const handleAddBlunder = async () => {
    if (buttonDisabled) return;
    setButtonDisabled(true);

    try {
      const newContributed = await api.addBlunders(name, blundersContributed + 1);
      const newTotal = await api.getBlunders();

      setBlundersContributed(newContributed);
      setTotalBlunders(newTotal);
    } catch (error) {
      console.error("Error adding blunder:", error);
    } finally {
      setButtonDisabled(false);
    }
  };

  const updateName = (newName: string) => {
    sessionStorage.setItem("name", newName);
    setName(newName);
  };

  const buttonText = "The Button".split(" ");

  return (
    <div className="container">
      <div className="item">
        <span style={{ fontSize: "2em" }}>BLUNDERS:</span>
        <div className="blunders-box">{totalBlunders}</div>
      </div>

      <motion.div className="item">
        <motion.button
          disabled={buttonDisabled}
          onClick={handleAddBlunder}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
        >
          {buttonDisabled ? (
            <CircularProgress />
          ) : (
            buttonText.map((char, i) => (
              <motion.span
                key={`${char}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.05,
                  ease: "easeOut"
                }}
              >
                {char}
                {i < buttonText.length - 1 && " "}
              </motion.span>
            ))
          )}
        </motion.button>
      </motion.div>

      <div className="item">
        <input
          onChange={(e) => updateName(e.target.value)}
          value={name || ""}
          placeholder="(Optional) Your Name"
        />
      </div>

      <div className="item" style={{ fontSize: "1em", color: "#3d3d3d" }}>
        {name ? `You've contributed: ${blundersContributed}` : ""}
      </div>
    </div>
  );
};

export default Home;