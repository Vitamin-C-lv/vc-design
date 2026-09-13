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
 * Decode the worker's packed layout. Positions intentionally use the source
 * mapping exactly: bbox.min + (int16 / 32767) * (bbox.max - bbox.min) * 0.5.
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
      const value = model.bbox.min[axis] +
        (view.getInt16(sourceOffset + axis * 2, true) / 32767) *
        (model.bbox.max[axis] - model.bbox.min[axis]) *
        0.5;
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
