import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CircularProgress } from "@mui/material";

// Api Functions
const api = {
  async getBlunders(): Promise<number> {
    const response = await fetch("/api/blunders");
    if (!response.ok) throw new Error("Failed to fetch blunders");
    const data = await response.json();
    return data[0].totalBlunders;
  },

  async addBlunders(add: number): Promise<number> {
    const baseUrl = window.location.origin;
    const url = new URL("api/blunders", baseUrl);

    url.searchParams.append("add", String(add));
    // Just add 1 instead of incrementing the current count

    const response = await fetch(url, { method: "PATCH" });
    if (!response.ok) throw new Error("Failed to add blunders");
    const data = await response.json();
    return data.blunders;
  }
};

const Home = () => {
  const [totalBlunders, setTotalBlunders] = useState<string | number>("Loading...");
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const [total] = await Promise.all([
          api.getBlunders(),
        ]);

        setTotalBlunders(total);
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };

    initializeData();
  }, []);

  const handleModifyBlunder = async (add: number) => {
    if (buttonDisabled) return;
    setButtonDisabled(true);

    try {
      // Pass the current contributed blunders to the API
      const newContributed = await api.addBlunders(add);

      setTotalBlunders(newContributed);
    } catch (error) {
      console.error("Error adding blunder:", error);
    } finally {
      setButtonDisabled(false);
    }
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
          onClick={() => handleModifyBlunder(1)}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          className={"blunder-button"}
        >
          {buttonDisabled ? (
            <CircularProgress sx={{color: "red"}} />
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
      <div className="item sub-item">
        <motion.button
            disabled={buttonDisabled}
            onClick={() => handleModifyBlunder(-1)}
            whileTap={{scale: 0.9}}
            transition={{type: "spring", stiffness: 400, damping: 25}}
            initial={{scale: 0.6}}
            animate={{scale: 1}}
            whileHover={{scale: 1.1}}
            className={"undo-button"}
        >
          {buttonDisabled ? (
              <CircularProgress sx={{color: "blue"}}/>
          ) : ( <motion.span>
                Remove Blunder
              </motion.span>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default Home;