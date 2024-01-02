function getFeatureListDisplay(genre) {
    $("#featureTableCardBody").each(function() {
        $(this).find('h4').html('Top 5 features: ' + String(genre));
        
        let thisGenreFeatureList = genre_feature_list_dict[genre];
        let allFeatureHTML = '';
        for (let i = 0; i < thisGenreFeatureList.length; ++i) {
            allFeatureHTML = allFeatureHTML + 
                            '<li class="list-group-item bg-transparent" style="color: white; border-color: white;">' + 
                            thisGenreFeatureList[i] 
                            +'</li>';
        }
        $(this).find('ul').html(allFeatureHTML);
    });
}

getFeatureListDisplay('All');