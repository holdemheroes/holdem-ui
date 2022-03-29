import React, { useEffect, useState } from "react"
import Moralis from "moralis"
import { Chart as ChartJS, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2'
ChartJS.register(...registerables);

export default function PriceChart() {

  const [ chartData, setChartData ] = useState(null);
  const [ lastBlock, setLastBlock ] = useState(0);
  const [ data, setData ] = useState([]);
  const [ labels, setLabels ] = useState([]);

  const processChartData = async () => {
    const params = { lastBlock: lastBlock }
    const cd = await Moralis.Cloud.run("getPricePerBlockData", params);
    const tmpData = data
    const tmpLabels = labels
    for(let i = 0; i < cd.length; i += 1) {
      tmpLabels.push(cd[i].block)
      tmpData.push(cd[i].price)
      if(parseInt(cd[i].block, 10) > lastBlock) {
        setLastBlock(cd[i].block)
      }
    }
    setLabels(tmpLabels)
    setData(tmpData)
    const d = {
      labels: labels,
      datasets: [
        {
          id: 1,
          label: 'Price',
          data: data,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        }
      ]
    }
    setChartData(d)
  }

  useEffect(async () => {
    if (!chartData) {
      await processChartData()
    }
  }, [chartData]);

  async function refreshChartData(event) {
    event.preventDefault();
    await processChartData()
  }

  if(!chartData) {
    return <>Loading chart</>
  }

  return (
    <>
      <form onSubmit={(e) => refreshChartData(e)} name="refresh-form">
        <input className="btn-shadow btn-hover-pointer" type="submit" value="Refresh" />
      </form>
      <Line
        datasetIdKey='id'
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Price by Block',
            },
          }}}
      />
    </>
  )

}
