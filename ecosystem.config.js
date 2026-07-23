module.exports = {
  apps: [
    {
      name: "bongo-coaching-fe",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start -p 5436",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
