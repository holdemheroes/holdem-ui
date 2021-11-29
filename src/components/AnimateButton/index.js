import { useState, useEffect } from 'react';
import './style.scss';

const AnimateButton = (props) => {
    let [iconNum, setIconNum] = useState(0);
    const iconGroup = [
        <img src="../../assets/images/Star-1.png" alt="" />,
        <img src="../../assets/images/heart.png" alt="" />,
        <img src="../../assets/images/spade.png" alt="" />,
        <img src="../../assets/images/diamond.png" alt="" />,
        <img src="../../assets/images/club.png" alt="" />,
    ];
    let handleMouseEnter = () => {
        let id = setInterval(() => {
            setIconNum((prev) => {
                if (prev >= 4) { clearInterval(id); setIconNum(0); }
                return prev + 1;
            });
        }, 100);
    };
    return (
        <div className="btn_animate" onMouseEnter={handleMouseEnter}>
            <div className="btn-icon-group">
                {iconGroup[iconNum]}
            </div>
            {props.children}
        </div>
    );
};

export default AnimateButton;