'''
Gives schema for Player table
'''

from app import DB


class Player(DB.Model):
    id = DB.Column(DB.Integer, primary_key=True)
    username = DB.Column(DB.String(80), unique=True, nullable=False)
    score = DB.Column(DB.Integer)

    def __repr__(self):
        return f'<Player {self.username}> | Total score: {self.score}'

    @property
    def serialize(self):
        '''
        function to return a serialized row
        '''
        return {'id': self.id, 'username': self.username, 'score': self.score}
