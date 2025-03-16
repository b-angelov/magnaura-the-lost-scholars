from django.core.management.base import BaseCommand
from main.models import Room, Puzzle
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Populates the database with rooms and puzzles'

    def handle(self, *args, **kwargs):
        # First create the room grid (5x5)
        rooms = []
        for x in range(-2, 3):
            for y in range(-2, 3):
                name = f"Room {x},{y}"
                description = f"You are in a mysterious chamber at coordinates {x},{y}."

                # Only starting room is unlocked
                is_locked = not (x == 0 and y == 0)

                # Add unique descriptions based on location
                if x == 0 and y == 0:
                    name = "Entrance Hall"
                    description = "A grand hall with marble floors and ancient inscriptions. Doorways lead in all directions."
                elif x == 1 and y == 0:
                    name = "Library of Whispers"
                    description = "Towering bookshelves filled with ancient tomes. The air is thick with dust and secrets."
                elif x == -1 and y == 0:
                    name = "Crystal Chamber"
                    description = "A room filled with glowing crystals of various colors. They hum with strange energy."
                elif x == 0 and y == 1:
                    name = "Observatory"
                    description = "A domed chamber with a magical ceiling showing constellations that shift and move."
                elif x == 0 and y == -1:
                    name = "Alchemist's Workshop"
                    description = "Bubbling potions and strange apparatus fill this room. The air smells of herbs and chemicals."
                elif x == 1 and y == 1:
                    name = "Garden of Riddles"
                    description = "An indoor garden with plants that seem to whisper riddles when you pass by."
                elif x == -1 and y == 1:
                    name = "Hall of Mirrors"
                    description = "The walls are lined with mirrors that don't always show your reflection accurately."
                elif x == 1 and y == -1:
                    name = "Elemental Chamber"
                    description = "This room cycles through manifestations of the four elements: fire, water, earth, and air."
                elif x == -1 and y == -1:
                    name = "Crypt of Knowledge"
                    description = "Ancient sarcophagi line the walls, each inscribed with fragments of forgotten wisdom."
                elif x == 2 and y == 0:
                    name = "Arithmancer's Study"
                    description = "Numbers and mathematical symbols float in the air, rearranging themselves constantly."
                elif x == -2 and y == 0:
                    name = "Chamber of Echoes"
                    description = "Your words echo strangely here, sometimes returning with different meanings."
                elif x == 0 and y == 2:
                    name = "Celestial Sanctum"
                    description = "Stars twinkle in the darkness overhead. Constellations form and reform in patterns."
                elif x == 0 and y == -2:
                    name = "Vault of Secrets"
                    description = "A sealed chamber with ancient locks and warnings inscribed on the doors."

                room = Room.objects.create(
                    name=name,
                    description=description,
                    x_coordinate=x,
                    y_coordinate=y,
                    is_locked=is_locked
                )
                rooms.append(room)
                self.stdout.write(f"Created room: {name}")

        # Create puzzles for each room
        puzzles = [
            # Starting Room (0,0)
            {
                "x": 0, "y": 0,
                "question": "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
                "answer": "echo",
                "hint": "Listen carefully to what comes back to you.",
                "wisdom_points": 5
            },
            # Library (1,0)
            {
                "x": 1, "y": 0,
                "question": "What gets wetter as it dries?",
                "answer": "towel",
                "hint": "Think about something you use after bathing.",
                "wisdom_points": 10
            },
            # Crystal Chamber (-1,0)
            {
                "x": -1, "y": 0,
                "question": "If you have me, you want to share me. If you share me, you haven't got me. What am I?",
                "answer": "secret",
                "hint": "It's something hidden that loses its value when revealed.",
                "wisdom_points": 15
            },
            # Observatory (0,1)
            {
                "x": 0, "y": 1,
                "question": "What celestial body has its own light and orbits around a planet?",
                "answer": "nothing",
                "hint": "Consider the definition carefully. Moons reflect light, they don't produce it.",
                "wisdom_points": 20
            },
            # Alchemist's Workshop (0,-1)
            {
                "x": 0, "y": -1,
                "question": "I am the combination of 6 protons, 6 neutrons and 6 electrons. What element am I?",
                "answer": "carbon",
                "hint": "This is a fundamental element for organic chemistry.",
                "wisdom_points": 25
            },
            # Garden of Riddles (1,1)
            {
                "x": 1, "y": 1,
                "question": "What has roots nobody sees, is taller than trees, up, up it goes, and yet never grows?",
                "answer": "mountain",
                "hint": "A giant natural formation that reaches toward the sky.",
                "wisdom_points": 15
            },
            # Hall of Mirrors (-1,1)
            {
                "x": -1, "y": 1,
                "question": "Forward I am heavy, but backward I am not. What am I?",
                "answer": "ton",
                "hint": "Read the word backward to find the answer.",
                "wisdom_points": 15
            },
            # Elemental Chamber (1,-1)
            {
                "x": 1, "y": -1,
                "question": "What can run but never walks, has a mouth but never talks, has a head but never weeps, has a bed but never sleeps?",
                "answer": "river",
                "hint": "A natural flowing water formation.",
                "wisdom_points": 20
            },
            # Crypt of Knowledge (-1,-1)
            {
                "x": -1, "y": -1,
                "question": "The more you take, the more you leave behind. What are they?",
                "answer": "footsteps",
                "hint": "Think about what you create as you walk along a path.",
                "wisdom_points": 15
            },
            # Arithmancer's Study (2,0)
            {
                "x": 2, "y": 0,
                "question": "What is the next number in the sequence: 1, 1, 2, 3, 5, 8, 13, ?",
                "answer": "21",
                "hint": "Each number is the sum of the two previous numbers.",
                "wisdom_points": 25
            },
            # Chamber of Echoes (-2,0)
            {
                "x": -2, "y": 0,
                "question": "I am a word of 6 letters. Remove one and 12 remains. What am I?",
                "answer": "dozens",
                "hint": "Think about units of measurement.",
                "wisdom_points": 20
            },
            # Celestial Sanctum (0,2)
            {
                "x": 0, "y": 2,
                "question": "What always comes once in a minute, twice in a moment, but never in a thousand years?",
                "answer": "m",
                "hint": "Look at the spelling of each word in the question.",
                "wisdom_points": 30
            },
            # Vault of Secrets (0,-2)
            {
                "x": 0, "y": -2,
                "question": "I have keys but no locks. I have space but no room. You can enter, but you cannot go outside. What am I?",
                "answer": "keyboard",
                "hint": "You're using one to type your answer.",
                "wisdom_points": 25
            },
            # Additional puzzles for variety
            {
                "x": 2, "y": 1,
                "question": "Two fathers and two sons went fishing. Each caught one fish. Why did they bring home only three fish?",
                "answer": "three people",
                "hint": "Think about how people can simultaneously be fathers and sons.",
                "wisdom_points": 20
            },
            {
                "x": -2, "y": 1,
                "question": "You see a boat filled with people. It hasn't sunk, but when you look again you don't see a single person on the boat. Why?",
                "answer": "all married",
                "hint": "Focus on the word 'single' in the question.",
                "wisdom_points": 15
            },
        ]

        for puzzle_data in puzzles:
            room = Room.objects.get(x_coordinate=puzzle_data["x"], y_coordinate=puzzle_data["y"])
            puzzle = Puzzle.objects.create(
                room=room,
                question=puzzle_data["question"],
                answer=puzzle_data["answer"],
                hint=puzzle_data["hint"],
                wisdom_points=puzzle_data["wisdom_points"]
            )
            self.stdout.write(f"Created puzzle for room {room.name}")

        self.stdout.write(self.style.SUCCESS('Successfully populated database'))