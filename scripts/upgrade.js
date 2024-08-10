const hre = require("hardhat");
const { encryptDataField } = require("@swisstronik/utils");

const sendShieldedTransaction = async (
  signer,
  destination,
  data,
  value
) => {
  const rpclink = network.config.url
  const [encryptedData] = await encryptDataField(rpclink, data)

  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value,
    gasLimit: 2000000,
  })
}

async function main() {

  const proxyAddress = "0x31e834872db0D2463035155122283F976E6dA7E2";
  const proxyAdminAddress = "0x810fbf3B36a0A72abE2FAD0Fd48E0F4e6dFa6ECE";
  const [signer] = await hre.ethers.getSigners()
  const proxy = await hre.ethers.getContractAt('ProxyImpl', proxyAddress)

  const modifiedContract = await hre.ethers.deployContract('ModifiedContract')
  await modifiedContract.waitForDeployment()
  console.log(`modifiedContract deployed to ${modifiedContract.target}`)

  const proxyAdmin = await hre.ethers.getContractAt('ProxyAdmin', proxyAdminAddress)

  const upgradeTo = await sendShieldedTransaction(
    signer,
    proxyAdmin.target,
    proxyAdmin.interface.encodeFunctionData('upgradeTo', [
      proxy.target,
      modifiedContract.target,
    ]),
    '0'
  )

  const upgradeToResult = await upgradeTo.wait()
  console.log(`OriginalContract upgraded to ModifiedContract, hash : ${upgradeToResult.hash}`)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})