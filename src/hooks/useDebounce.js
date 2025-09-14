import { useEffect, useState } from "react"

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Delay ke baad value update karta hai 

    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay);

    // Cleanup : agar value change hoti hai to existing timeout clear krta hai 

    return () => {
      clearTimeout(handler);
    };

  }, [value, delay]);

  return debouncedValue;
}