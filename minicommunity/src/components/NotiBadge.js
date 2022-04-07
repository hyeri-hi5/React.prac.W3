import React from "react";
import { Badge } from "@material-ui/core";
import NotificationsIcon from "@material-ui/icons/Notifications";

import { realtime } from "../shared/firebase";
import { ref, onValue, update } from "firebase/database";
import { useSelector } from "react-redux";

const NotiBadge = (props) => {
  const [is_read, setIsRead] = React.useState(true);
  const user_id = useSelector((state) => state.user.user.uid);

  const notiCheck = () => {
    const notiDB = ref(realtime, `noti/${user_id}`);
    update(notiDB, { read: true });
    props._onClick();
  };

  React.useEffect(() => {
    const notiDB = ref(realtime, `noti/${user_id}`);
    let subscribe = onValue(notiDB, (snapshot) => {
      console.log(snapshot.val());
      setIsRead(snapshot.val().read);
    });

    return () => subscribe();
  }, []);

  return (
    <React.Fragment>
      <Badge color="secondary" variant="dot" invisible={is_read} />
      <NotificationsIcon onClick={notiCheck} />
    </React.Fragment>
  );
};

NotiBadge.defaultProps = {
  _onClick: () => {},
};

export default NotiBadge;
