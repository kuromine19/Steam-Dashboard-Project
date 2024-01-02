let _select_time_filter = null;
let _select_price_filter = null;
let _select_genre_filter = null;
let time = null;
var one_week_data = JSON.parse(document.getElementById('one_week_data').textContent);

function redrawBarChartAndDonutChart() {
    console.log(_select_time_filter)
    console.log(_select_genre_filter)
    console.log(_select_price_filter)

    
    drawDonutChartBHa(_select_time_filter, _select_genre_filter, _select_price_filter);
    drawBarChartKB(_select_time_filter, _select_genre_filter,_select_price_filter);
}

let url = 'ws://'+window.location.host+'/ws/socket-server/'
const chatSocket=new WebSocket(url)
chatSocket.onmessage=function(e){
    try {
        let data = JSON.parse(e.data);
        if (time == 'Day') {
            treemap=drawTreeMap(data['metadata_day'],treemap.genre,treemap.price,1,treemap.tm)
            horizontal_bar_chart=drawHorizontalBarChart(data['num_of_genres_total_day'],horizontal_bar_chart.price,1,horizontal_bar_chart.hbc)
        }
        else if (time == 'Week') {
            treemap=drawTreeMap(data['metadata_week'],treemap.genre,treemap.price,1,treemap.tm)
            horizontal_bar_chart=drawHorizontalBarChart(data['num_of_genres_total_week'],horizontal_bar_chart.price,1,horizontal_bar_chart.hbc)
        }
        else {
            treemap=drawTreeMap(data['metadata_month'],treemap.genre,treemap.price,1,treemap.tm)
            horizontal_bar_chart=drawHorizontalBarChart(data['num_of_genres_total_month'],horizontal_bar_chart.price,1,horizontal_bar_chart.hbc)
        }
        redrawBarChartAndDonutChart()
    }
    catch (e) {};
}

$('#time-btn a').on('click', function () {
    selText = $(this).text();
    time = selText;
    $(this).parents('#time-btn').find('button')
        .html(`${selText}`);

    if (selText == 'Day'){
        treemap=drawTreeMap(metadata_day,treemap.genre,treemap.price,1,treemap.tm);
        horizontal_bar_chart=drawHorizontalBarChart(num_of_genres_total_day,horizontal_bar_chart.price,1,horizontal_bar_chart.hbc);
        
        _select_time_filter = 'day';
    }
    else if (selText == 'Week') {
        treemap=drawTreeMap(metadata_week,treemap.genre,treemap.price,1,treemap.tm);
        horizontal_bar_chart=drawHorizontalBarChart(num_of_genres_total_week,horizontal_bar_chart.price,1,horizontal_bar_chart.hbc);   
        
        _select_time_filter = 'week';
    }
    else {
        treemap=drawTreeMap(metadata_month,treemap.genre,treemap.price,1,treemap.tm);
        horizontal_bar_chart=drawHorizontalBarChart(num_of_genres_total_month,horizontal_bar_chart.price,1,horizontal_bar_chart.hbc);   
        _select_time_filter = 'month';
    }
    redrawBarChartAndDonutChart();


});

$('#genre-btn a').on('click', function () {
    selText = $(this).text();
    $(this).parents('#genre-btn').find('button')
        .html(`${selText}`);
    if(selText=='All'){
        getFeatureListDisplay(selText);
        selText=1
        _select_genre_filter = null;

    }
    else {
        getFeatureListDisplay(selText);
        _select_genre_filter = [selText];

    }
    
    treemap=drawTreeMap(treemap.metadata,selText,treemap.price,1,treemap.tm);

    redrawBarChartAndDonutChart();

    
});

$('#price-btn a').on('click', function () {
    selText = $(this).text();
    $(this).parents('#price-btn').find('button')
        .html(`${selText}`);

    if(selText=='Both') {
        treemap=drawTreeMap(treemap.metadata,treemap.genre,2,1,treemap.tm)
        horizontal_bar_chart=drawHorizontalBarChart(horizontal_bar_chart.metadata,2,1,horizontal_bar_chart.hbc)

        _select_price_filter = null;

    }
    else if (selText=='Free') {
        treemap=drawTreeMap(treemap.metadata,treemap.genre,0,1,treemap.tm)
        horizontal_bar_chart=drawHorizontalBarChart(horizontal_bar_chart.metadata,0,1,horizontal_bar_chart.hbc)

        _select_price_filter = 'free';

    }
    else {
        treemap=drawTreeMap(treemap.metadata,treemap.genre,1,1,treemap.tm)
        horizontal_bar_chart=drawHorizontalBarChart(horizontal_bar_chart.metadata,1,1,horizontal_bar_chart.hbc)

        _select_price_filter = 'paid';

    }
    redrawBarChartAndDonutChart();

});

treemap.canvas.onclick = (evt) => {

    const points = treemap.tm.getElementsAtEventForMode(
      evt,
      'nearest',
      { intersect: true },
      true
    );

    if (points.length) {
        const firstPoint = points[0];
        

        const value = treemap.tm.data.datasets[firstPoint.datasetIndex].data[firstPoint.index].g;
        // console.log(value)
        // console.log(one_week_data)
        
        $('#launch-pop-up').click()
        // console.log(1)
        openAI(one_week_data, value);
    }

  };



const API_URL = "https://api.openai.com/v1/chat/completions";
API_KEY = "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";

const resultText = document.getElementById("resultText");

async function openAI(data,name){
    resultText.innerText = "";
    
    temp=data.filter(data=>data.name==name);
    des=temp[0].description  
    console.log('data', data)
    console.log('name', name)
    // Fetch the response from the OpenAI API with the signal from AbortController
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content:`${des}\nGame này có gì hay? Nói bằng tiếng Việt`}],
            
        }),

    });
    
    const reply = await response.json();
    reply_content=reply.choices[0].message.content
    console.log(reply_content)
    resultText.innerText += reply_content
};