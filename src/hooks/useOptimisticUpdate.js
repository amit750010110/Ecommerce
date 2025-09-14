import { useCallback, useRef } from "react"

export const useOptimisticUpdate = (updateFunction, rollbackFunction) => {
  // useRef : previous state ko store krta hai rollback ke liye

  const previousState = useRef(null);

  // useCallback: optimistic update function ko memoize karta hai
  const executeOptimisticUpdate = useCallback(async (...args) => {
    try {
      // Current state ko save kro rollback ke liye 

      if (rollbackFunction) {
        previousState.current = rollbackFunction();
      }

      // UI ko Immedately update kro 
      updateFunction(...args);

      await Promise.resolve(); // Simulate async operation

    } catch (error) {
      if (rollbackFunction && previousState.current) {
        rollbackFunction(previousState.current);
      }
      throw error;
    }
  }, [updateFunction, rollbackFunction]);

  return executeOptimisticUpdate;
};