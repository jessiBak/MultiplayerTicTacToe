import {
  render,
  screen,
  fireEvent,
  queryByAttribute,
} from "@testing-library/react";
import App from "./App";

test("Login still there for blank username", () => {
  const result = render(<App />);

  const submitButton = screen.getByText("Submit");

  expect(submitButton).toBeInTheDocument();
  fireEvent.click(submitButton);
  expect(submitButton).toBeInTheDocument();
});

test("Login disapears for valid username value", () => {
  const result = render(<App />);

  const submitButton = screen.getByText("Submit");
  const usernameInput = screen.getByPlaceholderText("Enter your username here");

  expect(submitButton).toBeInTheDocument();
  fireEvent.change(usernameInput, { target: { value: "newUser1" } });
  fireEvent.click(submitButton);
  expect(submitButton).not.toBeInTheDocument();
});

test("Clicking Leaderboard toggle button shows/hides leaderboard", () => {
  const result = render(<App />);
  const getById = queryByAttribute.bind(null, "id");

  //get past the login screen
  const submitButton = screen.getByText("Submit");
  const usernameInput = screen.getByPlaceholderText("Enter your username here");
  fireEvent.change(usernameInput, { target: { value: "newUser1" } });
  fireEvent.click(submitButton);

  const ldrboardButton = screen.getByText("Show/Hide Leaderboard");
  fireEvent.click(ldrboardButton);
  const ldrBoard = getById(result.container, "leaderboard-table");
  expect(ldrBoard).toBeInTheDocument();
  fireEvent.click(ldrboardButton);
  expect(ldrBoard).not.toBeInTheDocument();
});
