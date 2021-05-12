import onChange from 'on-change';
import { validate, getStream } from './utils.js';
import state from './state.js';
import renderErrors from './renderErrors.js';

const app = () => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'rssForm.errors':
        renderErrors(value);
        break;
      default:
        break;
    }
  });

  const form = document.querySelector('form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inputUrl = formData.get('url');
    watchedState.rssForm.errors = validate(inputUrl);
    const data = getStream(inputUrl);
    data.then((response) => console.log(response.data.contents));
  });
};

app();
