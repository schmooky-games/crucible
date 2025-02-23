import './style.css';
import { setupApp } from './app';

document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.getElementById('app');
  if (appElement) {
    setupApp(appElement);
  } else {
    console.error('App element not found');
  }
});