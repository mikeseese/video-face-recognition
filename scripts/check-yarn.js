if (!/yarn\.js$/.test(process.env.npm_execpath)) {
  console.error(`\n` +
  `\n` +
  `Please install and use yarn:\n` +
  `\n` +
  `\tnpm install -g yarn && yarn\n\n\n\n`);
  process.exit(1)
}
