// import React, { useEffect, useState } from "react";
// import { useMoralis } from "react-moralis";
// import MoralisDappContext from "./context";
//
// function MoralisDappProvider({ children }) {
//   const { web3, Moralis, user } = useMoralis();
//   const [walletAddress, setWalletAddress] = useState();
//   const [chainId, setChainId] = useState("0x0");
//
//   useEffect(() => {
//     Moralis.onChainChanged(function (chain) {
//       setChainId(chain);
//       window.location.reload()
//     });
//
//     Moralis.onAccountChanged(function (address) {
//       setWalletAddress(address);
//     });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);
//
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   useEffect(() => {
//     setChainId( `0x${web3?.network?.chainId.toString(16)}` )
//   });
//
//   useEffect(
//     () => setWalletAddress(web3?.account || user?.get("ethAddress")),
//     [web3, user]
//   );
//
//   return (
//     <MoralisDappContext.Provider value={{ walletAddress, chainId }}>
//       {children}
//     </MoralisDappContext.Provider>
//   );
// }
//
// function useMoralisDapp() {
//   const context = React.useContext(MoralisDappContext);
//   if (context === undefined) {
//     throw new Error("useMoralisDapp must be used within a MoralisDappProvider");
//   }
//   return context;
// }
//
// export { MoralisDappProvider, useMoralisDapp };
