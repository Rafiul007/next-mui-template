const graphiqlSuffixPattern = /\/graphiql\/?$/i;

export const toGraphqlApiUrl = (url: string) => {
  if (!url) {
    return "";
  }

  return url.replace(graphiqlSuffixPattern, "/graphql");
};

// becuase there was a "i" in the URL
