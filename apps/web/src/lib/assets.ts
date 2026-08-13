export type AssetKey =
  | "background.auth"
  | "background.map"
  | "avatar.placeholder"
  | "mascot.placeholder";

const assetManifest: Record<AssetKey, string> = {
  "background.auth": "/assets/placeholders/generic.svg",
  "background.map": "/assets/placeholders/generic.svg",
  "avatar.placeholder": "/assets/placeholders/generic.svg",
  "mascot.placeholder": "/assets/placeholders/generic.svg",
};

export function resolveAsset(key: AssetKey): string {
  return assetManifest[key];
}
