import axios from 'axios';

const getStream = (url) => axios.get(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(url)}`);

export default getStream;
