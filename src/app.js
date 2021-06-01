import i18n from 'i18next';
import * as yup from 'yup';
import _ from 'lodash';
import resources from './locale';
import {
  getStream, parse,
} from './utils.js';
import initView from './render.js';

const addID = (posts, feedId) => posts.map((post) => ({ id: _.uniqueId(), feedId, ...post }));

const loadDelay = 5000;

const loadNewPosts = (watchedState) => {
  const links = watchedState.feeds.map((feed) => feed.link);
  return links.map((link) => {
    const feedId = watchedState.feeds.find((feed) => feed.link === link).id;
    return getStream(link).then((response) => {
      const postsCurrentFeed = watchedState.posts.filter((post) => post.feedId === feedId);
      const { posts } = parse(response.data.contents);
      const newPosts = _.differenceBy(posts, postsCurrentFeed, 'itemTitle');
      watchedState.posts.unshift(...addID(newPosts, feedId));
    }).catch(() => {});
  });
};

const getTypeError = (e) => {
  if (e.isAxiosError) {
    return 'network';
  } if (e.isParserError) {
    return 'parser';
  }
  return 'unknown';
};

const loadPosts = (watchedState, inputUrl) => {
  const {
    posts: oldPosts, feeds, rssForm,
  } = watchedState;
  const stream = getStream(inputUrl);

  stream.then((response) => {
    const feedId = _.uniqueId();
    const { title, description, posts } = parse(response.data.contents);
    feeds.unshift({
      id: feedId, title, description, link: inputUrl,
    });
    oldPosts.unshift(...addID(posts, feedId));
    rssForm.error = null;
    rssForm.state = 'finished';
  })
    .catch((e) => {
      rssForm.error = getTypeError(e);
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

      const validate = (value, feeds) => {
        const schema = yup.string().required().url().notOneOf(feeds.map((feed) => feed.link));
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
        const inputUrl = formData.get('url').trim();

        watchedState.rssForm.state = 'sending';
        const error = validate(inputUrl, watchedState.feeds);
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
        if (!targetId) return;
        watchedState.postId = targetId;
        if (targetId && !watchedState.visitedPostsId.includes(targetId)) {
          watchedState.visitedPostsId.push(targetId);
        }
      });
      setTimeout(function refresh() {
        Promise.all(loadNewPosts(watchedState)).finally(() => setTimeout(refresh, loadDelay));
      }, loadDelay);
    });
  return i18nInstance;
};
