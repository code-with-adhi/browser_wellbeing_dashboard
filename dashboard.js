// In dashboard.js

const API_URL = "https://browser-wellbeing-server.onrender.com";

let myChart;
let chartData = [];
let currentChartType = "bar"; // Keep track of the current chart type

const titleEl = document.getElementById("dashboardTitle");
const todayBtn = document.getElementById("todayBtn");
const weekBtn = document.getElementById("weekBtn");
const barBtn = document.getElementById("barChartBtn");
const pieBtn = document.getElementById("pieChartBtn");

// This function now takes a time range ('today' or 'week')
async function fetchAndRenderDashboard(range = "today") {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  // Update the title
  titleEl.textContent =
    range === "week" ? "Your Activity This Week" : "Your Activity Today";

  try {
    // Add the range parameter to the fetch URL
    const response = await fetch(`${API_URL}/api/dashboard?range=${range}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      localStorage.removeItem("authToken");
      window.location.href = "/login.html";
      return;
    }

    const rawData = await response.json();
    chartData = processChartData(rawData); // Process the data (grouping, etc.)

    if (chartData.length === 0) {
      // If a chart exists, destroy it before showing the message
      if (myChart) myChart.destroy();
      document.querySelector(
        ".chart-container"
      ).innerHTML = `<p>No activity tracked yet for ${range}.</p>`;
    } else {
      // Make sure the canvas is visible
      document.querySelector(".chart-container").innerHTML =
        '<canvas id="activityChart"></canvas>';
      renderChart(currentChartType); // Render the chart with the current type
    }
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
  }
}

// In dashboard.js

// In dashboard.js

function renderChart(chartType) {
  currentChartType = chartType;
  if (myChart) {
    myChart.destroy();
  }

  // --- NEW: Dynamic Color Logic ---
  // Check if the user's system is in dark mode
  const isDarkMode =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  // Set the text and grid line color based on the theme
  const textColor = isDarkMode ? "rgba(255, 255, 255, 0.8)" : "#6c757d";
  const gridColor = isDarkMode
    ? "rgba(255, 255, 255, 0.15)"
    : "rgba(0, 0, 0, 0.1)";

  const labels = chartData.map((item) => item.website_url);
  const values = chartData.map((item) => (item.total_time / 60).toFixed(2));
  const pieColors = [
    "rgba(255, 99, 132, 0.7)",
    "rgba(54, 162, 235, 0.7)",
    "rgba(255, 206, 86, 0.7)",
    "rgba(75, 192, 192, 0.7)",
    "rgba(153, 102, 255, 0.7)",
    "rgba(255, 159, 64, 0.7)",
    "rgba(201, 203, 207, 0.7)",
  ];

  const ctx = document.getElementById("activityChart").getContext("2d");
  myChart = new Chart(ctx, {
    type: chartType,
    data: {
      labels: labels,
      datasets: [
        {
          label: "Time Spent (in minutes)",
          data: values,
          backgroundColor:
            chartType === "bar" ? "rgba(0, 172, 193, 0.7)" : pieColors,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      indexAxis: chartType === "bar" ? "y" : "x",
      scales: {
        x: {
          beginAtZero: true,
          display: chartType === "bar",
          ticks: {
            color: textColor, // Apply dynamic color
          },
          grid: {
            color: gridColor, // Apply dynamic color
          },
        },
        y: {
          display: chartType === "bar",
          ticks: {
            color: textColor, // Apply dynamic color
          },
          grid: {
            color: gridColor, // Apply dynamic color
          },
        },
      },
      plugins: {
        legend: {
          position: "right",
          align: "center",
          labels: {
            color: textColor, // Apply dynamic color
            font: {
              size: 14,
            },
          },
        },
      },
    },
  });
}
function processChartData(rawData) {
  // ... (Your existing processChartData function)
  const timeThreshold = 5;
  const mainData = [];
  let othersTime = 0;
  for (const item of rawData) {
    if (item.total_time < timeThreshold) {
      othersTime += item.total_time;
    } else {
      mainData.push(item);
    }
  }
  if (othersTime > 0) {
    mainData.push({
      website_url: "Others (less than 5s)",
      total_time: othersTime,
    });
  }
  mainData.sort((a, b) => b.total_time - a.total_time);
  return mainData;
}

// --- Event Listeners ---

// Load initial data for today
document.addEventListener("DOMContentLoaded", () =>
  fetchAndRenderDashboard("today")
);

// Time range buttons
todayBtn.addEventListener("click", () => {
  fetchAndRenderDashboard("today");
  todayBtn.classList.add("active");
  weekBtn.classList.remove("active");
});

weekBtn.addEventListener("click", () => {
  fetchAndRenderDashboard("week");
  weekBtn.classList.add("active");
  todayBtn.classList.remove("active");
});

// Chart type buttons
barBtn.addEventListener("click", () => {
  renderChart("bar");
  barBtn.classList.add("active");
  pieBtn.classList.remove("active");
});

pieBtn.addEventListener("click", () => {
  renderChart("doughnut");
  pieBtn.classList.add("active");
  barBtn.classList.remove("active");
});

// Logout button
document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.removeItem("authToken");
  window.location.href = "/login.html";
});
