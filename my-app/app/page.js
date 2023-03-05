"use client";

import Web3Modal from "web3modal";
import styles from "./page.module.css";
import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import contractInfo from "../contract/contract.json";

export default function Home() {
  const web3modalRef = useRef();
  const [walletConnected, setWalletConnected] = useState(false);

  const connectWallet = async () => {
    try {
      const instance = await web3modalRef.current.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      const signer = provider.getSigner();

      // contract instance
      const contract = new ethers.Contract(
        contractInfo.address,
        contractInfo.abi,
        signer
      );
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleClick = async () => {
    try {
      await connectWallet();
      setWalletConnected(true);
    } catch (error) {
      console.log(error.message);
    }
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
