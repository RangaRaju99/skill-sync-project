import api from './axios';

export const getMentors = async () => {
  const { data } = await api.get('/mentor');
  return data;
};

export const getMentorById = async (id: string) => {
  const { data } = await api.get(`/mentor/${id}`);
  return data;
};

export const applyMentor = async (application: any) => {
  const { data } = await api.post('/mentor/apply', application);
  return data;
};
