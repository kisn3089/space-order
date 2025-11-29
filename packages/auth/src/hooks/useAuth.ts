import { useState } from "react";

export function useAuth() {
  const [count, setCount] = useState(1);

  return [count, setCount] as const;
}
