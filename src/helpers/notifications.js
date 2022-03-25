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
