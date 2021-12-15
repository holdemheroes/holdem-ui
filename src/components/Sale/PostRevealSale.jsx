import React, { useState, useEffect } from "react";
import { Pagination, Row, Col } from 'antd';
import NFTList from "./NFTList"

export default function PostRevealSale({ pricePerToken, canMint, mintedTokens }) {

  const [currentItems, setCurrentItems] = useState(null);
  const [tokensPerPage, setTokensPerPage] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  const [minted, setMinted] = useState(false);
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    let tmp = [];
    if (mintedTokens.length) {
      if (minted) {
        tmp = [...mintedTokens];
      } else {
        for (let i = 0; i < 1326; i += 1) {
          if (mintedTokens.includes(i)) continue;
          tmp.push(i);
        }
      }
    }
    console.log(tmp)
    setTokens([...tmp]);
  }, [minted, mintedTokens]);

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
    if (event.target.innerHTML == "Minted") setMinted(true);
    else if (event.target.innerHTML == "Not minted") setMinted(false);
  }

  return (
    <>
      <Row>
        <Col>
          {/* <h2 style={{ color: "white" }}>Post Reveal Mint Sale</h2> */}
          <p className="title">NFT Marketplace</p>
          <ul className="tabs" onClick={switchTab}>
            <li><a className={!minted ? "active" : ""}>Not minted</a></li>
            <li><a className={minted ? "active" : ""}>Minted</a></li>
          </ul>
        </Col>
      </Row>
      <Row>
        <Col></Col>
        <Col>
          <Row>
            <Col>
              <NFTList currentTokens={currentItems} canMint={canMint} mintedTokens={mintedTokens} pricePerToken={pricePerToken} />
            </Col>
          </Row>
          <Row>
            <Col>
              <Pagination
                showQuickJumper
                showSizeChanger
                onShowSizeChange={onShowSizeChange}
                defaultCurrent={1}
                total={tokens.length}
                onChange={handlePageClick}
              />
            </Col>
          </Row></Col>
      </Row>
    </>
  );
}
