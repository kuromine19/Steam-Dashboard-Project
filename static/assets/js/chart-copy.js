console.log('chart-copy');

data = data_2023_12_02_daily_json;

var following_hours = [];
var current_players = [];

for (var key in data) {  
  if (data.hasOwnProperty(key)) {
    var item = data[key];

    // Bây giờ 'item' là một đối tượng riêng biệt, và bạn có thể truy cập các trường dữ liệu của nó:
    var rank = item["rank"];
    var name = item["name"];
    var price_format = item["price_format"];
    var current_player = item["current_player"];
    var peak_player = item["peak_player"];
    var hour = item["hour"];
    var date = item["date"];
    var num_curators = item["num_curators"];
    var num_pos_reviews = item["num_pos_reviews"];
    var num_neg_reviews = item["num_neg_reviews"];

    var following_hour = new Date(item["date"]).toLocaleDateString() + " " + item["hour"] + ":00";
    following_hours.push(following_hour)
    current_players.push(item["current_player"] )
  }
}

// Get context with jQuery - using jQuery's .get() method.
if ($("#lineChart").length) {
  var lineChartCanvas = $("#lineChart").get(0).getContext("2d");
  var barChart = new Chart(lineChartCanvas, {
    type: 'line',
    data: {
      labels: following_hours,
      datasets: [{
        label: 'Current Players',
        data: current_players,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Date and Hour'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Current Players'
          }
        }
      }
    }
  });
}