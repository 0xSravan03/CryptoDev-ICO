"use client";

import Web3Modal from "web3modal";
import styles from "./page.module.css";
import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";

export default function Home() {
  const web3modalRef = useRef();
  const [walletConnected, setWalletConnected] = useState(false);

  const connectWallet = async () => {
    const instance = await web3modalRef.current.connect();
    const provider = new ethers.providers.Web3Provider(instance);
    const signer = provider.getSigner();
    return signer;
  };

  const handleClick = async () => {
    await connectWallet();
    setWalletConnected(true);
  };

  useEffect(() => {
    web3modalRef.current = new Web3Modal({
      network: "goerli",
      providerOptions: {},
      disableInjectedProvider: false,
    });
  });

  return (
    <main className={styles.main}>
      <button onClick={handleClick}>Connect Wallet</button>
    </main>
  );
}
