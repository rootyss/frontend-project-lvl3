import i18n from 'i18next';
import * as yup from 'yup';
import _ from 'lodash';
import resources from './locale';
import {
  getStream, parse, addID,
} from './utils.js';
import initView from './render.js';

const loadDelay = 5000;

const loadNewPosts = (watchedState) => {
  watchedState.rss.forEach((url) => {
    getStream(url).then((response) => {
      const { posts } = parse(response.data.contents);
      const newPosts = _.differenceBy(watchedState.posts, posts, 'title');
      watchedState.posts.push(...addID(newPosts));
    }).catch(() => {});
  });
};

const loadPosts = (watchedState, inputUrl) => {
  const {
    posts: oldPosts, feeds, rss, rssForm,
  } = watchedState;
  const stream = getStream(inputUrl);

  stream.then((response) => {
    const { title, description, posts } = parse(response.data.contents);
    oldPosts.push(...addID(posts, watchedState));
    feeds.unshift({
      title, description,
    });
    rss.push(inputUrl);
    rssForm.error = null;
    rssForm.state = 'finished';
  })
    .catch((e) => {
      if (e.request) {
        rssForm.error = 'network';
      } else if (e.isParserError) {
        rssForm.error = e.message;
      } else {
        rssForm.error = 'unknown';
      }
      rssForm.state = 'failed';
    });
};

export default () => {
  const state = {
    rssForm: {
      state: 'filling',
      error: null,
      valid: true,
    },
    rss: [],
    feeds: [],
    posts: [],
    postId: null,
    visitedPostsId: [],
  };

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
        submitButton: document.querySelector('button[type=submit]'),
        feedbackEl: document.querySelector('.feedback'),
        feedsContainer: document.querySelector('.feeds'),
        postsContainer: document.querySelector('.posts'),
        modalTitle: document.querySelector('.modal-title'),
        modalBody: document.querySelector('.modal-body'),
        closeModal: document.querySelector('.btn-secondary'),
        readMore: document.querySelector('.full-article'),
      };

      const watchedState = initView(state, elements, i18nInstance);

      const validate = (value) => {
        const schema = yup.object().shape({
          url: yup
            .string()
            .url()
            .notOneOf(watchedState.rss),
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
          watchedState.rssForm.valid = false;
          watchedState.rssForm.error = error;
          watchedState.rssForm.state = 'failed';
        } else {
          watchedState.rssForm.valid = true;
          loadPosts(watchedState, inputUrl);
        }
      });

      elements.postsContainer.addEventListener('click', (e) => {
        const targetId = e.target.dataset.id;

        if (targetId && !watchedState.visitedPostsId.includes(String(targetId))) {
          watchedState.visitedPostsId.push(targetId);
        }
        watchedState.postId = targetId;
      });
      setTimeout(function refresh() {
        loadNewPosts(watchedState);
        setTimeout(refresh, loadDelay);
      }, loadDelay);
    });
  return i18nInstance;
};
