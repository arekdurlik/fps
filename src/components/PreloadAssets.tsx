import { useNextTickTexture } from '../hooks/useNextTickTexture'

export function PreloadAssets() {
  useNextTickTexture('guns/reticles.png');
  useNextTickTexture('guns/smg/body_stock.png');
  useNextTickTexture('guns/smg/body_reddot.png');
  useNextTickTexture('guns/smg/ironsight_stock.png');
  useNextTickTexture('guns/smg/ironsight_reddot.png');
  useNextTickTexture('guns/smg/glass.png');
  return null;
}