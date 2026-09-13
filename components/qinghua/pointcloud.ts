export interface PointCloudBounds {
  min: [number, number, number];
  max: [number, number, number];
}

export interface PointCloudModelManifest {
  file: string;
  count: number;
  bbox: PointCloudBounds;
  bytes: number;
}

export interface PointCloudManifest {
  version: number;
  bytesPerPoint: number;
  layout: {
    position: { offset: 0; type: 'int16'; components: 3 };
    normal: { offset: 6; type: 'int8'; components: 3 };
    aPhase: { offset: 9; type: 'uint8' };
    aScale: { offset: 10; type: 'uint8' };
    aVertical: { offset: 11; type: 'uint8' };
    colorMix: { offset: 12; type: 'uint8' };
  };
  models: Record<'clay' | 'pulling' | 'bisque', PointCloudModelManifest>;
}

export interface DecodedPointCloud {
  count: number;
  position: Float32Array;
  normal: Float32Array;
  aPhase: Float32Array;
  aScale: Float32Array;
  aVertical: Float32Array;
  colorMix: Float32Array;
  bounds: PointCloudBounds;
}

function assertManifest(manifest: PointCloudManifest, model: PointCloudModelManifest, buffer: ArrayBuffer) {
  if (manifest.version !== 1 || manifest.bytesPerPoint !== 13) {
    throw new Error('不支持的青花点云格式');
  }
  if (model.bytes !== buffer.byteLength || model.count * manifest.bytesPerPoint > buffer.byteLength) {
    throw new Error('青花点云文件大小与清单不一致');
  }
}

/**
 * Decode the worker's packed layout.
 *
 * The positions are unsigned-quantised across the model's bounding box, so the
 * inverse has to undo *both* halves of that mapping. The build step
 * (`_build/qinghua-extract/build-pointcloud.mjs`) does:
 *
 *   quantize:   t = (v - min) / (max - min)   →  int16 in [-32767, 32767]
 *   inverse:    v = min + ((q + 32767) / 65534) * (max - min)
 *
 * An earlier version used `min + (q / 32767) * (max - min) * 0.5`. That drops the
 * `+ 32767` re-centring term, so every negative `q` — half the range — collapses
 * towards the wrong end and the whole cloud shifts by half the bounding box. The
 * vessel then sits off-centre, and since the render group rotates about Y, the
 * offset swings it out of frame as it turns.
 */
export function decodePointCloud(
  buffer: ArrayBuffer,
  manifest: PointCloudManifest,
  model: PointCloudModelManifest,
  maxPoints = model.count,
): DecodedPointCloud {
  assertManifest(manifest, model, buffer);

  const count = Math.min(model.count, Math.max(0, Math.floor(maxPoints)));
  const view = new DataView(buffer);
  const position = new Float32Array(count * 3);
  const normal = new Float32Array(count * 3);
  const aPhase = new Float32Array(count);
  const aScale = new Float32Array(count);
  const aVertical = new Float32Array(count);
  const colorMix = new Float32Array(count);
  const decodedMin: [number, number, number] = [Infinity, Infinity, Infinity];
  const decodedMax: [number, number, number] = [-Infinity, -Infinity, -Infinity];

  for (let index = 0; index < count; index += 1) {
    const sourceOffset = index * manifest.bytesPerPoint;
    const pointOffset = index * 3;
    for (let axis = 0; axis < 3; axis += 1) {
      const size = model.bbox.max[axis] - model.bbox.min[axis];
      const value =
        size === 0
          ? model.bbox.min[axis]
          : model.bbox.min[axis] +
            ((view.getInt16(sourceOffset + axis * 2, true) + 32767) / 65534) * size;
      position[pointOffset + axis] = value;
      decodedMin[axis] = Math.min(decodedMin[axis], value);
      decodedMax[axis] = Math.max(decodedMax[axis], value);
      normal[pointOffset + axis] = view.getInt8(sourceOffset + 6 + axis) / 127;
    }
    aPhase[index] = (view.getUint8(sourceOffset + 9) / 255) * Math.PI * 2;
    aScale[index] = 0.65 + (view.getUint8(sourceOffset + 10) / 255) * 0.8;
    aVertical[index] = view.getUint8(sourceOffset + 11) / 255;
    colorMix[index] = (view.getUint8(sourceOffset + 12) / 255) * 0.55;
  }

  return {
    count,
    position,
    normal,
    aPhase,
    aScale,
    aVertical,
    colorMix,
    bounds: {
      min: decodedMin,
      max: decodedMax,
    },
  };
}

export async function loadPointCloud(
  root: string,
  modelName: keyof PointCloudManifest['models'],
  maxPoints: number,
  signal?: AbortSignal,
): Promise<DecodedPointCloud> {
  const manifestResponse = await fetch(`${root}/pointcloud.json`, { signal });
  if (!manifestResponse.ok) throw new Error(`青花点云清单加载失败 (${manifestResponse.status})`);
  const manifest = (await manifestResponse.json()) as PointCloudManifest;
  const model = manifest.models[modelName];
  if (!model) throw new Error(`青花点云模型不存在: ${modelName}`);

  const dataResponse = await fetch(`${root}/${model.file}`, { signal });
  if (!dataResponse.ok) throw new Error(`青花点云数据加载失败 (${dataResponse.status})`);
  return decodePointCloud(await dataResponse.arrayBuffer(), manifest, model, maxPoints);
}
