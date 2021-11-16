import React from "react";

const styles = {
  title: {
    fontSize: "25px",
    fontWeight: "700",
    marginLeft: "-15px",
    marginBottom: "20px",
  },
  text: {
    fontSize: "17px",
  },
  wrapper: {
    width: "60vw",
    padding: "15px",
  },
};

export default function Home( props) {
  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>Holdem Heroes</h1>

    </div>
  );
}
