import { getTexasHoldemV1Address } from "helpers/networks"
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useEffect, useState } from "react";
import { useMoralis, useMoralisSubscription } from "react-moralis"
import abis from "../helpers/contracts"
import { openNotification } from "../helpers/notifications"

export const useGetUserWithdrawable = () => {
  const { Moralis, isWeb3Enabled } = useMoralis();
  const { chainId, walletAddress } = useMoralisDapp();

  const [balance, setBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [balanceFetched, setBalanceFetched] = useState(false)
  const [refetch, setRefetch] = useState(false)

  const abi = abis.texas_holdem_v1;
  const contractAddress = getTexasHoldemV1Address(chainId);

  const options = {
    contractAddress, abi,
  }

  function handleOnChainWithdrawable(result) {
    setBalanceFetched(true)
    setBalance(result)
  }

  function fetchOnChainWithdrawable() {
    setBalanceLoading(true)
    Moralis.executeFunction({
      functionName: "userWithdrawables",
      params: {
        "": walletAddress,
      },
      ...options
    })
      .then((result) => handleOnChainWithdrawable(result))
      .catch((e) => console.log(e.message))
  }

  //get initial balance
  useEffect(() => {
    if (balance === null && !balanceFetched && !balanceLoading && isWeb3Enabled) {
      fetchOnChainWithdrawable()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance, balanceFetched, balanceLoading, walletAddress, isWeb3Enabled])

  // check refetch
  useEffect(() => {
    let timeout
    if (refetch) {
      setRefetch(false)
      timeout = setTimeout(() => {
        fetchOnChainWithdrawable()
      }, 3000)
      fetchOnChainWithdrawable()
    }

    return () => {
      clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetch])

  // // refresh withdrawable every 2nd block
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchOnChainWithdrawable()
    }, 30000)

    return () => {
      clearTimeout(timeout)
    }
  })

  useMoralisSubscription("THRefunded",
    q => q.equalTo("player", walletAddress),
    [walletAddress],
    {
      onCreate: data => {
        openNotification({
          message: "🔊 Refunded!",
          description: `📃 Refund successful`,
          type: "success"
        });
        setRefetch(true)
      },
    })

  useMoralisSubscription("THWinningsCalculated",
    q => q,
    [],
    {
      onCreate: data => {
        setRefetch(true)
      },
    })

  useMoralisSubscription("THWithdrawal",
    q => q.equalTo("player", walletAddress),
    [walletAddress],
    {
      onCreate: data => {
        openNotification({
          message: "🔊 Success!",
          description: `📃 Withdraw successful`,
          type: "success"
        });
        setRefetch(true)
      },
    })

  return { balance }

};
