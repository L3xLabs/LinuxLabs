"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ChartPage() {
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to format a timestamp into a readable date
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Fetch posts from the API and prepare chart data
  useEffect(() => {
    const fetchPostsAndPrepareChart = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:3003/posts');
        const posts = response.data.messages || [];

        // Group posts by formatted date
        const dateCounts: { [key: string]: number } = {};
        posts.forEach((post: any) => {
          const formattedDate = formatDate(post.timestamp);
          dateCounts[formattedDate] = (dateCounts[formattedDate] || 0) + 1;
        });

        // Extract labels (dates) and values (counts)
        const labels = Object.keys(dateCounts);
        const values = labels.map(label => dateCounts[label]);

        // Set up chart data using the grouped data
        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Number of Posts',
              data: values,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load chart data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostsAndPrepareChart();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Posts Over Time</h1>
      {isLoading && <p>Loading chart data...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {chartData && (
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Number of Posts per Day',
              },
            },
          }}
        />
      )}
    </div>
  );
}
