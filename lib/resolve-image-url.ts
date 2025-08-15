// Utility to resolve asset URLs for Next.js Image component
import { assetManager } from '@/lib/asset-manager'

/**
 * Resolves an asset key to a direct URL that Next.js Image can use
 * @param imageAssetKey The asset key
 * @param fallbackUrl Fallback URL if asset key is null
 * @returns Promise<string> Direct URL or fallback
 */
export async function resolveImageUrl(
  imageAssetKey: string | null, 
  fallbackUrl: string | null = null
): Promise<string> {
  // If no asset key, use fallback or default
  if (!imageAssetKey) {
    return fallbackUrl || "https://cdn-icons-png.freepik.com/512/194/194935.png"
  }
  
  try {
    // Get presigned URL from asset manager
    const presignedData = await assetManager.generatePresignedUrl(imageAssetKey)
    
    if (presignedData) {
      return presignedData.url
    }
  } catch (error) {
    console.error('Error resolving asset URL:', error)
  }
  
  // Fallback to asset API if presigned URL fails
  return `/api/assets/${imageAssetKey}`
}

/**
 * Client-side version that uses the asset API
 * @param imageAssetKey The asset key
 * @param fallbackUrl Fallback URL if asset key is null
 * @returns string Asset API URL or fallback
 */
export function getAssetImageUrl(
  imageAssetKey: string | null, 
  fallbackUrl: string | null = null
): string {
  if (!imageAssetKey) {
    return fallbackUrl || "https://cdn-icons-png.freepik.com/512/194/194935.png"
  }
  
  return `/api/assets/${imageAssetKey}`
}
