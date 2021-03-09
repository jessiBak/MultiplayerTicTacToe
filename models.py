"""
    Gives the schema for the Player table.
    It also provides a way to serialize each row into
    a dict/JSON object.
    Attributes:
        DB.Model: A baseclass for all models
    """
from app import DB


class Player(DB.Model):
    """
    This is the Player class.
    It defines what's in each column
    """
    id = DB.Column(DB.Integer, primary_key=True)
    username = DB.Column(DB.String(80), unique=True, nullable=False)
    score = DB.Column(DB.Integer)

    def __repr__(self):
        """
        This allows a Player to be represented as a string
        """
        return f'<Player {self.username}> | Total score: {self.score}'

    @property
    def serialize(self):
        '''
        This is a function to return a serialized row
        (returns the information of a row as a dict/json format)
        '''
        return {'id': self.id, 'username': self.username, 'score': self.score}
