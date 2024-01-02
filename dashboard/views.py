from django.shortcuts import render
import json


import pandas as pd
pd.set_option("display.max_colwidth", 250)

from tqdm import tqdm
tqdm.pandas()

import seaborn as sns
sns.set_theme()

from .utils_Bha import prepare_for_donut, top_5_feature_list
from .utils_Dat import getData_OneMonth,getTopGenre, getMetaData_Month,getMetaData_Day, getMetaData_Week, getOneWeekData, original_data, unique_df


path_daily_dataset = "./data/2023-12-02-daily.json"

daily_df = pd.read_json(path_daily_dataset, orient="index")




def dashboard(request):
    # Bha
    name_price_dict, name_genre_dict = prepare_for_donut(unique_df)
    genre_feature_list_dict = top_5_feature_list(unique_df)

    # KB
    dataOneMonth = getData_OneMonth(original_data, date_now=max(original_data.date))
    uniqueData_dict = unique_df.to_dict()

    # Dat
    one_week_data=getOneWeekData(original_data)
    metadata_day,num_of_genres_total_day=getMetaData_Day(
        original_data, 
        unique=unique_df,
    )
    genre=getTopGenre(original_data)
    metadata_week,num_of_genres_total_week=getMetaData_Week(
        original_data,
        unique=unique_df,
    )
    metadata_month,num_of_genres_total_month=getMetaData_Month(
        original_data,
        unique=unique_df,
    )


    context = {
        # Bha
        'name_price_dict': json.dumps(name_price_dict),
        'name_genre_dict': json.dumps(name_genre_dict),
        'genre_feature_list_dict': json.dumps(genre_feature_list_dict),

        # KB
        'uniqueData': json.dumps(uniqueData_dict),
        "dataOneMonth" : json.dumps(dataOneMonth),

        # Dat
        'genre':genre,
        'one_week_data':one_week_data,
        'metadata_day':metadata_day,
        'metadata_week':metadata_week,
        'num_of_genres_total_day':num_of_genres_total_day,
        'num_of_genres_total_week':num_of_genres_total_week,
        'metadata_month':metadata_month,
        'num_of_genres_total_month':num_of_genres_total_month
    }

    return render(request, 'dashboard/dashboard.html', context=context)