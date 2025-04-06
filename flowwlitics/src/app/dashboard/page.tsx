"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function DashboardPage() {
  const [postsData, setPostsData] = useState<any[]>([]);
  const [sentimentData, setSentimentData] = useState<{
    sentiment: { positive: number; neutral: number; negative: number };
    totalPosts: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("sentiment"); // Set default tab to sentiment

  // Function to format a timestamp into a readable date
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Function to format a timestamp into hours
  const formatHour = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.getHours();
  };

  // Fetch sentiment data from the API
  useEffect(() => {
    const fetchSentimentData = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get("http://localhost:3003/analyse");
        console.log("Sentiment data:", res.data);
        setSentimentData(res.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching sentiment data:", err);
        setError("Failed to load sentiment data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSentimentData();
  }, []);

  // Fetch posts from the API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("http://localhost:3003/posts");
        console.log("Posts data:", response.data);
        const posts = response.data.messages || [];
        setPostsData(posts);
        setError(null);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // CSV Export Functions
  const downloadCSV = (csvContent: string, fileName: string) => {
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute(
      "href",
      "data:text/csv;charset=utf-8,\uFEFF" + encodedUri
    );
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPostsToCSV = () => {
    // Define headers based on the post data structure
    const headers = [
      "ID",
      "Author",
      "Content",
      "Timestamp",
      "Is Anonymous",
      "Votes",
      "Comment Count",
    ];

    // Convert posts data to CSV rows
    const csvRows = postsData.map((post) => [
      post.id || "",
      post.isAnonymous ? "Anonymous" : post.author?.name || "Unknown",
      `"${(post.content || "").replace(/"/g, '""')}"`, // Escape quotes in content
      post.timestamp || "",
      post.isAnonymous ? "Yes" : "No",
      post.votes || 0,
      post.comments?.length || 0,
    ]);

    // Combine headers and rows
    const csvArray = [headers, ...csvRows];

    // Convert to CSV string
    const csvContent = csvArray.map((row) => row.join(",")).join("\n");

    // Download the CSV
    downloadCSV(
      csvContent,
      `posts-data-${new Date().toISOString().split("T")[0]}.csv`
    );
  };

  const exportSentimentDataToCSV = () => {
    if (!sentimentData) return;

    // Define headers
    const headers = ["Sentiment Type", "Count"];

    // Convert sentiment data to CSV rows
    const csvRows = [
      ["Positive", sentimentData.sentiment.positive],
      ["Neutral", sentimentData.sentiment.neutral],
      ["Negative", sentimentData.sentiment.negative],
      ["Total Posts", sentimentData.totalPosts],
    ];

    // Combine headers and rows
    const csvArray = [headers, ...csvRows];

    // Convert to CSV string
    const csvContent = csvArray.map((row) => row.join(",")).join("\n");

    // Download the CSV
    downloadCSV(
      csvContent,
      `sentiment-data-${new Date().toISOString().split("T")[0]}.csv`
    );
  };

  const exportChartDataToCSV = (chartData: any, fileName: string) => {
    if (!chartData || !chartData.labels || !chartData.datasets) return;

    // Prepare headers (first column is for labels)
    const headers = [
      "Category",
      ...chartData.datasets.map((ds: any) => ds.label || "Value"),
    ];

    // Prepare rows
    const rows = chartData.labels.map((label: string, index: number) => {
      return [label, ...chartData.datasets.map((ds: any) => ds.data[index])];
    });

    // Combine headers and rows
    const csvArray = [headers, ...rows];

    // Convert to CSV string
    const csvContent = csvArray.map((row) => row.join(",")).join("\n");

    // Download the CSV
    downloadCSV(
      csvContent,
      `${fileName}-${new Date().toISOString().split("T")[0]}.csv`
    );
  };

  // Function to export data based on active tab
  const exportCurrentTabData = () => {
    switch (activeTab) {
      case "sentiment":
        exportSentimentDataToCSV();
        break;
      case "overview":
        exportChartDataToCSV(preparePostsByDateChart(), "posts-over-time");
        break;
      case "activity":
        exportChartDataToCSV(preparePostsByHourChart(), "posts-by-hour");
        break;
      case "users":
        exportChartDataToCSV(prepareTopUsersChart(), "top-contributors");
        break;
      case "engagement":
        exportChartDataToCSV(prepareEngagementChart(), "engagement-metrics");
        break;
      default:
        exportPostsToCSV();
    }
  };

  // Prepare data for sentiment analysis chart
  const prepareSentimentChart = () => {
    if (!sentimentData) return null;

    return {
      labels: ["Positive", "Neutral", "Negative"],
      datasets: [
        {
          data: [
            sentimentData.sentiment.positive,
            sentimentData.sentiment.neutral,
            sentimentData.sentiment.negative,
          ],
          backgroundColor: [
            "rgba(75, 192, 75, 0.6)", // Green for positive
            "rgba(54, 162, 235, 0.6)", // Blue for neutral
            "rgba(255, 99, 132, 0.6)", // Red for negative
          ],
          borderColor: [
            "rgba(75, 192, 75, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 99, 132, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare sentiment distribution percentage chart
  const prepareSentimentPercentChart = () => {
    if (!sentimentData) return null;

    const total =
      sentimentData.sentiment.positive +
      sentimentData.sentiment.neutral +
      sentimentData.sentiment.negative;

    return {
      labels: ["Positive", "Neutral", "Negative"],
      datasets: [
        {
          data: [
            ((sentimentData.sentiment.positive / total) * 100).toFixed(1),
            ((sentimentData.sentiment.neutral / total) * 100).toFixed(1),
            ((sentimentData.sentiment.negative / total) * 100).toFixed(1),
          ],
          backgroundColor: [
            "rgba(75, 192, 75, 0.6)", // Green for positive
            "rgba(54, 162, 235, 0.6)", // Blue for neutral
            "rgba(255, 99, 132, 0.6)", // Red for negative
          ],
          borderColor: [
            "rgba(75, 192, 75, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 99, 132, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for posts by date chart
  const preparePostsByDateChart = () => {
    // Group posts by formatted date
    const dateCounts: { [key: string]: number } = {};
    postsData.forEach((post) => {
      const formattedDate = formatDate(post.timestamp);
      dateCounts[formattedDate] = (dateCounts[formattedDate] || 0) + 1;
    });

    // Sort dates chronologically
    const sortedDates = Object.keys(dateCounts).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    return {
      labels: sortedDates,
      datasets: [
        {
          label: "Number of Posts",
          data: sortedDates.map((date) => dateCounts[date]),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for anonymous vs. identified posts pie chart
  const prepareAnonymityChart = () => {
    const anonymousPosts = postsData.filter((post) => post.isAnonymous).length;
    const identifiedPosts = postsData.filter(
      (post) => !post.isAnonymous
    ).length;

    return {
      labels: ["Anonymous Posts", "Identified Posts"],
      datasets: [
        {
          data: [anonymousPosts, identifiedPosts],
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
          ],
          borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for posts by hour of day chart
  const preparePostsByHourChart = () => {
    // Initialize an array for each hour (0-23)
    const hourCounts = Array(24).fill(0);

    postsData.forEach((post) => {
      const hour = formatHour(post.timestamp);
      hourCounts[hour]++;
    });

    return {
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets: [
        {
          label: "Posts by Hour of Day",
          data: hourCounts,
          backgroundColor: "rgba(153, 102, 255, 0.6)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1,
          tension: 0.4,
        },
      ],
    };
  };

  // Prepare data for engagement (votes/comments) chart
  const prepareEngagementChart = () => {
    // Group by date and count votes and comments
    const dateEngagement: {
      [key: string]: { votes: number; comments: number };
    } = {};

    postsData.forEach((post) => {
      const formattedDate = formatDate(post.timestamp);
      if (!dateEngagement[formattedDate]) {
        dateEngagement[formattedDate] = { votes: 0, comments: 0 };
      }
      dateEngagement[formattedDate].votes += post.votes || 0;
      dateEngagement[formattedDate].comments += post.comments?.length || 0;
    });

    // Sort dates chronologically
    const sortedDates = Object.keys(dateEngagement).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    return {
      labels: sortedDates,
      datasets: [
        {
          label: "Votes",
          data: sortedDates.map((date) => dateEngagement[date].votes),
          backgroundColor: "rgba(255, 206, 86, 0.6)",
          borderColor: "rgba(255, 206, 86, 1)",
          borderWidth: 1,
        },
        {
          label: "Comments",
          data: sortedDates.map((date) => dateEngagement[date].comments),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for top users chart
  const prepareTopUsersChart = () => {
    // Group posts by author name
    const authorCounts: { [key: string]: number } = {};
    postsData.forEach((post) => {
      const authorName = post.author?.name || "Unknown";
      authorCounts[authorName] = (authorCounts[authorName] || 0) + 1;
    });

    // Sort by post count and take top 5
    const topAuthors = Object.entries(authorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      labels: topAuthors.map(([author]) => author),
      datasets: [
        {
          label: "Number of Posts",
          data: topAuthors.map(([_, count]) => count),
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="max-h-screen bg-gray-50">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Posts Analytics Dashboard</h1>

          {/* CSV Export Button */}
          {!isLoading && !error && (postsData.length > 0 || sentimentData) && (
            <button
              onClick={exportCurrentTabData}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download CSV
            </button>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">Loading dashboard data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && (sentimentData || postsData.length > 0) && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-2">Total Posts</h2>
                <p className="text-4xl font-bold text-blue-600">
                  {sentimentData?.totalPosts || postsData.length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-2">
                  Positive Sentiment
                </h2>
                <p className="text-4xl font-bold text-green-600">
                  {sentimentData?.sentiment.positive || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-2">
                  Neutral Sentiment
                </h2>
                <p className="text-4xl font-bold text-blue-500">
                  {sentimentData?.sentiment.neutral || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-2">
                  Negative Sentiment
                </h2>
                <p className="text-4xl font-bold text-red-500">
                  {sentimentData?.sentiment.negative || 0}
                </p>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex border-b mb-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab("sentiment")}
                className={`py-2 px-4 ${
                  activeTab === "sentiment"
                    ? "border-b-2 border-blue-500 font-medium"
                    : "text-gray-500"
                }`}
              >
                Sentiment Analysis
              </button>
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-2 px-4 ${
                  activeTab === "overview"
                    ? "border-b-2 border-blue-500 font-medium"
                    : "text-gray-500"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`py-2 px-4 ${
                  activeTab === "activity"
                    ? "border-b-2 border-blue-500 font-medium"
                    : "text-gray-500"
                }`}
              >
                Activity Patterns
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`py-2 px-4 ${
                  activeTab === "users"
                    ? "border-b-2 border-blue-500 font-medium"
                    : "text-gray-500"
                }`}
              >
                User Analysis
              </button>
              <button
                onClick={() => setActiveTab("engagement")}
                className={`py-2 px-4 ${
                  activeTab === "engagement"
                    ? "border-b-2 border-blue-500 font-medium"
                    : "text-gray-500"
                }`}
              >
                Engagement
              </button>
            </div>

            {/* Tab content */}
            {activeTab === "sentiment" && sentimentData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Sentiment Distribution
                  </h2>
                  <div className="h-64">
                    <Pie data={prepareSentimentChart()} options={pieOptions} />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Sentiment Breakdown
                  </h2>
                  <div className="h-64">
                    <Doughnut
                      data={prepareSentimentPercentChart()}
                      options={pieOptions}
                    />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
                  <h2 className="text-xl font-semibold mb-4">
                    Sentiment Analysis Summary
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h3 className="font-semibold text-green-700 mb-2">
                        Positive Sentiment
                      </h3>
                      <p className="text-2xl font-bold text-green-600">
                        {sentimentData.sentiment.positive}
                      </p>
                      <p className="text-sm text-green-700">
                        {(
                          (sentimentData.sentiment.positive /
                            (sentimentData.sentiment.positive +
                              sentimentData.sentiment.neutral +
                              sentimentData.sentiment.negative)) *
                          100
                        ).toFixed(1)}
                        % of total
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-blue-700 mb-2">
                        Neutral Sentiment
                      </h3>
                      <p className="text-2xl font-bold text-blue-600">
                        {sentimentData.sentiment.neutral}
                      </p>
                      <p className="text-sm text-blue-700">
                        {(
                          (sentimentData.sentiment.neutral /
                            (sentimentData.sentiment.positive +
                              sentimentData.sentiment.neutral +
                              sentimentData.sentiment.negative)) *
                          100
                        ).toFixed(1)}
                        % of total
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h3 className="font-semibold text-red-700 mb-2">
                        Negative Sentiment
                      </h3>
                      <p className="text-2xl font-bold text-red-600">
                        {sentimentData.sentiment.negative}
                      </p>
                      <p className="text-sm text-red-700">
                        {(
                          (sentimentData.sentiment.negative /
                            (sentimentData.sentiment.positive +
                              sentimentData.sentiment.neutral +
                              sentimentData.sentiment.negative)) *
                          100
                        ).toFixed(1)}
                        % of total
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Posts Over Time
                  </h2>
                  <Bar data={preparePostsByDateChart()} options={barOptions} />
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Anonymous vs. Identified Posts
                  </h2>
                  <div className="h-64">
                    <Pie data={prepareAnonymityChart()} options={pieOptions} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "activity" && (
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Posts by Hour of Day
                  </h2>
                  <Line
                    data={preparePostsByHourChart()}
                    options={lineOptions}
                  />
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Posts By Day of Week
                  </h2>
                  <p className="text-gray-500">
                    Post activity broken down by day of week would appear here
                    when there's enough data spanning multiple weeks.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Top Contributors
                  </h2>
                  <Bar data={prepareTopUsersChart()} options={barOptions} />
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">User Retention</h2>
                  <p className="text-gray-500">
                    User retention metrics would appear here when there's data
                    spanning longer time periods to analyze returning users.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "engagement" && (
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Votes and Comments Over Time
                  </h2>
                  <Bar data={prepareEngagementChart()} options={barOptions} />
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Content Performance
                  </h2>
                  <p className="text-gray-500">
                    Average engagement metrics per post would appear here with
                    more comprehensive data.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {!isLoading && !error && postsData.length === 0 && !sentimentData && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-lg text-gray-500">
              No data available to display.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
