import * as THREE from "three";
import { BoxGeometry } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";

let hexagonGeometries = new BoxGeometry(0, 0, 0);

function makeHex(height, position) {
  const geo = new THREE.CylinderGeometry(1, 1, height, 6, 1, false);
  geo.translate(position.x, height * 0.5, position.y);

  hexagonGeometries = mergeGeometries([hexagonGeometries, geo]);
}

export { hexagonGeometries, makeHex };
