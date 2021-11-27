import { useGetUserWithdrawable } from "../hooks/useGetUserWithdrawable"
import { n4 } from "helpers/formatters";
import { openNotification } from "../helpers/notifications"
import { useMoralisDapp } from "../providers/MoralisDappProvider/MoralisDappProvider"
import { useMoralis } from "react-moralis"
import abis from "../helpers/contracts"
import { getTexasHoldemV1Address } from "../helpers/networks"
// import { Button } from "antd"

function Withdrawable() {

  const { chainId } = useMoralisDapp();
  const { Moralis } = useMoralis()

  const { balance } = useGetUserWithdrawable()

  const abi = abis.texas_holdem_v1;
  const contractAddress = getTexasHoldemV1Address(chainId);

  const options = {
    contractAddress, abi,
  }

  const handleWithdraw = async () => {
    const opts = {
      ...options,
      functionName: "withdrawWinnings",
    }

    const tx = await Moralis.executeFunction({ awaitReceipt: false, ...opts });
    tx.on("transactionHash", (hash) => {
      openNotification({
        message: "🔊 Withdraw requested!",
        description: `📃 Tx Hash: ${hash}`,
        type: "success"
      });
    })
      .on("error", (error) => {
        console.log(error);
      });
  }

  return (
    <>
      <button onClick={() => handleWithdraw()}
        className="btn btn-connect-wallet btn-shadow">
        Withdraw {`${n4.format(
          Moralis.Units.FromWei(balance, 18)
        )} ETH`}</button>
    </>
  );
}
export default Withdrawable

