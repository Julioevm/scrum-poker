export default (config, env, helpers) => {
  config.resolve.modules.push(env.src);
};
