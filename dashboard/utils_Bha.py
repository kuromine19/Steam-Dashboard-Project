

def prepare_for_donut(_unique_df):

    name_price_genre_df = _unique_df[['name', 'price_format', 'genre']]
    name_price_genre_df = name_price_genre_df.set_index('name')

    name_price_genre_dict = name_price_genre_df.to_dict()

    name_price_dict = name_price_genre_dict['price_format']
    name_genre_dict = name_price_genre_dict['genre']

    return name_price_dict, name_genre_dict


def top_5_feature_list(df):
    df_exploded = df.explode('genre').explode('feature_list')
    result_df = df_exploded.groupby(['genre', 'feature_list']).size().reset_index(name='count')
    top5_features_by_genre = result_df.groupby('genre').apply(lambda group: group.nlargest(5, 'count')).reset_index(drop=True)
    result_dict_by_genre = top5_features_by_genre.groupby('genre')['feature_list'].apply(list).to_dict()
    overall_top5_features = result_df.nlargest(5, 'count')['feature_list'].tolist()
    result_dict_by_genre['All'] = overall_top5_features

    return result_dict_by_genre