import Blockie from 'components/Blockie';
import './style.scss';

const AnimateButton = (props) => {
    return (
        <div className="btn_animate">
            <div className="btn-icon-group">
                <img src="../../assets/images/Star-1.png" style={{ display: "block" }} alt="" />
                <img src="../../assets/images/heart.png" style={{ display: "none" }} alt="" />
                <img src="../../assets/images/spade.png" style={{ display: "none" }} alt="" />
                <img src="../../assets/images/diamond.png" style={{ display: "none" }} alt="" />
                <img src="../../assets/images/club.png" style={{ display: "none" }} alt="" />
            </div>
            {props.children}
        </div>
    );
};

export default AnimateButton;