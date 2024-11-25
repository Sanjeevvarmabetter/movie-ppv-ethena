const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts");

    const VNFT = await ethers.getContractFactory("VideoNFTMarketplace");
    const nftcontract = await VNFT.deploy();

    console.log("VNFT contract deployed to: ",nftcontract.target);
}

main()
    .then(()=>process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });



// 0xF5633334919253c91b0E5363Ca46Ce1B3EF557f1