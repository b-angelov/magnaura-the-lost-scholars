from rest_framework import serializers
from .models import Room, Puzzle, GameSession


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'name', 'description', 'x_coordinate', 'y_coordinate']


class PuzzleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Puzzle
        fields = ['id', 'puzzle_type', 'question', 'hint', 'wisdom_points']
        # Note: answer is intentionally excluded for security


class GameSessionSerializer(serializers.ModelSerializer):
    current_room = RoomSerializer(read_only=True)

    class Meta:
        model = GameSession
        fields = ['id', 'current_room', 'wisdom_points', 'started_at']