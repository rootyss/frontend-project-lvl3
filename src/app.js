import onChange from 'on-change';
import i18n from 'i18next';
import resources from './locale.js';
import {
  validate, getStream, parse, addNormalizedData,
} from './utils.js';
import state from './state.js';
import render from './render.js';

const app = () => {
  const watchedState = onChange(state, () => {
    render(state, i18nInstance);
  });

  const i18nInstance = i18n.createInstance();
  i18nInstance
    .init({
      lng: 'ru',
      debug: false,
      resources,
    }).then((t) => { render(watchedState, i18nInstance); });

  const form = document.querySelector('form');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    watchedState.rssForm.state = 'sending';

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
      addNormalizedData(data, watchedState);
      watchedState.rssForm.state = 'finished';
    })
      .catch((e) => {
        watchedState.rssForm.state = 'failed';
        watchedState.rssForm.errors = e.message;
      });
  });
  render(watchedState, i18nInstance);
};

app();
