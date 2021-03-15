import unittest
import unittest.mock as mock
from unittest.mock import patch
import os
import sys

sys.path.append(os.path.abspath('../../'))
from app import add_new_user
from app import add_win
from app import add_loss
from app import models
from app import add_new_lst
from app import change_score

KEY_INPUT = 'input'
KEY_EXPECTED = 'expected'
FIRST_USR = 'first1'


class AddNewUserTestCase(unittest.TestCase):
    def setUp(self):
        self.success_test_params = [{
            KEY_INPUT:
            'jess',
            KEY_EXPECTED: [
                '<Player first1> | Total score: 105',
                '<Player jess> | Total score: 100'
            ]
        }]

        initial_player = models.Player(username=FIRST_USR, score=105)
        self.initial_mock_db = [initial_player]

    def mock_db_session_add(self, usr):
        self.initial_mock_db.append(usr)

    def mock_db_session_commit(self):
        pass

    def mock_db_session_query_all(self):
        return self.initial_mock_db

    def mock_db_session_filter_by(self, lst, usr):
        return [r for r in lst if r.username == usr]

    def mock_db_first(self, lst):
        return lst[0]

    def test_success(self):
        print("Initial db:")
        print(self.initial_mock_db)
        for test in self.success_test_params:
            with patch('app.DB.session.add', self.mock_db_session_add):
                with patch('app.DB.session.commit',
                           self.mock_db_session_commit):
                    with patch('app.DB.session.query') as mocked_query:
                        mocked_query.all = self.mock_db_session_query_all
                        mocked_query.filter_by = self.mock_db_session_filter_by
                        actual_result = add_new_user(test[KEY_INPUT])
                        print("Actual result:")
                        print(actual_result)
                        expected_result = test[KEY_EXPECTED]
                        print("Expected result:")
                        print(expected_result)
                        self.assertEqual(len(actual_result),
                                         len(expected_result))
                        self.assertEqual(actual_result[1], expected_result[1])


if __name__ == "__main__":
    unittest.main()
