function drawHorizontalBarChart(metadata,price,update,hbc) {
  var options = {
    indexAxis: 'y',
    
    elements: {
      bar: {
        borderWidth: 2,
      }
    },
    responsive: true,
    plugins: {
      legend: {
        display:false
      },
      title: {
        display: false,
      },
      
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255,255,255,0.1)',
        },
        ticks: {
          color: 'white'
        },
      },
      y: {
        grid: {
          color: 'rgba(255,255,255,0.1)',
        },
        ticks: {
          color: 'white'
        }
      }
    }
  };

  xValues=[]
  yValues=[]

  if(price==2){
    metadata.sort(function(a,b) {
      return b.total - a.total
    });
  for (var i=0,len=metadata.length;i<len;i++){
    xValues.push(metadata[i].genre)
    yValues.push(metadata[i].total)
    }
  }
  else if(price==1){
    metadata.sort(function(a,b) {
      return b.charged - a.charged
    });
    for (var i=0,len=metadata.length;i<len;i++){
      xValues.push(metadata[i].genre)
      yValues.push(metadata[i].charged)
      }
  }
  else{
    metadata.sort(function(a,b) {
      return b.free - a.free
    });
    for (var i=0,len=metadata.length;i<len;i++){
      xValues.push(metadata[i].genre)
      yValues.push(metadata[i].free)
      }
  }
  
  var data = {
    labels: xValues.slice(0,5),
    datasets: [
      {
        label: 'Data',
        data: yValues.slice(0,5),
        backgroundColor: "rgba(	26, 159, 255, 0.4)",
        hoverBackgroundColor: "rgba(	26, 159, 255, 0.8)",
      },
    ]
  }
  if (update==1) {
    hbc.clear();
    hbc.destroy();
}
  // Create the chart
  var ctx = document.getElementById('horizontal-bar').getContext('2d');
  hbc = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: options
  });
  return {'hbc':hbc,
          'metadata':metadata,
          'price':price}
}

var horizontal_bar_chart;

var num_of_genres_total_day = JSON.parse(document.getElementById('num_of_genres_total_day').textContent);
for (var i=0, len = num_of_genres_total_day.length;i < len; i++) {
  num_of_genres_total_day[i].genre = num_of_genres_total_day[i].genre.trim();
}

var num_of_genres_total_week = JSON.parse(document.getElementById('num_of_genres_total_week').textContent);
for (var i=0, len = num_of_genres_total_week.length;i < len; i++) {
  num_of_genres_total_week[i].genre = num_of_genres_total_week[i].genre.trim();
}

var num_of_genres_total_month = JSON.parse(document.getElementById('num_of_genres_total_month').textContent);
for (var i=0, len = num_of_genres_total_month.length;i < len; i++) {
  num_of_genres_total_month[i].genre = num_of_genres_total_month[i].genre.trim();
}

horizontal_bar_chart=drawHorizontalBarChart(num_of_genres_total_day,2,0,0)