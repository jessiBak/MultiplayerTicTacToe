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

class AddNewLstTestCase(unittest.TestCase):
    def setUp(self):
        self.success_test_params = [
            {
                KEY_INPUT: 'first1',
                KEY_EXPECTED: ['first1']
            },
            
            {
                KEY_INPUT: 'jess',
                KEY_EXPECTED: ['first1', 'jess']
            }
        ]
        
        self.initial_lst = ['first1']
        
    def test_success(self):
        print("Initial list: " + str(self.initial_lst))
        for test in self.success_test_params:
            actual = add_new_lst(test[KEY_INPUT], self.initial_lst)
            print("Actual result: " + str(actual))
            expected = test[KEY_EXPECTED]
            print("Expected result: " + str(expected))
            self.assertEqual(len(actual), len(expected))
            self.assertEqual(actual, expected)   
            
class ScoreChangeTestCase(unittest.TestCase):
    def setUp(self):
        self.success_test_params = [
            {
                KEY_INPUT: 'first1',
                KEY_EXPECTED: {'username': 'first1', 'score': 104}
            },
            
            {
                KEY_INPUT: 'jess',
                KEY_EXPECTED: {'username': 'jess', 'score': 101}
            }
        ]
        self.initial_users = {'first1': {'username': 'first1', 'score': 105 }, 'jess': { 'username': 'jess', 'score': 100 }}
        
    def test_success(self):
        print("Initial users: " + str(self.initial_users))
        for test in self.success_test_params:
            if (test[KEY_INPUT] == 'jess'):
                actual = change_score(self.initial_users, test[KEY_INPUT], True)
            else:
                actual = change_score(self.initial_users, test[KEY_INPUT], False)
            print("Actual result: " + str(actual))
            expected = test[KEY_EXPECTED]
            print("Expected result: " + str(expected))
            self.assertEqual(len(actual), len(expected))
            self.assertEqual(actual, expected)   

if __name__ == "__main__":
    unittest.main()