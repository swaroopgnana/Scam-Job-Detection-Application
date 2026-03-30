import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function VictimGraph({ data }) {
  const chartData = data.map((v, i) => ({
    year: 2020 + i,
    victims: v,
  }));

  return (
    <div className="glass p-6">
      <h2 className="text-xl mb-4">Victim Growth</h2>

      <Line
        data={{
          labels: chartData.map((item) => item.year),
          datasets: [
            {
              label: "Victims",
              data: chartData.map((item) => item.victims),
              borderColor: "#8b5cf6",
              backgroundColor: "#8b5cf6",
              tension: 0.35
            }
          ]
        }}
      />
    </div>
  );
}
