import React, { useRef, useEffect } from "react";

export default function useKey({ key, cb }) {
  const callbackRef = useRef(cb);

  useEffect(() => {
    function handleKeyPress(event) {
      if (event.code === key) {
        callbackRef.current(event);
      }
    }

    document.addEventListener("keypress", handleKeyPress);
    return () => {
      document.removeEventListener("keypress", handleKeyPress);
    };
  }, [key]);
}
