import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Kommunicate from "@kommunicate/kommunicate-chatbot-plugin";

const root = ReactDOM.createRoot(document.getElementById('root'));

Kommunicate.init("1d77091aa12763612ab3be58e1c2a4fec", {
    automaticChatOpenOnNavigation: true,
    popupWidget: true
  });

root.render(
    <App />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
