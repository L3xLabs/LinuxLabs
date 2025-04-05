"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie, Line } from 'react-chartjs-2';
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
} from 'chart.js';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Function to format a timestamp into a readable date
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Function to format a timestamp into hours
  const formatHour = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.getHours();
  };

  // Fetch posts from the API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:3003/posts');
        const posts = response.data.messages || [];
        setPostsData(posts);
        setError(null);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Prepare data for posts by date chart
  const preparePostsByDateChart = () => {
    // Group posts by formatted date
    const dateCounts: { [key: string]: number } = {};
    postsData.forEach((post) => {
      const formattedDate = formatDate(post.timestamp);
      dateCounts[formattedDate] = (dateCounts[formattedDate] || 0) + 1;
    });

    // Sort dates chronologically
    const sortedDates = Object.keys(dateCounts).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    return {
      labels: sortedDates,
      datasets: [
        {
          label: 'Number of Posts',
          data: sortedDates.map(date => dateCounts[date]),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for anonymous vs. identified posts pie chart
  const prepareAnonymityChart = () => {
    const anonymousPosts = postsData.filter(post => post.isAnonymous).length;
    const identifiedPosts = postsData.filter(post => !post.isAnonymous).length;

    return {
      labels: ['Anonymous Posts', 'Identified Posts'],
      datasets: [
        {
          data: [anonymousPosts, identifiedPosts],
          backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
          borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
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
          label: 'Posts by Hour of Day',
          data: hourCounts,
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
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
      [key: string]: { votes: number; comments: number } 
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
    const sortedDates = Object.keys(dateEngagement).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    return {
      labels: sortedDates,
      datasets: [
        {
          label: 'Votes',
          data: sortedDates.map(date => dateEngagement[date].votes),
          backgroundColor: 'rgba(255, 206, 86, 0.6)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1,
        },
        {
          label: 'Comments',
          data: sortedDates.map(date => dateEngagement[date].comments),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
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
      const authorName = post.author?.name || 'Unknown';
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
          label: 'Number of Posts',
          data: topAuthors.map(([_, count]) => count),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
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
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
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
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Posts Analytics Dashboard</h1>
        
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
        
        {!isLoading && !error && postsData.length > 0 && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-2">Total Posts</h2>
                <p className="text-4xl font-bold text-blue-600">{postsData.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-2">Anonymous Posts</h2>
                <p className="text-4xl font-bold text-red-500">
                  {postsData.filter(post => post.isAnonymous).length}
                  <span className="text-lg text-gray-500 ml-2">
                    ({((postsData.filter(post => post.isAnonymous).length / postsData.length) * 100).toFixed(1)}%)
                  </span>
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-2">Total Votes</h2>
                <p className="text-4xl font-bold text-green-600">
                  {postsData.reduce((sum, post) => sum + (post.votes || 0), 0)}
                </p>
              </div>
            </div>
            
            {/* Tab navigation */}
            <div className="flex border-b mb-6">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-4 ${activeTab === 'overview' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('activity')}
                className={`py-2 px-4 ${activeTab === 'activity' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
              >
                Activity Patterns
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`py-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
              >
                User Analysis
              </button>
              <button 
                onClick={() => setActiveTab('engagement')}
                className={`py-2 px-4 ${activeTab === 'engagement' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
              >
                Engagement
              </button>
            </div>
            
            {/* Tab content */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Posts Over Time</h2>
                  <Bar data={preparePostsByDateChart()} options={barOptions} />
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Anonymous vs. Identified Posts</h2>
                  <div className="h-64">
                    <Pie data={prepareAnonymityChart()} options={pieOptions} />
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'activity' && (
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Posts by Hour of Day</h2>
                  <Line data={preparePostsByHourChart()} options={lineOptions} />
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Posts By Day of Week</h2>
                  <p className="text-gray-500">Post activity broken down by day of week would appear here when there's enough data spanning multiple weeks.</p>
                </div>
              </div>
            )}
            
            {activeTab === 'users' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Top Contributors</h2>
                  <Bar data={prepareTopUsersChart()} options={barOptions} />
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">User Retention</h2>
                  <p className="text-gray-500">User retention metrics would appear here when there's data spanning longer time periods to analyze returning users.</p>
                </div>
              </div>
            )}
            
            {activeTab === 'engagement' && (
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Votes and Comments Over Time</h2>
                  <Bar data={prepareEngagementChart()} options={barOptions} />
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Content Performance</h2>
                  <p className="text-gray-500">Average engagement metrics per post would appear here with more comprehensive data.</p>
                </div>
              </div>
            )}
          </>
        )}
        
        {!isLoading && !error && postsData.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-lg text-gray-500">No posts data available to display.</p>
          </div>
        )}
      </div>
    </div>
  );
}