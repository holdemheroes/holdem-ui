import React from "react";
import { Card } from "antd";

export default function NFTMeta({ metadata }) {

  const traits = [];
  for (let i = 0; i < metadata.attributes.length; i++) {
    const attr = metadata.attributes[i];
    traits.push(<li key={`nft_meta${i}_${attr.trait_type}`}>{attr.trait_type}: {attr.value}<br /></li>);
  }

  const attributes = <ul>{traits}</ul>;

  return (
    <Card title={metadata.name}>
      {attributes}
    </Card>
  );
}