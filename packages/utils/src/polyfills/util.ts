import util from 'util/';

function debuglog() {
  return console.debug;
}

export = {
  debuglog,
  ...util,
};
