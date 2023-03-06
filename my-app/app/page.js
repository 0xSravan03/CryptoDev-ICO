"use client";

import Web3Modal from "web3modal";
import styles from "./page.module.css";
import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import contractInfo from "../contract/contract.json";
import nftContractInfo from "../contract/nftContract.json";

export default function Home() {
  const web3modalRef = useRef();
  const [walletConnected, setWalletConnected] = useState(false);
  const [tokensMinted, setTokensMinted] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(0);
  const [myToken, setMyToken] = useState(0);

  const connectWallet = async () => {
    try {
      const instance = await web3modalRef.current.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      const signer = provider.getSigner();
      setWalletConnected(true);
      // contract instance
      const contract = new ethers.Contract(
        contractInfo.address,
        contractInfo.abi,
        signer
      );

      const totalTokenAvail = await contract.getMaxSupply();
      setTotalTokens(totalTokenAvail.toString());
      await getTotalTokensMinted(contract);
      await getTokensToBeClaimed(contract);
      await getMyTokenBalance(contract);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleClick = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.log(error.message);
    }
  };

  // getTotalTokensMinted() - returns total amount of tokens minted till now;
  const getTotalTokensMinted = async (contract) => {
    try {
      const totalMinted = await contract.totalSupply();
      setTokensMinted(totalMinted.toString());
    } catch (error) {
      console.log(error.message);
    }
  };

  // get amount of tokens that can be claimed by the user.
  const getTokensToBeClaimed = async (contract) => {
    try {
      const signer = contract.signer;

      // NFT Contract
      const nftContract = new ethers.Contract(
        nftContractInfo.address,
        nftContractInfo.abi,
        signer
      );

      const signerAddress = await signer.getAddress();
      const balanceNFT = await nftContract.balanceOf(signerAddress);

      if (balanceNFT.toString() == "0") {
        setTokensToBeClaimed(0);
      } else {
        setTokensToBeClaimed(balanceNFT.toString());
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // get token owned by the connected user.
  const getMyTokenBalance = async (contract) => {
    try {
      const signer = contract.signer;
      const signerAddress = await signer.getAddress();
      const balanceToken = await contract.balanceOf(signerAddress);
      setMyToken(balanceToken.toString());
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
      <div>
        {tokensMinted} / {ethers.utils.formatEther(totalTokens)}
      </div>
      <div>{tokensToBeClaimed}</div>
    </main>
  );
}
