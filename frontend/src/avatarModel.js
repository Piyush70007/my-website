import * as T from 'three';

// Sculpted geometry only: no photograph, image texture, or face-service request.
export function createAvatar() {
  const root = new T.Group();
  const material = (color, roughness = .7, metalness = 0) => new T.MeshStandardMaterial({ color, roughness, metalness });
  const skin = material('#b97f5b', .75), skinLight = material('#c58b65'), earInner = material('#a56851');
  const hair = material('#17151a', .55), hairHighlight = material('#26222a', .62);
  const beard = material('#30241f', .92), lips = material('#99604f');
  const jacket = material('#20232b', .75), lapel = material('#292d35', .85), shirt = material('#788479', .92);
  const white = material('#eee6d9', .4), iris = material('#39271d', .32), pupil = material('#100e12', .2), gleam = material('#ffffff', .1);
  function mesh(geometry, mat, position = [0,0,0], scale = [1,1,1], parent = root) {
    const item = new T.Mesh(geometry, mat); item.position.set(...position); item.scale.set(...scale); parent.add(item); return item;
  }
  function oval(mat, pos, scale, parent = root) { return mesh(new T.SphereGeometry(1, 40, 28), mat, pos, scale, parent); }
  function stroke(points, radius, mat, parent = root) {
    return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p))), 28, radius, 8, false), mat, [0,0,0], [1,1,1], parent);
  }
  function panel(points, mat, depth = .025) {
    const shape = new T.Shape(); points.forEach(([x,y], i) => i ? shape.lineTo(x,y) : shape.moveTo(x,y)); shape.closePath();
    return mesh(new T.ExtrudeGeometry(shape, { depth, bevelEnabled:true, bevelSize:.025, bevelThickness:.025, bevelSegments:3, steps:1 }), mat);
  }
  // Waist-to-shoulder silhouette, with a flattened front and a complete back.
  const bodyProfile = [[.66,-1.85],[.79,-1.65],[.91,-1.2],[1.03,-.65],[1.12,-.35],[1.08,-.1],[.8,.08],[.48,.19],[.27,.23]];
  const body = mesh(new T.LatheGeometry(bodyProfile.map(([x,y])=>new T.Vector2(x,y)),64), jacket, [0,0,-.04], [1,1,.46]);
  const positions=body.geometry.attributes.position,indices=body.geometry.index.array,keep=[];
  for(let i=0;i<indices.length;i+=3){const ids=[indices[i],indices[i+1],indices[i+2]];const x=ids.reduce((s,j)=>s+positions.getX(j),0)/3,y=ids.reduce((s,j)=>s+positions.getY(j),0)/3,z=ids.reduce((s,j)=>s+positions.getZ(j),0)/3;if(!(z>0&&Math.abs(x)<.29+Math.max(0,-y)*.05))keep.push(...ids);}
  body.geometry.setIndex(keep);body.geometry.computeVertexNormals();
  // Rounded sleeves hang naturally to the cropped waist.
  for (const side of [-1,1]) {
    const arm = oval(jacket, [side*.94,-.95,-.035], [.28,.87,.38]); arm.rotation.z=side*.12;
    stroke([[side*.78,-.18,.28],[side*.95,-.65,.31],[side*.95,-1.48,.27]], .012, lapel);
  }
  const polo=panel([[-.3,.16],[-.48,-.32],[-.45,-1.8],[.45,-1.8],[.48,-.32],[.3,.16]],shirt);polo.position.z=.33;
  mesh(new T.CylinderGeometry(.23,.27,.64,40),skin,[0,.35,-.015],[1,1,.92]);
  const leftCollar=panel([[-.19,.14],[-.32,.03],[-.21,-.19],[-.025,-.05]],shirt); leftCollar.position.z=.43;
  const rightCollar=panel([[.19,.14],[.32,.03],[.21,-.19],[.025,-.05]],shirt); rightCollar.position.z=.43;
  const leftLapel=panel([[-.46,.12],[-.84,-.11],[-.6,-.52],[-.72,-.7],[-.24,-1.55],[-.31,-.36]],lapel);leftLapel.position.z=.43;
  const rightLapel=panel([[.46,.12],[.84,-.11],[.6,-.52],[.72,-.7],[.24,-1.55],[.31,-.36]],lapel);rightLapel.position.z=.43;
  stroke([[0,-.3,.485],[0,-.65,.48],[0,-1.35,.4]], .012, material('#777f78'));
  for(const y of [-.45,-.64]) oval(material('#737d77'),[.015,y,.485],[.024,.024,.012]);
  // A short silver chain follows the neckline rather than floating on the chest.
  stroke([[-.23,.2,.2],[-.2,.06,.4],[0,-.05,.47],[.2,.06,.4],[.23,.2,.2]],.012,material('#c3c5c7',.35,.65));
  const head = new T.Group(); root.add(head); head.position.y=1.28;
  const headProfile=[[0,-.8],[.22,-.78],[.4,-.65],[.53,-.44],[.61,-.15],[.64,.18],[.63,.46],[.56,.67],[.36,.8],[0,.85]];
  mesh(new T.LatheGeometry(headProfile.map(([r,y])=>new T.Vector2(r,y)),80),skin,[0,0,0],[1,1,.83],head);
  // Cheek and muzzle planes soften the face without a flat photo texture.
  oval(skin,[0,-.38,.37],[.41,.31,.19],head);
  for(const side of [-1,1]) {
    oval(skin,[side*.62,-.01,-.015],[.13,.24,.13],head);
    oval(earInner,[side*.67,-.005,.072],[.055,.145,.04],head);
    // Almond-shaped eyes with upper lids and a small catchlight.
    oval(white,[side*.27,.2,.473],[.17,.075,.048],head);
    oval(iris,[side*.264,.197,.522],[.063,.069,.021],head);
    oval(pupil,[side*.264,.197,.542],[.03,.044,.012],head);
    oval(gleam,[side*.264-.019,.223,.551],[.012,.015,.006],head);
    stroke([[side*.1,.22,.493],[side*.25,.282,.507],[side*.43,.224,.459]],.018,beard,head);
    stroke([[side*.11,.38,.46],[side*.26,.416,.473],[side*.43,.375,.419]],.04,hair,head);
    // Close-cropped sideburns meet the jaw beard.
    const sideburn=oval(beard,[side*.555,-.16,.15],[.048,.29,.16],head);sideburn.rotation.z=-side*.13;
  }
  oval(skinLight,[0,.03,.52],[.088,.255,.12],head);
  oval(skinLight,[0,-.13,.66],[.12,.095,.1],head);
  for(const side of [-1,1]) {
    oval(skin,[side*.085,-.17,.599],[.074,.055,.071],head);
    oval(earInner,[side*.077,-.192,.646],[.028,.014,.014],head);
  }
  // Beard is a fitted lower-face surface, with an open mouth region.
  const beardGeo=new T.SphereGeometry(1,64,28,0,Math.PI*2,.49*Math.PI,.51*Math.PI);
  oval(beard,[0,-.67,.19],[.37,.12,.27],head);
  mesh(beardGeo,beard,[0,-.19,.005],[.61,.59,.515],head);
  // The skin muzzle sits forward of the beard shell.
  oval(skin,[0,-.37,.475],[.255,.16,.06],head);
  oval(lips,[0,-.39,.529],[.18,.038,.024],head);
  stroke([[-.16,-.387,.548],[0,-.399,.555],[.16,-.387,.548]],.01,material('#65443c'),head);
  for(const side of [-1,1]) {
    const moustache=oval(beard,[side*.105,-.294,.529],[.116,.041,.026],head);moustache.rotation.z=side*.14;
  }
  oval(beard,[0,-.49,.506],[.045,.042,.015],head);
  // Full scalp and swept, wavy locks: solid geometry visible from every angle.
  mesh(new T.SphereGeometry(1,64,32,0,Math.PI*2,0,Math.PI*.57),hair,[0,.43,-.025],[.665,.55,.56],head);
  for(let i=0;i<6;i++) {
    const x=-.48+i*.18;
    const lock=oval(i%3===0?hairHighlight:hair,[x,.76+Math.sin(i*.61)*.09,.19+Math.cos(i*.36)*.13],[.25,.2,.34],head);
    lock.rotation.set(-.2+i*.04,-.16,-.48);
  }
  for(let i=0;i<5;i++) {
    const x=-.42+i*.2;
    stroke([[x,.63,.42],[x-.09,.82,.45],[x-.19,.88,.25],[x-.24,.8,.03]],.085,hair,head);
  }
  // Flat, deliberate bust cut with a thin studio plinth.
  mesh(new T.CylinderGeometry(.77,.79,.08,64),material('#333b53',.55,.2),[0,-1.87,-.02],[1,1,.56]);
  const blinkEyes = head.children.filter(child=>child.material===white || child.material===iris || child.material===pupil || child.material===gleam);
  return { root, head, blinkEyes };
}
