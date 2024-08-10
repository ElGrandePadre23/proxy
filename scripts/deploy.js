const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners()

  const originalContract = await hre.ethers.deployContract('OriginalContract')
  await originalContract.waitForDeployment()
  console.log(`originalContract deployed to ${originalContract.target}`)


  const proxyAdmin = await hre.ethers.deployContract('ProxyAdmin', [signer.address])
  await proxyAdmin.waitForDeployment()
  console.log(`proxyAdmin deployed to ${proxyAdmin.target}`)

  const proxy = await hre.ethers.deployContract('ProxyImpl', [
    originalContract.target,
    proxyAdmin.target,
    originalContract.interface.encodeFunctionData('initialize', []),
  ])
  await proxy.waitForDeployment()
  console.log(`proxy deployed to ${proxy.target}`)

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })