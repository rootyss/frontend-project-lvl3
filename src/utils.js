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
    return null;
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

export { getStream, validate, parse };
