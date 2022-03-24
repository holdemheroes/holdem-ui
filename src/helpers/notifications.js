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
  const extracted = matches ? matches[1] : eStr
  switch(extracted) {
    case "eth too low":
      return "Purchase price too low. Try a higher price"
    default:
      return extracted
  }
}
