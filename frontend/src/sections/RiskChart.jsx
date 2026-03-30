import { Doughnut } from "react-chartjs-2";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function RiskChart({ risk }) {
  const data = [
    { name: "Risk", value: risk },
    { name: "Safe", value: 100 - risk },
  ];

  return (
    <div className="glass p-6">
      <h2 className="text-xl mb-4">Risk Analysis</h2>

      <Doughnut
        data={{
          labels: data.map((item) => item.name),
          datasets: [
            {
              data: data.map((item) => item.value),
              backgroundColor: ["#ff4d4f", "#52c41a"],
              borderColor: ["#ff4d4f", "#52c41a"]
            }
          ]
        }}
      />

      <p className="mt-3 text-center text-lg font-bold">
        {risk}% Risk
      </p>
    </div>
  );
}
