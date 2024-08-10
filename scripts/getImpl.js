const { decryptNodeResponse,encryptDataField } = require("@swisstronik/utils");
const hre = require("hardhat");

const readContractData = async (provider, contract, method, args) => {
  const res = await sendShieldedQuery(
    provider,
    contract.target,
    contract.interface.encodeFunctionData(method, args),
    '0'
  )

  return contract.interface.decodeFunctionResult(method, res)
}

const sendShieldedQuery = async (provider, destination, data, value) => {
  const rpclink = hre.network.config.url
  const [encryptedData, usedEncryptedKey] = await encryptDataField(rpclink, data)

  const response = await provider.call({
    to: destination,
    data: encryptedData,
    value,
  })

  return await decryptNodeResponse(rpclink, response, usedEncryptedKey)
}
async function main() {
  const [signer] = await hre.ethers.getSigners()

  const proxyAddress = "0x31e834872db0D2463035155122283F976E6dA7E2";
  const proxyAdminAddress = "0x810fbf3B36a0A72abE2FAD0Fd48E0F4e6dFa6ECE";
  
  const proxy = await hre.ethers.getContractAt('ProxyImpl', proxyAddress)

  const proxyAdmin = await hre.ethers.getContractAt('ProxyAdmin', proxyAdminAddress)

  const implementation = (await readContractData(signer.provider, proxyAdmin, 'implementation', [proxy.target]))[0]
  console.log('implementation:', implementation)

  const admin = (await readContractData(signer.provider, proxyAdmin, 'admin', [proxy.target]))[0]
  console.log('admin:', admin)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})