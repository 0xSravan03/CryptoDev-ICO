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
  const [loading, setLoading] = useState(false);
  const [tokenAmount, setTokenAmount] = useState(0);
  const [claimStatus, setClaimStatus] = useState(false);

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
      await checkClaimStatus(contract);

      return contract;
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

  // Mint
  const mintToken = async (amount) => {
    try {
      const contract = await connectWallet();
      const tx = await contract.mint(amount, {
        value: ethers.utils.parseEther((0.0001 * amount).toString()),
      });
      setLoading(true);
      await tx.wait(3);
      console.log("Minted");
      setLoading(false);
      await getMyTokenBalance(contract);
      await getTotalTokensMinted(contract);
    } catch (error) {
      console.log(error.message);
    }
  };

  // Claim
  const claimToken = async () => {
    try {
      const contract = await connectWallet();
      const tx = await contract.claim();
      setLoading(true);
      await tx.wait(3);
      console.log("Token Claimed");
      setLoading(false);
    } catch (error) {
      console.log(error.message);
    }
  };

  const checkClaimStatus = async (contract) => {
    try {
      const signer = contract.signer;
      const signerAddress = await signer.getAddress();
      const claimStatus = await contract.tokenClaimed(signerAddress);
      setClaimStatus(claimStatus);
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

  const renderButton = () => {
    if (loading) {
      return (
        <div>
          <button className={styles.button}>Loading...</button>
        </div>
      );
    }
    if (tokensToBeClaimed > 0 && !claimStatus) {
      return (
        <div>
          <div className={styles.description}>
            {tokensToBeClaimed * 10} Tokens can be claimed!
          </div>
          <button className={styles.button} onClick={claimToken}>
            Claim Tokens
          </button>
        </div>
      );
    }

    return (
      <div style={{ display: "flex-col" }}>
        <div>
          <input
            type="number"
            placeholder="Amount of Tokens"
            onChange={(e) => setTokenAmount(e.target.value.toString())}
            className={styles.input}
          />
        </div>

        <button
          className={styles.button}
          disabled={!(tokenAmount > 0)}
          onClick={() => mintToken(tokenAmount)}
        >
          Mint Tokens
        </button>
      </div>
    );
  };

  return (
    <main className={styles.main}>
      <div>
        <h1 className={styles.title}>Welcome to Crypto Devs ICO!</h1>
        <div className={styles.description}>
          You can claim or mint Crypto Dev tokens here
        </div>
        {walletConnected ? (
          <div>
            <div className={styles.description}>
              You have minted {ethers.utils.formatEther(myToken)} Crypto Dev
              Tokens
            </div>
            <div className={styles.description}>
              Overall {ethers.utils.formatEther(tokensMinted)}/10000 have been
              minted!!!
            </div>
            {renderButton()}
          </div>
        ) : (
          <button onClick={handleClick} className={styles.button}>
            Connect wallet
          </button>
        )}
      </div>
      <div>
        <img className={styles.image} src="./0.svg" />
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </main>
  );
}
