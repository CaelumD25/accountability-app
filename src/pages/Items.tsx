import {useEffect, useState} from "react";



const Items = () => {
  const [items, setItems] = useState([])

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

  return <>{items}</>
}
export default Items;