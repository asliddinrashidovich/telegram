import { Iuser } from "@/types";
import { useState } from "react";

const useContact = () => {
  const [currentContact, setCurrentContact] = useState<Iuser | null>(null);
  return {currentContact, setCurrentContact};
};

export default useContact;
