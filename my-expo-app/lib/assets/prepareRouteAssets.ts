import { equityScaleArt } from '../../src/features/templates/equity-scale/equityScaleArt';
import { scaleFrameIndex } from '../../src/features/templates/equity-scale/components/scaleArmLayout';

export async function prepareBundledAssets(sources: readonly number[]): Promise<void> {
  if (sources.length === 0) return;
  try {
    const { Asset } = await import('expo-asset');
    await Asset.loadAsync([...sources]);
  } catch {
    // Bundled require() remains the fallback.
  }
}

export function firstEquityScaleAssets(): number[] {
  const rest = scaleFrameIndex(0);
  const neighbors = [rest - 1, rest, rest + 1].filter(
    (index) => index >= 0 && index < equityScaleArt.scaleFrames.length
  );
  return [
    equityScaleArt.scale.body as number,
    ...neighbors.map((index) => equityScaleArt.scaleFrames[index] as number),
    equityScaleArt.dial as number,
    equityScaleArt.dialHand.pinchBack as number,
    equityScaleArt.dialHand.pinchFront as number,
  ];
}

export function firstPeekAssets(): number[] {
  return [
    require('../../assets/tables/hero-glove-rest.png'),
    require('../../assets/tables/hero-glove-pinch.png'),
    require('../../assets/tables/hero-glove-lift.png'),
  ];
}

export async function prepareKnownWorldAssets(worldId: string): Promise<void> {
  const sources: number[] = [];
  if (worldId === 'bennys-garden') {
    sources.push(require('../../assets/themes/bennys-garden/map-chunk-a.jpg'));
  } else if (worldId === 'local-casino') {
    sources.push(require('../../assets/themes/local-casino/map-chunk-a.jpg'));
  }
  await prepareBundledAssets(sources);
}

export async function prepareTemplateAssets(templateId: 1 | 2): Promise<void> {
  await prepareBundledAssets(templateId === 2 ? firstEquityScaleAssets() : firstPeekAssets());
}
