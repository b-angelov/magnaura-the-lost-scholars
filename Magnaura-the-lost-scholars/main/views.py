from django.shortcuts import render

# Create your views here.

from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import GameSession, Room, Puzzle
from .serializers import RoomSerializer, PuzzleSerializer
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if username is None or password is None:
        return Response({'error': 'Please provide both username and password'},
                        status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)

    if not user:
        return Response({'error': 'Invalid Credentials'},
                        status=status.HTTP_401_UNAUTHORIZED)

    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        'token': token.key,
        'user_id': user.pk,
        'username': user.username,
        'email': user.email
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_game(request):
    # Delete existing sessions
    GameSession.objects.filter(user=request.user).delete()

    # Get starting room (coordinates 0,0)
    starting_room = get_object_or_404(Room, x_coordinate=0, y_coordinate=0)

    # Create new game session
    session = GameSession.objects.create(
        user=request.user,
        current_room=starting_room
    )

    return Response({
        'message': 'Game started successfully',
        'room': RoomSerializer(starting_room).data
    })


# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def move(request):
#     direction = request.data.get('direction')
#     if direction not in ['up', 'down', 'left', 'right']:
#         return Response({'error': 'Invalid direction'}, status=400)
#
#     # Get current session
#     session = get_object_or_404(GameSession, user=request.user)
#     current_room = session.current_room
#
#     # Calculate new coordinates
#     new_x, new_y = current_room.x_coordinate, current_room.y_coordinate
#     if direction == 'up':
#         new_y += 1
#     elif direction == 'down':
#         new_y -= 1
#     elif direction == 'left':
#         new_x -= 1
#     elif direction == 'right':
#         new_x += 1
#
#     # Try to find room at new coordinates
#     try:
#         new_room = Room.objects.get(x_coordinate=new_x, y_coordinate=new_y)
#         if new_room.is_locked:
#             return Response({'error': 'This room is locked! Solve puzzles to proceed.'}, status=400)
#
#         # Update session with new room
#         session.current_room = new_room
#         session.save()
#
#         return Response({
#             'message': f'Moved to {new_room.name}',
#             'room': RoomSerializer(new_room).data
#         })
#     except Room.DoesNotExist:
#         return Response({'error': 'Cannot move in that direction!'}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def move(request):
    # Get position from request data
    position_data = request.data.get('position')

    # Validate position data
    if not position_data or 'x' not in position_data or 'y' not in position_data:
        return Response({'error': 'Invalid position data. Expected {x: int, y: int}'}, status=400)

    try:
        new_x = int(position_data['x'])
        new_y = int(position_data['y'])
    except (ValueError, TypeError):
        return Response({'error': 'Position coordinates must be integers'}, status=400)

    # Get current session
    session = get_object_or_404(GameSession, user=request.user)
    current_room = session.current_room

    # Validate that the move is to an adjacent room
    if abs(new_x - current_room.x_coordinate) > 1 or abs(new_y - current_room.y_coordinate) > 1:
        return Response({'error': 'Can only move to adjacent rooms'}, status=400)

    # Also validate that the move is not diagonal
    if abs(new_x - current_room.x_coordinate) == 1 and abs(new_y - current_room.y_coordinate) == 1:
        return Response({'error': 'Diagonal movement is not allowed'}, status=400)

    # Try to find room at new coordinates
    try:
        new_room = Room.objects.get(x_coordinate=new_x, y_coordinate=new_y)
        if new_room.is_locked:
            return Response({'error': 'This room is locked! Solve puzzles to proceed.'}, status=400)

        # Update session with new room
        session.current_room = new_room
        session.save()

        return Response({
            'message': f'Moved to {new_room.name}',
            'room': RoomSerializer(new_room).data
        })
    except Room.DoesNotExist:
        return Response({'error': 'No room exists at those coordinates!'}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_puzzle(request):
    session = get_object_or_404(GameSession, user=request.user)
    puzzles = Puzzle.objects.filter(room=session.current_room)

    if not puzzles.exists():
        return Response({'message': 'No puzzles in this room'})

    return Response({
        'puzzles': PuzzleSerializer(puzzles, many=True).data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def solve_puzzle(request):
    puzzle_id = request.data.get('puzzle_id')
    answer = request.data.get('answer')

    puzzle = get_object_or_404(Puzzle, id=puzzle_id)
    session = get_object_or_404(GameSession, user=request.user)

    if puzzle.room != session.current_room:
        return Response({'error': 'This puzzle is not in your current room'}, status=400)

    if puzzle.answer.lower() == answer.lower():
        # Award wisdom points
        session.wisdom_points += puzzle.wisdom_points
        session.save()

        # Unlock connected rooms if applicable
        # This is simplified - you might have more complex unlocking logic
        connected_rooms = Room.objects.filter(
            is_locked=True,
            x_coordinate__in=[session.current_room.x_coordinate - 1, session.current_room.x_coordinate + 1],
            y_coordinate__in=[session.current_room.y_coordinate - 1, session.current_room.y_coordinate + 1],
        )
        for room in connected_rooms:
            room.is_locked = False
            room.save()

        return Response({
            'success': True,
            'message': 'Correct answer! Your wisdom increases.',
            'wisdom_points': session.wisdom_points
        })
    else:
        return Response({
            'success': False,
            'message': 'Incorrect answer. Try again or seek more knowledge.'
        })


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email', '')

    # Validate input
    if username is None or password is None:
        return Response({'error': 'Please provide both username and password'},
                        status=status.HTTP_400_BAD_REQUEST)

    # Check if username already exists
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'},
                        status=status.HTTP_400_BAD_REQUEST)

    # Create new user
    user = User.objects.create_user(username=username, password=password, email=email)

    # Create token for the new user
    token, created = Token.objects.get_or_create(user=user)

    return Response({
        'token': token.key,
        'user_id': user.pk,
        'username': user.username,
        'email': user.email
    }, status=status.HTTP_201_CREATED)


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_level(request):
#     """
#     Return level data based on the requested level number
#     """
#     level = request.GET.get('level', 1)
#     try:
#         level = int(level)
#     except ValueError:
#         return Response({"detail": "Invalid level parameter"}, status=status.HTTP_400_BAD_REQUEST)
#
#     # Here you would typically fetch data from your database
#     # This is a simplified example with hardcoded data
#
#     level_data = {
#         1: {
#             "mapData": {
#                 "width": 10,
#                 "height": 10,
#                 "tiles": [
#                     # Array of tile objects that represent your game map
#                     # Each tile might have properties like type, walkable, etc.
#                     [{"type": "floor", "walkable": True}, {"type": "wall", "walkable": False}],
#                     # More rows of tiles
#                 ],
#                 "objects": [
#                     # Interactive objects on the map
#                     {"id": 1, "type": "scroll", "position": {"x": 3, "y": 4}},
#                     {"id": 2, "type": "npc", "position": {"x": 5, "y": 7}}
#                 ]
#             },
#             "startPosition": {"x": 1, "y": 1}
#         },
#         # Additional levels
#         2: {
#             "mapData": {"width": 12, "height": 12, "tiles": [[]], "objects": []},
#             "startPosition": {"x": 0, "y": 0}
#         }
#     }
#
#     if level not in level_data:
#         return Response({"detail": f"Level {level} not found"}, status=status.HTTP_404_NOT_FOUND)
#
#     return Response(level_data[level])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_level(request):
    level = request.GET.get('level', 1)
    try:
        level = int(level)
    except ValueError:
        return Response({"detail": "Invalid level parameter"}, status=status.HTTP_400_BAD_REQUEST)

    # Example level data with mapData as a direct 2D array
    level_data = {
        1: {
            # Direct 2D array for mapData as expected by the frontend
            "mapData": [
                [{"type": "floor"}, {"type": "wall"}, {"type": "floor"}, {"type": "floor"}, {"type": "floor"}],
                [{"type": "floor"}, {"type": "floor"}, {"type": "scroll"}, {"type": "floor"}, {"type": "floor"}],
                [{"type": "wall"}, {"type": "floor"}, {"type": "floor"}, {"type": "npc", "npcType": "scholar"},
                 {"type": "floor"}],
                [{"type": "floor"}, {"type": "floor"}, {"type": "relic"}, {"type": "floor"}, {"type": "door"}],
                [{"type": "wall"}, {"type": "wall"}, {"type": "wall"}, {"type": "wall"}, {"type": "wall"}],
            ],
            "startPosition": {"x": 1, "y": 1}
        },
        # Additional levels...
    }

    if level not in level_data:
        return Response({"detail": f"Level {level} not found"}, status=status.HTTP_404_NOT_FOUND)

    return Response(level_data[level])
