from django.db import models

# Create your models here.

from django.db import models
from django.contrib.auth.models import User


class Room(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    x_coordinate = models.IntegerField()
    y_coordinate = models.IntegerField()
    is_locked = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class Puzzle(models.Model):
    PUZZLE_TYPES = [
        ('RIDDLE', 'Linguistic Riddle'),
        ('LOGIC', 'Logic Trial'),
        ('FAITH', 'Faith-Based Puzzle'),
        ('DEBATE', 'Philosophical Debate'),
    ]

    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='puzzles')
    puzzle_type = models.CharField(max_length=20, choices=PUZZLE_TYPES)
    question = models.TextField()
    answer = models.CharField(max_length=255)
    hint = models.TextField(null=True, blank=True)
    wisdom_points = models.IntegerField(default=10)

    def __str__(self):
        return f"{self.get_puzzle_type_display()} in {self.room.name}"


class GameSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    current_room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True)
    wisdom_points = models.IntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Game of {self.user.username}"


class Inventory(models.Model):
    game_session = models.OneToOneField(GameSession, on_delete=models.CASCADE)
    collected_items = models.JSONField(default=dict)
