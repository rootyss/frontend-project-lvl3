import * as yup from 'yup';

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

export default validate;
