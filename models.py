from app import db

class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True) 
    username = db.Column(db.String(80), unique=True, nullable=False)
    score = db.Column(db.Integer)

    def __repr__(self):
        return f'<Player {self.username}> | Total score: {self.score}'
    
    @property
    def serialize(self):
        return {
            'id': self.id,
            'username': self.username,
            'score': self.score
        }