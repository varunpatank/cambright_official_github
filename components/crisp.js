"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

const CrispChat = () => {
  useEffect(() => {
    Crisp.configure("7515cdf7-97b8-4a0b-b4ab-57da6e09b7e6");
  });

  return null;
};

export default CrispChat;
