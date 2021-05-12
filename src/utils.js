import axios from 'axios';
import * as yup from 'yup';

const getStream = (url) => axios.get(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(url)}`);

const schema = yup.string().url('Ссылка должна быть валидным URL');

const validate = (url) => {
  try {
    schema.validateSync(url);
    return null;
  } catch (e) {
    console.log(e.message);
    return e.message;
  }
};

export { getStream, validate };
