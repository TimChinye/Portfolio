export function getURL(): string {
  return assertValue(
    process.env.NEXT_PUBLIC_URL,
    'Missing environment variable: NEXT_PUBLIC_URL'
  )
}
export function getDraftModeSecret(): string {
  return assertValue(
    process.env.SANITY_API_VIEWER_TOKEN,
    'Missing environment variable: SANITY_API_VIEWER_TOKEN'
  );
};

export function getStudioPath(): string {
  return assertValue(
    process.env.NEXT_PUBLIC_SANITY_STUDIO_PATH,
    'Missing environment variable: NEXT_PUBLIC_SANITY_STUDIO_PATH'
  );
};

export function getDataset(): string {
  return assertValue(
    process.env.NEXT_PUBLIC_SANITY_DATASET,
    'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET'
  );
};

export function getProjectId(): string {
  return assertValue(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID'
  );
};

export function getApiVersion(): string {
  return assertValue(
    process.env.NEXT_PUBLIC_SANITY_API_VERSION,
    'Missing environment variable: NEXT_PUBLIC_SANITY_API_VERSION'
  );
};

export function getMuxTokenId(): string {
  return assertValue(
    process.env.SANITY_STUDIO_MUX_TOKEN_ID,
    'Missing environment variable: SANITY_STUDIO_MUX_TOKEN_ID'
  );
}

export function getMuxTokenSecret(): string {
  return assertValue(
    process.env.SANITY_STUDIO_MUX_TOKEN_SECRET,
    'Missing environment variable: SANITY_STUDIO_MUX_TOKEN_SECRET'
  );
}

export function getMuxDataEnvKey(): string {
  return assertValue(
    process.env.NEXT_PUBLIC_MUX_DATA_ENV_KEY,
    'Missing environment variable: NEXT_PUBLIC_MUX_DATA_ENV_KEY'
  );
}

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  };

  return v;
};