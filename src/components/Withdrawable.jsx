import { useMoralis } from "react-moralis";
import { useGetUserWithdrawable } from "../hooks/useGetUserWithdrawable";
import { n4 } from "../helpers/formatters";
import { openNotification } from "../helpers/notifications";
import abis from "../helpers/contracts";
import { getCurrencySymbol, getTexasHoldemV1Address } from "../helpers/networks"

function Withdrawable() {

  const { Moralis, chainId } = useMoralis();

  const { balance } = useGetUserWithdrawable();

  const abi = abis.texas_holdem_v1;
  const contractAddress = getTexasHoldemV1Address(chainId);
  const currencySymbol = getCurrencySymbol(chainId);

  const options = {
    contractAddress, abi,
  };

  const handleWithdraw = async () => {
    const opts = {
      ...options,
      functionName: "withdrawWinnings",
    };

    try {
      const tx = await Moralis.executeFunction({ awaitReceipt: false, ...opts });
      openNotification({
        message: "🔊 New Transaction",
        description: `📃 Tx Hash: ${tx.hash}`,
        type: "success"
      });
    } catch (e) {
      openNotification({
        message: "🔊 Error",
        description: `📃 Receipt: ${e.message}`,
        type: "error"
      });
      console.log(e);
    }
  }

  return (
    <>
      <button onClick={() => handleWithdraw()}
        className="btn-withdrawable btn-shadow btn-hover-pointer">
        Withdraw {`${n4.format(
          Moralis.Units.FromWei(balance === null ? "0" : balance, 18)
        )} ${currencySymbol}`}</button>
    </>
  );
}

export default Withdrawable;

