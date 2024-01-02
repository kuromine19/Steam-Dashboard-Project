  /* ChartJS
   * -------
   * Data and config for chartjs
   */


// AVERAGE CURRENT PLAYER
const _name = Object.values(dataOneMonth.name);
const _date = Object.values(dataOneMonth.date);
const _price_format = Object.values(dataOneMonth.price_format);
const _current_player = Object.values(dataOneMonth.current_player);
const _hour = Object.values(dataOneMonth.hour);
const _genre = Object.values(dataOneMonth.genre);

// --unique--
// const _name_Unique = Object.values(uniqueData.name);  
// const _genre_Unique = Object.values(uniqueData.genre);

let areChart = null;


function KBgetData(name, date, hour, current_player, price_format, dateFilter=null, genreFilter=null, priceFilter=null) {
  let sum_current_player = [0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0.,
    0., 0., 0., 0., 0., 0., 0.];
  let count_hour = [0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0.,
    0., 0., 0., 0., 0., 0., 0.];
  let average = [];

  for (let i = 0; i < date.length; ++i) {
      if (dateFilter != null) {
          let thisRowDate = date[i];
          if (dateFilter == 'day') {
              let yesterdayDate = new Date();
              yesterdayDate.setDate(yesterdayDate.getDate() - 3);
              yesterdayDate = Number(yesterdayDate);
              if (thisRowDate < yesterdayDate) {
                  continue;
              }
          }
          else if (dateFilter == 'week') {
              let lastWeekDate = new Date();
              lastWeekDate.setDate(lastWeekDate.getDate() - 7);
              lastWeekDate = Number(lastWeekDate);
              if (thisRowDate < lastWeekDate) {
                  continue;
              }
          }
          else if (dateFilter == 'month') {
              let lastMonthDate = new Date();
              lastMonthDate.setDate(lastMonthDate.getDate() - 30);
              lastMonthDate = Number(lastMonthDate);

              if (thisRowDate < lastMonthDate) {
                  continue;
              }
          }
      }

      if (genreFilter != null) {
        //   let idx_game = _name_Unique.indexOf(name[i]);
          let thisRowGenre = _genre[i];
          const filteredArray = thisRowGenre.filter(value => genreFilter.includes(value));
          if (filteredArray.length < genreFilter.length) {
              continue;
          }
      }

      if (priceFilter != null) {
          let thisRowPriceFormat = price_format[i];
          if (priceFilter == 'free') {
              if (thisRowPriceFormat > 0)
                  continue;
          }
          else if (priceFilter == 'paid') {
              if (thisRowPriceFormat <= 0)
                  continue;
          }
      }

 
      if (current_player!=null){
      count_hour[hour[i]] += 1;
      sum_current_player[hour[i]] += current_player[i];
      }

  }
  
  for (var i = 0; i < sum_current_player.length; ++i) {
    average.push(Math.floor(sum_current_player[i]/count_hour[i]));
  }
  return average;
}


function drawBarChartKB(dateFilter, genreFilter,priceFilter) {
    let average_current_player_by_hour = KBgetData(_name,_date,_hour,_current_player,_price_format,dateFilter,genreFilter,priceFilter);
    const OPTION_average_current_player_by_hour = {
    responsive: true,
    plugins:{
        legend: {
            display: false
        },
    },
    scales: {
        x: {
        display: true,
        title: {
            display: true,
            text: 'Time',
            color:'white'
        },
        grid: {
            color: 'rgba(255,255,255,0.1)',
          },
          ticks: {
            color: 'white'
          },
        },
        y: {
        display: true,
        title: {
            display: true,
            text: 'Avg current players',
            color:'white'

        },
        grid: {
            color: 'rgba(255,255,255,0.1)',
          },
          ticks: {
            color: 'white'
          },
        }
    },
    }

    const DATA_average_current_player_by_hour = {
    labels: [ 0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16,
        17, 18, 19, 20, 21, 22, 23],
    datasets: [{
        label: 'Avg Current Players',
        data: average_current_player_by_hour,
        backgroundColor: 'rgba(	26, 159, 255, 0.4)',
        hoverBackgroundColor:'rgba(	26, 159, 255, 0.8)',
        tension: 0.1
    }]
    };

    // Get context with jQuery - using jQuery's .get() method.
    if ($("#areaChart_AvgCurrentPlayer").length) {
    var areChartCanvas = $("#areaChart_AvgCurrentPlayer").get(0).getContext("2d");
    if (areChart != null)
        areChart.destroy();
    areChart = new Chart(areChartCanvas, {
        type: 'bar',
        data: DATA_average_current_player_by_hour,
        options: OPTION_average_current_player_by_hour,
    });
    }
}


drawBarChartKB(null, null,null);