import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CircularProgress } from "@mui/material";
import UndoIcon from '@mui/icons-material/Undo';
import api from '../Api.ts';


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

    initializeData().then(() => console.log("Finished loading"));
  }, []);

  // Handles the pressing of buttons that increment or decrement the
  const handleModifyBlunder = async (add: number) => {
    if (buttonDisabled) return;
    setButtonDisabled(true);

    try {
      // Add the blunders number to the current count
      const newBlunders = await api.addBlunders(add);

      setTotalBlunders(newBlunders);
    } catch (error) {
      console.error("Error adding blunder:", error);
    } finally {
      setButtonDisabled(false);
    }
  };

  // For animation of writing The Button
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
          ) : ( <UndoIcon/>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default Home;