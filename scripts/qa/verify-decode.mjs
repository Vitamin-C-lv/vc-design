import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
// 仓库根 = 本文件的 ../../ —— 绝不写死绝对路径，否则换台机器 clone 下来就全废。
const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const Q = ROOT + 'public/qinghua';
const manifest = JSON.parse(fs.readFileSync(`${Q}/pointcloud.json`, 'utf8'));
const bpp = manifest.bytesPerPoint;

function decodeOld(buf, model, axis) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const out = [];
  for (let i = 0; i < model.count; i++) out.push(model.bbox.min[axis] + (dv.getInt16(i*bpp + axis*2, true)/32767) * (model.bbox.max[axis]-model.bbox.min[axis]) * 0.5);
  return out;
}
function decodeNew(buf, model, axis) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const size = model.bbox.max[axis] - model.bbox.min[axis];
  const out = [];
  for (let i = 0; i < model.count; i++) out.push(model.bbox.min[axis] + ((dv.getInt16(i*bpp + axis*2, true)+32767)/65534) * size);
  return out;
}
const stat = (a) => ({min: Math.min(...a), max: Math.max(...a), center: (Math.min(...a)+Math.max(...a))/2});
const AX = ['X','Y','Z'];
for (const [name, m] of Object.entries(manifest.models)) {
  const buf = fs.readFileSync(`${Q}/${m.file}`);
  console.log(`\n=== ${name} (${m.count} 点) ===`);
  for (let ax = 0; ax < 3; ax++) {
    const o = stat(decodeOld(buf, m, ax));
    const n = stat(decodeNew(buf, m, ax));
    const bb = `[${m.bbox.min[ax].toFixed(4)}, ${m.bbox.max[ax].toFixed(4)}]`;
    console.log(`  ${AX[ax]}  manifest bbox ${bb}`);
    console.log(`     旧: [${o.min.toFixed(4)}, ${o.max.toFixed(4)}] 中心 ${o.center.toFixed(4)}  ← 偏移 ${(o.center-Math.max(Math.abs(m.bbox.min[ax]),Math.abs(m.bbox.max[ax]))*0).toFixed(4)}`);
    console.log(`     新: [${n.min.toFixed(4)}, ${n.max.toFixed(4)}] 中心 ${n.center.toFixed(4)}`);
    const ok = Math.abs(n.min - m.bbox.min[ax]) < 0.02 && Math.abs(n.max - m.bbox.max[ax]) < 0.02;
    console.log(`     ${ok ? '✅ 新解码与 manifest bbox 一致' : '❌ 新解码仍不匹配'}`);
  }
}
