const { ethers } = require("hardhat")

async function main() {
    const ContractFactory = await ethers.getContractFactory("CryptoDevToken")
    console.log("Deploying Contract...")
    const CryptoDevToken = await ContractFactory.deploy(
        "1000",
        "0x217f3aEAe122aC1bC7Ea63482e4d3FA52bb3Eb10"
    )
    await CryptoDevToken.deployed()
    console.log(`Contract Deployed at : ${CryptoDevToken.address}`)

    const name = await CryptoDevToken.name()
    const symbol = await CryptoDevToken.symbol()

    console.log(`Name : ${name}`)
    console.log(`Symbol : ${symbol}`)

    const maxSupply = await CryptoDevToken.getMaxSupply()
    console.log(`Max Supply : ${maxSupply}`)
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
