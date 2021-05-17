import onChange from 'on-change';
import {
  validate, getStream, parse, addNormalizedData,
} from './utils.js';
import state from './state.js';
import render from './render.js';

const app = () => {
  const watchedState = onChange(state, () => {
    render(state);
  });

  const feedbackEl = document.querySelector('.feedback');
  const form = document.querySelector('form');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const inputUrl = formData.get('url');
    watchedState.rssForm.errors = validate(inputUrl);
    if (watchedState.rssForm.errors) {
      return;
    }
    if (watchedState.rss.includes(inputUrl)) {
      watchedState.rssForm.errors = 'RSS уже добавлен';
      return;
    }
    watchedState.rss.push(inputUrl);
    const stream = getStream(inputUrl);
    stream.then((response) => {
      const data = parse(response.data.contents);
      feedbackEl.textContent = 'Данные загружены';
      feedbackEl.classList.add('text-success');
      addNormalizedData(data, watchedState);
      console.log(state);
    })
      .catch((e) => {
        watchedState.rssForm.errors = e.message;
      });
  });
  render(watchedState);
};

app();
