import React, { useEffect, useState } from "react"
import Moralis from "moralis"
import { Chart as ChartJS, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2'
ChartJS.register(...registerables);

export default function PriceChart() {

  const [ chartData, setChartData ] = useState(null);

  const processChartData = async () => {
    const cd = await Moralis.Cloud.run("getPricePerBlockData");
    const data = []
    const labels = []
    for(let i = 0; i < cd.length; i += 1) {
      labels.push(cd[i].block)
      data.push(cd[i].price)
    }
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
