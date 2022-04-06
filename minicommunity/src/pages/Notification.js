import React from "react";
import { Grid, Text, Image } from "../elements";
import Card from "../components/Card";

import { realtime } from "../shared/firebase";
import { useSelector } from "react-redux";

import { ref, child, query, set, get, orderByChild } from "firebase/database";

const Notification = (props) => {
  const user = useSelector((state) => state.user.user);
  const [noti, setNoti] = React.useState([]);
  React.useEffect(() => {
    if (!user) {
      return;
    }

    const notiDB = ref(realtime, `noti/${user.uid}/list`);
    const _noti = query(notiDB, orderByChild("insert_dt"));

    get(_noti).then((snapshot) => {
      if (snapshot.exists()) {
        let _data = snapshot.val();
        // console.log(_data);

        let _noti_list = Object.keys(_data)
          .reverse()
          .map((s) => {
            return _data[s];
          });
        console.log(_noti_list);
        setNoti(_noti_list);
      }
    });
  }, [user]);

  return (
    <React.Fragment>
      <Grid padding="16px" bg="#eff6ff">
        {noti.map((n, idx) => {
          return <Card key={`noti_${idx}`} {...n} />;
        })}
      </Grid>
    </React.Fragment>
  );
};

export default Notification;
