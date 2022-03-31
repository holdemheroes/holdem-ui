import React, { useEffect, useState } from "react"
import Moralis from "moralis"
import { Chart as ChartJS, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2'
import { useNFTSaleInfo } from "../../hooks/useNFTSaleInfo"
import { Spin } from "antd"
ChartJS.register(...registerables);

export default function PriceChart() {

  const { targetEms } = useNFTSaleInfo();

  const [ chartData, setChartData ] = useState(null);
  const [ lastBlock, setLastBlock ] = useState(0);
  const [ data, setData ] = useState([]);
  const [ ems, setEms ] = useState([]);
  const [ targetEmsData, setTargetEmsData ] = useState([]);
  const [ labels, setLabels ] = useState([]);

  const processChartData = async () => {
    const params = { lastBlock: lastBlock };
    const cd = await Moralis.Cloud.run("getPricePerBlockData", params);
    const tmpData = data
    const tmpEms = ems
    const tmpTargetEms = targetEmsData
    const tmpLabels = labels

    for(let i = 0; i < cd.length; i += 1) {
      tmpLabels.push(cd[i].block)
      tmpData.push(cd[i].price)
      tmpEms.push(Number(cd[i].ems))
      tmpTargetEms.push(Number(targetEms.toString()))
      if(parseInt(cd[i].block, 10) > lastBlock) {
        setLastBlock(cd[i].block)
      }
    }
    setLabels(tmpLabels)
    setData(tmpData)
    setEms(tmpEms)
    setTargetEmsData(tmpTargetEms)
    const d = {
      labels: labels,
      datasets: [
        {
          id: 1,
          label: "Price",
          data: data,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          yAxisID: 'y',
          fill: false,
          borderWidth: 2,
          pointRadius: 0,
        },
        {
          id: 2,
          label: 'EMS',
          data: ems,
          borderColor: 'rgb(162, 53, 235)',
          backgroundColor: 'rgba(162, 53, 235, 0.5)',
          yAxisID: 'y1',
          fill: false,
          borderWidth: 2,
          pointRadius: 0,
        },
        {
          id: 3,
          label: 'Target EMS',
          data: targetEmsData,
          borderColor: 'rgb(162, 235, 53)',
          backgroundColor: 'rgba(162, 235, 53, 0.5)',
          yAxisID: 'y1',
          fill: false,
          borderWidth: 2,
          pointRadius: 0,
        }
      ]
    }
    setChartData(d)
  }

  useEffect(() => {

    async function _procData() {
      await processChartData()
    }
    if (!chartData && targetEms) {
      _procData()
    }
  }, [chartData, targetEms]);

  useEffect(() => {
    async function _procData() {
      await processChartData()
    }

    const timeout = setTimeout(() => {
      if(chartData && targetEms) {
        _procData()
      }
    }, 15000);

    return () => {
      clearTimeout(timeout);
    };
  }, [chartData, targetEms])

  if(!chartData) {
    return <Spin />
  }

  return (
    <>
      <Line
        datasetIdKey="id"
        data={chartData}
        options={
        {
          spanGaps: true,
          responsive: true,
          animation: false,
          plugins: {
            title: {
              display: true,
              text: "Price by Block",
            },
          },
          scales: {
            x: {
              ticks: {
                color: "white"
              },
              title: {
                display: true,
                text: 'Block #',
                color: "white"
              },
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'ETH Price',
                color: "white"
              },
              ticks: {
                color: "white"
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',

              // grid line settings
              grid: {
                drawOnChartArea: false, // only want the grid lines for one axis to show up
              },
              title: {
                display: true,
                text: 'EMS',
                color: "white"
              },
              ticks: {
                color: "white"
              }
            },
          }
        }
      }
      />
    </>
  );
}
