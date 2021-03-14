import React from "react";

export function Login(props) {
  return (
    <div className="login">
      <h1>Login</h1>
      <form className="l-form">
        <input
          type="text"
          ref={props.iRef}
          placeholder="Enter your username here"
          required="required"
        />
        <button type="button" className="login-btn" onClick={props.login_click}>
          Submit
        </button>
      </form>
    </div>
  );
}
