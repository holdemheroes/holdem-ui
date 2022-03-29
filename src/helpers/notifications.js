import { notification } from "antd";

export const openNotification = ({ message, description, type }) => {
  switch (type) {
    case "success":
      notification.success({
        placement: "bottomRight",
        message,
        description,
        className: "notification success"
      });
      break;
    case "error":
      notification.error({
        placement: "bottomRight",
        message,
        description,
        className: "notification error"
      });
      break;
    default:
      notification.open({
        placement: "bottomRight",
        message,
        description,
        className: "notification"
      });
      break;
  }
};

export const extractErrorMessage = (e) => {
  const eStr = e.toString()
  const matches = eStr.match(/"execution reverted: (.*?)"/);
  const extracted = matches ? matches[1] : e.message
  switch(extracted) {
    case "eth too low":
      return "Purchase price too low. Try a higher price"
    case "not started":
      return "Sale has not started yet"
    case "sold out":
      return "Sold out!"
    case "ended":
      return "Sale has ended"
    case "> max per tx":
      return "Cannot mint more than maximum"
    case "> mint limit":
      return "Blind mint limit reached for this wallet"
    case "exceeds supply":
      return "Cannot mint more than supply!"
    case "not revealed":
      return "Hands have not been revealed yet"
    case "not distributed":
      return "Hands have not been distributed yet"
    case "invalid id":
      return "Invalid Token ID"
    default:
      return extracted
  }
}
