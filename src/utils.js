import axios from 'axios';

const getCorsUrl = (url) => {
  const corsProxyUrl = new URL('/get', 'https://hexlet-allorigins.herokuapp.com');
  corsProxyUrl.searchParams.set('disableCache', 'true');
  corsProxyUrl.searchParams.set('url', url);
  return corsProxyUrl.toString();
};
const getStream = (url) => axios.get(getCorsUrl(url));

const parse = (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'application/xml');
  const parsererror = doc.querySelector('parsererror');
  if (parsererror) {
    const error = new Error('parser');
    error.isParserError = true;
    throw error;
  }
  const title = doc.querySelector('channel > title').textContent;
  const description = doc.querySelector('channel > description').textContent;
  const items = doc.querySelectorAll('item');
  const posts = [...items].map((item) => {
    const itemTitle = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const descriptionPost = item.querySelector('description').textContent;
    return { itemTitle, link, descriptionPost };
  });
  return { title, description, posts };
};

const addNormalizedData = (data, state, url) => {
  const currentFeedID = state.feeds.length + 1;
  let currentPostID = state.posts.length + 1;

  const { title, description, posts } = data;
  state.feeds.push({
    url, id: currentFeedID, title, description,
  });
  posts.forEach((post) => {
    const { itemTitle, link, descriptionPost } = post;
    state.posts.push({
      feedID: currentFeedID,
      id: currentPostID,
      title: itemTitle,
      link,
      description: descriptionPost,
    });
    currentPostID += 1;
  });
};

export {
  getStream, parse, addNormalizedData,
};
