function updateRepository(x: object, url: string=null): object {
  if(!url) return x;
  url = url.replace(/\.git$/, '');
  url = url.replace(/^git\+/, '');
  url = url.replace(/^git:\/\//, '');
  x['repository'] = {
    type: 'git',
    url: `git+${url}.git`
  };
  x['bugs'] = {
    url: `${url}/issues`
  };
  x['homepage'] = `${url}#readme`;
  return x;
}
export default updateRepository;
