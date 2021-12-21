import React, { useState, useEffect } from "react";
import { Pagination, Checkbox, Slider } from 'antd';
import NFTList from "./NFTList";
import { useMoralis } from "react-moralis";

export default function PostRevealSale({ pricePerToken, canMint, mintedTokens }) {

  const [currentItems, setCurrentItems] = useState(null);
  const [tokensPerPage, setTokensPerPage] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  const [minted, setMinted] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [shape, setShape] = useState(["Offsuit", "Suited", "Pair"]);
  const [ranksRange, setRanksRange] = useState([1, 169]);
  const [marks, setMarks] = useState({ 1: '1', 169: '169' });

  const { Moralis } = useMoralis();

  const options = [
    { label: "Offsuit", value: "Offsuit" },
    { label: "Suited", value: "Suited" },
    { label: "Pair", value: "Pair" }
  ];

  useEffect(() => {
    let filtered = [];
    const Hands = Moralis.Object.extend("Hands");
    const query = new Moralis.Query(Hands);
    console.log(mintedTokens)
    query.containedIn("shape", shape)
      .greaterThanOrEqualTo("rank", parseInt(ranksRange[0]))
      .lessThanOrEqualTo("rank", parseInt(ranksRange[1]))
      .find()
      .then((result) => {
        for (let i = 0; i < result.length; i++) {
          filtered.push(result[i].get("tokenId"));
        }
        let tmp = [];
        if (mintedTokens.length) {
          for (let i = 0; i < filtered.length; i++) {
            if (minted && mintedTokens.includes(filtered[i])) tmp.push(filtered[i]);
            if (!minted && !mintedTokens.includes(filtered[i])) tmp.push(filtered[i]);
          }
        }
        setTokens([...tmp]);
      });
  }, [minted, mintedTokens, shape, ranksRange]);

  useEffect(() => {
    const start = (pageNumber - 1) * tokensPerPage;
    const end = start + tokensPerPage;
    setCurrentItems(tokens.slice(start, end));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, tokensPerPage, tokens]);

  const handlePageClick = (pageNumber) => {
    setPageNumber(pageNumber);
  };

  function onShowSizeChange(pageNumber, pageSize) {
    setTokensPerPage(pageSize);
    setPageNumber(pageNumber);
  }

  function switchTab(event) {
    event.preventDefault();
    if (event.target.innerHTML === "Minted") setMinted(true);
    else if (event.target.innerHTML === "Not minted") setMinted(false);
  }

  function handleShapeChange(checkedValues) {
    console.log(checkedValues);
    setShape([...checkedValues]);
  }

  function handleRankChange(value) {
    console.log("Rank: ", value);
    setMarks({ [value[0]]: `${value[0]}`, [value[1]]: `${value[1]}` });
    setRanksRange([...value]);
  }

  return (
    <>
      <div className="sales-header">
        {/* <h2 style={{ divor: "white" }}>Post Reveal Mint Sale</h2> */}
        <p className="title">NFT Marketplace</p>
        <ul className="tabs" onClick={switchTab}>
          <li><a className={!minted ? "active" : ""}>Not minted</a></li>
          <li><a className={minted ? "active" : ""}>Minted</a></li>
        </ul>
      </div>

      <div className="sales-main">
        <div className="filter_sidebar">
          <p className="title">Filters</p>
          <div className="filter_body">
            <div className="filter_item">
              <p>Shape</p>
              <Checkbox.Group options={options} onChange={handleShapeChange} defaultValue={["Offsuit", "Suited", "Pair"]} />
            </div>
            <div className="filter_item">
              <p>Rank</p>
              <Slider range marks={marks} defaultValue={[1, 169]} min={1} max={169} onChange={handleRankChange}></Slider>
            </div>
          </div>
        </div>

        <div className="nft_list-wrapper">
          <NFTList currentTokens={currentItems} canMint={canMint} mintedTokens={mintedTokens} pricePerToken={pricePerToken} />

          <div>
            <Pagination
              showQuickJumper
              showSizeChanger
              onShowSizeChange={onShowSizeChange}
              defaultCurrent={1}
              total={tokens.length}
              onChange={handlePageClick}
            />
          </div>
        </div>
      </div>
    </>
  );
}
