import axios from 'axios';
import * as yup from 'yup';

const getStream = (url) => axios.get(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(url)}`);

const schema = yup.string().url('Ссылка должна быть валидным URL');

const validate = (url) => {
  try {
    schema.validateSync(url);
    return null;
  } catch (e) {
    return e.message;
  }
};

const parse = (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length > 0) {
    throw new Error('Отсутствует валидный RSS');
  }
  const title = doc.querySelector('channel > title').textContent;
  const description = doc.querySelector('channel > description').textContent;
  const items = doc.querySelectorAll('item');
  const posts = [...items].map((item) => {
    const itemTitle = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    return { itemTitle, link };
  });
  return { title, description, posts };
};

const addNormalizedData = (data, state) => {
  const currentFeedID = state.feeds.length + 1;
  let currentPostID = state.posts.length + 1;

  const { title, description, posts } = data;
  state.feeds.push({ id: currentFeedID, title, description });
  posts.forEach((post) => {
    const { itemTitle, link } = post;
    state.posts.push({
      feedID: currentFeedID, id: currentPostID, title: itemTitle, link,
    });
    currentPostID += 1;
  });
};

export {
  getStream, validate, parse, addNormalizedData,
};
