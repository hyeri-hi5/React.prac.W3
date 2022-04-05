import React from "react";
import _ from "lodash";

const Search = () => {
  const [text, setText] = React.useState("");

  const debounce = _.debounce((e) => {
    console.log("debounce :::", e.target.value);
  }, 1000);

  const throttle = _.throttle((e) => {
    console.log("throttle :::", e.target.value);
  }, 1000);

  //함수를 memorization(저장) 해주는 useCallback. 렌더링해도 함수 초기화 안한다.
  const keyPress = React.useCallback(debounce, []);

  const onChange = (e) => {
    setText(e.target.value);
    keyPress(e);
  };

  return (
    <div>
      <input type="text" onChange={onChange} value={text} />
    </div>
  );
};

export default Search;
