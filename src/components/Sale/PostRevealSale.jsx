import React, { useState, useEffect } from "react";
import { Pagination, Row, Col } from 'antd';
import NFTList from "./NFTList"

export default function PostRevealSale({ pricePerToken, canMint, mintedTokens }) {

  const tokens = []
  for (let i = 0; i < 1326; i += 1) {
    tokens.push(i)
  }

  const [currentItems, setCurrentItems] = useState(null);
  const [tokensPerPage, seTokensPerPage] = useState(10);
  const [pageNumber, setPageNumber] = useState(1)

  useEffect(() => {
    const start = (pageNumber - 1) * tokensPerPage
    const end = start + tokensPerPage;
    setCurrentItems(tokens.slice(start, end));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, tokensPerPage]);

  const handlePageClick = (pageNumber) => {
    setPageNumber(pageNumber)
  };

  function onShowSizeChange(pageNumber, pageSize) {
    seTokensPerPage(pageSize)
    setPageNumber(pageNumber)
  }

  return (
    <div>
      <Row>
        <Col>
          <h2>Post Reveal Mint Sale</h2>
        </Col>
      </Row>
      <Row>
        <Col>
          <div>
            <NFTList currentTokens={currentItems} canMint={canMint} mintedTokens={mintedTokens} pricePerToken={pricePerToken} />
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <Pagination
            showQuickJumper
            showSizeChanger
            onShowSizeChange={onShowSizeChange}
            defaultCurrent={1}
            total={1326}
            onChange={handlePageClick}
          />
        </Col>
      </Row>
    </div>
  );
}
