import json
from channels.generic.websocket import AsyncWebsocketConsumer

class DashboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Kết nối WebSocket
        self.room_group_name = 'dashboard'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        await self.send(text_data=json.dumps({
            'type':'connection_established',
            'message':'You are now connected!'
        }) )

    async def dashboard_update_message(self, event):
        metadata_day = event['metadata_day']
        metadata_week = event['metadata_week']
        metadata_month = event['metadata_month']

        num_of_genres_total_day = event['num_of_genres_total_day']
        num_of_genres_total_week = event['num_of_genres_total_week']
        num_of_genres_total_month = event['num_of_genres_total_month']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'dashboard_update',
            'metadata_day': metadata_day,
            'metadata_week':metadata_week,
            'metadata_month':metadata_month,
            'num_of_genres_total_day':num_of_genres_total_day,
            'num_of_genres_total_week':num_of_genres_total_week,
            'num_of_genres_total_month':num_of_genres_total_month
        }))