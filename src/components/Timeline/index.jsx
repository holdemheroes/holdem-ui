// import { useState, useEffect } from "react";
import "./style.scss";

export default function Timeline() {

    return (
        <div className="timeline-wrapper">
            <div className="timeline">
                <div className="line"></div>

                <div className="timestop">
                </div>
                <div className="timestop">
                </div>
                <div className="timestop">
                </div>
            </div>

            <div className="description">
                <div className="text">
                    <p className="date"></p>
                    <p className="title">NFT Minting<br />on Ethereum</p>
                </div>
                <div className="text">
                    <p className="date"></p>
                    <p className="title">Card Reveal +<br />Polygon Card Airdrop</p>
                </div>
                <div className="text">
                    <p className="date"></p>
                    <p className="title">Poker Games Live <br />on both chains</p>
                </div>
            </div>
        </div>
    );
}