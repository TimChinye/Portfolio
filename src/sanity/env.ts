export function getDraftModeSecret(): string {
  return assertValue(
    process.env.SANITY_API_VIEWER_TOKEN,
    'Missing environment variable: SANITY_API_VIEWER_TOKEN'
  )
}

export function getStudioPath(): string {
  return assertValue(
    process.env.NEXT_PUBLIC_SANITY_STUDIO_PATH,
    'Missing environment variable: NEXT_PUBLIC_SANITY_STUDIO_PATH'
  )
}

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET'
)

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID'
)

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-14'

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
