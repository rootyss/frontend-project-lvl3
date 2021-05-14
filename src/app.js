import onChange from 'on-change';
import { validate, getStream, parse } from './utils.js';
import state from './state.js';
import render from './render.js';

const app = () => {
  const watchedState = onChange(state, () => {
    render(state);
  });

  const form = document.querySelector('form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inputUrl = formData.get('url');
    watchedState.rssForm.errors = validate(inputUrl);
    if (watchedState.rssForm.errors) {
      return;
    }
    const data = getStream(inputUrl);
    data.then((response) => {
      const datas = parse(response.data.contents);
      if (!data) {
        watchedState.rssForm.errors = null;
      }
      console.log(datas);
    });
  });
  render(watchedState);
};

app();
