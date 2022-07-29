import Dotenv from 'dotenv-webpack';
export default (config, env, helpers) => {
  config.resolve.modules.push(env.src);
  config.plugins.push(new Dotenv({ path: './.env' }));
};
