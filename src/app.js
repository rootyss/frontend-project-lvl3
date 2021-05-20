import i18n from 'i18next';
import * as yup from 'yup';
import resources from './locale';
import {
  getStream, parse, addNormalizedData,
} from './utils.js';
import state from './state.js';
import initView from './render.js';

const app = () => {
  const i18nInstance = i18n.createInstance();
  i18nInstance
    .init({
      lng: 'ru',
      debug: false,
      resources,
    }).then(() => {
      yup.setLocale({
        string: {
          url: 'url',
        },
        mixed: {
          notOneOf: 'doubleUrl',
        },
      });

      const elements = {
        form: document.querySelector('form'),
        input: document.querySelector('input'),
        submitButton: document.querySelector('button'),
        feedbackEl: document.querySelector('.feedback'),
        feedsContainer: document.querySelector('.feeds'),
        postsContainer: document.querySelector('.posts'),
      };

      const watchedState = initView(state, elements, i18nInstance);

      const validate = (value) => {
        const schema = yup.object().shape({
          url: yup
            .string()
            .url()
            .notOneOf(watchedState.feeds.map(({ url }) => url)),
        });
        try {
          schema.validateSync(value);
          return null;
        } catch (e) {
          return e.message;
        }
      };

      elements.form.addEventListener('submit', (event) => {
        event.preventDefault();
        watchedState.rssForm.state = 'sending';

        const formData = new FormData(event.target);
        const inputUrl = formData.get('url');

        watchedState.rssForm.state = 'sending';
        const error = validate({ url: inputUrl });
        if (error) {
          watchedState.rssForm.error = error;
          watchedState.rssForm.state = 'failed';
        } else {
          const stream = getStream(inputUrl);

          stream.then((response) => {
            const data = parse(response.data.contents);
            addNormalizedData(data, watchedState, inputUrl);
            watchedState.rssForm.error = null;
            watchedState.rssForm.state = 'finished';
          })
            .catch((e) => {
              if (e.request) {
                watchedState.rssForm.error = 'network';
              } else if (e.isParserError) {
                watchedState.rssForm.error = e.message;
              } else {
                watchedState.rssForm.error = 'unknown';
              }
              watchedState.rssForm.state = 'failed';
            });
        }
      });

      elements.postsContainer.addEventListener('click', (e) => {
        const targetId = e.target.dataset.id;

        if (targetId && !watchedState.visitedPostsId.includes(String(targetId))) {
          watchedState.visitedPostsId.push(targetId);
        }
      });
    });
  return i18nInstance;
};

app();
