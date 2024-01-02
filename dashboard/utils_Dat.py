from collections import Counter
from pymongo import MongoClient
import pandas as pd
import json
from datetime import timedelta
from datetime import datetime

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from threading import Thread


def loadData():
    client=MongoClient('mongodb+srv://nguyenthanhdatpy:01259229215dat@warehouse.favm3s8.mongodb.net/?retryWrites=true&w=majority')
    db=client.hourly_top_games
    collection=db.data
    cursor=collection.find({})
    data={}
    dfs=[]
    for document in cursor:
        document.pop('_id')
        data=list(document.values())[0]
        dfs.append(pd.DataFrame(data))
    metadata_df = pd.concat(dfs, ignore_index=True)
    return metadata_df


print(f'[{datetime.now()}] Loading unique-game...')
print(f'[{datetime.now()}] Finish!')

print(f'[{datetime.now()}] Loading data...')
original_data=loadData()
original_data['num_pos_reviews']=original_data['num_pos_reviews'].apply(int)
original_data['num_neg_reviews']=original_data['num_neg_reviews'].apply(int)
original_data['hour']=original_data['hour'].apply(int)
original_data['price_format']=original_data['price_format'].apply(float)
original_data.sort_values(['date','hour'],inplace=True)
original_data.reset_index(inplace=True)

path_unique_dataset = "./data/2023-12-02-unique.json"
unique_df = pd.read_json(path_unique_dataset, orient="index")

print(f'[{datetime.now()}] Loading data finished!')


def update_dashboard():
    channel_layer = get_channel_layer()
    client=MongoClient('mongodb+srv://nguyenthanhdatpy:01259229215dat@warehouse.favm3s8.mongodb.net/?retryWrites=true&w=majority')
    db=client.hourly_top_games
    collection=db.data
    
    pipeline = [{"$match": {"operationType": "insert"}}]
    metadata_df=original_data
    with collection.watch(pipeline=pipeline) as stream:
        print("Listening for changes...")
        for change in stream:
            change_df=pd.DataFrame(change['fullDocument']['hourly_data'])

            change_df['num_pos_reviews']=change_df['num_pos_reviews'].apply(int)
            change_df['num_neg_reviews']=change_df['num_neg_reviews'].apply(int)
            change_df['hour']=change_df['hour'].apply(int)
            change_df['price_format']=change_df['price_format'].apply(float)

            print(change_df)
            metadata_df=pd.concat([metadata_df,change_df])
            # metadata_df.reset_index(inplace=True)
            
            metadata_day,num_of_genres_total_day=getMetaData_Day(metadata_df,unique_df)
            metadata_week,num_of_genres_total_week=getMetaData_Week(metadata_df,unique_df)
            metadata_month,num_of_genres_total_month=getMetaData_Week(metadata_df,unique_df)


            async_to_sync(channel_layer.group_send)(
            'dashboard',
                {
                    'type': 'dashboard_update_message',
                    'metadata_day': metadata_day,
                    'metadata_week':metadata_week,
                    'metadata_month':metadata_month,
                    'num_of_genres_total_day':num_of_genres_total_day,
                    'num_of_genres_total_week':num_of_genres_total_week,
                    'num_of_genres_total_month':num_of_genres_total_month
                    
                }
            )


print(f'[{datetime.now()}] Init thread...')
update_dashboard_thread = Thread(target=update_dashboard)
update_dashboard_thread.start()
print(f'[{datetime.now()}] Thread started')


def str_to_datetime(dt: str):
    return datetime.strptime(dt, '%Y-%m-%d')

def getData_OneMonth(df, date_now):
    tmp_df = df.__deepcopy__()
    tmp_df=tmp_df[['name','date','hour','price_format','current_player']]
    tmp_df.dropna(inplace=True)
    tmp_df['date']=tmp_df['date'].apply(lambda x: str_to_datetime(x))
    filter_MONTH = str_to_datetime(date_now) - timedelta(days=30)
    tmp_df = tmp_df[(tmp_df.date>=filter_MONTH) & (tmp_df.date<date_now)]
    tmp_df.date = tmp_df.date.apply(lambda x: int(x.timestamp()*1000))

    name=tmp_df.name.unique()

    mw=unique_df.loc[unique_df['name'].isin(name)][['name','genre']].sort_values('name',ascending=True)

    tmp_df=tmp_df.merge(mw,on='name').sort_values('current_player',ascending=False)
    
    tmp_df = tmp_df.sort_values(by=["date","hour"],ascending=[True,True]).reset_index(drop=True)
    tmp_df.dropna(inplace=True)

    return tmp_df.to_dict()

def getTopGenre(data):
    data=data.loc[data['genre'].notna()]
    data['genre'] = data['genre'].apply(lambda x: [word.strip() for word in x])

    game_genres = data.genre.tolist()
    flat_genres = [genre for sublist in game_genres for genre in sublist]
    genre_counts = dict(Counter(flat_genres))
    genre=list(dict(sorted(genre_counts.items(), key=lambda item: item[1],reverse=True)).keys())[0:10]
    return genre

def sum_dicts(dict1, dict2):
    result_dict = {key: dict1.get(key, 0) + dict2.get(key, 0) for key in set(dict1) | set(dict2)}
    return result_dict

def num_of_genres(col_genre):
    game_genres = col_genre.tolist()
    flat_genres = [genre for sublist in game_genres for genre in sublist]
    genre_counts = Counter(flat_genres)
    return dict(genre_counts)

def num_of_genres_total(df):
    free = df[df['price_format'] <= 0]
    charged = df[df['price_format'] > 0]
    
    free_dict = num_of_genres(free['genre'])
    charged_dict = num_of_genres(charged['genre'])
    total_dict = sum_dicts(free_dict, charged_dict)
 
    df = pd.DataFrame({
        'free': free_dict,
        'charged': charged_dict,
        'total': total_dict
    }).fillna(0)  
    
    df = df.reset_index()
    df.rename(columns = {"index": "genre"}, inplace = True)

    return df

def getMetaData_Day(data, unique):
    hour=data.hour.unique()[-1]
    date=data.date.unique()[-2:]
    metadata_day=data.loc[((data['date']==date[0]) & (data['hour']>hour) | 
                           (data['date']==date[1]) & (data['hour']<=hour))]
    
    metadata_day=metadata_day[['name','current_player']].groupby('name').mean().sort_values('name',ascending=True).reset_index()
    metadata_day['current_player']=metadata_day['current_player'].apply(lambda x:round(x))
    
    name=metadata_day.name.unique()

    md=unique.loc[unique['name'].isin(name)][['name','price_format','genre']].sort_values('name',ascending=True)

    metadata_day=metadata_day.merge(md,on='name').sort_values('current_player',ascending=False)
    num_of_genres_total_day=num_of_genres_total(metadata_day)
    json_records = num_of_genres_total_day.to_json(orient ='records') 
    num_of_genres_total_day = [] 
    num_of_genres_total_day = json.loads(json_records) 
    
    json_records = metadata_day.to_json(orient ='records') 
    metadata_day = [] 
    metadata_day = json.loads(json_records) 
    return metadata_day,num_of_genres_total_day

def getMetaData_Week(data, unique):
    day=data.date.unique()[-8:-1]
    metadata_week=data.loc[data['date'].isin(day)]
    metadata_week=metadata_week[['name','current_player']].groupby('name').mean().sort_values('name',ascending=True).reset_index()
    metadata_week['current_player']=metadata_week['current_player'].apply(lambda x:round(x))
    
    name=metadata_week.name.unique()

    mw=unique.loc[unique['name'].isin(name)][['name','price_format','genre']].sort_values('name',ascending=True)

    metadata_week=metadata_week.merge(mw,on='name').sort_values('current_player',ascending=False)

    num_of_genres_total_week=num_of_genres_total(metadata_week)

    json_records = num_of_genres_total_week.to_json(orient ='records') 
    num_of_genres_total_week = [] 
    num_of_genres_total_week = json.loads(json_records) 

    json_records = metadata_week.to_json(orient ='records') 
    metadata_week = [] 
    metadata_week = json.loads(json_records) 

    return metadata_week,num_of_genres_total_week

def getMetaData_Month(data, unique):
    day=data.date.unique()[-31:-1]
    metadata_month=data.loc[data['date'].isin(day)]
    metadata_month=metadata_month[['name','current_player']].groupby('name').mean().sort_values('name',ascending=True).reset_index()
    metadata_month['current_player']=metadata_month['current_player'].apply(lambda x:round(x))
    
    name=metadata_month.name.unique()

    mw=unique.loc[unique['name'].isin(name)][['name','price_format','genre']].sort_values('name',ascending=True)

    metadata_month=metadata_month.merge(mw,on='name').sort_values('current_player',ascending=False)

    num_of_genres_total_month=num_of_genres_total(metadata_month)

    json_records = num_of_genres_total_month.to_json(orient ='records') 
    num_of_genres_total_month = [] 
    num_of_genres_total_month = json.loads(json_records) 

    json_records = metadata_month.to_json(orient ='records') 
    metadata_month = [] 
    metadata_month = json.loads(json_records) 

    return metadata_month,num_of_genres_total_month

def getOneWeekData(data):
    day=data.date.unique()[-8:-1]
    data=data.loc[data['date'].isin(day)][['name','description']]
    data=data.drop_duplicates(subset='name',keep='first').reset_index(drop=True)
    json_records = data.to_json(orient ='records') 
    data = [] 
    data = json.loads(json_records) 
    
    return data
